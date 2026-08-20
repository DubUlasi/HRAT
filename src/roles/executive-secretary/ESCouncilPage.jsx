import React, { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import DownloadCsvButton from '../../components/ui/DownloadCsvButton';
import ComplaintsTable from '../../components/ui/ComplaintsTable';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import ComplaintListFilters, {
  matchesStatusFilter,
  matchesCategoryFilter,
  matchesPopulationFilter,
} from '../../components/complaints/ComplaintListFilters';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { usePagination } from '../../hooks/usePagination';
import { downloadComplaintsExcel } from '../../utils/exportUtils';
import { SUB_STATUS } from '../../constants/complaintStatus';
import { executiveSecretaryNavItems } from './navConfig';

const TABS = [
  { key: 'ready', label: 'Ready For Council', status: SUB_STATUS.READY_FOR_COUNCIL },
  { key: 'inadmissible', label: 'Inadmissible Review', status: SUB_STATUS.INADMISSIBLE },
];

function matchesSearch(complaint, search) {
  if (!search) return true;
  const term = search.toLowerCase();
  return [complaint.subject, complaint.complaintNumber, complaint.victim?.name, complaint.allegedViolator?.name]
    .filter(Boolean)
    .some((field) => field.toLowerCase().includes(term));
}

export default function ESCouncilPage() {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const [tab, setTab] = useState('ready');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [populationFilter, setPopulationFilter] = useState('all');
  const [keyGroupFilter, setKeyGroupFilter] = useState('all');

  const activeTab = TABS.find((t) => t.key === tab);
  const rows = complaints
    .filter((c) => c.subStatus === activeTab.status)
    .filter((c) => matchesSearch(c, search))
    .filter((c) => matchesStatusFilter(c, statusFilter))
    .filter((c) => matchesCategoryFilter(c, categoryFilter))
    .filter((c) => matchesPopulationFilter(c, populationFilter, keyGroupFilter));
  const pagination = usePagination(rows, 10, `${tab}|${search}|${statusFilter}|${categoryFilter}|${populationFilter}|${keyGroupFilter}`);

  return (
    <AppShell navItems={executiveSecretaryNavItems} user={user}>
      <PageHeader
        title="Council Review"
        subtitle="Complaints ready for the Executive Secretary/Governing Council's final decision."
        actions={<DownloadCsvButton onDownload={() => downloadComplaintsExcel(rows, 'Council Review')} disabled={!rows.length} />}
      />

      <div className="text-tab-group">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`text-tab-btn ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="filter-toolbar">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by subject, complaint number, victim, or alleged violator..."
        />
        <ComplaintListFilters
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          populationFilter={populationFilter}
          onPopulationChange={setPopulationFilter}
          keyGroupFilter={keyGroupFilter}
          onKeyGroupChange={setKeyGroupFilter}
        />
      </div>

      <ComplaintsTable
        complaints={pagination.pageItems}
        getActionHref={(c) => `/executive-secretary/complaints/${c.id}`}
      />

      <Pagination
        page={pagination.page}
        pageCount={pagination.pageCount}
        pageSize={pagination.pageSize}
        totalItems={pagination.totalItems}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />
    </AppShell>
  );
}
