import React, { useEffect, useState } from 'react';
import { Inbox, ShieldCheck, Send, Gavel, PlusCircle } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import HeroBanner from '../../components/dashboard/HeroBanner';
import QuickTrackerBlob from '../../components/dashboard/QuickTrackerBlob';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import MakeComplaintModal from '../../components/complaints/MakeComplaintModal';
import { useAuth } from '../../context/AuthContext';
import { getRegistryDashboard } from '../../api/registryApi';
import { registryHeadNavItems, registryHeadUser } from './navConfig';

// This route (`/registry-head`) is exclusive to complaint-registry-head — nobody else ever
// renders it (see the Phase 3 plan), so unlike the other Registry Head pages this one is
// rewritten directly against the real dashboard endpoint rather than role-branching to a
// separate Real* component. Rows have no click-through: no single-complaint GET exists yet.
export default function RegistryHeadDashboardPage() {
  const { user } = useAuth();
  const [showMakeComplaint, setShowMakeComplaint] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getRegistryDashboard()
      .then(setData)
      .catch((err) => setError(err.problem?.detail || err.message))
      .finally(() => setLoading(false));
  }, []);

  const greetingName = data?.user?.firstName || user?.name?.split(' ')[0] || registryHeadUser.name.split(' ')[0];
  const overview = data?.overview || {};
  const navigationCounts = data?.navigationCounts || {};
  const needsAction = data?.needsYourAction || [];
  const recentComplaints = data?.recentComplaints || [];

  const situationMessages = data ? [
    {
      text: navigationCounts.needsMyAction > 0
        ? `${navigationCounts.needsMyAction} complaint${navigationCounts.needsMyAction === 1 ? '' : 's'} across the registry ${navigationCounts.needsMyAction === 1 ? 'is' : 'are'} waiting on you right now.`
        : 'The registry is all caught up, nothing is waiting on you right now.',
    },
    {
      text: `${overview.needsOfficer || 0} need${overview.needsOfficer === 1 ? 's' : ''} an officer assigned, ${overview.needsAdmissibility || 0} need${overview.needsAdmissibility === 1 ? 's' : ''} an admissibility step.`,
    },
    {
      text: `${overview.totalOpenComplaints || 0} open complaint${overview.totalOpenComplaints === 1 ? '' : 's'} on file across the entire registry.`,
    },
  ] : [{ text: 'Loading the registry overview...' }];

  return (
    <AppShell navItems={registryHeadNavItems} user={user || registryHeadUser}>
      <PageHeader
        title="Complaint Registry Head Dashboard"
        subtitle={`Welcome back, ${greetingName}. Here's what's happening across the registry.`}
        notificationCount={2}
        actions={
          <Button variant="primary" icon={PlusCircle} onClick={() => setShowMakeComplaint(true)}>
            Make a Complaint
          </Button>
        }
      />

      {error && <p className="su-field-hint-dark" style={{ color: 'var(--danger-color)' }}>{error}</p>}

      <HeroBanner
        greetingName={greetingName}
        badge="Complaint Registry Head"
        situationMessages={situationMessages}
        rightSlot={<QuickTrackerBlob />}
        stats={[
          { icon: Inbox, value: overview.needsOfficer || 0, label: 'Needs Officer' },
          { icon: ShieldCheck, value: overview.needsAdmissibility || 0, label: 'Needs Admissibility' },
          { icon: Send, value: overview.needsDepartment || 0, label: 'Needs Department' },
          { icon: Gavel, value: overview.readyForCouncil || 0, label: 'Ready For Council' },
        ]}
      />

      <div className="recent-complaints-card action-queue-card">
        <div className="section-header-flex">
          <h2>
            Needs Your Action
            {needsAction.length > 0 && <span className="count-badge">{needsAction.length}</span>}
          </h2>
        </div>
        {needsAction.length === 0 ? (
          <EmptyState message={loading ? 'Loading...' : "You're all caught up, nothing needs your attention right now."} />
        ) : (
          <div className="related-complaints-list">
            {needsAction.slice(0, 6).map((c) => (
              <div key={c.complaintId} className="related-complaint-row">
                <div className="related-complaint-main">
                  <span className="related-complaint-subject">{c.subject}</span>
                  <span className="related-complaint-date">{c.complaintNumber || 'No number yet'} · Filed {new Date(c.filedAt).toDateString()}</span>
                  {c.description && <span className="related-complaint-outcome">{c.description}</span>}
                </div>
                <div className="related-complaint-side">
                  <span className="status-badge status-info">{c.actionLabel}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="recent-complaints-card">
        <div className="section-header-flex">
          <h2>Recent Complaints</h2>
          <Button variant="secondary" to="/registry-head/complaints">View All Complaints</Button>
        </div>
        {recentComplaints.length === 0 ? (
          <EmptyState message={loading ? 'Loading...' : 'No complaints on file yet.'} />
        ) : (
          <div className="complaints-table-wrap">
            <table className="complaints-table">
              <thead>
                <tr>
                  <th>Complaint Subject</th>
                  <th>Victim</th>
                  <th>Alleged Violator</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints.map((c) => (
                  <tr key={c.complaintId}>
                    <td>
                      <div className="complaint-subject-cell">
                        <span className="complaint-subject">{c.subject}</span>
                        <div className="complaint-subject-meta-row">
                          {c.complaintNumber && <span className="complaint-number-tag">{c.complaintNumber}</span>}
                          <span className="complaint-date">{new Date(c.filedAt).toDateString()}</span>
                        </div>
                        <div className="complaint-subject-meta-row">
                          <span className="category-pill pill-info">{c.category}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="person-cell">
                        <span className="person-cell-name">{c.victim}</span>
                        {c.additionalVictimCount > 0 && <span className="person-cell-more">+{c.additionalVictimCount}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="person-cell">
                        <span className="person-cell-name">{c.allegedViolator}</span>
                        {c.additionalViolatorCount > 0 && <span className="person-cell-more">+{c.additionalViolatorCount}</span>}
                      </div>
                    </td>
                    <td><span className="status-badge status-info">{c.statusLabel || c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <MakeComplaintModal open={showMakeComplaint} onClose={() => setShowMakeComplaint(false)} />
    </AppShell>
  );
}
