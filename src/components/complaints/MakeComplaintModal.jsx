import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import ComplaintWizardForm from './ComplaintWizardForm';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import { useTranslation } from '../../context/I18nContext';

// Same wizard, same fields, same signup.css styling as the public /complaint page — framed in
// a wide desktop wizard modal chrome (header + numbered stepper bar) instead of navigating away.
export default function MakeComplaintModal({ open, onClose, prefillPhone }) {
  const { t } = useTranslation();

  if (!open) return null;

  return createPortal(
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="wizard-modal-container">
        <div className="wizard-modal-header">
          <div className="wizard-modal-header-text">
            <h3>{t('makeComplaintModal.title')}</h3>
            <p>{t('makeComplaintModal.subtitle')}</p>
          </div>
          <div className="modal-header-actions">
            <LanguageSwitcher />
            <button type="button" className="wizard-modal-close" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="wizard-modal-body">
          <ComplaintWizardForm onComplete={onClose} initialVictimPhone={prefillPhone} skipPhoneGate />
        </div>
      </div>
    </div>,
    document.body
  );
}
