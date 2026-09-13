import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import AppShell from '../../../components/layout/AppShell';
import PageHeader from '../../../components/layout/PageHeader';
import DownloadCsvButton from '../../../components/ui/DownloadCsvButton';
import SearchBar from '../../../components/ui/SearchBar';
import Select from '../../../components/ui/Select';
import EmptyState from '../../../components/ui/EmptyState';
import Pagination from '../../../components/ui/Pagination';
import Avatar from '../../../components/ui/Avatar';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import FormField from '../../../components/ui/FormField';
import Input from '../../../components/ui/Input';
import SuccessModal from '../../../components/ui/SuccessModal';
import { useAuth } from '../../../context/AuthContext';
import { downloadBlob } from '../../../api/client';
import { listRepeatViolators, exportRepeatViolators, confirmRepeatViolator, getRegistryComplaintFilterOptions } from '../../../api/registryApi';
import { ROLE_NAV_ITEMS } from '../../roleNavMap';
import { registryHeadNavItems } from '../navConfig';

// The Confirm modal collects/edits the canonical display name, pre-filled from the suggested
// match's own displayName.
function ConfirmModal({ violator, onClose, onConfirm }) {
  const [displayName, setDisplayName] = useState(violator?.displayName || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await onConfirm(displayName.trim());
    } catch (err) {
      setError(err.problem?.detail || err.message);
    }
    setSubmitting(false);
  };

  if (!violator) return null;
  return (
    <Modal open={!!violator} onClose={onClose} title="Confirm Repeat Violator" width="440px">
      <form onSubmit={handleSubmit}>
        <p className="modal-description">
          Link this suggested match to one confirmed profile. Matched by {violator.matchType?.toLowerCase() || 'name'} across {violator.complaintCount} complaints.
        </p>
        <FormField label="Canonical Display Name" required>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
        </FormField>
        {error && <p className="su-field-hint-dark" style={{ color: 'var(--danger-color)' }}>{error}</p>}
        <div className="modal-actions">
          <Button type="submit" variant="submit" disabled={submitting}>{submitting ? 'Confirming...' : 'Confirm'}</Button>
        </div>
      </form>
    </Modal>
  );
}

// Real counterpart to RegistryHeadRepeatOffendersPage.jsx's mock body, complaint-registry-head
// only. Note: GET /registry/repeat-violators only returns aggregate fields per violator (no
// underlying alleged-violator record ids) — there's no way to know from this list alone exactly
// which complaint records a "suggested" match's confirm call should link. This sends
// [repeatViolatorId] as a best-effort single-element allegedViolatorIds array; UNVERIFIED against
// the live API (no complaint-registry-head test account yet) — check this first once one exists.
export default function RealRepeatOffendersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const navItems = ROLE_NAV_ITEMS[user?.role] || registryHeadNavItems;
  const [filterOptions, setFilterOptions] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [confirmedMessage, setConfirmedMessage] = useState('');

  useEffect(() => {
    getRegistryComplaintFilterOptions().then(setFilterOptions).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, categoryFilter]);

  const load = () => {
    setLoading(true);
    setError('');
    listRepeatViolators({ search: debouncedSearch, categoryId: categoryFilter, page, pageSize })
      .then(setResult)
      .catch((err) => setError(err.problem?.detail || err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [debouncedSearch, categoryFilter, page, pageSize]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportRepeatViolators({ search: debouncedSearch, categoryId: categoryFilter });
      downloadBlob(blob, `repeat-violators-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      setError(err.problem?.detail || err.message);
    }
    setExporting(false);
  };

  const handleConfirm = async (displayName) => {
    const res = await confirmRepeatViolator([confirmTarget.repeatViolatorId], displayName);
    setConfirmTarget(null);
    setConfirmedMessage(`Confirmed — linked ${res.linkedComplaintCount} complaint${res.linkedComplaintCount === 1 ? '' : 's'} to "${res.displayName}".`);
    load();
  };

  const items = result?.items || [];

  return (
    <AppShell navItems={navItems} user={user}>
      <PageHeader
        title="Repeat Violators"
        subtitle="Alleged violators connected to at least two admissible complaints."
        actions={<DownloadCsvButton onDownload={handleExport} disabled={exporting || !items.length} label={exporting ? 'Exporting...' : 'Export'} />}
      />

      <div className="filter-toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name..." />
        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {filterOptions?.categories?.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </Select>
      </div>

      {error && <p className="su-field-hint-dark" style={{ color: 'var(--danger-color)' }}>{error}</p>}

      {items.length === 0 ? (
        <EmptyState message={loading ? 'Loading...' : 'No repeat violators match your search/filters.'} />
      ) : (
        <>
          <div className="complaints-table-wrap">
            <table className="complaints-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Complaints</th>
                  <th>Categories</th>
                  <th>Most Recent</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((v) => (
                  <tr key={v.repeatViolatorId}>
                    <td>
                      <div
                        className="person-cell"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/registry-head/repeat-offenders/${encodeURIComponent(v.repeatViolatorId)}`, { state: { violator: v } })}
                      >
                        <Avatar name={v.displayName} size={28} />
                        <span className="person-cell-name">{v.displayName}</span>
                        {v.requiresConfirmation && <span className="count-badge" style={{ marginLeft: 6 }}>Suggested</span>}
                      </div>
                    </td>
                    <td>{v.violatorType}</td>
                    <td><span className="count-badge">{v.complaintCount}</span></td>
                    <td>{v.categories?.map((c) => c.name).join(', ')}</td>
                    <td>{v.mostRecentComplaintAt ? new Date(v.mostRecentComplaintAt).toDateString() : '—'}</td>
                    <td>
                      {v.requiresConfirmation ? (
                        <Button variant="secondary" onClick={() => setConfirmTarget(v)}>Confirm</Button>
                      ) : (
                        <button
                          type="button"
                          className="action-icon-btn"
                          onClick={() => navigate(`/registry-head/repeat-offenders/${encodeURIComponent(v.repeatViolatorId)}`, { state: { violator: v } })}
                          aria-label={`View ${v.displayName}`}
                        >
                          <ChevronRight size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={result?.page || page}
            pageCount={result?.totalPages || 1}
            pageSize={result?.pageSize || pageSize}
            totalItems={result?.totalCount || items.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}

      <ConfirmModal violator={confirmTarget} onClose={() => setConfirmTarget(null)} onConfirm={handleConfirm} />
      <SuccessModal open={!!confirmedMessage} message={confirmedMessage} onClose={() => setConfirmedMessage('')} />
    </AppShell>
  );
}
