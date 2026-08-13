import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Building2, Briefcase, Mic, Activity, FileText, Hash, Tag, Paperclip, Users, AlertOctagon, RotateCcw } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import StageTracker from '../../components/ui/StageTracker';
import ConfirmActionModal from '../../components/ui/ConfirmActionModal';
import SuccessModal from '../../components/ui/SuccessModal';
import HeroPersonCard from '../../components/complaints/HeroPersonCard';
import ActivityLogDrawer from '../../components/complaints/ActivityLogDrawer';
import RelatedComplaintsPanel from '../../components/complaints/RelatedComplaintsPanel';
import OffenderCaseHistoryDrawer from '../../components/complaints/OffenderCaseHistoryDrawer';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { SUB_STATUS, stageProgressPercent, isBounceBackActivity, buildActivityTimeline } from '../../constants/complaintStatus';
import { CATEGORY_LABELS, CATEGORY_COLOR } from '../../constants/complaintCategories';
import { offices, departments } from '../../data/mockOfficers';
import { executiveSecretaryNavItems } from './navConfig';
import RecordVerdictModal from './modals/RecordVerdictModal';
import ReopenOrCloseModal from './modals/ReopenOrCloseModal';

const CONFIRM_COPY = {
  resolveEscalation: { description: 'This clears it from your Escalated To Me queue.' },
};

const STAGE_LABEL = {
  verdict: 'Council Verdict',
  reopenClose: 'Council Reopen/Close Decision',
};

const SUCCESS_COPY = {
  verdict: 'Council verdict recorded, case closed!',
  reopenClose: 'Council decision recorded successfully!',
  resolveEscalation: 'Escalation marked resolved!',
};

export default function ESComplaintDetailPage() {
  const { complaintId } = useParams();
  const { user } = useAuth();
  const { getComplaintById, findRelatedComplaints, attachDocuments, recordCouncilVerdict, councilReopenOrClose, resolveEscalation } = useComplaints();

  const complaint = getComplaintById(complaintId);
  const [flow, setFlow] = useState({ type: null, step: null, payload: null });
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [showOffenderHistory, setShowOffenderHistory] = useState(false);

  if (!complaint) {
    return (
      <AppShell navItems={executiveSecretaryNavItems} user={user}>
        <div className="detail-top-nav-bar">
          <Link to="/executive-secretary/council" className="back-to-cases-btn">
            <ArrowLeft size={16} /> Back to Council Review
          </Link>
        </div>
        <h1>Complaint not found</h1>
        <p>This complaint may have been removed or the link is incorrect.</p>
      </AppShell>
    );
  }

  const closeFlow = () => setFlow({ type: null, step: null, payload: null });
  const handleInputSubmit = (payload) => setFlow((f) => ({ ...f, step: 'confirm', payload }));

  const handleConfirm = () => {
    const { type, payload } = flow;
    if (type === 'verdict') {
      recordCouncilVerdict(complaint.id, payload);
    } else if (type === 'reopenClose') {
      councilReopenOrClose(complaint.id, { decision: payload.decision, recommendation: payload.recommendation });
    } else if (type === 'resolveEscalation') {
      resolveEscalation(complaint.id, { note: null });
    }
    if (payload?.files?.length) {
      attachDocuments(complaint.id, payload.files, STAGE_LABEL[type] || null);
    }
    setFlow((f) => ({ ...f, step: 'success' }));
  };

  const officeName = offices.find((o) => o.id === complaint.office)?.name;
  const departmentName = departments.find((d) => d.id === complaint.department)?.name;
  const isEscalated = complaint.esEscalation?.escalated && !complaint.esEscalation.resolved;

  const renderActionButton = () => {
    const buttons = [];
    if (complaint.subStatus === SUB_STATUS.READY_FOR_COUNCIL) {
      buttons.push(
        <Button key="verdict" variant="primary" onClick={() => setFlow({ type: 'verdict', step: 'input', payload: null })}>
          Record Council Verdict
        </Button>
      );
    }
    if (complaint.subStatus === SUB_STATUS.INADMISSIBLE) {
      buttons.push(
        <Button key="reopenClose" variant="primary" onClick={() => setFlow({ type: 'reopenClose', step: 'input', payload: null })}>
          Council Decision
        </Button>
      );
    }
    if (isEscalated) {
      buttons.push(
        <Button key="resolve" variant="secondary" onClick={() => setFlow({ type: 'resolveEscalation', step: 'confirm', payload: null })}>
          Mark Escalation Resolved
        </Button>
      );
    }
    return buttons.length ? buttons : null;
  };

  const sortedActivity = [...complaint.activityLog].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const progressPct = stageProgressPercent(complaint.stageIndex);
  const actionButton = renderActionButton();
  const categoryColor = CATEGORY_COLOR[complaint.category] || 'info';
  const isRepeatViolator = findRelatedComplaints(complaint.id).length > 0;

  return (
    <AppShell navItems={executiveSecretaryNavItems} user={user}>
      <div className="detail-top-nav-bar">
        <Link to="/executive-secretary/council" className="back-to-cases-btn">
          <ArrowLeft size={16} /> Back to Council Review
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
              {isEscalated && <span className="urgency-pill negative">Escalated to ES</span>}
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

          {complaint.esEscalation?.escalated && (
            <div className="detail-section-card">
              <h3 className="section-card-title"><Activity size={14} /> Escalation Note</h3>
              <p className="review-summary-line">{complaint.esEscalation.note || 'No note provided.'}</p>
              <p className="review-summary-meta" style={{ marginTop: 6 }}>
                Escalated by {complaint.esEscalation.escalatedBy} · {complaint.esEscalation.resolved ? 'Resolved' : 'Unresolved'}
              </p>
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

      <RecordVerdictModal
        key={`verdict-${complaint.id}`}
        open={flow.type === 'verdict' && flow.step === 'input'}
        onClose={closeFlow}
        onSubmit={handleInputSubmit}
      />
      <ReopenOrCloseModal
        key={`reopen-close-${complaint.id}`}
        open={flow.type === 'reopenClose' && flow.step === 'input'}
        complaint={complaint}
        onClose={closeFlow}
        onSubmit={handleInputSubmit}
      />

      <ConfirmActionModal
        open={flow.type === 'resolveEscalation' && flow.step === 'confirm'}
        description={CONFIRM_COPY.resolveEscalation.description}
        onCancel={closeFlow}
        onConfirm={handleConfirm}
      />
      <ConfirmActionModal
        open={(flow.type === 'verdict' || flow.type === 'reopenClose') && flow.step === 'confirm'}
        description="Your decision is permanent."
        onCancel={closeFlow}
        onConfirm={handleConfirm}
      />

      <SuccessModal
        open={flow.step === 'success'}
        message={flow.type === 'verdict' ? SUCCESS_COPY.verdict : flow.type === 'reopenClose' ? SUCCESS_COPY.reopenClose : flow.type === 'resolveEscalation' ? SUCCESS_COPY.resolveEscalation : ''}
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
