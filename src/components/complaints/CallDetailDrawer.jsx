import React from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X, Clock, Phone } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { useComplaints } from '../../context/ComplaintsContext';
import { getCallerTypeMeta, getCallOutcomeMeta } from '../../constants/callCenter';
import { CATEGORY_LABELS } from '../../constants/complaintCategories';

// Same slide-in pattern as ActivityLogDrawer — takes the call record directly (no lookup by
// id), matching that drawer's convention of the caller handing over the exact data to show.
export default function CallDetailDrawer({ open, onClose, call }) {
  const { getComplaintById } = useComplaints();

  if (!open || !call) return null;

  const callerMeta = getCallerTypeMeta(call.callerType);
  const outcomeMeta = getCallOutcomeMeta(call.outcome);
  const linkedComplaints = (call.linkedComplaintIds || [])
    .map((id) => getComplaintById(id))
    .filter(Boolean);

  return createPortal(
    <div className="drawer-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <aside className="activity-drawer">
        <div className="activity-drawer-header">
          <h3>Call Details</h3>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="activity-drawer-body">
          <div className="offender-summary-row">
            <span className="offender-summary-count"><Phone size={13} /> {call.phoneNumber}</span>
            <div className="offender-categories-cell">
              <StatusBadge label={callerMeta.label} color={callerMeta.color} />
              <StatusBadge label={outcomeMeta.label} color={outcomeMeta.color} />
            </div>
          </div>

          <div className="call-detail-section">
            <span className="spec-label">Handled By</span>
            <span className="spec-value">{call.handledBy}</span>
          </div>

          <div className="call-detail-section">
            <span className="spec-label">Timestamp</span>
            <span className="spec-value call-detail-timestamp"><Clock size={12} /> {new Date(call.timestamp).toLocaleString()}</span>
          </div>

          {call.suggestedCategory && (
            <div className="call-detail-section">
              <span className="spec-label">Suggested Category</span>
              <span className="category-pill">{CATEGORY_LABELS[call.suggestedCategory] || call.suggestedCategory}</span>
            </div>
          )}

          <div className="call-detail-section">
            <span className="spec-label">Call Notes</span>
            <p className="call-detail-notes">{call.notes || 'No notes recorded.'}</p>
          </div>

          <div className="call-detail-section">
            <span className="spec-label">Linked Complaint{linkedComplaints.length === 1 ? '' : 's'}</span>
            {linkedComplaints.length === 0 ? (
              <p className="call-detail-notes">No complaint linked to this call.</p>
            ) : (
              <div className="related-complaints-list">
                {linkedComplaints.map((c) => (
                  <Link key={c.id} to={`/registry-head/complaints/${c.id}`} className="related-complaint-row">
                    <div className="related-complaint-main">
                      <span className="related-complaint-subject">{c.subject}</span>
                      <span className="related-complaint-date">Filed {new Date(c.dateFiled).toDateString()}</span>
                    </div>
                    <StatusBadge status={c.subStatus} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>,
    document.body
  );
}
