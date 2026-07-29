import React from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useTranslation } from '../../../context/I18nContext';
import LocationAutocomplete from '../../ui/LocationAutocomplete';

// Step 4 of 5 — "Who is responsible?" New to the mobile-style flow (the reference design
// doesn't show it, but the web form already collects it) — same simplified visual language as
// Step 3. Only the name is required; complainants often don't know anything else about the
// alleged violator.
export default function StepViolatorDetails({ value, onChange, onBack, onContinue, stepLabel }) {
  const { t } = useTranslation();

  return (
    <div className="su-step active">
      <div className="su-heading left-align">
        <div className="su-step-label">{stepLabel}</div>
        <h1 className="su-title-dark">{t('wizard.violator.title')}</h1>
        <p className="su-subtitle">{t('wizard.violator.subtitle')}</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onContinue(); }}>
        <p className="su-field-hint-dark optional-note">{t('wizard.violator.optionalNote')}</p>

        <div className="victim-form-grid">
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

          <div className="su-field-group">
            <label className="su-label-dark">{t('common.phone')} ({t('wizard.optional')})</label>
            <input
              type="tel"
              className="su-input-blue"
              value={value.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
            />
          </div>

          <div className="su-field-group">
            <label className="su-label-dark">{t('common.gender')} ({t('wizard.optional')})</label>
            <div className="su-select-wrap">
              <select
                className="su-input-white su-select"
                value={value.gender}
                onChange={(e) => onChange({ gender: e.target.value })}
              >
                <option value="">{t('common.selectGender')}</option>
                <option value="female">{t('common.genderFemale')}</option>
                <option value="male">{t('common.genderMale')}</option>
                <option value="rather_not_say">{t('common.genderRatherNotSay')}</option>
              </select>
              <ChevronDown className="su-select-chevron" size={16} />
            </div>
          </div>

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
            />
          </div>
        </div>

        <div className="su-step-nav">
          <button type="button" className="su-btn-light-pill" onClick={onBack}>{t('common.back')}</button>
          <button type="submit" className="su-btn-purple-pill">
            {t('common.continue')} <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
