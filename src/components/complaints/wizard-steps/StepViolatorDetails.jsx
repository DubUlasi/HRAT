import React from 'react';
import { ArrowRight, ChevronDown, Trash2, UserPlus } from 'lucide-react';
import { useTranslation } from '../../../context/I18nContext';
import LocationAutocomplete from '../../ui/LocationAutocomplete';

// Step 4 of 5 — "Who is responsible?" One card per violator, mirroring StepVictimDetails —
// numbering/remove controls only appear once there's more than one. Only the name is required;
// complainants often don't know anything else about the alleged violator(s).
export default function StepViolatorDetails({ violators, onChange, onAdd, onRemove, onBack, onContinue, stepLabel }) {
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

        {violators.map((violator, index) => (
          <div className="multi-person-card" key={index}>
            {violators.length > 1 && (
              <div className="multi-person-card-header">
                <span className="multi-person-card-title">
                  {index === 0 ? t('wizard.violator.primaryViolator') : t('wizard.violator.violatorNumber', { number: index + 1 })}
                </span>
                {index > 0 && (
                  <button type="button" className="multi-person-remove" onClick={() => onRemove(index)}>
                    <Trash2 size={14} /> {t('wizard.violator.removeViolator')}
                  </button>
                )}
              </div>
            )}

            <div className="victim-form-grid">
              <div className="su-field-group">
                <label className="su-label-dark">
                  {t('common.firstName')} <span className="su-req-red">*</span>
                </label>
                <input
                  type="text"
                  className="su-input-blue"
                  value={violator.firstName}
                  onChange={(e) => onChange(index, { firstName: e.target.value })}
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
                  value={violator.lastName}
                  onChange={(e) => onChange(index, { lastName: e.target.value })}
                  required
                />
              </div>

              <div className="su-field-group">
                <label className="su-label-dark">{t('common.phone')} ({t('wizard.optional')})</label>
                <input
                  type="tel"
                  className="su-input-blue"
                  value={violator.phone}
                  onChange={(e) => onChange(index, { phone: e.target.value })}
                />
              </div>

              <div className="su-field-group">
                <label className="su-label-dark">{t('common.gender')} ({t('wizard.optional')})</label>
                <div className="su-select-wrap">
                  <select
                    className="su-input-white su-select"
                    value={violator.gender}
                    onChange={(e) => onChange(index, { gender: e.target.value })}
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
                  value={violator.email}
                  onChange={(e) => onChange(index, { email: e.target.value })}
                />
              </div>

              <div className="su-field-group full-width">
                <label className="su-label-dark">{t('common.address')} ({t('wizard.optional')})</label>
                <LocationAutocomplete
                  value={violator.address}
                  onChange={(address) => onChange(index, { address })}
                />
              </div>
            </div>
          </div>
        ))}

        <button type="button" className="multi-person-add" onClick={onAdd}>
          <UserPlus size={16} /> {t('wizard.violator.addAnotherViolator')}
        </button>

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
