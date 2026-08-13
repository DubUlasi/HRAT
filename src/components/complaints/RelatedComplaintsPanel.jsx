import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ChevronRight } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { getComplaintOutcomeSummary } from '../../constants/complaintStatus';
import { ROLE_COMPLAINT_DETAIL_BASE } from '../../roles/roleNavMap';
import { userCanViewComplaint, REPEAT_VIOLATOR_ROLES } from '../../roles/scopeComplaints';

// Compact "does this violator show up elsewhere" panel for the complaint detail page. Pulls
// its matches from findRelatedComplaints (ComplaintsContext) — no matching logic lives here.
// Reused by all 6 role detail pages, so links must point at the CURRENT role's own detail
// route, not a hardcoded one — and a related complaint outside the current role's own scope
// (e.g. a Director seeing a related case filed against another department) renders as a plain
// unlinked row instead of a dead-end "no access" click-through.
export default function RelatedComplaintsPanel({ complaintId, onViewFullHistory }) {
  const { user } = useAuth();
  const { findRelatedComplaints } = useComplaints();
  const related = findRelatedComplaints(complaintId);
  const detailBase = ROLE_COMPLAINT_DETAIL_BASE[user?.role] || '/registry-head/complaints';
  const canDrillIntoHistory = REPEAT_VIOLATOR_ROLES.includes(user?.role);

  return (
    <div className="detail-section-card">
      <div className="section-header-flex">
        <h3 className="section-card-title">
          Related Complaints
          {related.length > 0 && <span className="count-badge">{related.length}</span>}
        </h3>
        {related.length > 0 && canDrillIntoHistory && (
          <button type="button" className="btn-link" onClick={onViewFullHistory}>View Full History</button>
        )}
      </div>

      {related.length === 0 ? (
        <div className="related-complaints-empty">
          <EmptyState icon={ShieldAlert} message="No other complaints found against this alleged violator." />
        </div>
      ) : (
        <div className="related-complaints-list">
          {related.slice(0, 5).map((c) => {
            const viewable = userCanViewComplaint(c, user);
            const content = (
              <>
                <div className="related-complaint-main">
                  <span className="related-complaint-subject">{c.subject}</span>
                  <span className="related-complaint-date">Filed {new Date(c.dateFiled).toDateString()}</span>
                  <span className="related-complaint-outcome">{getComplaintOutcomeSummary(c)}</span>
                </div>
                <div className="related-complaint-side">
                  <StatusBadge status={c.subStatus} />
                  {viewable && <ChevronRight size={15} className="related-complaint-chevron" />}
                </div>
              </>
            );
            return viewable ? (
              <Link key={c.id} to={`${detailBase}/${c.id}`} className="related-complaint-row">
                {content}
              </Link>
            ) : (
              <div key={c.id} className="related-complaint-row related-complaint-row-locked">
                {content}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
