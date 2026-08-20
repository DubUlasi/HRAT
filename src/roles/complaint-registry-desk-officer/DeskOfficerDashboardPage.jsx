import React from 'react';
import { Hash, Gavel, CheckCircle2 } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import HeroBanner from '../../components/dashboard/HeroBanner';
import QuickTrackerBlob from '../../components/dashboard/QuickTrackerBlob';
import ActionQueueList from '../../components/dashboard/ActionQueueList';
import ComplaintsTable from '../../components/ui/ComplaintsTable';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { deskOfficerNavItems } from './navConfig';
import { needsNumber, needsAdmissibilityDecision } from './deskOfficerQueue';

function actionReason(c, officerId) {
  if (needsNumber(c, officerId)) return 'Needs a complaint number processed';
  if (needsAdmissibilityDecision(c, officerId)) return 'Needs an admissibility decision';
  return null;
}

export default function DeskOfficerDashboardPage() {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const officerId = user?.officerId;

  const pendingNumbers = complaints.filter((c) => needsNumber(c, officerId));
  const pendingAdmissibility = complaints.filter((c) => needsAdmissibilityDecision(c, officerId));
  const mine = complaints.filter((c) => c.registryOfficerId === officerId || c.admissibilityOfficerId === officerId);
  const handledCount = mine.length;
  const needsAction = [...pendingNumbers, ...pendingAdmissibility];
  const recentComplaints = [...mine].sort((a, b) => new Date(b.dateFiled) - new Date(a.dateFiled)).slice(0, 10);

  const situationMessages = [
    {
      text: needsAction.length > 0
        ? `You have ${needsAction.length} complaint${needsAction.length === 1 ? '' : 's'} waiting on you right now.`
        : 'Nothing waiting on you right now, new assignments will show up here.',
    },
    {
      text: `${pendingNumbers.length} need${pendingNumbers.length === 1 ? 's' : ''} a complaint number processed, ${pendingAdmissibility.length} need${pendingAdmissibility.length === 1 ? 's' : ''} an admissibility decision.`,
    },
    {
      text: `You've handled ${handledCount} complaint${handledCount === 1 ? '' : 's'} in total so far.`,
    },
  ];

  return (
    <AppShell navItems={deskOfficerNavItems} user={user}>
      <PageHeader
        title="Complaint Registry Desk Officer Dashboard"
        subtitle={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}. Process complaint numbers and admissibility decisions assigned to you.`}
      />

      <HeroBanner
        greetingName={user?.name?.split(' ')[0] || 'there'}
        badge="Complaint Registry Desk Officer"
        situationMessages={situationMessages}
        rightSlot={<QuickTrackerBlob />}
        stats={[
          { icon: Hash, value: pendingNumbers.length, label: 'Needs Number' },
          { icon: Gavel, value: pendingAdmissibility.length, label: 'Needs Decision' },
          { icon: CheckCircle2, value: handledCount, label: 'Total Handled' },
        ]}
      />

      <ActionQueueList
        title="Needs Your Action"
        items={needsAction}
        getHref={(c) => `/desk-officer/complaints/${c.id}`}
        getReason={(c) => actionReason(c, officerId)}
        getNavFrom={() => '/desk-officer/queue'}
      />

      <div className="recent-complaints-card">
        <div className="section-header-flex">
          <h2>Recent Complaints</h2>
        </div>
        <ComplaintsTable
          complaints={recentComplaints}
          getActionHref={(c) => `/desk-officer/complaints/${c.id}`}
        />
      </div>
    </AppShell>
  );
}
