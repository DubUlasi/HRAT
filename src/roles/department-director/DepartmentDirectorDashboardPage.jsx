import React from 'react';
import { Inbox, UserPlus, CheckCircle2, Briefcase } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import HeroBanner from '../../components/dashboard/HeroBanner';
import QuickTrackerBlob from '../../components/dashboard/QuickTrackerBlob';
import ActionQueueList from '../../components/dashboard/ActionQueueList';
import ComplaintsTable from '../../components/ui/ComplaintsTable';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { departments } from '../../data/mockOfficers';
import { needsDeptReview, needsAssignment, needsFinalReview } from './directorQueue';
import { departmentDirectorNavItems } from './navConfig';

function actionReason(c, departmentId) {
  if (needsDeptReview(c, departmentId)) return 'New assignment, needs your accept/reject review';
  if (needsAssignment(c, departmentId)) return 'Accepted, needs a supervisor or investigator assigned';
  if (needsFinalReview(c, departmentId)) return 'Back from your supervisor, needs final sign-off';
  return null;
}

export default function DepartmentDirectorDashboardPage() {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const departmentId = user?.departmentId;
  const departmentName = departments.find((d) => d.id === departmentId)?.name;

  const pendingReview = complaints.filter((c) => needsDeptReview(c, departmentId));
  const pendingAssignment = complaints.filter((c) => needsAssignment(c, departmentId));
  const pendingFinalReview = complaints.filter((c) => needsFinalReview(c, departmentId));
  const departmentComplaints = complaints.filter((c) => c.department === departmentId);
  const departmentTotal = departmentComplaints.length;
  const needsAction = [...pendingReview, ...pendingAssignment, ...pendingFinalReview];
  const recentComplaints = [...departmentComplaints].sort((a, b) => new Date(b.dateFiled) - new Date(a.dateFiled)).slice(0, 10);

  const situationMessages = [
    {
      text: needsAction.length > 0
        ? `${departmentName || 'Your department'} has ${needsAction.length} complaint${needsAction.length === 1 ? '' : 's'} waiting on you right now.`
        : `${departmentName || 'Your department'} is all caught up, nothing is waiting on you right now.`,
    },
    {
      text: `${pendingReview.length} new assignment${pendingReview.length === 1 ? '' : 's'} to review, ${pendingFinalReview.length} final review${pendingFinalReview.length === 1 ? '' : 's'} pending.`,
    },
    {
      text: `${departmentTotal} complaint${departmentTotal === 1 ? '' : 's'} on file for your department in total.`,
    },
  ];

  return (
    <AppShell navItems={departmentDirectorNavItems} user={user}>
      <PageHeader
        title="Department Director Dashboard"
        subtitle={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}. Review, assign, and oversee your department's complaint pipeline.`}
      />

      <HeroBanner
        greetingName={user?.name?.split(' ')[0] || 'there'}
        badge={`Department Director${departmentName ? ` - ${departmentName}` : ''}`}
        situationMessages={situationMessages}
        rightSlot={<QuickTrackerBlob />}
        stats={[
          { icon: Inbox, value: pendingReview.length, label: 'New Assignments' },
          { icon: UserPlus, value: pendingAssignment.length, label: 'Awaiting Assignment' },
          { icon: CheckCircle2, value: pendingFinalReview.length, label: 'Final Reviews' },
          { icon: Briefcase, value: departmentTotal, label: 'Total In Department' },
        ]}
      />

      <ActionQueueList
        title="Needs Your Action"
        items={needsAction}
        getHref={(c) => `/department-director/complaints/${c.id}`}
        getReason={(c) => actionReason(c, departmentId)}
      />

      <div className="recent-complaints-card">
        <div className="section-header-flex">
          <h2>Recent Complaints</h2>
        </div>
        <ComplaintsTable
          complaints={recentComplaints}
          getActionHref={(c) => `/department-director/complaints/${c.id}`}
        />
      </div>
    </AppShell>
  );
}
