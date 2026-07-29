import React, { useState } from 'react';
import { ArrowRight, UserCircle, Users, Pencil } from 'lucide-react';
import { useTranslation } from '../../../context/I18nContext';
import { getKeyPopulation } from '../../../constants/keyPopulations';
import KeyPopulationSheet from './KeyPopulationSheet';
import LocationAutocomplete from '../../ui/LocationAutocomplete';

const GENDER_OPTIONS = ['female', 'male', 'rather_not_say'];

// Step 3 of 5 — "Who was affected?" Two toggle cards for self vs. someone else, then the core
// identity fields, then a "more about you" section (address + general/key population, with a
// bottom sheet for the key-population group) — folding in everything the old Step 2 collected.
export default function StepVictimDetails({ value, onChange, onBack, onContinue, stepLabel }) {
  const { t } = useTranslation();
  const [showKeyPopSheet, setShowKeyPopSheet] = useState(false);
  const [pendingSelection, setPendingSelection] = useState(value.keyPopulationGroup);

  const selectedPopulation = getKeyPopulation(value.keyPopulationGroup);

  const handlePopulationTypeChange = (type) => {
    if (type === 'key') {
      setPendingSelection(value.keyPopulationGroup);
      onChange({ populationType: type });
      setShowKeyPopSheet(true);
    } else {
      onChange({ populationType: type, keyPopulationGroup: null });
    }
  };

  const handleConfirmKeyPopulation = () => {
    onChange({ keyPopulationGroup: pendingSelection });
    setShowKeyPopSheet(false);
  };

  const handleCloseSheet = () => {
    // Dismissing without confirming and no prior selection reverts to General Population, so
    // the toggle never ends up showing "Key Population" selected with nothing behind it.
    if (!value.keyPopulationGroup) onChange({ populationType: 'general' });
    setShowKeyPopSheet(false);
  };

  return (
    <div className="su-step active">
      <div className="su-heading left-align">
        <div className="su-step-label">{stepLabel}</div>
        <h1 className="su-title-dark">{t('wizard.victim.title')}</h1>
        <p className="su-subtitle">{t('wizard.victim.subtitle')}</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onContinue(); }}>
        <div className="su-section-label">{t('wizard.victim.whoExperienced')}</div>
        <div className="toggle-card-row">
          <button
            type="button"
            className={`toggle-card ${value.relationship === 'self' ? 'selected' : ''}`}
            onClick={() => onChange({ relationship: 'self' })}
          >
            <span className="toggle-card-icon"><UserCircle size={20} /></span>
            <span className="toggle-card-label">{t('wizard.victim.myself')}</span>
          </button>
          <button
            type="button"
            className={`toggle-card ${value.relationship === 'other' ? 'selected' : ''}`}
            onClick={() => onChange({ relationship: 'other' })}
          >
            <span className="toggle-card-icon"><Users size={20} /></span>
            <span className="toggle-card-label">{t('wizard.victim.someoneElse')}</span>
          </button>
        </div>

        <div className="victim-form-grid" style={{ marginBottom: 20 }}>
          <div className="su-field-group">
            <label className="su-label-dark">
              {t('common.firstName')} <span className="su-req-red">*</span>
            </label>
            <input
              type="text"
              className="su-input-blue"
              value={value.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
              required
            />
          </div>
          <div className="su-field-group">
            <label className="su-label-dark">
              {t('common.lastName')} <span className="su-req-red">*</span>
            </label>
            <input
              type="text"
              className="su-input-blue"
              value={value.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
              required
            />
          </div>
          <div className="su-field-group full-width">
            <label className="su-label-dark">
              {t('common.phone')} <span className="su-req-red">*</span>
            </label>
            <input
              type="tel"
              className="su-input-blue"
              value={value.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="su-field-group full-width" style={{ marginBottom: 20 }}>
          <label className="su-label-dark">
            {t('common.gender')} <span className="su-req-red">*</span>
          </label>
          <div className="pill-toggle-group">
            {GENDER_OPTIONS.map((g) => (
              <button
                type="button"
                key={g}
                className={`pill-toggle-option ${value.gender === g ? 'selected' : ''}`}
                onClick={() => onChange({ gender: g })}
              >
                {g === 'female' ? t('common.genderFemale') : g === 'male' ? t('common.genderMale') : t('common.genderRatherNotSay')}
              </button>
            ))}
          </div>
        </div>

        <div className="su-more-about-section">
          <div className="su-section-label">{t('wizard.victim.moreAboutYou')}</div>

          <div className="su-field-group full-width">
            <label className="su-label-dark">{t('common.email')} ({t('wizard.optional')})</label>
            <input
              type="email"
              className="su-input-white"
              value={value.email}
              onChange={(e) => onChange({ email: e.target.value })}
            />
          </div>

          <div className="su-field-group full-width">
            <label className="su-label-dark">{t('common.address')} ({t('wizard.optional')})</label>
            <LocationAutocomplete
              value={value.address}
              onChange={(address) => onChange({ address })}
              placeholder={t('wizard.victim.addressPlaceholder')}
            />
          </div>

          <div className="su-field-group full-width">
            <label className="su-label-dark">{t('wizard.victim.populationQuestion')}</label>
            <div className="toggle-card-row">
              <button
                type="button"
                className={`toggle-card ${value.populationType === 'general' ? 'selected' : ''}`}
                onClick={() => handlePopulationTypeChange('general')}
              >
                <span className="toggle-card-label">{t('wizard.victim.generalPopulation')}</span>
              </button>
              <button
                type="button"
                className={`toggle-card ${value.populationType === 'key' ? 'selected' : ''}`}
                onClick={() => handlePopulationTypeChange('key')}
              >
                <span className="toggle-card-label">{t('wizard.victim.keyPopulation')}</span>
              </button>
            </div>

            {value.populationType === 'key' && selectedPopulation && (
              <div className="key-population-chip">
                <selectedPopulation.icon size={14} />
                {selectedPopulation.label}
                <button type="button" onClick={() => { setPendingSelection(value.keyPopulationGroup); setShowKeyPopSheet(true); }} aria-label="Change selection">
                  <Pencil size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="su-step-nav">
          <button type="button" className="su-btn-light-pill" onClick={onBack}>{t('common.back')}</button>
          <button type="submit" className="su-btn-purple-pill">
            {t('common.continue')} <ArrowRight size={18} />
          </button>
        </div>
      </form>

      <KeyPopulationSheet
        open={showKeyPopSheet}
        selected={pendingSelection}
        onSelect={setPendingSelection}
        onClose={handleCloseSheet}
        onConfirm={handleConfirmKeyPopulation}
      />
    </div>
  );
}
