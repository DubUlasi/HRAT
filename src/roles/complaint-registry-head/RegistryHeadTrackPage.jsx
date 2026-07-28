import React, { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import FormField from '../../components/ui/FormField';
import StatusBadge from '../../components/ui/StatusBadge';
import StageTracker from '../../components/ui/StageTracker';
import ComplaintProfileCard from '../../components/complaints/ComplaintProfileCard';
import ActivityLogDrawer from '../../components/complaints/ActivityLogDrawer';
import { useComplaints } from '../../context/ComplaintsContext';
import { registryHeadNavItems, registryHeadUser } from './navConfig';

// The "select a complaint and view its progress" flow is identical for every role per the
// manual ("This is the same process used to track complaints for every type of user").
export default function RegistryHeadTrackPage() {
  const { complaints } = useComplaints();
  const [selectedId, setSelectedId] = useState('');
  const [showActivityLog, setShowActivityLog] = useState(false);

  const complaint = complaints.find((c) => c.id === selectedId);

  return (
    <AppShell navItems={registryHeadNavItems} user={registryHeadUser}>
      <PageHeader title="Track Complaint" subtitle="Check the details of a filed complaint here." />

      <div className="complaint-detail-main" style={{ marginBottom: 24 }}>
        <FormField label="Select Complaint">
          <Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            <option value="">-- Select Complaint --</option>
            {complaints.map((c) => (
              <option key={c.id} value={c.id}>
                {c.subject} — (submitted on {new Date(c.dateFiled).toDateString()})
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      {complaint && (
        <div className="complaint-detail-main">
          <div className="complaint-detail-main-header">
            <div>
              <h2>{complaint.subject}</h2>
              {complaint.complaintNumber && <p className="complaint-number">Complaint Number: {complaint.complaintNumber}</p>}
              <div style={{ marginTop: 8 }}>
                <StatusBadge status={complaint.subStatus} />
              </div>
            </div>
            <Button variant="secondary" to={`/registry-head/complaints/${complaint.id}`}>
              View Complaint
            </Button>
          </div>

          <StageTracker stageIndex={complaint.stageIndex} onStageClick={() => setShowActivityLog(true)} />

          <p className="complaint-description">{complaint.description}</p>

          <ComplaintProfileCard roleLabel="Victim" person={complaint.victim} tagVariant="victim" />
          <div style={{ height: 16 }} />
          <ComplaintProfileCard roleLabel="Alleged Violator" person={complaint.allegedViolator} tagVariant="violator" />
        </div>
      )}

      <ActivityLogDrawer
        open={showActivityLog}
        onClose={() => setShowActivityLog(false)}
        activityLog={complaint?.activityLog || []}
      />
    </AppShell>
  );
}
