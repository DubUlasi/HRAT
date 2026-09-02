import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle2, PlusCircle, ChevronRight } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import HeroBanner from '../../components/dashboard/HeroBanner';
import QuickTrackerBlob from '../../components/dashboard/QuickTrackerBlob';
import Button from '../../components/ui/Button';
import StageTracker from '../../components/ui/StageTracker';
import ComplaintsTable from '../../components/ui/ComplaintsTable';
import EmptyState from '../../components/ui/EmptyState';
import MakeComplaintModal from '../../components/complaints/MakeComplaintModal';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { scopeComplaintsForUser } from '../scopeComplaints';
import { CATEGORY_LABELS } from '../../constants/complaintCategories';
import { SUB_STATUS } from '../../constants/complaintStatus';
import { complainantNavItems, complainantBottomNav, complainantUser } from './navConfig';

const INACTIVE = [SUB_STATUS.CLOSED];

// Own bespoke pill badge for the mobile card list (not the shared StatusBadge component) — one
// of the deliberate custom-design pieces of the complainant mobile experience, styled via the
// --cx-badge-* tokens in complainant-mobile.css rather than the app's shared status colors.
function getMobileStatusBadge(status) {
  if (status === SUB_STATUS.CLOSED) {
    return <span className="mobile-complaint-card-badge resolved">Resolved</span>;
  }
  if (status === SUB_STATUS.WITHDRAWN) {
    return <span className="mobile-complaint-card-badge withdrawn">Withdrawn</span>;
  }
  if (status === SUB_STATUS.NEW) {
    return <span className="mobile-complaint-card-badge pending">Pending</span>;
  }
  return <span className="mobile-complaint-card-badge investigation">Under Investigation</span>;
}

function mobileProgressColor(status) {
  if (status === SUB_STATUS.CLOSED) return 'green';
  if (status === SUB_STATUS.NEW) return 'yellow';
  return 'blue';
}

