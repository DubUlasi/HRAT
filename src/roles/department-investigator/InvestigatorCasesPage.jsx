import React from 'react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import ComplaintsTable from '../../components/ui/ComplaintsTable';
import Pagination from '../../components/ui/Pagination';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { usePagination } from '../../hooks/usePagination';
import { isMyActiveCase } from './investigatorQueue';
import { departmentInvestigatorNavItems } from './navConfig';

export default function InvestigatorCasesPage() {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const officerId = user?.officerId;

  const rows = complaints.filter((c) => isMyActiveCase(c, officerId));
  const pagination = usePagination(rows, 10);

  return (
    <AppShell navItems={departmentInvestigatorNavItems} user={user}>
      <PageHeader title="My Cases" subtitle="Complaints currently assigned to you for investigation." />

      <ComplaintsTable
        complaints={pagination.pageItems}
        getActionHref={(c) => `/department-investigator/complaints/${c.id}`}
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
