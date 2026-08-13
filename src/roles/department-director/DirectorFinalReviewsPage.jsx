import React from 'react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import ComplaintsTable from '../../components/ui/ComplaintsTable';
import Pagination from '../../components/ui/Pagination';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { usePagination } from '../../hooks/usePagination';
import { needsFinalReview } from './directorQueue';
import { departmentDirectorNavItems } from './navConfig';

export default function DirectorFinalReviewsPage() {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const departmentId = user?.departmentId;

  const rows = complaints.filter((c) => needsFinalReview(c, departmentId));
  const pagination = usePagination(rows, 10);

  return (
    <AppShell navItems={departmentDirectorNavItems} user={user}>
      <PageHeader
        title="Review Findings"
        subtitle="Complaints the Supervisor has approved, forward to the registry, send back, or escalate to the Executive Secretary."
      />

      <ComplaintsTable
        complaints={pagination.pageItems}
        getActionHref={(c) => `/department-director/complaints/${c.id}`}
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
