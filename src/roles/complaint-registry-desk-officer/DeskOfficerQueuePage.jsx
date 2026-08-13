import React from 'react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import ComplaintsTable from '../../components/ui/ComplaintsTable';
import Pagination from '../../components/ui/Pagination';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { usePagination } from '../../hooks/usePagination';
import { SUB_STATUS } from '../../constants/complaintStatus';
import { deskOfficerNavItems } from './navConfig';

function needsNumber(c, officerId) {
  return c.registryOfficerId === officerId && c.subStatus === SUB_STATUS.COMPLAINT_NUMBER_ASSIGNMENT && !c.complaintNumber;
}

function needsAdmissibilityDecision(c, officerId) {
  return (
    c.admissibilityOfficerId === officerId &&
    c.subStatus === SUB_STATUS.ADMISSIBILITY_CHECK &&
    (!c.admissibility.decision || (c.admissibility.headConfirmed && c.admissibility.headAgree === false))
  );
}

export default function DeskOfficerQueuePage() {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const officerId = user?.officerId;

  const needsAction = complaints.filter((c) => needsNumber(c, officerId) || needsAdmissibilityDecision(c, officerId));
  const pagination = usePagination(needsAction, 10);

  return (
    <AppShell navItems={deskOfficerNavItems} user={user}>
      <PageHeader
        title="My Queue"
        subtitle="Complaints assigned to you that still need a complaint number or an admissibility decision."
      />

      <ComplaintsTable
        complaints={pagination.pageItems}
        getActionHref={(c) => `/desk-officer/complaints/${c.id}`}
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
