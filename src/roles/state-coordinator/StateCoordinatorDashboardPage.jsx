import React from 'react';
import { UserPlus, CheckCircle2, ClipboardList } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import HeroBanner from '../../components/dashboard/HeroBanner';
import QuickTrackerBlob from '../../components/dashboard/QuickTrackerBlob';
import ActionQueueList from '../../components/dashboard/ActionQueueList';
import ComplaintsTable from '../../components/ui/ComplaintsTable';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { offices } from '../../data/mockOfficers';
import { needsPersonnelAssignment, needsCoordinatorReview } from './stateCoordinatorQueue';
import { stateCoordinatorNavItems } from './navConfig';

function actionReason(c, officeId) {
  if (needsPersonnelAssignment(c, officeId)) return 'Needs a state personnel officer assigned';
  if (needsCoordinatorReview(c, officeId)) return "Needs your review of the personnel officer's findings";
  return null;
}

function actionNavFrom(c, officeId) {
  return needsPersonnelAssignment(c, officeId) ? '/state-coordinator/incoming' : '/state-coordinator/complaints';
}

export default function StateCoordinatorDashboardPage() {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const officeId = user?.officeId;
  const officeName = offices.find((o) => o.id === officeId)?.name;

  const toAssign = complaints.filter((c) => needsPersonnelAssignment(c, officeId));
  const toReview = complaints.filter((c) => needsCoordinatorReview(c, officeId));
  const mine = complaints.filter((c) => c.stateOffice?.sentTo === officeId);
  const totalHandled = mine.length;
  const needsAction = [...toAssign, ...toReview];
  const recentComplaints = [...mine].sort((a, b) => new Date(b.dateFiled) - new Date(a.dateFiled)).slice(0, 10);

  const situationMessages = [
    {
      text: needsAction.length > 0
        ? `You have ${needsAction.length} complaint${needsAction.length === 1 ? '' : 's'} waiting on you right now.`
        : 'Nothing waiting on you right now, new cases will show up here.',
    },
    {
      text: `${toAssign.length} need${toAssign.length === 1 ? 's' : ''} a personnel officer assigned, ${toReview.length} need${toReview.length === 1 ? 's' : ''} your review.`,
    },
    {
      text: `Your office has handled ${totalHandled} complaint${totalHandled === 1 ? '' : 's'} in total so far.`,
    },
  ];

  return (
    <AppShell navItems={stateCoordinatorNavItems} user={user}>
      <PageHeader
        title="State Coordinator Dashboard"
        subtitle={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}. Assign personnel officers and review submitted findings.`}
      />

      <HeroBanner
        greetingName={user?.name?.split(' ')[0] || 'there'}
        badge={`State Coordinator${officeName ? ` - ${officeName}` : ''}`}
        situationMessages={situationMessages}
        rightSlot={<QuickTrackerBlob />}
        stats={[
          { icon: UserPlus, value: toAssign.length, label: 'Needs Personnel Officer' },
          { icon: CheckCircle2, value: toReview.length, label: 'Needs Review' },
          { icon: ClipboardList, value: totalHandled, label: 'Total Handled' },
        ]}
      />

      <ActionQueueList
        title="Needs Your Action"
        items={needsAction}
        getHref={(c) => `/state-coordinator/complaints/${c.id}`}
        getReason={(c) => actionReason(c, officeId)}
        getNavFrom={(c) => actionNavFrom(c, officeId)}
      />

      <div className="recent-complaints-card">
        <div className="section-header-flex">
          <h2>Recent Complaints</h2>
        </div>
        <ComplaintsTable
          complaints={recentComplaints}
          getActionHref={(c) => `/state-coordinator/complaints/${c.id}`}
        />
      </div>
    </AppShell>
  );
}
