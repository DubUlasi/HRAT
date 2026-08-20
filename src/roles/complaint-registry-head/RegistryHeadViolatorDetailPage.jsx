import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Phone, Mail, FileWarning, ChevronRight } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Avatar from '../../components/ui/Avatar';
import BackButton from '../../components/ui/BackButton';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import DownloadCsvButton from '../../components/ui/DownloadCsvButton';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { getComplaintOutcomeSummary } from '../../constants/complaintStatus';
import { downloadComplaintsExcel } from '../../utils/exportUtils';
import { CATEGORY_LABELS, CATEGORY_COLOR } from '../../constants/complaintCategories';
import { registryHeadNavItems, registryHeadUser } from './navConfig';
import { ROLE_NAV_ITEMS, ROLE_COMPLAINT_DETAIL_BASE } from '../roleNavMap';
import { scopeRepeatOffendersForUser } from '../scopeComplaints';

// Full case history for one repeat violator — everything OffenderCaseHistoryDrawer shows in its
// compact slide-in, at full page width/detail, reached by clicking a row on the Repeat Violators
// list. That drawer stays as-is for its other call sites (Business Intelligence teaser, a single
// complaint's "View Full History" link); this page is specifically the Repeat Violators list's
// own "view all details" destination.
export default function RegistryHeadViolatorDetailPage() {
  const { violatorId } = useParams();
  const { user } = useAuth();
  const navItems = ROLE_NAV_ITEMS[user?.role] || registryHeadNavItems;
  const detailBase = ROLE_COMPLAINT_DETAIL_BASE[user?.role] || '/registry-head/complaints';
  const { getRepeatOffenders } = useComplaints();

  const violator = scopeRepeatOffendersForUser(getRepeatOffenders(), user).find((o) => o.id === decodeURIComponent(violatorId));

  if (!violator) {
    return (
      <AppShell navItems={navItems} user={user || registryHeadUser}>
        <div className="detail-top-nav-bar">
          <BackButton navItems={navItems} fallbackTo="/registry-head/repeat-offenders" />
        </div>
        <h1>Violator not found</h1>
        <p>This violator may no longer meet the repeat-violator threshold, or the link is incorrect.</p>
      </AppShell>
    );
  }

  return (
    <AppShell navItems={navItems} user={user || registryHeadUser}>
      <div className="detail-top-nav-bar">
        <BackButton navItems={navItems} fallbackTo="/registry-head/repeat-offenders" />
        <DownloadCsvButton
          onDownload={() => downloadComplaintsExcel(violator.complaints, `${violator.name} - Case History`)}
          disabled={!violator.complaints.length}
        />
      </div>

      <div className="violator-detail-hero">
        <Avatar name={violator.name} size={56} />
        <div className="violator-detail-identity">
          <h1>{violator.name}</h1>
          <div className="violator-detail-contact-row">
            {violator.phone && <span><Phone size={12} /> {violator.phone}</span>}
            {violator.email && <span><Mail size={12} /> {violator.email}</span>}
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
          {violator.categories.map((cat) => (
            <span key={cat} className={`category-pill pill-${CATEGORY_COLOR[cat] || 'info'}`}>{CATEGORY_LABELS[cat] || cat}</span>
          ))}
        </div>
      </div>

      <div className="detail-section-card" style={{ marginTop: 16 }}>
        <h3 className="section-card-title">All Complaints ({violator.complaints.length})</h3>

        {violator.complaints.length === 0 ? (
          <EmptyState message="No complaints on file." />
        ) : (
          <div className="related-complaints-list" style={{ marginTop: 10 }}>
            {violator.complaints.map((c) => (
              <Link key={c.id} to={`${detailBase}/${c.id}`} className="related-complaint-row">
                <div className="related-complaint-main">
                  <span className="related-complaint-subject">{c.subject}</span>
                  <span className="related-complaint-date">
                    {c.complaintNumber ? `${c.complaintNumber} · ` : ''}Filed {new Date(c.dateFiled).toDateString()}
                  </span>
                  <span className="related-complaint-outcome">{getComplaintOutcomeSummary(c)}</span>
                </div>
                <div className="related-complaint-side">
                  <StatusBadge status={c.subStatus} />
                  <ChevronRight size={15} className="related-complaint-chevron" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
