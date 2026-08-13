import React, { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import ComplaintsTable from '../../components/ui/ComplaintsTable';
import Pagination from '../../components/ui/Pagination';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { usePagination } from '../../hooks/usePagination';
import { SUB_STATUS } from '../../constants/complaintStatus';
import { executiveSecretaryNavItems } from './navConfig';

const TABS = [
  { key: 'ready', label: 'Ready For Council', status: SUB_STATUS.READY_FOR_COUNCIL },
  { key: 'inadmissible', label: 'Inadmissible Review', status: SUB_STATUS.INADMISSIBLE },
];

export default function ESCouncilPage() {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const [tab, setTab] = useState('ready');

  const activeTab = TABS.find((t) => t.key === tab);
  const rows = complaints.filter((c) => c.subStatus === activeTab.status);
  const pagination = usePagination(rows, 10, tab);

  return (
    <AppShell navItems={executiveSecretaryNavItems} user={user}>
      <PageHeader
        title="Council Review"
        subtitle="Complaints ready for the Executive Secretary/Governing Council's final decision."
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
