import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { FileWarning } from 'lucide-react';
import AppShell from '../../../components/layout/AppShell';
import BackButton from '../../../components/ui/BackButton';
import Avatar from '../../../components/ui/Avatar';
import { useAuth } from '../../../context/AuthContext';
import { ROLE_NAV_ITEMS } from '../../roleNavMap';
import { registryHeadNavItems } from '../navConfig';
import { listRepeatViolators } from '../../../api/registryApi';

// Real counterpart to RegistryHeadViolatorDetailPage.jsx, complaint-registry-head only. No
// single-violator GET exists on the backend — the list endpoint only returns aggregate fields
// (no per-violator complaint list), so unlike the mock version, this can only show the summary
// a Registry Head already saw on the list row, not each individual complaint. Prefers the row
// data passed via navigate(..., {state}) from RealRepeatViolators.jsx; falls back to refetching
// the list and matching the id (e.g. a direct URL visit or a page refresh, where state is gone).
export default function RealViolatorDetail() {
  const { violatorId } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const navItems = ROLE_NAV_ITEMS[user?.role] || registryHeadNavItems;
  const [violator, setViolator] = useState(location.state?.violator || null);
  const [loading, setLoading] = useState(!location.state?.violator);

  useEffect(() => {
    if (violator) return;
    listRepeatViolators({ pageSize: 100 })
      .then((res) => setViolator(res.items?.find((v) => v.repeatViolatorId === decodeURIComponent(violatorId)) || null))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [violatorId]);

  if (loading) {
    return (
      <AppShell navItems={navItems} user={user}>
        <div className="detail-top-nav-bar">
          <BackButton navItems={navItems} fallbackTo="/registry-head/repeat-offenders" />
        </div>
        <p className="review-summary-line">Loading...</p>
      </AppShell>
    );
  }

  if (!violator) {
    return (
      <AppShell navItems={navItems} user={user}>
        <div className="detail-top-nav-bar">
          <BackButton navItems={navItems} fallbackTo="/registry-head/repeat-offenders" />
        </div>
        <h1>Violator not found</h1>
        <p>Open this page from the Repeat Violators list — direct links can't be resolved yet (no single-violator lookup exists on the backend).</p>
      </AppShell>
    );
  }

  return (
    <AppShell navItems={navItems} user={user}>
      <div className="detail-top-nav-bar">
        <BackButton navItems={navItems} fallbackTo="/registry-head/repeat-offenders" />
      </div>

      <div className="violator-detail-hero">
        <Avatar name={violator.displayName} size={56} />
        <div className="violator-detail-identity">
          <h1>{violator.displayName}</h1>
          <div className="violator-detail-contact-row">
            <span>{violator.violatorType}</span>
            <span>{violator.matchType === 'Confirmed' ? 'Confirmed profile' : 'Suggested match'}</span>
          </div>
        </div>
        <div className="violator-detail-stats">
          <div className="violator-detail-stat">
            <span className="value">{violator.complaintCount}</span>
            <span className="label">Complaints</span>
          </div>
        </div>
      </div>

      <div className="violator-detail-categories">
        <span className="hero-people-label"><FileWarning size={12} /> Categories Involved</span>
        <div className="hero-tags-row">
          {violator.categories?.map((cat) => (
            <span key={cat.id} className="category-pill pill-info">{cat.name}</span>
          ))}
        </div>
      </div>

      <div className="detail-section-card" style={{ marginTop: 16 }}>
        <h3 className="section-card-title">Most Recent Complaint</h3>
        <p className="review-summary-line">
          {violator.mostRecentComplaintAt ? new Date(violator.mostRecentComplaintAt).toDateString() : 'Not available'}
        </p>
        <p className="su-field-hint-dark" style={{ marginTop: 10 }}>
          The individual complaint list for this violator isn't available yet — there's no backend endpoint for it yet, only this aggregate summary.
        </p>
      </div>
    </AppShell>
  );
}
