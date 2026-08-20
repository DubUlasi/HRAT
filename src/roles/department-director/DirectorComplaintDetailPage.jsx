import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Building2, Briefcase, Mic, Activity, FileText, Hash, Tag, Paperclip, Users, AlertOctagon, RotateCcw, Flag, UsersRound, Phone, Mail } from 'lucide-react';
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
import InvestigationActivitiesCard from '../../components/complaints/InvestigationActivitiesCard';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { downloadComplaintReport } from '../../utils/exportUtils';
import { stageProgressPercent, isBounceBackActivity, buildActivityTimeline, canDirectorCommentOnActivities } from '../../constants/complaintStatus';
import { CATEGORY_LABELS, CATEGORY_COLOR } from '../../constants/complaintCategories';
import { offices, departments, departmentSupervisors, investigationOfficers } from '../../data/mockOfficers';
import { needsDeptReview, needsAssignment, needsFinalReview } from './directorQueue';
import { departmentDirectorNavItems } from './navConfig';
import { userCanViewComplaint, scopeComplaintsForUser } from '../scopeComplaints';
import DepartmentReviewModal from './modals/DepartmentReviewModal';
import DirectorFinalReviewModal from './modals/DirectorFinalReviewModal';

const CONFIRM_COPY = {
  reviewDept: { description: 'This decision goes back to the Registry Head if rejected.' },
  assignSupervisor: { description: 'You are assigning this complaint to a supervisor in your department.' },
  assignInvestigator: { description: 'You are assigning this complaint directly to an investigation officer.' },
  finalReview: { description: 'Your response is permanent.' },
};

const STAGE_LABEL = {
  reviewDept: 'Department Review',
  assignSupervisor: 'Supervisor Assignment',
  assignInvestigator: 'Investigation Officer Assignment',
  finalReview: 'Director Final Review',
};

const SUCCESS_COPY = {
  reviewDept: 'Department review recorded successfully!',
  assignSupervisor: 'Assigned to supervisor successfully!',
  assignInvestigator: 'Assigned to investigation officer successfully!',
  finalReview: 'Final review recorded successfully!',
};

