import React, { useEffect, useState } from 'react';
import AppShell from '../../../components/layout/AppShell';
import PageHeader from '../../../components/layout/PageHeader';
import DownloadCsvButton from '../../../components/ui/DownloadCsvButton';
import SearchBar from '../../../components/ui/SearchBar';
import Select from '../../../components/ui/Select';
import EmptyState from '../../../components/ui/EmptyState';
import Pagination from '../../../components/ui/Pagination';
import ProgressBar from '../../../components/ui/ProgressBar';
import { useAuth } from '../../../context/AuthContext';
import { downloadBlob } from '../../../api/client';
import { listFlaggedRegistryComplaints, exportFlaggedRegistryComplaints, getRegistryComplaintFilterOptions } from '../../../api/registryApi';
import { ROLE_NAV_ITEMS } from '../../roleNavMap';
import { registryHeadNavItems } from '../navConfig';

// Real counterpart to RegistryHeadFlaggedComplaintsPage.jsx's mock body, complaint-registry-head
// only — near-identical to RealComplaintsList, kept as its own small file rather than a further
// prop-branch since the flagged response carries its own extra columns (flagReason/flaggedAt).
export default function RealFlaggedComplaints() {
  const { user } = useAuth();
  const navItems = ROLE_NAV_ITEMS[user?.role] || registryHeadNavItems;
  const [filterOptions, setFilterOptions] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [populationFilter, setPopulationFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getRegistryComplaintFilterOptions().then(setFilterOptions).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter, categoryFilter, populationFilter]);

  useEffect(() => {
    setLoading(true);
    setError('');
    listFlaggedRegistryComplaints({ search: debouncedSearch, status: statusFilter, categoryId: categoryFilter, populationType: populationFilter, page, pageSize })
      .then(setResult)
      .catch((err) => setError(err.problem?.detail || err.message))
      .finally(() => setLoading(false));
  }, [debouncedSearch, statusFilter, categoryFilter, populationFilter, page, pageSize]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportFlaggedRegistryComplaints({ search: debouncedSearch, status: statusFilter, categoryId: categoryFilter, populationType: populationFilter });
      downloadBlob(blob, `flagged-complaints-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      setError(err.problem?.detail || err.message);
    }
    setExporting(false);
  };

  const items = result?.items || [];

  return (
    <AppShell navItems={navItems} user={user}>
      <PageHeader
        title="Flagged Complaints"
        subtitle="Complaints with an active attention flag."
        actions={<DownloadCsvButton onDownload={handleExport} disabled={exporting || !items.length} label={exporting ? 'Exporting...' : 'Export'} />}
      />

      <div className="filter-toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by subject, complaint number, victim, or alleged violator..." />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {filterOptions?.statuses?.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </Select>
        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {filterOptions?.categories?.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </Select>
        <Select value={populationFilter} onChange={(e) => setPopulationFilter(e.target.value)}>
          <option value="">All Populations</option>
          {filterOptions?.populationTypes?.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </Select>
      </div>

      {error && <p className="su-field-hint-dark" style={{ color: 'var(--danger-color)' }}>{error}</p>}

      {items.length === 0 ? (
        <EmptyState message={loading ? 'Loading...' : 'No flagged complaints match your search/filters.'} />
      ) : (
        <>
          <div className="complaints-table-wrap">
            <table className="complaints-table">
              <thead>
                <tr>
                  <th>Complaint Subject</th>
                  <th>Victim</th>
                  <th>Alleged Violator</th>
                  <th>Flag Reason</th>
                  <th>Status</th>
                  <th>Case Progress</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.complaintId}>
                    <td>
                      <div className="complaint-subject-cell">
                        <span className="complaint-subject">{c.subject}</span>
                        <div className="complaint-subject-meta-row">
                          {c.complaintNumber && <span className="complaint-number-tag">{c.complaintNumber}</span>}
                          <span className="complaint-date">{new Date(c.filedAt).toDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="person-cell">
                        <span className="person-cell-name">{c.victim}</span>
                        {c.additionalVictimCount > 0 && <span className="person-cell-more">+{c.additionalVictimCount}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="person-cell">
                        <span className="person-cell-name">{c.allegedViolator}</span>
                        {c.additionalViolatorCount > 0 && <span className="person-cell-more">+{c.additionalViolatorCount}</span>}
                      </div>
                    </td>
                    <td>
                      <span className="urgency-pill warning flagged-pill">"{c.flagReason}"</span>
                      <div className="complaint-date" style={{ marginTop: 4 }}>{new Date(c.flaggedAt).toLocaleDateString()}</div>
                    </td>
                    <td><span className="status-badge status-info">{c.statusLabel || c.status}</span></td>
                    <td><ProgressBar percent={c.progressPercent} /></td>
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
    </AppShell>
  );
}
