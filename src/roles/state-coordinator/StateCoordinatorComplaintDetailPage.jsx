import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Building2, Mic, Activity, FileText, Hash, Tag, Paperclip, Users, AlertOctagon, RotateCcw, Flag, UsersRound, ClipboardCheck } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import BackButton from '../../components/ui/BackButton';
import DownloadCsvButton from '../../components/ui/DownloadCsvButton';
import StatusBadge from '../../components/ui/StatusBadge';
import StageTracker from '../../components/ui/StageTracker';
import ConfirmActionModal from '../../components/ui/ConfirmActionModal';
import SuccessModal from '../../components/ui/SuccessModal';
import AssignPersonModal from '../../components/complaints/AssignPersonModal';
import HeroPersonCard from '../../components/complaints/HeroPersonCard';
import ActivityLogDrawer from '../../components/complaints/ActivityLogDrawer';
import RelatedComplaintsPanel from '../../components/complaints/RelatedComplaintsPanel';
import OffenderCaseHistoryDrawer from '../../components/complaints/OffenderCaseHistoryDrawer';
import FlagComplaintModal from '../../components/complaints/FlagComplaintModal';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { downloadComplaintReport } from '../../utils/exportUtils';
import { stageProgressPercent, isBounceBackActivity, buildActivityTimeline } from '../../constants/complaintStatus';
import { CATEGORY_LABELS, CATEGORY_COLOR } from '../../constants/complaintCategories';
import { offices, statePersonnel } from '../../data/mockOfficers';
import { needsPersonnelAssignment, needsCoordinatorReview } from './stateCoordinatorQueue';
import { stateCoordinatorNavItems } from './navConfig';
import { userCanViewComplaint, scopeComplaintsForUser } from '../scopeComplaints';
import StateCoordinatorReviewModal from './modals/StateCoordinatorReviewModal';

const CONFIRM_COPY = {
  assignPersonnel: { description: 'You are assigning this complaint to a state personnel officer for local review.' },
  review: { description: 'Your response determines whether this goes back to head office or back to the personnel officer.' },
};

const STAGE_LABEL = {
  assignPersonnel: 'State Personnel Assignment',
  review: 'State Coordinator Review',
};

const SUCCESS_COPY = {
  assignPersonnel: 'Assigned to state personnel officer successfully!',
  review: 'Review recorded successfully!',
};

