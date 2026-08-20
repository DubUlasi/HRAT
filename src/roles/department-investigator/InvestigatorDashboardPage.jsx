import React from 'react';
import { Clock, Activity, ClipboardList } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import HeroBanner from '../../components/dashboard/HeroBanner';
import QuickTrackerBlob from '../../components/dashboard/QuickTrackerBlob';
import ActionQueueList from '../../components/dashboard/ActionQueueList';
import ComplaintsTable from '../../components/ui/ComplaintsTable';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { SUB_STATUS } from '../../constants/complaintStatus';
import { departments } from '../../data/mockOfficers';
import { isMyActiveCase } from './investigatorQueue';
import { departmentInvestigatorNavItems } from './navConfig';

function actionReason(c) {
  return c.subStatus === SUB_STATUS.ASSIGNED_TO_INVESTIGATOR ? 'Not started yet, log an activity to begin' : 'In progress, findings not yet submitted';
}

export default function InvestigatorDashboardPage() {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const officerId = user?.officerId;
  const departmentName = departments.find((d) => d.id === user?.departmentId)?.name;

  const activeCases = complaints.filter((c) => isMyActiveCase(c, officerId));
  const notYetStarted = activeCases.filter((c) => c.subStatus === SUB_STATUS.ASSIGNED_TO_INVESTIGATOR);
  const inProgress = activeCases.filter((c) => c.subStatus === SUB_STATUS.INVESTIGATING);
  const mine = complaints.filter((c) => c.investigatorId === officerId);
  const totalHandled = mine.length;
  const recentComplaints = [...mine].sort((a, b) => new Date(b.dateFiled) - new Date(a.dateFiled)).slice(0, 10);

  const situationMessages = [
    {
      text: activeCases.length > 0
        ? `You have ${activeCases.length} active case${activeCases.length === 1 ? '' : 's'} right now.`
        : 'No active cases right now, new assignments will show up here.',
    },
    {
      text: `${notYetStarted.length} not yet started, ${inProgress.length} in progress.`,
    },
    {
      text: `You've investigated ${totalHandled} complaint${totalHandled === 1 ? '' : 's'} in total so far.`,
    },
  ];

  return (
    <AppShell navItems={departmentInvestigatorNavItems} user={user}>
      <PageHeader
        title="Department Investigation Officer Dashboard"
        subtitle={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}. Log activity and record findings on your active cases.`}
      />

      <HeroBanner
        greetingName={user?.name?.split(' ')[0] || 'there'}
        badge={`Department Investigation Officer${departmentName ? ` - ${departmentName}` : ''}`}
        situationMessages={situationMessages}
        rightSlot={<QuickTrackerBlob />}
        stats={[
          { icon: Clock, value: notYetStarted.length, label: 'Not Yet Started' },
          { icon: Activity, value: inProgress.length, label: 'In Progress' },
          { icon: ClipboardList, value: totalHandled, label: 'Total Handled' },
        ]}
      />

      <ActionQueueList
        title="Cases Needing Attention"
        items={activeCases}
        getHref={(c) => `/department-investigator/complaints/${c.id}`}
        getReason={actionReason}
        getNavFrom={() => '/department-investigator/cases'}
        emptyMessage="No active cases right now, new assignments will show up here."
      />

      <div className="recent-complaints-card">
        <div className="section-header-flex">
          <h2>Recent Complaints</h2>
        </div>
        <ComplaintsTable
          complaints={recentComplaints}
          getActionHref={(c) => `/department-investigator/complaints/${c.id}`}
        />
      </div>
    </AppShell>
  );
}
