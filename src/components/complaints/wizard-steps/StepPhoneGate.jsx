import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '../../../context/I18nContext';

// The very first screen for an unauthenticated complainant — collects a phone number to
// identify/track the complaint before anything else. No step-number chrome (matches the
// mobile app not showing progress during this kind of pre-flow identity gate), and no Back
// button since there's nowhere to go back to.
export default function StepPhoneGate({ value, onChange, onContinue }) {
  const { t } = useTranslation();

  return (
    <div className="su-step active">
      <div className="su-heading">
        <h1>{t('wizard.phoneGate.title')}</h1>
        <p className="su-subtitle">{t('wizard.phoneGate.subtitle')}</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onContinue(); }}>
        <div className="su-field-group full-width" style={{ marginBottom: 22, textAlign: 'left' }}>
          <label className="su-label-dark">
            {t('wizard.phoneGate.label')} <span className="su-req-red">*</span>
          </label>
          <input
            type="tel"
            className="su-input-blue"
            placeholder={t('wizard.phoneGate.placeholder')}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="su-step1-nav">
          <button type="submit" className="su-btn-continue">
            {t('common.continue')} <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
