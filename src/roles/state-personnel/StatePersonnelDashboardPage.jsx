import React from 'react';
import { Clock, Send, ClipboardList } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import HeroBanner from '../../components/dashboard/HeroBanner';
import QuickTrackerBlob from '../../components/dashboard/QuickTrackerBlob';
import ActionQueueList from '../../components/dashboard/ActionQueueList';
import ComplaintsTable from '../../components/ui/ComplaintsTable';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { offices } from '../../data/mockOfficers';
import { needsPersonnelWork, awaitingCoordinatorReview } from './statePersonnelQueue';
import { statePersonnelNavItems } from './navConfig';

function actionReason(c, officerId) {
  return needsPersonnelWork(c, officerId) ? 'Needs your local review and findings' : 'Awaiting the State Coordinator\'s review';
}

export default function StatePersonnelDashboardPage() {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const officerId = user?.officerId;
  const officeName = offices.find((o) => o.id === user?.officeId)?.name;

  const activeCases = complaints.filter((c) => needsPersonnelWork(c, officerId));
  const awaitingReview = complaints.filter((c) => awaitingCoordinatorReview(c, officerId));
  const mine = complaints.filter((c) => c.stateOffice?.assignedPersonnelId === officerId);
  const totalHandled = mine.length;
  const needsAction = [...activeCases, ...awaitingReview];
  const recentComplaints = [...mine].sort((a, b) => new Date(b.dateFiled) - new Date(a.dateFiled)).slice(0, 10);

  const situationMessages = [
    {
      text: activeCases.length > 0
        ? `You have ${activeCases.length} case${activeCases.length === 1 ? '' : 's'} needing your review right now.`
        : 'No cases needing review right now, new assignments will show up here.',
    },
    {
      text: `${activeCases.length} need${activeCases.length === 1 ? 's' : ''} your findings, ${awaitingReview.length} awaiting the coordinator's review.`,
    },
    {
      text: `You've handled ${totalHandled} complaint${totalHandled === 1 ? '' : 's'} in total so far.`,
    },
  ];

  return (
    <AppShell navItems={statePersonnelNavItems} user={user}>
      <PageHeader
        title="State Personnel Dashboard"
        subtitle={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}. Review your assigned cases and submit findings.`}
      />

      <HeroBanner
        greetingName={user?.name?.split(' ')[0] || 'there'}
        badge={`State Personnel${officeName ? ` - ${officeName}` : ''}`}
        situationMessages={situationMessages}
        rightSlot={<QuickTrackerBlob />}
        stats={[
          { icon: Clock, value: activeCases.length, label: 'Needs Your Findings' },
          { icon: Send, value: awaitingReview.length, label: 'Awaiting Review' },
          { icon: ClipboardList, value: totalHandled, label: 'Total Handled' },
        ]}
      />

      <ActionQueueList
        title="Needs Your Action"
        items={needsAction}
        getHref={(c) => `/state-personnel/complaints/${c.id}`}
        getReason={(c) => actionReason(c, officerId)}
        getNavFrom={() => '/state-personnel/cases'}
      />

      <div className="recent-complaints-card">
        <div className="section-header-flex">
          <h2>Recent Complaints</h2>
        </div>
        <ComplaintsTable
          complaints={recentComplaints}
          getActionHref={(c) => `/state-personnel/complaints/${c.id}`}
        />
      </div>
    </AppShell>
  );
}
