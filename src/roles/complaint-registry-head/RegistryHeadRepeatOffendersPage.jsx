import React, { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import RepeatOffendersTable from '../../components/ui/RepeatOffendersTable';
import SearchBar from '../../components/ui/SearchBar';
import OffenderCaseHistoryDrawer from '../../components/complaints/OffenderCaseHistoryDrawer';
import { useComplaints } from '../../context/ComplaintsContext';
import { registryHeadNavItems, registryHeadUser } from './navConfig';

export default function RegistryHeadRepeatOffendersPage() {
  const { getRepeatOffenders } = useComplaints();
  const [historyComplaintId, setHistoryComplaintId] = useState(null);
  const [search, setSearch] = useState('');
  const offenders = getRepeatOffenders().filter((o) => !search || o.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppShell navItems={registryHeadNavItems} user={registryHeadUser}>
      <PageHeader
        title="Repeat Offenders"
        subtitle="Alleged violators named in two or more complaints, across every stage of the pipeline."
      />

      <div className="filter-toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by alleged violator name..." />
      </div>

      <RepeatOffendersTable
        offenders={offenders}
        onViewHistory={(offender) => setHistoryComplaintId(offender.anchorComplaintId)}
      />

      <OffenderCaseHistoryDrawer
        open={!!historyComplaintId}
        onClose={() => setHistoryComplaintId(null)}
        complaintId={historyComplaintId}
      />
    </AppShell>
  );
}
