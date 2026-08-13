import React from 'react';
import Modal from '../../ui/Modal';
import { KEY_POPULATIONS } from '../../../constants/keyPopulations';
import { useTranslation } from '../../../context/I18nContext';

// The app's usual centered Modal (not a mobile-style bottom sheet, per feedback). Confirming
// closes it and commits `selected` back up to StepVictimDetails.
export default function KeyPopulationSheet({ open, selected, onSelect, onClose, onConfirm }) {
  const { t } = useTranslation();

  return (
    <Modal open={open} onClose={onClose} title={t('wizard.victim.keyPopulationSheetTitle')} width="440px">
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
    </Modal>
  );
}
