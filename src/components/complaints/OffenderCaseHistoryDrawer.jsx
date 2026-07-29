import React from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { useComplaints } from '../../context/ComplaintsContext';
import { getComplaintOutcomeSummary } from '../../constants/complaintStatus';
import { CATEGORY_LABELS } from '../../constants/complaintCategories';

// Single shared source for viewing a violator's full case history — reachable from the
// standalone Repeat Offenders page, the Business Intelligence teaser, and an individual
// complaint's detail page alike. Takes only a `complaintId` (any complaint naming the
// violator works as the anchor) and derives the rest via findRelatedComplaints, so every
// call site stays in sync with the same matching logic instead of pre-building its own shape.
export default function OffenderCaseHistoryDrawer({ open, onClose, complaintId }) {
  const { getComplaintById, findRelatedComplaints } = useComplaints();

  if (!open || !complaintId) return null;

  const anchor = getComplaintById(complaintId);
  if (!anchor) return null;

  const related = findRelatedComplaints(complaintId);
  const allComplaints = [anchor, ...related].sort((a, b) => new Date(b.dateFiled) - new Date(a.dateFiled));
  const categories = [...new Set(allComplaints.map((c) => c.category))];
  const violatorName = allComplaints[0].allegedViolator.name;

  return createPortal(
    <div className="drawer-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <aside className="activity-drawer offender-history-drawer">
        <div className="activity-drawer-header">
          <h3>{violatorName}</h3>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="activity-drawer-body">
          <div className="offender-summary-row">
            <span className="offender-summary-count">
              {allComplaints.length} complaint{allComplaints.length === 1 ? '' : 's'} on file
            </span>
            <div className="offender-categories-cell">
              {categories.map((cat) => (
                <span key={cat} className="category-pill">{CATEGORY_LABELS[cat] || cat}</span>
              ))}
            </div>
          </div>

          {allComplaints.map((c) => (
            <div key={c.id} className="offender-case-row">
              <div className="offender-case-row-top">
                <Link to={`/registry-head/complaints/${c.id}`} className="offender-case-subject">{c.subject}</Link>
                <StatusBadge status={c.subStatus} />
              </div>
              <div className="offender-case-date">Filed {new Date(c.dateFiled).toDateString()}</div>
              <p className="offender-case-outcome">{getComplaintOutcomeSummary(c)}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>,
    document.body
  );
}
