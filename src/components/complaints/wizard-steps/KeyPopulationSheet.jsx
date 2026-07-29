import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { KEY_POPULATIONS } from '../../../constants/keyPopulations';
import { useTranslation } from '../../../context/I18nContext';

// Mobile-style bottom sheet (slides up from the bottom, rounded top corners) rather than the
// app's usual centered Modal — used only here, where the mobile reference design calls for a
// sheet specifically. Confirming closes it and commits `selected` back up to StepVictimDetails.
export default function KeyPopulationSheet({ open, selected, onSelect, onClose, onConfirm }) {
  const { t } = useTranslation();

  if (!open) return null;

  return createPortal(
    <div className="bottom-sheet-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bottom-sheet-panel">
        <span className="bottom-sheet-handle" />
        <div className="bottom-sheet-header">
          <h3>{t('wizard.victim.keyPopulationSheetTitle')}</h3>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <p className="bottom-sheet-note">{t('wizard.victim.keyPopulationConfidentialityNote')}</p>

        <div className="key-population-list">
          {KEY_POPULATIONS.map((pop) => {
            const Icon = pop.icon;
            return (
              <button
                type="button"
                key={pop.value}
                className={`key-population-option ${selected === pop.value ? 'selected' : ''}`}
                onClick={() => onSelect(pop.value)}
              >
                <span className="key-population-icon"><Icon size={18} /></span>
                <span className="key-population-text">
                  <span className="key-population-label">{pop.label}</span>
                  <span className="key-population-desc">{pop.description}</span>
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="su-btn-purple-pill bottom-sheet-confirm"
          disabled={!selected}
          onClick={onConfirm}
        >
          {t('wizard.victim.confirmSelection')}
        </button>
      </div>
    </div>,
    document.body
  );
}
