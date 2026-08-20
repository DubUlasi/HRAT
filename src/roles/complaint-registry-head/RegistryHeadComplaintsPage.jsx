import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import DownloadCsvButton from '../../components/ui/DownloadCsvButton';
import ComplaintsCardGrid from '../../components/complaints/ComplaintsCardGrid';
import ComplaintsTable from '../../components/ui/ComplaintsTable';
import MakeComplaintModal from '../../components/complaints/MakeComplaintModal';
import SearchBar from '../../components/ui/SearchBar';
import ViewToggle from '../../components/ui/ViewToggle';
import Pagination from '../../components/ui/Pagination';
import ComplaintListFilters, {
  matchesStatusFilter,
  matchesCategoryFilter,
  matchesPopulationFilter,
} from '../../components/complaints/ComplaintListFilters';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { SUB_STATUS } from '../../constants/complaintStatus';
import { usePagination } from '../../hooks/usePagination';
import { downloadComplaintsExcel } from '../../utils/exportUtils';
import { needsHeadAction, headActionReason } from './registryHeadQueue';
import { registryHeadNavItems, registryHeadUser } from './navConfig';

const FILTER_COPY = {
  all: { title: 'Complaints', subtitle: 'See the list of filed complaints below.' },
  new: { title: 'New Complaints', subtitle: 'Complaints awaiting their first action, assign a complaint number to get started.' },
  treated: { title: 'Treated Complaints', subtitle: 'Complaints that have been fully investigated and closed.' },
  'needs-action': { title: 'Needs My Action', subtitle: 'Every complaint currently waiting on you, at any stage of the pipeline.' },
};

function filterComplaints(complaints, filter) {
  if (filter === 'new') return complaints.filter((c) => c.subStatus === SUB_STATUS.NEW);
  if (filter === 'treated') return complaints.filter((c) => c.subStatus === SUB_STATUS.CLOSED);
  if (filter === 'needs-action') return complaints.filter(needsHeadAction);
  return complaints;
}

function matchesSearch(complaint, search) {
  if (!search) return true;
  const term = search.toLowerCase();
  return [complaint.subject, complaint.complaintNumber, complaint.victim?.name, complaint.allegedViolator?.name]
    .filter(Boolean)
    .some((field) => field.toLowerCase().includes(term));
}

export default function RegistryHeadComplaintsPage({ filter = 'all' }) {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const [showMakeComplaint, setShowMakeComplaint] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [populationFilter, setPopulationFilter] = useState('all');
  const [keyGroupFilter, setKeyGroupFilter] = useState('all');
  const copy = FILTER_COPY[filter] || FILTER_COPY.all;
  const filteredComplaints = filterComplaints(complaints, filter)
    .filter((c) => matchesSearch(c, search))
    .filter((c) => matchesStatusFilter(c, statusFilter))
    .filter((c) => matchesCategoryFilter(c, categoryFilter))
    .filter((c) => matchesPopulationFilter(c, populationFilter, keyGroupFilter));
  const pagination = usePagination(filteredComplaints, 10, `${filter}|${search}|${statusFilter}|${categoryFilter}|${populationFilter}|${keyGroupFilter}`);

  return (
    <AppShell navItems={registryHeadNavItems} user={user || registryHeadUser}>
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
        actions={
          <>
            <DownloadCsvButton onDownload={() => downloadComplaintsExcel(filteredComplaints, copy.title)} disabled={!filteredComplaints.length} />
            <Button variant="primary" icon={PlusCircle} onClick={() => setShowMakeComplaint(true)}>
              Make a Complaint
            </Button>
          </>
        }
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
        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      {viewMode === 'list' ? (
        <ComplaintsTable
          complaints={pagination.pageItems}
          getActionHref={(c) => `/registry-head/complaints/${c.id}`}
          getReason={filter === 'needs-action' ? headActionReason : undefined}
        />
      ) : (
        <ComplaintsCardGrid complaints={pagination.pageItems} />
      )}

      <Pagination
        page={pagination.page}
        pageCount={pagination.pageCount}
        pageSize={pagination.pageSize}
        totalItems={pagination.totalItems}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />

      <MakeComplaintModal open={showMakeComplaint} onClose={() => setShowMakeComplaint(false)} />
    </AppShell>
  );
}
