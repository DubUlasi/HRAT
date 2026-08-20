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
import { registryHeadNavItems, registryHeadUser } from './navConfig';
import { ROLE_NAV_ITEMS, ROLE_COMPLAINT_DETAIL_BASE } from '../roleNavMap';
import { scopeComplaintsForUser } from '../scopeComplaints';

function matchesSearch(complaint, search) {
  if (!search) return true;
  const term = search.toLowerCase();
  return [complaint.subject, complaint.complaintNumber, complaint.victim?.name, complaint.allegedViolator?.name]
    .filter(Boolean)
    .some((field) => field.toLowerCase().includes(term));
}

function flagReason(c) {
  return c.flagReason ? `"${c.flagReason}"` : 'Flagged for attention';
}

// Shared across every role's sidebar, same pattern as Track Complaint — renders whichever role
// is actually logged in's own nav/detail routes, scoped down to complaints that role can
// otherwise see (Registry Head/ES get every flagged complaint, everyone else only their own).
export default function RegistryHeadFlaggedComplaintsPage() {
  const { user } = useAuth();
  const navItems = ROLE_NAV_ITEMS[user?.role] || registryHeadNavItems;
  const detailBase = ROLE_COMPLAINT_DETAIL_BASE[user?.role] || '/registry-head/complaints';
  const { complaints: allComplaints } = useComplaints();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [populationFilter, setPopulationFilter] = useState('all');
  const [keyGroupFilter, setKeyGroupFilter] = useState('all');

  const flagged = scopeComplaintsForUser(allComplaints, user).filter((c) => c.flagged);
  const filtered = flagged
    .filter((c) => matchesSearch(c, search))
    .filter((c) => matchesStatusFilter(c, statusFilter))
    .filter((c) => matchesCategoryFilter(c, categoryFilter))
    .filter((c) => matchesPopulationFilter(c, populationFilter, keyGroupFilter));
  const pagination = usePagination(filtered, 10, `${search}|${statusFilter}|${categoryFilter}|${populationFilter}|${keyGroupFilter}`);

  return (
    <AppShell navItems={navItems} user={user || registryHeadUser}>
      <PageHeader
        title="Flagged Complaints"
        subtitle="Every complaint flagged for attention that you have access to, at any stage of the pipeline."
        actions={<DownloadCsvButton onDownload={() => downloadComplaintsExcel(filtered, 'Flagged Complaints')} disabled={!filtered.length} />}
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
        getActionHref={(c) => `${detailBase}/${c.id}`}
        getReason={flagReason}
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
