import React from 'react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import ComplaintsTable from '../../components/ui/ComplaintsTable';
import Pagination from '../../components/ui/Pagination';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { usePagination } from '../../hooks/usePagination';
import { executiveSecretaryNavItems } from './navConfig';

export default function ESEscalatedPage() {
  const { user } = useAuth();
  const { complaints } = useComplaints();

  const rows = complaints.filter((c) => c.esEscalation?.escalated && !c.esEscalation.resolved);
  const pagination = usePagination(rows, 10);

  return (
    <AppShell navItems={executiveSecretaryNavItems} user={user}>
      <PageHeader title="Escalated To Me" subtitle="Complaints a Department Director flagged for your attention." />

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
