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
import {
  listRegistryComplaints, listNewRegistryComplaints, listTreatedRegistryComplaints, listRegistryActions,
  exportRegistryComplaints, exportNewRegistryComplaints, exportTreatedRegistryComplaints, exportRegistryActions,
  getRegistryComplaintFilterOptions,
} from '../../../api/registryApi';
import { ROLE_NAV_ITEMS } from '../../roleNavMap';
import { registryHeadNavItems } from '../navConfig';

const FILTER_CONFIG = {
  all: { title: 'All Complaints', subtitle: 'Every complaint in the registry.', fetchFn: listRegistryComplaints, exportFn: exportRegistryComplaints, filenamePrefix: 'all-complaints' },
  new: { title: 'New Complaints', subtitle: 'Recently submitted headquarters complaints still awaiting initial routing.', fetchFn: listNewRegistryComplaints, exportFn: exportNewRegistryComplaints, filenamePrefix: 'new-complaints' },
  treated: { title: 'Treated Complaints', subtitle: 'Complaints that have moved beyond initial routing.', fetchFn: listTreatedRegistryComplaints, exportFn: exportTreatedRegistryComplaints, filenamePrefix: 'treated-complaints' },
  'needs-action': { title: 'Needs My Action', subtitle: 'Your active work queue.', fetchFn: listRegistryActions, exportFn: exportRegistryActions, filenamePrefix: 'needs-my-action' },
};

// Real counterpart to RegistryHeadComplaintsPage.jsx's mock body, for the complaint-registry-head
// role only — that page's own filtering/pagination is entirely client-side over a locally-cached
// full complaint array; the real endpoints take search/status/categoryId/populationType/page/
// pageSize as query params, so this holds that as state and refetches on change instead. Rows
// have no "View" link — no single-complaint GET exists yet (see the Phase 3 plan), so there's
// nowhere for one to go.
export default function RealComplaintsList({ filter = 'all' }) {
  const { user } = useAuth();
  const navItems = ROLE_NAV_ITEMS[user?.role] || registryHeadNavItems;
  const config = FILTER_CONFIG[filter] || FILTER_CONFIG.all;
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

  // Debounce free-text search so every keystroke doesn't fire its own request.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Any filter change (including a new debounced search term) resets to page 1 — a stale page
  // number from a wider result set could otherwise land past the end of a narrower one.
  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter, categoryFilter, populationFilter, filter]);

  useEffect(() => {
    setLoading(true);
    setError('');
    config.fetchFn({ search: debouncedSearch, status: statusFilter, categoryId: categoryFilter, populationType: populationFilter, page, pageSize })
      .then(setResult)
      .catch((err) => setError(err.problem?.detail || err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, debouncedSearch, statusFilter, categoryFilter, populationFilter, page, pageSize]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await config.exportFn({ search: debouncedSearch, status: statusFilter, categoryId: categoryFilter, populationType: populationFilter });
      downloadBlob(blob, `${config.filenamePrefix}-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      setError(err.problem?.detail || err.message);
    }
    setExporting(false);
  };

  const items = result?.items || [];

  return (
    <AppShell navItems={navItems} user={user}>
      <PageHeader
        title={config.title}
        subtitle={config.subtitle}
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
        <EmptyState message={loading ? 'Loading...' : 'No complaints match your search/filters.'} />
      ) : (
        <>
          <div className="complaints-table-wrap">
            <table className="complaints-table">
              <thead>
                <tr>
                  <th>Complaint Subject</th>
                  <th>Victim</th>
                  <th>Alleged Violator</th>
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
                        <div className="complaint-subject-meta-row">
                          <span className="category-pill pill-info">{c.category}</span>
                        </div>
                        {c.instructions && <span className="complaint-subject-reason">{c.instructions}</span>}
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
