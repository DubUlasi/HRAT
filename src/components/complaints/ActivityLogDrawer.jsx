import React from 'react';
import { createPortal } from 'react-dom';
import { X, History, RotateCcw, FileText } from 'lucide-react';
import { isBounceBackActivity, getActivityDocuments } from '../../constants/complaintStatus';

// Identical for every role per the manual ("This is the same process used to access the
// activity logs for complaints for every type of user"). Reuses the exact same connected
// timeline (.activity-vertical-timeline/.activity-timeline-item/.activity-node-icon) as the
// detail page's own top-5 preview, so the full log reads as "the same timeline, expanded"
// instead of a second, differently-styled list — accent ring on the latest entry, warning-toned
// node on anything that bounced the case backward, muted dot otherwise.
export default function ActivityLogDrawer({ open, onClose, activityLog = [], documents = [] }) {
  if (!open) return null;

  const sorted = [...activityLog].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const attachmentTotal = sorted.reduce((sum, entry) => sum + getActivityDocuments(entry, { documents }).length, 0);

  return createPortal(
    <div className="drawer-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <aside className="activity-drawer">
        <div className="activity-drawer-header">
          <span className="activity-drawer-header-icon"><History size={15} /></span>
          <div className="activity-drawer-header-text">
            <h3>Full Activity Log</h3>
            <p>
              {sorted.length} event{sorted.length === 1 ? '' : 's'} recorded
              {attachmentTotal > 0 && `, ${attachmentTotal} document${attachmentTotal === 1 ? '' : 's'} attached`}
            </p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="activity-drawer-body">
          {sorted.length === 0 && <p className="activity-empty">No activity yet.</p>}
          <div className="activity-vertical-timeline">
            {sorted.map((entry, idx) => {
              const bounceBack = isBounceBackActivity(entry.message);
              const entryDocuments = getActivityDocuments(entry, { documents });
              return (
                <div key={entry.id} className={`activity-timeline-item ${idx === 0 ? 'current' : ''} ${bounceBack ? 'bounce-back' : ''}`}>
                  <span className="activity-node-icon">
                    {bounceBack ? <RotateCcw size={10} /> : <span className={`activity-node-dot ${idx === 0 ? 'latest' : ''}`} />}
                  </span>
                  <div className="activity-item-content">
                    <div className="activity-item-header">
                      {entry.message}
                      {bounceBack && <span className="bounce-back-tag">Sent Back</span>}
                    </div>
                    <div className="activity-item-date">{new Date(entry.timestamp).toLocaleString()}, {entry.actor}</div>
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
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </div>,
    document.body
  );
}
