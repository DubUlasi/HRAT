import React from 'react';
import { TrendingUp, FileBarChart, Gavel, AlertOctagon, AlertTriangle, FileText } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import HeroBanner from '../../components/dashboard/HeroBanner';
import QuickTrackerBlob from '../../components/dashboard/QuickTrackerBlob';
import QuickLinksGrid from '../../components/dashboard/QuickLinksGrid';
import ActionQueueList from '../../components/dashboard/ActionQueueList';
import Button from '../../components/ui/Button';
import ComplaintsTable from '../../components/ui/ComplaintsTable';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { SUB_STATUS } from '../../constants/complaintStatus';
import { executiveSecretaryNavItems } from './navConfig';

function actionReason(c) {
  if (c.esEscalation?.escalated && !c.esEscalation.resolved) return 'Escalated to you for attention';
  if (c.subStatus === SUB_STATUS.READY_FOR_COUNCIL) return 'Ready for council verdict';
  if (c.subStatus === SUB_STATUS.INADMISSIBLE) return 'Ruled inadmissible, needs your reopen/close decision';
  return null;
}

// Ready For Council/Inadmissible Review are tabs on one page; Escalated To Me is a separate
// nav page — this queue merges rows from both, so which one a row "belongs to" (for sidebar
// highlighting) depends on its own status, not on the fact that they're all in one widget here.
function actionNavFrom(c) {
  if (c.esEscalation?.escalated && !c.esEscalation.resolved) return '/executive-secretary/escalated';
  return '/executive-secretary/council';
}

export default function ESDashboardPage() {
  const { user } = useAuth();
  const { complaints } = useComplaints();

  const readyForCouncil = complaints.filter((c) => c.subStatus === SUB_STATUS.READY_FOR_COUNCIL);
  const inadmissible = complaints.filter((c) => c.subStatus === SUB_STATUS.INADMISSIBLE);
  const escalated = complaints.filter((c) => c.esEscalation?.escalated && !c.esEscalation.resolved);
  const needsActionIds = new Set([...readyForCouncil, ...inadmissible, ...escalated].map((c) => c.id));
  const needsAction = complaints.filter((c) => needsActionIds.has(c.id));
  const recentComplaints = [...complaints].sort((a, b) => new Date(b.dateFiled) - new Date(a.dateFiled)).slice(0, 10);

  const situationMessages = [
    {
      text: `You have ${readyForCouncil.length} complaint${readyForCouncil.length === 1 ? '' : 's'} ready for council and ${inadmissible.length} awaiting inadmissible review.`,
    },
    {
      text: escalated.length > 0
        ? `${escalated.length} complaint${escalated.length === 1 ? '' : 's'} escalated to you for attention.`
        : 'Nothing escalated to you right now.',
    },
    {
      text: `${complaints.length} complaints on file across the entire registry.`,
    },
  ];

  return (
    <AppShell navItems={executiveSecretaryNavItems} user={user}>
      <PageHeader
        title="Executive Secretary Dashboard"
        subtitle={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}. Review council-ready cases and oversee the registry.`}
      />

      <HeroBanner
        greetingName={user?.name?.split(' ')[0] || 'there'}
        badge="Executive Secretary"
        situationMessages={situationMessages}
        rightSlot={<QuickTrackerBlob />}
        stats={[
          { icon: Gavel, value: readyForCouncil.length, label: 'Ready For Council' },
          { icon: AlertTriangle, value: inadmissible.length, label: 'Inadmissible Review' },
          { icon: AlertOctagon, value: escalated.length, label: 'Escalated To You' },
          { icon: FileText, value: complaints.length, label: 'Total Complaints' },
        ]}
      />

      <QuickLinksGrid
        title="Quick Links"
        links={[
          { to: '/registry-head/business-intelligence', icon: TrendingUp, accent: 'info', title: 'Business Intelligence', description: 'Registry-wide trends, cycle times, and office/department performance.' },
          { to: '/registry-head/reports', icon: FileBarChart, accent: 'violet', title: 'Custom Reports', description: 'Build a report from any combination of filters and download it.' },
        ]}
      />

      <ActionQueueList
        title="Needs Your Action"
        items={needsAction}
        getHref={(c) => `/executive-secretary/complaints/${c.id}`}
        getReason={actionReason}
        getNavFrom={actionNavFrom}
      />

      <div className="recent-complaints-card">
        <div className="section-header-flex">
          <h2>Recent Complaints</h2>
          <Button variant="secondary" to="/executive-secretary/council">View Council Queue</Button>
        </div>
        <ComplaintsTable
          complaints={recentComplaints}
          getActionHref={(c) => `/executive-secretary/complaints/${c.id}`}
        />
      </div>
    </AppShell>
  );
}
