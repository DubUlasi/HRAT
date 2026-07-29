import React, { useState } from 'react';
import { FileText, Inbox, CheckCircle2, Clock, PlusCircle } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import HeroBanner from '../../components/dashboard/HeroBanner';
import QuickTrackerBlob from '../../components/dashboard/QuickTrackerBlob';
import Button from '../../components/ui/Button';
import ComplaintsTable from '../../components/ui/ComplaintsTable';
import MakeComplaintModal from '../../components/complaints/MakeComplaintModal';
import VoiceReportModal from '../../components/complaints/VoiceReportModal';
import ReportChoiceModal from '../../components/complaints/ReportChoiceModal';
import { useComplaints } from '../../context/ComplaintsContext';
import { SUB_STATUS, getSubStatusMeta } from '../../constants/complaintStatus';
import { registryHeadNavItems, registryHeadUser } from './navConfig';

const INACTIVE_STATUSES = [SUB_STATUS.CLOSED, SUB_STATUS.INADMISSIBLE, SUB_STATUS.WITHDRAWN];

export default function RegistryHeadDashboardPage() {
  const { complaints } = useComplaints();
  const [showReportChoice, setShowReportChoice] = useState(false);
  const [showMakeComplaint, setShowMakeComplaint] = useState(false);
  const [showVoiceReport, setShowVoiceReport] = useState(false);

  const newCount = complaints.filter((c) => c.subStatus === SUB_STATUS.NEW).length;
  const resolvedCount = complaints.filter((c) => c.subStatus === SUB_STATUS.CLOSED).length;
  const pendingCount = complaints.filter((c) => !INACTIVE_STATUSES.includes(c.subStatus)).length;
  const recentComplaints = [...complaints]
    .sort((a, b) => new Date(b.dateFiled) - new Date(a.dateFiled))
    .slice(0, 10);

  const latest = recentComplaints[0];
  const situationMessages = [
    {
      text: `You've got ${complaints.length} complaint${complaints.length === 1 ? '' : 's'} on file at the moment, ${pendingCount} still working their way through the pipeline, and ${resolvedCount} already resolved.`,
    },
    {
      text: latest
        ? `The most recent one, "${latest.subject}", is currently sitting at ${getSubStatusMeta(latest.subStatus).label}.`
        : 'Nothing filed yet, new complaints will show up here as soon as they come in.',
    },
    {
      text: pendingCount > 0
        ? `Whenever you have a moment, ${pendingCount} complaint${pendingCount === 1 ? ' could use' : 's could use'} a look in the Complaints tab.`
        : 'You are all caught up, nothing is waiting on you right now.',
    },
  ];

  return (
    <AppShell navItems={registryHeadNavItems} user={registryHeadUser}>
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${registryHeadUser.name.split(' ')[0]}. Here's what's happening across the registry.`}
        notificationCount={2}
        actions={
          <Button variant="primary" icon={PlusCircle} onClick={() => setShowReportChoice(true)}>
            Make a Complaint
          </Button>
        }
      />

      <HeroBanner
        greetingName="Bem"
        situationMessages={situationMessages}
        rightSlot={<QuickTrackerBlob />}
        stats={[
          { icon: FileText, value: complaints.length, label: 'Total Complaints' },
          { icon: Inbox, value: newCount, label: 'New' },
          { icon: CheckCircle2, value: resolvedCount, label: 'Resolved' },
          { icon: Clock, value: pendingCount, label: 'Pending' },
        ]}
      />

      <div className="recent-complaints-card">
        <div className="section-header-flex">
          <h2>Complaints</h2>
          <Button variant="secondary" to="/registry-head/complaints">View All Complaints</Button>
        </div>
        <ComplaintsTable
          complaints={recentComplaints}
          getActionHref={(c) => `/registry-head/complaints/${c.id}`}
        />
      </div>

      <ReportChoiceModal
        open={showReportChoice}
        onClose={() => setShowReportChoice(false)}
        onSelectType={() => { setShowReportChoice(false); setShowMakeComplaint(true); }}
        onSelectSpeak={() => { setShowReportChoice(false); setShowVoiceReport(true); }}
      />
      <MakeComplaintModal open={showMakeComplaint} onClose={() => setShowMakeComplaint(false)} />
      <VoiceReportModal open={showVoiceReport} onClose={() => setShowVoiceReport(false)} />
    </AppShell>
  );
}
