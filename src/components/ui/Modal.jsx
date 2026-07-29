import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, headerActions, children, hideClose = false, width }) {
  if (!open) return null;

  return createPortal(
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal-panel" style={width ? { maxWidth: width } : undefined}>
        {(title || headerActions || !hideClose) && (
          <div className="modal-header">
            {title && <h3>{title}</h3>}
            <div className="modal-header-actions">
              {headerActions}
              {!hideClose && (
                <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body
  );
}
