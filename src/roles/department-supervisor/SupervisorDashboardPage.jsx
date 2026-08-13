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
import { departments } from '../../data/mockOfficers';
import { needsInvestigatorAssignment, needsFindingsReview } from './supervisorQueue';
import { departmentSupervisorNavItems } from './navConfig';

function actionReason(c, officerId) {
  if (needsInvestigatorAssignment(c, officerId)) return 'Needs an investigator assigned';
  if (needsFindingsReview(c, officerId)) return "Needs your review of the investigator's findings";
  return null;
}

export default function SupervisorDashboardPage() {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const officerId = user?.officerId;
  const departmentName = departments.find((d) => d.id === user?.departmentId)?.name;

  const toAssign = complaints.filter((c) => needsInvestigatorAssignment(c, officerId));
  const toReview = complaints.filter((c) => needsFindingsReview(c, officerId));
  const mine = complaints.filter((c) => c.supervisorId === officerId);
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
      text: `${toAssign.length} need${toAssign.length === 1 ? 's' : ''} an investigator assigned, ${toReview.length} need${toReview.length === 1 ? 's' : ''} your review.`,
    },
    {
      text: `You've supervised ${totalHandled} complaint${totalHandled === 1 ? '' : 's'} in total so far.`,
    },
  ];

  return (
    <AppShell navItems={departmentSupervisorNavItems} user={user}>
      <PageHeader
        title="Department Supervisor Dashboard"
        subtitle={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}. Assign investigators and review submitted findings.`}
      />

      <HeroBanner
        greetingName={user?.name?.split(' ')[0] || 'there'}
        badge={`Department Supervisor${departmentName ? ` - ${departmentName}` : ''}`}
        situationMessages={situationMessages}
        rightSlot={<QuickTrackerBlob />}
        stats={[
          { icon: UserPlus, value: toAssign.length, label: 'Needs Investigator' },
          { icon: CheckCircle2, value: toReview.length, label: 'Needs Review' },
          { icon: ClipboardList, value: totalHandled, label: 'Total Handled' },
        ]}
      />

      <ActionQueueList
        title="Needs Your Action"
        items={needsAction}
        getHref={(c) => `/department-supervisor/complaints/${c.id}`}
        getReason={(c) => actionReason(c, officerId)}
      />

      <div className="recent-complaints-card">
        <div className="section-header-flex">
          <h2>Recent Complaints</h2>
        </div>
        <ComplaintsTable
          complaints={recentComplaints}
          getActionHref={(c) => `/department-supervisor/complaints/${c.id}`}
        />
      </div>
    </AppShell>
  );
}
