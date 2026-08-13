import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Building2, Briefcase, Mic, Activity, FileText, Hash, Tag, Paperclip, Phone, Users, StickyNote, AlertOctagon, RotateCcw } from 'lucide-react';
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
import { stageProgressPercent, isBounceBackActivity, buildActivityTimeline } from '../../constants/complaintStatus';
import { CATEGORY_LABELS, CATEGORY_COLOR } from '../../constants/complaintCategories';
import { offices, departments } from '../../data/mockOfficers';
import { isMyActiveCase } from './investigatorQueue';
import { departmentInvestigatorNavItems } from './navConfig';
import { userCanViewComplaint } from '../scopeComplaints';
import LogActivityModal from './modals/LogActivityModal';
import UpdateFindingsModal from './modals/UpdateFindingsModal';

const ACTIVITY_ICONS = { call: Phone, meeting: Users, note: StickyNote };

const CONFIRM_COPY = {
  submit: { description: 'This locks your findings and sends them to your Supervisor for review, you will not be able to edit them after this.' },
};

const SUCCESS_COPY = {
  submit: 'Findings submitted successfully!',
  logActivity: 'Activity logged successfully!',
  updateFindings: 'Findings updated successfully!',
};

export default function InvestigatorComplaintDetailPage() {
  const { complaintId } = useParams();
  const { user } = useAuth();
  const { getComplaintById, findRelatedComplaints, attachDocuments, logInvestigationActivity, updateInvestigationFinding, submitInvestigationFindings } = useComplaints();

  const complaint = getComplaintById(complaintId);
  const [flow, setFlow] = useState({ type: null, step: null, payload: null });
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [showOffenderHistory, setShowOffenderHistory] = useState(false);

  if (!complaint || !userCanViewComplaint(complaint, user)) {
    return (
      <AppShell navItems={departmentInvestigatorNavItems} user={user}>
        <div className="detail-top-nav-bar">
          <Link to="/department-investigator/cases" className="back-to-cases-btn">
            <ArrowLeft size={16} /> Back to My Cases
          </Link>
        </div>
        <h1>Complaint not found</h1>
        <p>This complaint may have been removed, or you don't have access to it.</p>
      </AppShell>
    );
  }

  const officerId = user?.officerId;
  const closeFlow = () => setFlow({ type: null, step: null, payload: null });

  const handleLogActivity = (payload) => {
    logInvestigationActivity(complaint.id, payload);
    if (payload?.files?.length) attachDocuments(complaint.id, payload.files, 'Investigation Activity Log');
    setFlow((f) => ({ ...f, step: 'success' }));
  };

  const handleUpdateFindings = (payload) => {
    updateInvestigationFinding(complaint.id, payload);
    if (payload?.files?.length) attachDocuments(complaint.id, payload.files, 'Investigation Findings');
    setFlow((f) => ({ ...f, step: 'success' }));
  };

  const handleConfirm = () => {
    if (flow.type === 'submit') {
      submitInvestigationFindings(complaint.id);
    }
    setFlow((f) => ({ ...f, step: 'success' }));
  };

  const officeName = offices.find((o) => o.id === complaint.office)?.name;
  const departmentName = departments.find((d) => d.id === complaint.department)?.name;
  const isActive = isMyActiveCase(complaint, officerId);
  const activities = [...(complaint.investigation.activities || [])].sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt));

  const sortedActivity = [...complaint.activityLog].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const progressPct = stageProgressPercent(complaint.stageIndex);
  const categoryColor = CATEGORY_COLOR[complaint.category] || 'info';
  const isRepeatViolator = findRelatedComplaints(complaint.id).length > 0;

  return (
    <AppShell navItems={departmentInvestigatorNavItems} user={user}>
      <div className="detail-top-nav-bar">
        <Link to="/department-investigator/cases" className="back-to-cases-btn">
          <ArrowLeft size={16} /> Back to My Cases
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

        {isActive && (
          <div className="hero-actions-row">
            <Button variant="secondary" onClick={() => setFlow({ type: 'logActivity', step: 'input', payload: null })}>Log Activity</Button>
            <Button variant="secondary" onClick={() => setFlow({ type: 'updateFindings', step: 'input', payload: null })}>Update Findings</Button>
            <Button
              variant="primary"
              disabled={!complaint.investigation.finding}
              onClick={() => setFlow({ type: 'submit', step: 'confirm', payload: null })}
            >
              Submit Final Findings
            </Button>
          </div>
        )}

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

          <div className="detail-section-card">
            <h3 className="section-card-title"><FileText size={14} /> Findings &amp; Recommendation</h3>
            {complaint.investigation.finding ? (
              <>
                <p className="review-summary-line">{complaint.investigation.finding}</p>
                {complaint.investigation.recommendation && (
                  <p className="review-summary-line" style={{ marginTop: 8 }}>
                    <strong>Recommendation:</strong> {complaint.investigation.recommendation}
                  </p>
                )}
              </>
            ) : (
              <p className="review-summary-line" style={{ color: 'var(--text-muted)' }}>No findings recorded yet, use Update Findings to add them.</p>
            )}
          </div>

          {activities.length > 0 && (
            <div className="detail-section-card">
              <h3 className="section-card-title"><Users size={14} /> Investigation Activities ({activities.length})</h3>
              <div className="activity-vertical-timeline">
                {activities.map((entry) => {
                  const Icon = ACTIVITY_ICONS[entry.type] || StickyNote;
                  return (
                    <div key={entry.id} className="activity-timeline-item">
                      <span className="activity-node-icon"><Icon size={13} /></span>
                      <div className="activity-item-content">
                        <div className="activity-item-header">{entry.type.charAt(0).toUpperCase() + entry.type.slice(1)} with {entry.withParty}</div>
                        <div className="activity-item-date">{entry.summary}</div>
                        <div className="activity-item-date">{new Date(entry.loggedAt).toLocaleString()}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
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

      <LogActivityModal
        key={`log-activity-${complaint.id}`}
        open={flow.type === 'logActivity' && flow.step === 'input'}
        onClose={closeFlow}
        onSubmit={handleLogActivity}
      />
      <UpdateFindingsModal
        key={`update-findings-${complaint.id}`}
        open={flow.type === 'updateFindings' && flow.step === 'input'}
        complaint={complaint}
        onClose={closeFlow}
        onSubmit={handleUpdateFindings}
      />

      <ConfirmActionModal
        open={flow.type === 'submit' && flow.step === 'confirm'}
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