export default function DirectorComplaintDetailPage() {
  const { complaintId } = useParams();
  const { user } = useAuth();
  const {
    getComplaintById,
    findRelatedComplaints,
    attachDocuments,
    toggleComplaintFlag,
    directorReviewDepartment,
    assignSupervisor,
    assignInvestigator,
    directorFinalReview,
    escalateToExecutiveSecretary,
    addActivityComment,
    updateActivityComment,
  } = useComplaints();

  const complaint = getComplaintById(complaintId);
  const [flow, setFlow] = useState({ type: null, step: null, payload: null });
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [showOffenderHistory, setShowOffenderHistory] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagSuccessMessage, setFlagSuccessMessage] = useState(null);

  if (!complaint || !userCanViewComplaint(complaint, user)) {
    return (
      <AppShell navItems={departmentDirectorNavItems} user={user}>
        <div className="detail-top-nav-bar">
          <BackButton navItems={departmentDirectorNavItems} fallbackTo="/department-director/new" />
        </div>
        <h1>Complaint not found</h1>
        <p>This complaint may have been removed, or you don't have access to it.</p>
      </AppShell>
    );
  }

  const departmentId = user?.departmentId;
  const startFlow = (type) => setFlow({ type, step: 'input', payload: null });
  const closeFlow = () => setFlow({ type: null, step: null, payload: null });
  const handleInputSubmit = (payload) => setFlow((f) => ({ ...f, step: 'confirm', payload }));

  const handleConfirm = () => {
    const { type, payload } = flow;
    if (type === 'reviewDept') {
      directorReviewDepartment(complaint.id, { accepted: payload.accepted, remark: payload.remark });
    } else if (type === 'assignSupervisor') {
      assignSupervisor(complaint.id, payload);
    } else if (type === 'assignInvestigator') {
      assignInvestigator(complaint.id, payload);
    } else if (type === 'finalReview') {
      directorFinalReview(complaint.id, { action: payload.action, remark: payload.remark });
      if (payload.escalate) {
        escalateToExecutiveSecretary(complaint.id, { note: payload.escalateNote });
      }
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
  const departmentName = departments.find((d) => d.id === complaint.department)?.name;
  const deptSupervisors = departmentSupervisors.filter((s) => s.departmentId === departmentId);
  const deptInvestigators = investigationOfficers.filter((i) => i.departmentId === departmentId);

  const renderActionButton = () => {
    if (needsDeptReview(complaint, departmentId)) {
      return <Button variant="primary" onClick={() => startFlow('reviewDept')}>Review Department Assignment</Button>;
    }
    if (needsAssignment(complaint, departmentId)) {
      return (
        <>
          <Button variant="primary" onClick={() => startFlow('assignSupervisor')}>Assign Supervisor</Button>
          <Button variant="secondary" onClick={() => startFlow('assignInvestigator')}>Assign Investigation Officer Directly</Button>
        </>
      );
    }
    if (needsFinalReview(complaint, departmentId)) {
      return <Button variant="primary" onClick={() => startFlow('finalReview')}>Final Review</Button>;
    }
    return null;
  };

  // Sorted by when the activity actually happened, not when it was typed into the system —
  // older entries predating the happenedOn field fall back to their loggedAt.
  const activities = [...(complaint.investigation.activities || [])].sort(
    (a, b) => new Date(b.happenedOn || b.loggedAt) - new Date(a.happenedOn || a.loggedAt)
  );

  const sortedActivity = [...complaint.activityLog].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const progressPct = stageProgressPercent(complaint.stageIndex);
  const actionButton = renderActionButton();
  const categoryColor = CATEGORY_COLOR[complaint.category] || 'info';
  const isRepeatViolator = scopeComplaintsForUser(findRelatedComplaints(complaint.id), user).length > 0;

  return (
    <AppShell navItems={departmentDirectorNavItems} user={user}>
      <div className="detail-top-nav-bar">
        <BackButton navItems={departmentDirectorNavItems} fallbackTo="/department-director/new" />
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
              {complaint.esEscalation?.escalated && !complaint.esEscalation.resolved && (
                <span className="urgency-pill negative">Escalated to ES</span>
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

          {(complaint.investigation.finding || complaint.investigation.recommendation || complaint.investigation.findingDocuments?.length > 0) && (
            <div className="detail-section-card">
              <h3 className="section-card-title"><FileText size={14} /> Investigation Findings</h3>
              {complaint.investigation.finding && <p className="review-summary-line">{complaint.investigation.finding}</p>}
              {complaint.investigation.recommendation && (
                <p className="review-summary-line" style={{ marginTop: 8 }}>
                  <strong>Recommendation:</strong> {complaint.investigation.recommendation}
                </p>
              )}
              {complaint.investigation.findingDocuments?.length > 0 && (
                <div className="activity-attachment-list" style={{ marginTop: 10 }}>
                  {complaint.investigation.findingDocuments.map((doc) => (
                    <a key={doc.id} href={doc.url} download={doc.name} target="_blank" rel="noreferrer" className="activity-attachment-row">
                      <Paperclip size={12} />
                      <span>{doc.name}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          <InvestigationActivitiesCard
            activities={activities}
            canComment={canDirectorCommentOnActivities(complaint.subStatus)}
            onAddComment={(entry, text) => addActivityComment(complaint.id, entry.id, text)}
            canEditComments={canDirectorCommentOnActivities(complaint.subStatus)}
            currentUserId={user?.officerId}
            onEditComment={(entry, comment, text) => updateActivityComment(complaint.id, entry.id, comment.id, text)}
          />
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
                <span className="spec-label"><Users size={12} /> Filed By</span>
                <span className="spec-value">{complaint.filedBy?.type === 'group' ? 'Group / Committee' : 'Individual'}</span>
              </div>
              {complaint.filedBy?.type === 'group' && (
                <>
                  <div className="spec-item">
                    <span className="spec-label"><UsersRound size={12} /> Group Name</span>
                    <span className="spec-value">{complaint.filedBy.groupName || '—'}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label"><Users size={12} /> Representative</span>
                    <span className="spec-value">{complaint.filedBy.representativeName || '—'}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label"><Phone size={12} /> Rep. Phone</span>
                    <span className="spec-value">{complaint.filedBy.representativePhone || '—'}</span>
                  </div>
                  {complaint.filedBy.representativeEmail && (
                    <div className="spec-item">
                      <span className="spec-label"><Mail size={12} /> Rep. Email</span>
                      <span className="spec-value">{complaint.filedBy.representativeEmail}</span>
                    </div>
                  )}
                </>
              )}
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

      <DepartmentReviewModal
        key={`review-dept-${complaint.id}`}
        open={flow.type === 'reviewDept' && flow.step === 'input'}
        complaint={complaint}
        onClose={closeFlow}
        onSubmit={handleInputSubmit}
      />
      <AssignPersonModal
        key={`assign-supervisor-${complaint.id}`}
        open={flow.type === 'assignSupervisor' && flow.step === 'input'}
        title="Assign Supervisor"
        personLabel="Supervisor"
        people={deptSupervisors}
        onClose={closeFlow}
        onSubmit={handleInputSubmit}
      />
      <AssignPersonModal
        key={`assign-investigator-${complaint.id}`}
        open={flow.type === 'assignInvestigator' && flow.step === 'input'}
        title="Assign Investigation Officer"
        personLabel="Investigation Officer"
        people={deptInvestigators}
        onClose={closeFlow}
        onSubmit={handleInputSubmit}
      />
      <DirectorFinalReviewModal
        key={`final-review-${complaint.id}`}
        open={flow.type === 'finalReview' && flow.step === 'input'}
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