// A complainant's own home page — not a reuse of any other role's dashboard, since none of them
// fit "here's the status of the cases I filed". Track Complaints/My Profile are shared pages
// (see roleNavMap.js) reused as-is; this page and Support/Rights are the only new ones.
export default function ComplainantDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { complaints: allComplaints } = useComplaints();
  const [showNewModal, setShowNewModal] = useState(false);
  const person = user || complainantUser;
  const firstName = person.name.split(' ')[0];

  const myComplaints = scopeComplaintsForUser(allComplaints, person)
    .sort((a, b) => new Date(b.dateFiled) - new Date(a.dateFiled));

  const totalComplaints = myComplaints.length;
  const activeComplaints = myComplaints.filter((c) => !INACTIVE.includes(c.subStatus)).length;
  const resolvedComplaints = totalComplaints - activeComplaints;
  const latestCase = myComplaints[0];

  const situationMessages = [
    { text: 'Track your active human rights reports in real time.' },
    { text: 'Our desk officers are currently reviewing your submissions.' },
    { text: 'Access guidance on your legal rights at any time.' },
  ];

  return (
    <AppShell navItems={complainantNavItems} user={person} bottomNavItems={complainantBottomNav} mobileClassName="complainant-mobile-view">
      {/* ─── Desktop layout ─── */}
      <div className="complainant-desktop-header">
        <PageHeader
          title="Complaints Dashboard"
          subtitle="Manage and track your human rights complaints, access support, and view status updates."
          actions={<Button variant="primary" icon={PlusCircle} onClick={() => setShowNewModal(true)}>File New Complaint</Button>}
        />
      </div>

      <div className="complainant-desktop-hero">
        <HeroBanner
          greetingName={firstName}
          badge="Citizen Portal"
          situationMessages={situationMessages}
          rightSlot={<QuickTrackerBlob />}
          stats={[
            { icon: FileText, value: totalComplaints, label: 'Total Submitted' },
            { icon: Clock, value: activeComplaints, label: 'Active Reports' },
            { icon: CheckCircle2, value: resolvedComplaints, label: 'Resolved Reports' },
          ]}
        />
      </div>

      <div className="complainant-desktop-stage-card" style={{ marginTop: 24 }}>
        {!latestCase ? (
          <div className="categories-card">
            <h3 className="section-card-title"><Clock size={16} /> Case Stage Progress</h3>
            <p className="review-summary-line">You haven't submitted any complaints yet. Click "File New Complaint" above to get started.</p>
          </div>
        ) : (
          <div className="categories-card">
            <div className="section-header-flex">
              <div className="hero-tags-row">
                <span className="urgency-pill positive">Most Recent Case</span>
                <span className="detail-tracking-code">{latestCase.complaintNumber || 'PENDING'}</span>
                <span className="category-pill">{CATEGORY_LABELS[latestCase.category] || latestCase.category}</span>
              </div>
              <Button variant="secondary" onClick={() => navigate(`/registry-head/track?id=${latestCase.id}`)}>
                Track Full Progress
              </Button>
            </div>
            <h2 style={{ fontSize: 18, margin: '10px 0 2px' }}>{latestCase.subject}</h2>
            <p className="review-summary-line">Filed {new Date(latestCase.dateFiled).toDateString()}</p>
            <div style={{ marginTop: 12 }}>
              <StageTracker stageIndex={latestCase.stageIndex} />
            </div>
          </div>
        )}
      </div>

      <div className="complainant-desktop-table">
        <div className="categories-card" style={{ marginTop: 24 }}>
          <h2>My Submissions</h2>
          <ComplaintsTable
            complaints={myComplaints}
            getActionHref={(c) => `/registry-head/track?id=${c.id}`}
          />
        </div>
      </div>

      {/* ─── Mobile layout ─── */}
      <div className="complainant-mobile-hero">
        <div className="mobile-hero-card">
          <div className="mobile-hero-top">
            <Link to="/registry-head/settings" style={{ display: 'flex', textDecoration: 'none' }} title="View Profile & Settings">
              {person.avatarSrc ? (
                <img src={person.avatarSrc} alt="" className="mobile-hero-avatar" />
              ) : (
                <div className="mobile-hero-avatar-placeholder">{firstName.charAt(0)}</div>
              )}
            </Link>
          </div>

          <div className="mobile-hero-greeting">
            <h2>Hello, {firstName}</h2>
            <p>Do not allow any evil go unreported</p>
          </div>

          <div className="mobile-hero-stats">
            <div className="mobile-hero-stat">
              <div className="mobile-hero-stat-icon"><FileText size={14} /></div>
              <span className="mobile-hero-stat-value">{totalComplaints}</span>
              <span className="mobile-hero-stat-label">Total</span>
            </div>
            <div className="mobile-hero-stat">
              <div className="mobile-hero-stat-icon"><CheckCircle2 size={14} /></div>
              <span className="mobile-hero-stat-value">{resolvedComplaints}</span>
              <span className="mobile-hero-stat-label">Resolved</span>
            </div>
            <div className="mobile-hero-stat">
              <div className="mobile-hero-stat-icon"><Clock size={14} /></div>
              <span className="mobile-hero-stat-value">{activeComplaints}</span>
              <span className="mobile-hero-stat-label">Active</span>
            </div>
          </div>

          <button type="button" className="mobile-report-btn" onClick={() => setShowNewModal(true)}>
            <PlusCircle size={18} /> Report a Case <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="complainant-mobile-complaints">
        <div className="mobile-complaints-section">
          <div className="mobile-complaints-header">
            <h3>Recent Complaints</h3>
            <Link to="/registry-head/track">View all <ChevronRight size={16} /></Link>
          </div>

          {myComplaints.length === 0 ? (
            <EmptyState message="No complaints filed yet. Tap 'Report a Case' above to get started." />
          ) : (
            myComplaints.map((c) => {
              const stageIdx = c.stageIndex ?? 0;
              const progress = Math.max(((stageIdx + 1) / 7) * 100, 8);
              const truncated = c.subject && c.subject.length > 30 ? `${c.subject.slice(0, 30)}…` : c.subject;
              return (
                <div key={c.id} className="mobile-complaint-card" onClick={() => navigate(`/registry-head/track?id=${c.id}`)}>
                  <div className="mobile-complaint-card-header">
                    <h4 className="mobile-complaint-card-title">{truncated}</h4>
                    {getMobileStatusBadge(c.subStatus)}
                    <ChevronRight size={18} className="mobile-complaint-card-chevron" />
                  </div>
                  <div className="mobile-complaint-card-meta">
                    Alleged Violator: <strong>{c.allegedViolator?.name || 'N/A'}</strong>
                  </div>
                  <div className="mobile-complaint-progress">
                    <div className={`mobile-complaint-progress-fill ${mobileProgressColor(c.subStatus)}`} style={{ width: `${progress}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <MakeComplaintModal open={showNewModal} onClose={() => setShowNewModal(false)} isComplainant />
    </AppShell>
  );
}
