import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle2, PlusCircle, ChevronRight } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import HeroBanner from '../../components/dashboard/HeroBanner';
import QuickTrackerBlob from '../../components/dashboard/QuickTrackerBlob';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import ProgressBar from '../../components/ui/ProgressBar';
import MakeComplaintModal from '../../components/complaints/MakeComplaintModal';
import { useAuth } from '../../context/AuthContext';
import { getComplainantDashboard, listComplainantComplaints } from '../../api/complainantApi';
import { complainantNavItems, complainantBottomNav, complainantUser } from './navConfig';

// Own bespoke pill badge for the mobile card list (not the shared StatusBadge component) — one
// of the deliberate custom-design pieces of the complainant mobile experience, styled via the
// --cx-badge-* tokens in complainant-mobile.css rather than the app's shared status colors.
// Real `status` comes back as the ComplaintStatus enum's own name (Draft/Submitted/
// UnderAdmissibilityReview/Assigned/Investigating/Closed/Withdrawn/Abandoned), not the mock
// SUB_STATUS values this used to switch on.
function getMobileStatusBadge(status) {
  if (status === 'Closed') return <span className="mobile-complaint-card-badge resolved">Resolved</span>;
  if (status === 'Withdrawn' || status === 'Abandoned') return <span className="mobile-complaint-card-badge withdrawn">Withdrawn</span>;
  if (status === 'Submitted') return <span className="mobile-complaint-card-badge pending">Pending</span>;
  return <span className="mobile-complaint-card-badge investigation">Under Investigation</span>;
}

function mobileProgressColor(status) {
  if (status === 'Closed') return 'green';
  if (status === 'Submitted') return 'yellow';
  return 'blue';
}

// A complainant's own home page — not a reuse of any other role's dashboard, since none of them
// fit "here's the status of the cases I filed". Track Complaints/My Profile are shared pages
// (see roleNavMap.js) reused as-is; this page and Support/Rights are the only new ones.
//
// Reads real data from GET /complainants/dashboard + GET /complainants (the mock complaints
// context is not used here at all for this role) — see the "Wire the frontend up to the real
// HRAT backend API" plan, Phase 2.
export default function ComplainantDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showNewModal, setShowNewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const person = user || complainantUser;
  const firstName = (person.name || '').split(' ')[0];

  const loadData = () => {
    setLoading(true);
    Promise.all([getComplainantDashboard(), listComplainantComplaints({ page: 1, pageSize: 10 })])
      .then(([dashboardResult, listResult]) => {
        setDashboard(dashboardResult);
        setComplaints(listResult.items || []);
      })
      .catch(() => { /* leave dashboard/complaints as-is; page still renders with zero counts */ })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleModalClose = () => {
    setShowNewModal(false);
    loadData();
  };

  const counts = dashboard?.counts || { totalSubmitted: 0, activeReports: 0, resolvedReports: 0 };
  const latestCase = dashboard?.mostRecentComplaint || null;

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
          title="Complainant Dashboard"
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
            { icon: FileText, value: counts.totalSubmitted, label: 'Total Submitted' },
            { icon: Clock, value: counts.activeReports, label: 'Active Reports' },
            { icon: CheckCircle2, value: counts.resolvedReports, label: 'Resolved Reports' },
          ]}
        />
      </div>

      <div className="complainant-desktop-stage-card" style={{ marginTop: 24 }}>
        {!loading && !latestCase ? (
          <div className="categories-card">
            <h3 className="section-card-title"><Clock size={16} /> Case Stage Progress</h3>
            <p className="review-summary-line">You haven't submitted any complaints yet. Click "File New Complaint" above to get started.</p>
          </div>
        ) : latestCase && (
          <div className="categories-card">
            <div className="section-header-flex">
              <div className="hero-tags-row">
                <span className="urgency-pill positive">Most Recent Case</span>
                <span className="detail-tracking-code">{latestCase.complaintNumber || 'PENDING'}</span>
                <span className="category-pill">{latestCase.category}</span>
              </div>
              <Button variant="secondary" onClick={() => navigate(`/registry-head/track?id=${latestCase.id}`)}>
                Track Full Progress
              </Button>
            </div>
            <h2 style={{ fontSize: 18, margin: '10px 0 2px' }}>{latestCase.subject}</h2>
            <p className="review-summary-line">Filed {new Date(latestCase.filedAt).toDateString()}</p>
            <div style={{ marginTop: 12 }}>
              <ProgressBar percent={latestCase.progressPercent} />
            </div>
          </div>
        )}
      </div>

      <div className="complainant-desktop-table">
        <div className="categories-card" style={{ marginTop: 24 }}>
          <h2>My Submissions</h2>
          {complaints.length === 0 ? (
            <EmptyState message={loading ? 'Loading...' : 'No complaints filed yet.'} />
          ) : (
            <div className="complaints-table-wrap">
              <table className="complaints-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="complaint-subject-cell">
                          <span className="complaint-subject">{c.subject}</span>
                          <div className="complaint-subject-meta-row">
                            {c.complaintNumber && <span className="complaint-number-tag">{c.complaintNumber}</span>}
                            <span className="complaint-date">{new Date(c.filedAt).toDateString()}</span>
                          </div>
                        </div>
                      </td>
                      <td>{c.category}</td>
                      <td>{c.status}</td>
                      <td>{c.progressPercent}%</td>
                      <td>
                        <button type="button" className="action-icon-btn" onClick={() => navigate(`/registry-head/track?id=${c.id}`)} aria-label={`View ${c.subject}`}>
                          <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
              <span className="mobile-hero-stat-value">{counts.totalSubmitted}</span>
              <span className="mobile-hero-stat-label">Total</span>
            </div>
            <div className="mobile-hero-stat">
              <div className="mobile-hero-stat-icon"><CheckCircle2 size={14} /></div>
              <span className="mobile-hero-stat-value">{counts.resolvedReports}</span>
              <span className="mobile-hero-stat-label">Resolved</span>
            </div>
            <div className="mobile-hero-stat">
              <div className="mobile-hero-stat-icon"><Clock size={14} /></div>
              <span className="mobile-hero-stat-value">{counts.activeReports}</span>
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

          {complaints.length === 0 ? (
            <EmptyState message={loading ? 'Loading...' : "No complaints filed yet. Tap 'Report a Case' above to get started."} />
          ) : (
            complaints.map((c) => {
              const truncated = c.subject && c.subject.length > 30 ? `${c.subject.slice(0, 30)}…` : c.subject;
              return (
                <div key={c.id} className="mobile-complaint-card" onClick={() => navigate(`/registry-head/track?id=${c.id}`)}>
                  <div className="mobile-complaint-card-header">
                    <h4 className="mobile-complaint-card-title">{truncated}</h4>
                    {getMobileStatusBadge(c.status)}
                    <ChevronRight size={18} className="mobile-complaint-card-chevron" />
                  </div>
                  <div className="mobile-complaint-card-meta">
                    Alleged Violator: <strong>{c.allegedViolatorNames?.[0] || 'N/A'}</strong>
                  </div>
                  <div className="mobile-complaint-progress">
                    <div className={`mobile-complaint-progress-fill ${mobileProgressColor(c.status)}`} style={{ width: `${Math.max(c.progressPercent, 8)}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <MakeComplaintModal open={showNewModal} onClose={handleModalClose} isComplainant />
    </AppShell>
  );
}
