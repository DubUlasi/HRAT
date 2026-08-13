import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ChevronRight } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import { useComplaints } from '../../context/ComplaintsContext';
import { getComplaintOutcomeSummary } from '../../constants/complaintStatus';

// Compact "does this violator show up elsewhere" panel for the complaint detail page. Pulls
// its matches from findRelatedComplaints (ComplaintsContext) — no matching logic lives here.
export default function RelatedComplaintsPanel({ complaintId, onViewFullHistory }) {
  const { findRelatedComplaints } = useComplaints();
  const related = findRelatedComplaints(complaintId);

  return (
    <div className="detail-section-card">
      <div className="section-header-flex">
        <h3 className="section-card-title">
          Related Complaints
          {related.length > 0 && <span className="count-badge">{related.length}</span>}
        </h3>
        {related.length > 0 && (
          <button type="button" className="btn-link" onClick={onViewFullHistory}>View Full History</button>
        )}
      </div>

      {related.length === 0 ? (
        <div className="related-complaints-empty">
          <EmptyState icon={ShieldAlert} message="No other complaints found against this alleged violator." />
        </div>
      ) : (
        <div className="related-complaints-list">
          {related.slice(0, 5).map((c) => (
            <Link key={c.id} to={`/registry-head/complaints/${c.id}`} className="related-complaint-row">
              <div className="related-complaint-main">
                <span className="related-complaint-subject">{c.subject}</span>
                <span className="related-complaint-date">Filed {new Date(c.dateFiled).toDateString()}</span>
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
  );
}
