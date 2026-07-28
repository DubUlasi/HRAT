import React from 'react';
import { createPortal } from 'react-dom';
import { X, Clock } from 'lucide-react';

// Identical for every role per the manual ("This is the same process used to access the
// activity logs for complaints for every type of user").
export default function ActivityLogDrawer({ open, onClose, activityLog = [] }) {
  if (!open) return null;

  const sorted = [...activityLog].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return createPortal(
    <div className="drawer-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <aside className="activity-drawer">
        <div className="activity-drawer-header">
          <h3>Activity Logs</h3>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="activity-drawer-body">
          {sorted.length === 0 && <p className="activity-empty">No activity yet.</p>}
          {sorted.map((entry) => (
            <div key={entry.id} className="activity-entry">
              <p className="activity-message">{entry.message}</p>
              <div className="activity-meta">
                <Clock size={12} />
                <span>{new Date(entry.timestamp).toLocaleString()}</span>
                <span className="activity-actor">{entry.actor}</span>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>,
    document.body
  );
}
