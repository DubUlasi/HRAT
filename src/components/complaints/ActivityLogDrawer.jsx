import React from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, FileText } from 'lucide-react';
import { isBounceBackActivity, getActivityDocuments } from '../../constants/complaintStatus';

// Identical for every role per the manual ("This is the same process used to access the
// activity logs for complaints for every type of user").
export default function ActivityLogDrawer({ open, onClose, activityLog = [], documents = [] }) {
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
          {sorted.map((entry) => {
            const entryDocuments = getActivityDocuments(entry, { documents });
            return (
              <div key={entry.id} className="activity-entry">
                <p className="activity-message">
                  {entry.message}
                  {isBounceBackActivity(entry.message) && <span className="bounce-back-tag">Sent Back</span>}
                </p>
                <div className="activity-meta">
                  <Clock size={12} />
                  <span>{new Date(entry.timestamp).toLocaleString()}</span>
                  <span className="activity-actor">{entry.actor}</span>
                </div>
                {entryDocuments.length > 0 && (
                  <div className="activity-attachment-list">
                    {entryDocuments.map((doc) => (
                      <a key={doc.id} href={doc.url} download={doc.name} target="_blank" rel="noreferrer" className="activity-attachment-row">
                        <FileText size={12} />
                        <span>{doc.name}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </div>,
    document.body
  );
}