export default function StateCoordinatorComplaintDetailPage() {
  const { complaintId } = useParams();
  const { user } = useAuth();
  const { getComplaintById, findRelatedComplaints, attachDocuments, toggleComplaintFlag, assignStatePersonnel, stateCoordinatorReview } = useComplaints();

  const complaint = getComplaintById(complaintId);
  const [flow, setFlow] = useState({ type: null, step: null, payload: null });
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [showOffenderHistory, setShowOffenderHistory] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagSuccessMessage, setFlagSuccessMessage] = useState(null);

  if (!complaint || !userCanViewComplaint(complaint, user)) {
    return (
      <AppShell navItems={stateCoordinatorNavItems} user={user}>
        <div className="detail-top-nav-bar">
          <BackButton navItems={stateCoordinatorNavItems} fallbackTo="/state-coordinator/incoming" />
        </div>
        <h1>Complaint not found</h1>
        <p>This complaint may have been removed, or you don't have access to it.</p>
      </AppShell>
    );
  }

  const officeId = user?.officeId;
  const closeFlow = () => setFlow({ type: null, step: null, payload: null });
  const handleInputSubmit = (payload) => setFlow((f) => ({ ...f, step: 'confirm', payload }));

  const handleConfirm = () => {
    const { type, payload } = flow;
    if (type === 'assignPersonnel') {
      assignStatePersonnel(complaint.id, { personId: payload.personId, personName: payload.personName, remark: payload.remark });
    } else if (type === 'review') {
      stateCoordinatorReview(complaint.id, payload);
    }
    if (payload?.files?.length) {
      attachDocuments(complaint.id, payload.files, STAGE_LABEL[type] || null);
    }
    setFlow((f) => ({ ...f, step: 'success' }));
  };

  const handleToggleFlag = ({ flagged, reason }) => {
    toggleComplaintFlag(complaint.id, { flagged, reason });
    setShowFlagModal(false);
    setFlagSuccessMessage(flagged ? 'Complaint flagged successfully!' : 'Flag removed successfully!');
  };

  const officeName = offices.find((o) => o.id === complaint.office)?.name;
  const stateOfficeName = offices.find((o) => o.id === complaint.stateOffice?.sentTo)?.name;
  const officePersonnel = statePersonnel.filter((p) => p.officeId === officeId);

  const renderActionButton = () => {
    if (needsPersonnelAssignment(complaint, officeId)) {
      return <Button variant="primary" onClick={() => setFlow({ type: 'assignPersonnel', step: 'input', payload: null })}>Assign State Personnel Officer</Button>;
    }
    if (needsCoordinatorReview(complaint, officeId)) {
      return <Button variant="primary" onClick={() => setFlow({ type: 'review', step: 'input', payload: null })}>Review Findings</Button>;
    }
    return null;
  };

  const sortedActivity = [...complaint.activityLog].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const progressPct = stageProgressPercent(complaint.stageIndex);
  const actionButton = renderActionButton();
  const categoryColor = CATEGORY_COLOR[complaint.category] || 'info';
  const isRepeatViolator = scopeComplaintsForUser(findRelatedComplaints(complaint.id), user).length > 0;

  return (
    <AppShell navItems={stateCoordinatorNavItems} user={user}>
      <div className="detail-top-nav-bar">
        <BackButton navItems={stateCoordinatorNavItems} fallbackTo="/state-coordinator/incoming" />
        <DownloadCsvButton onDownload={() => downloadComplaintReport(complaint)} label="Download Report" />
      </div>

      <div className="case-detail-hero" style={{ '--category-color': `var(--${categoryColor}-color)`, '--category-tint': `var(--${categoryColor}-light)` }}>
        <div className="hero-top-row">
          <div className="hero-left-content">
            <div className="hero-tags-row">
              {complaint.complaintNumber && <span className="detail-tracking-code">{complaint.complaintNumber}</span>}
              <span className={`category-pill pill-${categoryColor}`}>{CATEGORY_LABELS[complaint.category]}</span>
              {complaint.filedBy?.type === 'group' && (
                <span className="urgency-pill info group-complaint-pill">
                  <UsersRound size={11} /> Group Complaint
                </span>
              )}
              {isRepeatViolator && (
                <span className="urgency-pill negative repeat-violator-pill">
                  <AlertOctagon size={11} /> Repeat Violator
                </span>
              )}
              {complaint.flagged && (
                <span className="urgency-pill warning flagged-pill">
                  <Flag size={11} /> Flagged
                </span>
              )}
            </div>

            <h1 className="hero-case-title">{complaint.subject}</h1>
            <p className="hero-case-description">{complaint.description}</p>

            <div className="hero-meta-row">
              <span><Calendar size={13} /> Filed {new Date(complaint.dateFiled).toDateString()}</span>
              {officeName && <span><Building2 size={13} /> {officeName}</span>}
              {stateOfficeName && <span><Building2 size={13} /> {stateOfficeName}</span>}
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

        <div className="hero-actions-row">
          {actionButton}
          <Button variant="secondary" icon={Flag} onClick={() => setShowFlagModal(true)}>
            {complaint.flagged ? 'Remove Flag' : 'Flag Complaint'}
          </Button>
        </div>

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
              <h3 className="section-card-title"><Activity size={14} /> Recent Activity</h3>
              <button type="button" className="btn-link" onClick={() => setShowActivityLog(true)}>View Full Log</button>
            </div>
            <div className="activity-vertical-timeline">
              {buildActivityTimeline(sortedActivity).map((entry, idx) => {
                const bounceBack = isBounceBackActivity(entry.message);
                return (
                  <div key={entry.id} className={`activity-timeline-item ${idx === 0 ? 'current' : ''} ${bounceBack ? 'bounce-back' : ''}`}>
                    <span className="activity-node-icon">
                      {bounceBack ? <RotateCcw size={10} /> : <span className={`activity-node-dot ${idx === 0 ? 'latest' : ''}`} />}
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

          {(complaint.stateOffice?.findingSummary || complaint.stateOffice?.assignedPersonnelName) && (
            <div className="detail-section-card">
              <h3 className="section-card-title"><ClipboardCheck size={14} /> State Office Review</h3>
              {complaint.stateOffice?.assignedPersonnelName && (
                <p className="review-summary-line">Assigned to: <strong>{complaint.stateOffice.assignedPersonnelName}</strong></p>
              )}
              {complaint.stateOffice?.assignmentRemark && (
                <p className="review-summary-line" style={{ marginTop: 8 }}>{complaint.stateOffice.assignmentRemark}</p>
              )}
              {complaint.stateOffice?.findingSummary && (
                <p className="review-summary-line" style={{ marginTop: 8 }}>
                  <strong>Findings:</strong> {complaint.stateOffice.findingSummary}
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
                <span className="spec-label"><Building2 size={12} /> State Office</span>
                <span className="spec-value">{stateOfficeName || '—'}</span>
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
        key={`assign-personnel-${complaint.id}`}
        open={flow.type === 'assignPersonnel' && flow.step === 'input'}
        title="Assign State Personnel Officer"
        personLabel="State Personnel Officer"
        people={officePersonnel}
        onClose={closeFlow}
        onSubmit={handleInputSubmit}
      />
      <StateCoordinatorReviewModal
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

      <FlagComplaintModal
        open={showFlagModal}
        onClose={() => setShowFlagModal(false)}
        flagged={complaint.flagged}
        onSubmit={handleToggleFlag}
      />

      <SuccessModal
        open={!!flagSuccessMessage}
        message={flagSuccessMessage || ''}
        onClose={() => setFlagSuccessMessage(null)}
      />
    </AppShell>
  );
}
