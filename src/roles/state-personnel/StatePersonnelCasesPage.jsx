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
import { needsPersonnelWork } from './statePersonnelQueue';
import { statePersonnelNavItems } from './navConfig';

function matchesSearch(complaint, search) {
  if (!search) return true;
  const term = search.toLowerCase();
  return [complaint.subject, complaint.complaintNumber, complaint.victim?.name, complaint.allegedViolator?.name]
    .filter(Boolean)
    .some((field) => field.toLowerCase().includes(term));
}

export default function StatePersonnelCasesPage() {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [populationFilter, setPopulationFilter] = useState('all');
  const [keyGroupFilter, setKeyGroupFilter] = useState('all');
  const officerId = user?.officerId;

  const rows = complaints
    .filter((c) => needsPersonnelWork(c, officerId))
    .filter((c) => matchesSearch(c, search))
    .filter((c) => matchesStatusFilter(c, statusFilter))
    .filter((c) => matchesCategoryFilter(c, categoryFilter))
    .filter((c) => matchesPopulationFilter(c, populationFilter, keyGroupFilter));
  const pagination = usePagination(rows, 10, `${search}|${statusFilter}|${categoryFilter}|${populationFilter}|${keyGroupFilter}`);

  return (
    <AppShell navItems={statePersonnelNavItems} user={user}>
      <PageHeader title="Assigned Cases" subtitle="Complaints assigned to you that still need your local review."
        actions={<DownloadCsvButton onDownload={() => downloadComplaintsExcel(rows, 'Assigned Cases')} disabled={!rows.length} />}
      />

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
        getActionHref={(c) => `/state-personnel/complaints/${c.id}`}
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
