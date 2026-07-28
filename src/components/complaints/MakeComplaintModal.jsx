import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import ComplaintWizardForm from './ComplaintWizardForm';

// Same wizard, same fields, same signup.css styling as the public /complaint page — framed in
// a wide desktop wizard modal chrome (header + numbered stepper bar) instead of navigating away.
export default function MakeComplaintModal({ open, onClose }) {
  if (!open) return null;

  return createPortal(
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="wizard-modal-container">
        <div className="wizard-modal-header">
          <div className="wizard-modal-header-text">
            <h3>File a New Complaint</h3>
            <p>Complete every step to submit a complaint on behalf of a victim.</p>
          </div>
          <button type="button" className="wizard-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="wizard-modal-body">
          <ComplaintWizardForm onComplete={onClose} />
        </div>
      </div>
    </div>,
    document.body
  );
}
