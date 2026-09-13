import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import ComplaintWizardForm from './ComplaintWizardForm';
import ComplainantComplaintWizard from './complainant-wizard/ComplainantComplaintWizard';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import { useTranslation } from '../../context/I18nContext';
import '../../styles/makeComplaintModal.css';

// Same wide desktop wizard modal chrome either way — which wizard renders inside it depends on
// `isComplainant`: real, draft-based ComplainantComplaintWizard for the Complainant's own
// dashboard/rights page; the mock ComplaintWizardForm (unchanged) for staff filing on someone's
// behalf, e.g. Registry Head's own "Make Complaint" — that flow has no real backend endpoint yet.
export default function MakeComplaintModal({ open, onClose, prefillPhone, isComplainant = false }) {
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
          {isComplainant ? (
            <ComplainantComplaintWizard onComplete={onClose} />
          ) : (
            <ComplaintWizardForm onComplete={onClose} initialVictimPhone={prefillPhone} skipPhoneGate isComplainant={isComplainant} />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
