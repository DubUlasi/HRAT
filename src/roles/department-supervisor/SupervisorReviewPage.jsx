import React from 'react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import ComplaintsTable from '../../components/ui/ComplaintsTable';
import Pagination from '../../components/ui/Pagination';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { usePagination } from '../../hooks/usePagination';
import { needsFindingsReview } from './supervisorQueue';
import { departmentSupervisorNavItems } from './navConfig';

export default function SupervisorReviewPage() {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const officerId = user?.officerId;

  const rows = complaints.filter((c) => needsFindingsReview(c, officerId));
  const pagination = usePagination(rows, 10);

  return (
    <AppShell navItems={departmentSupervisorNavItems} user={user}>
      <PageHeader title="Review Findings" subtitle="Investigator findings awaiting your review before they go to the Director." />

      <ComplaintsTable
        complaints={pagination.pageItems}
        getActionHref={(c) => `/department-supervisor/complaints/${c.id}`}
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
