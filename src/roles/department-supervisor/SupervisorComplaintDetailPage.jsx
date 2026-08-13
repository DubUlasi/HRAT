import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Building2, Briefcase, Mic, Activity, FileText, Hash, Tag, Paperclip, Users, AlertOctagon, RotateCcw } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import StageTracker from '../../components/ui/StageTracker';
import ConfirmActionModal from '../../components/ui/ConfirmActionModal';
import SuccessModal from '../../components/ui/SuccessModal';
import AssignPersonModal from '../../components/complaints/AssignPersonModal';
import HeroPersonCard from '../../components/complaints/HeroPersonCard';
import ActivityLogDrawer from '../../components/complaints/ActivityLogDrawer';
import RelatedComplaintsPanel from '../../components/complaints/RelatedComplaintsPanel';
import OffenderCaseHistoryDrawer from '../../components/complaints/OffenderCaseHistoryDrawer';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { stageProgressPercent, isBounceBackActivity, buildActivityTimeline } from '../../constants/complaintStatus';
import { CATEGORY_LABELS, CATEGORY_COLOR } from '../../constants/complaintCategories';
import { offices, departments, investigationOfficers } from '../../data/mockOfficers';
import { needsInvestigatorAssignment, needsFindingsReview } from './supervisorQueue';
import { departmentSupervisorNavItems } from './navConfig';
import { userCanViewComplaint } from '../scopeComplaints';
import SupervisorReviewModal from './modals/SupervisorReviewModal';

const CONFIRM_COPY = {
  assignInvestigator: { description: 'You are assigning this complaint to an investigator.' },
  review: { description: 'Your response determines whether this goes to the Director or back to the investigator.' },
};

const STAGE_LABEL = {
  assignInvestigator: 'Investigator Assignment',
  review: 'Supervisor Review',
};

const SUCCESS_COPY = {
  assignInvestigator: 'Assigned to investigator successfully!',
  review: 'Review recorded successfully!',
};

