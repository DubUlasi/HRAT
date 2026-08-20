import React, { useState } from 'react';
import { Inbox, ShieldCheck, Send, Gavel, PlusCircle } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import HeroBanner from '../../components/dashboard/HeroBanner';
import QuickTrackerBlob from '../../components/dashboard/QuickTrackerBlob';
import ActionQueueList from '../../components/dashboard/ActionQueueList';
import Button from '../../components/ui/Button';
import ComplaintsTable from '../../components/ui/ComplaintsTable';
import MakeComplaintModal from '../../components/complaints/MakeComplaintModal';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import {
  needsHeadAction,
  needsNumberAssignment,
  needsAdmissibilityAssignment,
  needsAdmissibilityConfirmation,
  needsDepartmentAssignment,
  needsSendToCouncil,
  headActionReason,
} from './registryHeadQueue';
import { registryHeadNavItems, registryHeadUser } from './navConfig';

export default function RegistryHeadDashboardPage() {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const [showMakeComplaint, setShowMakeComplaint] = useState(false);

  const pendingNumbering = complaints.filter(needsNumberAssignment);
  const pendingAdmissibility = complaints.filter((c) => needsAdmissibilityAssignment(c) || needsAdmissibilityConfirmation(c));
  const pendingDepartment = complaints.filter(needsDepartmentAssignment);
  const pendingCouncil = complaints.filter(needsSendToCouncil);
  const needsAction = complaints.filter(needsHeadAction);
  const recentComplaints = [...complaints]
    .sort((a, b) => new Date(b.dateFiled) - new Date(a.dateFiled))
    .slice(0, 10);

  const situationMessages = [
    {
      text: needsAction.length > 0
        ? `${needsAction.length} complaint${needsAction.length === 1 ? '' : 's'} across the registry ${needsAction.length === 1 ? 'is' : 'are'} waiting on you right now.`
        : 'The registry is all caught up, nothing is waiting on you right now.',
    },
    {
      text: `${pendingNumbering.length} need${pendingNumbering.length === 1 ? 's' : ''} an officer assigned, ${pendingAdmissibility.length} need${pendingAdmissibility.length === 1 ? 's' : ''} an admissibility step.`,
    },
    {
      text: `${complaints.length} complaint${complaints.length === 1 ? '' : 's'} on file across the entire registry.`,
    },
  ];

  return (
    <AppShell navItems={registryHeadNavItems} user={user || registryHeadUser}>
      <PageHeader
        title="Complaint Registry Head Dashboard"
        subtitle={`Welcome back, ${user?.name?.split(' ')[0] || registryHeadUser.name.split(' ')[0]}. Here's what's happening across the registry.`}
        notificationCount={2}
        actions={
          <Button variant="primary" icon={PlusCircle} onClick={() => setShowMakeComplaint(true)}>
            Make a Complaint
          </Button>
        }
      />

      <HeroBanner
        greetingName={user?.name?.split(' ')[0] || registryHeadUser.name.split(' ')[0]}
        badge="Complaint Registry Head"
        situationMessages={situationMessages}
        rightSlot={<QuickTrackerBlob />}
        stats={[
          { icon: Inbox, value: pendingNumbering.length, label: 'Needs Officer' },
          { icon: ShieldCheck, value: pendingAdmissibility.length, label: 'Needs Admissibility' },
          { icon: Send, value: pendingDepartment.length, label: 'Needs Department' },
          { icon: Gavel, value: pendingCouncil.length, label: 'Ready For Council' },
        ]}
      />

      <ActionQueueList
        title="Needs Your Action"
        items={needsAction}
        getHref={(c) => `/registry-head/complaints/${c.id}`}
        getReason={headActionReason}
        getNavFrom={() => '/registry-head/complaints/needs-action'}
        viewAllHref="/registry-head/complaints/needs-action"
      />

      <div className="recent-complaints-card">
        <div className="section-header-flex">
          <h2>Recent Complaints</h2>
          <Button variant="secondary" to="/registry-head/complaints">View All Complaints</Button>
        </div>
        <ComplaintsTable
          complaints={recentComplaints}
          getActionHref={(c) => `/registry-head/complaints/${c.id}`}
        />
      </div>

      <MakeComplaintModal open={showMakeComplaint} onClose={() => setShowMakeComplaint(false)} />
    </AppShell>
  );
}