export default function SupervisorComplaintDetailPage() {
  const { complaintId } = useParams();
  const { user } = useAuth();
  const { getComplaintById, findRelatedComplaints, attachDocuments, assignInvestigator, supervisorReview } = useComplaints();

  const complaint = getComplaintById(complaintId);
  const [flow, setFlow] = useState({ type: null, step: null, payload: null });
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [showOffenderHistory, setShowOffenderHistory] = useState(false);

  if (!complaint || !userCanViewComplaint(complaint, user)) {
    return (
      <AppShell navItems={departmentSupervisorNavItems} user={user}>
        <div className="detail-top-nav-bar">
          <Link to="/department-supervisor/to-assign" className="back-to-cases-btn">
            <ArrowLeft size={16} /> Back to To Assign
          </Link>
        </div>
        <h1>Complaint not found</h1>
        <p>This complaint may have been removed, or you don't have access to it.</p>
      </AppShell>
    );
  }

  const officerId = user?.officerId;
  const closeFlow = () => setFlow({ type: null, step: null, payload: null });
  const handleInputSubmit = (payload) => setFlow((f) => ({ ...f, step: 'confirm', payload }));

  const handleConfirm = () => {
    const { type, payload } = flow;
    if (type === 'assignInvestigator') {
      assignInvestigator(complaint.id, payload);
    } else if (type === 'review') {
      supervisorReview(complaint.id, payload);
    }
    if (payload?.files?.length) {
      attachDocuments(complaint.id, payload.files, STAGE_LABEL[type] || null);
    }
    setFlow((f) => ({ ...f, step: 'success' }));
  };

  const officeName = offices.find((o) => o.id === complaint.office)?.name;
  const departmentName = departments.find((d) => d.id === complaint.department)?.name;
  const deptInvestigators = investigationOfficers.filter((i) => i.departmentId === complaint.department);

  const renderActionButton = () => {
    if (needsInvestigatorAssignment(complaint, officerId)) {
      return <Button variant="primary" onClick={() => setFlow({ type: 'assignInvestigator', step: 'input', payload: null })}>Assign Investigator</Button>;
    }
    if (needsFindingsReview(complaint, officerId)) {
      return <Button variant="primary" onClick={() => setFlow({ type: 'review', step: 'input', payload: null })}>Review Findings</Button>;
    }
    return null;
  };

  const sortedActivity = [...complaint.activityLog].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const progressPct = stageProgressPercent(complaint.stageIndex);
  const actionButton = renderActionButton();
  const categoryColor = CATEGORY_COLOR[complaint.category] || 'info';
  const isRepeatViolator = findRelatedComplaints(complaint.id).length > 0;

  return (
    <AppShell navItems={departmentSupervisorNavItems} user={user}>
      <div className="detail-top-nav-bar">
        <Link to="/department-supervisor/to-assign" className="back-to-cases-btn">
          <ArrowLeft size={16} /> Back to To Assign
        </Link>
      </div>

      <div className="case-detail-hero" style={{ '--category-color': `var(--${categoryColor}-color)`, '--category-tint': `var(--${categoryColor}-light)` }}>
        <div className="hero-top-row">
          <div className="hero-left-content">
            <div className="hero-tags-row">
              {complaint.complaintNumber && <span className="detail-tracking-code">{complaint.complaintNumber}</span>}
              <span className={`category-pill pill-${categoryColor}`}>{CATEGORY_LABELS[complaint.category]}</span>
              {isRepeatViolator && (
                <span className="urgency-pill negative repeat-violator-pill">
                  <AlertOctagon size={11} /> Repeat Violator
                </span>
              )}
            </div>

            <h1 className="hero-case-title">{complaint.subject}</h1>
            <p className="hero-case-description">{complaint.description}</p>

            <div className="hero-meta-row">
              <span><Calendar size={13} /> Filed {new Date(complaint.dateFiled).toDateString()}</span>
              {officeName && <span><Building2 size={13} /> {officeName}</span>}
              {departmentName && <span><Briefcase size={13} /> {departmentName}</span>}
            </div>
          </div>

          <div className="status-hero-card">
            <span className="status-card-label">Current Status</span>
            <StatusBadge status={complaint.subStatus} />
            <div className="status-progress-ring" style={{ '--pct': progressPct }}>
              <div className="status-progress-ring-inner">
                <span className="status-progress-value">{progressPct}%</span>
                <span className="status-progress-caption">Complete</span>
              </div>
            </div>
          </div>
        </div>

        {actionButton && <div className="hero-actions-row">{actionButton}</div>}

        <div className="hero-people-section">
          <span className="hero-people-label"><Users size={12} /> People Involved</span>
          <div className="hero-people-grid">
            <HeroPersonCard roleLabel="Victim" person={complaint.victim} tagVariant="victim" />
            <HeroPersonCard roleLabel="Alleged Violator" person={complaint.allegedViolator} tagVariant="violator" />
          </div>
        </div>
      </div>

      <StageTracker stageIndex={complaint.stageIndex} onStageClick={() => setShowActivityLog(true)} />

      <div className="case-detail-content-grid">
        <div className="detail-column-left">
          <div className="detail-section-card">
            <div className="section-header-flex">
              <h3 className="section-card-title"><Activity size={14} /> Activity Timeline</h3>
              <button type="button" className="btn-link" onClick={() => setShowActivityLog(true)}>View Full Log</button>
            </div>
            <div className="activity-vertical-timeline">
              {buildActivityTimeline(sortedActivity).map((entry, idx) => {
                const bounceBack = isBounceBackActivity(entry.message);
                return (
                  <div key={entry.id} className={`activity-timeline-item ${idx === 0 ? 'current' : ''} ${bounceBack ? 'bounce-back' : ''}`}>
                    <span className="activity-node-icon">
                      {bounceBack ? <RotateCcw size={10} /> : idx === 0 ? <span className="current-ring-inner" /> : <span className="locked-circle" />}
                    </span>
                    <div className="activity-item-content">
                      <div className="activity-item-header">
                        {entry.message}
                        {bounceBack && <span className="bounce-back-tag">Sent Back</span>}
                      </div>
                      <div className="activity-item-date">{new Date(entry.timestamp).toLocaleString()}, {entry.actor}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {(complaint.investigation.finding || complaint.investigation.recommendation) && (
            <div className="detail-section-card">
              <h3 className="section-card-title"><FileText size={14} /> Investigation Findings</h3>
              {complaint.investigation.finding && <p className="review-summary-line">{complaint.investigation.finding}</p>}
              {complaint.investigation.recommendation && (
                <p className="review-summary-line" style={{ marginTop: 8 }}>
                  <strong>Recommendation:</strong> {complaint.investigation.recommendation}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="detail-column-right">
          <div className="detail-section-card">
            <h3 className="section-card-title"><FileText size={14} /> Case Details</h3>
            <div className="case-spec-list">
              <div className="spec-item">
                <span className="spec-label"><Hash size={12} /> Complaint No.</span>
                <span className="spec-value mono">{complaint.complaintNumber || '—'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label"><Tag size={12} /> Category</span>
                <span className="spec-value">{CATEGORY_LABELS[complaint.category]}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label"><Building2 size={12} /> Handling Office</span>
                <span className="spec-value">{officeName || '—'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label"><Briefcase size={12} /> Handling Dept.</span>
                <span className="spec-value">{departmentName || '—'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label"><Calendar size={12} /> Date Filed</span>
                <span className="spec-value">{new Date(complaint.dateFiled).toDateString()}</span>
              </div>
            </div>
          </div>

          {complaint.voiceRecordingUrl && (
            <div className="detail-section-card">
              <h3 className="section-card-title"><Mic size={15} /> Voice Recording</h3>
              <p className="voice-recording-note">Original audio submitted with this complaint, always available for reference.</p>
              <audio controls src={complaint.voiceRecordingUrl} className="voice-recording-player" />
            </div>
          )}

          {(complaint.evidence?.length > 0 || complaint.documents?.length > 0) && (
            <div className="detail-section-card">
              <h3 className="section-card-title">
                <Paperclip size={15} /> Documents &amp; Resources ({(complaint.evidence?.length || 0) + (complaint.documents?.length || 0)})
              </h3>
              <div className="evidence-file-list">
                {complaint.evidence?.map((file, idx) => (
                  <a key={`ev-${file.name}-${idx}`} href={file.url} target="_blank" rel="noreferrer" className="evidence-file-row">
                    <FileText size={14} />
                    <div className="evidence-file-info">
                      <span className="evidence-file-name">{file.name}</span>
                      <span className="evidence-file-meta">Filed with complaint</span>
                    </div>
                  </a>
                ))}
                {complaint.documents?.map((doc) => (
                  <a key={doc.id} href={doc.url} target="_blank" rel="noreferrer" className="evidence-file-row">
                    <FileText size={14} />
                    <div className="evidence-file-info">
                      <span className="evidence-file-name">{doc.name}</span>
                      <span className="evidence-file-meta">
                        {doc.stage ? `${doc.stage} · ` : ''}{doc.uploadedBy}, {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          <RelatedComplaintsPanel
            complaintId={complaint.id}
            onViewFullHistory={() => setShowOffenderHistory(true)}
          />
        </div>
      </div>

      <AssignPersonModal
        key={`assign-investigator-${complaint.id}`}
        open={flow.type === 'assignInvestigator' && flow.step === 'input'}
        title="Assign Investigator"
        personLabel="Investigator"
        people={deptInvestigators}
        onClose={closeFlow}
        onSubmit={handleInputSubmit}
      />
      <SupervisorReviewModal
        key={`review-${complaint.id}`}
        open={flow.type === 'review' && flow.step === 'input'}
        complaint={complaint}
        onClose={closeFlow}
        onSubmit={handleInputSubmit}
      />

      <ConfirmActionModal
        open={flow.step === 'confirm'}
        description={CONFIRM_COPY[flow.type]?.description || ''}
        onCancel={closeFlow}
        onConfirm={handleConfirm}
      />

      <SuccessModal
        open={flow.step === 'success'}
        message={flow.type ? SUCCESS_COPY[flow.type] : ''}
        onClose={closeFlow}
      />

      <ActivityLogDrawer
        open={showActivityLog}
        onClose={() => setShowActivityLog(false)}
        activityLog={complaint.activityLog}
        documents={complaint.documents}
      />

      <OffenderCaseHistoryDrawer
        open={showOffenderHistory}
        onClose={() => setShowOffenderHistory(false)}
        complaintId={complaint.id}
      />
    </AppShell>
  );
}
