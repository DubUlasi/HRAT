import React, { useState } from 'react';
import { ArrowRight, UserCircle, Users, UsersRound, Pencil, Check, Trash2, UserPlus } from 'lucide-react';
import { useTranslation } from '../../../context/I18nContext';
import { getKeyPopulation } from '../../../constants/keyPopulations';
import KeyPopulationSheet from './KeyPopulationSheet';
import LocationAutocomplete from '../../ui/LocationAutocomplete';

const GENDER_OPTIONS = ['female', 'male', 'rather_not_say'];

// Step 3 of 6 — "Who was affected?" One card per victim, so a group complaint is just more
// cards. The self/someone-else toggle only makes sense for the first victim (every victim added
// after that is implicitly someone else); numbering/remove controls only appear once there's
// more than one victim, so the common single-victim case looks exactly like before.
//
// `isComplainant` gates the self/someone-else question entirely — it only ever makes sense on
// an entry point where the person filling this out could plausibly BE the victim (the public
// wizard, the Complainant's own dashboard). Staff filing on someone's behalf never sees it; for
// them (and for any victim after the first, who's never "yourself") the wizard behaves as if
// "someone else" was chosen — see `isSelfReport` below, which drives the depersonalized
// "Do they belong..." population question wording.
export default function StepVictimDetails({ victims, onChange, onAdd, onRemove, filedBy, onFiledByChange, isComplainant, onBack, onContinue, stepLabel }) {
  const { t } = useTranslation();
  const [keyPopIndex, setKeyPopIndex] = useState(null);
  const [pendingSelection, setPendingSelection] = useState(null);

  const handlePopulationTypeChange = (index, type) => {
    if (type === 'key') {
      setPendingSelection(victims[index].keyPopulationGroup);
      onChange(index, { populationType: type });
      setKeyPopIndex(index);
    } else {
      onChange(index, { populationType: type, keyPopulationGroup: null });
    }
  };

  const handleConfirmKeyPopulation = () => {
    onChange(keyPopIndex, { keyPopulationGroup: pendingSelection });
    setKeyPopIndex(null);
  };

  const handleCloseSheet = () => {
    const victim = victims[keyPopIndex];
    // Dismissing without confirming and no prior selection reverts to General Population, so
    // the toggle never ends up showing "Key Population" selected with nothing behind it.
    if (victim && !victim.keyPopulationGroup) onChange(keyPopIndex, { populationType: 'general' });
    setKeyPopIndex(null);
  };

  return (
    <div className="su-step active">
      <div className="su-heading left-align">
        <div className="su-step-label">{stepLabel}</div>
        <h1 className="su-title-dark">{t('wizard.victim.title')}</h1>
        <p className="su-subtitle">{t('wizard.victim.subtitle')}</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onContinue(); }}>
        <div className="multi-person-card">
          <div className="su-section-label">{t('wizard.victim.filedByQuestion')}</div>
          <div className="toggle-card-row">
            <button
              type="button"
              className={`toggle-card ${filedBy.type === 'individual' ? 'selected' : ''}`}
              onClick={() => onFiledByChange({ type: 'individual' })}
            >
              {filedBy.type === 'individual' && <span className="toggle-card-check"><Check size={11} /></span>}
              <span className="toggle-card-icon"><UserCircle size={20} /></span>
              <span className="toggle-card-label">{t('wizard.victim.filedByIndividual')}</span>
            </button>
            <button
              type="button"
              className={`toggle-card ${filedBy.type === 'group' ? 'selected' : ''}`}
              onClick={() => onFiledByChange({ type: 'group' })}
            >
              {filedBy.type === 'group' && <span className="toggle-card-check"><Check size={11} /></span>}
              <span className="toggle-card-icon"><UsersRound size={20} /></span>
              <span className="toggle-card-label">{t('wizard.victim.filedByGroup')}</span>
            </button>
          </div>

          {filedBy.type === 'group' && (
            <div className="victim-form-grid">
              <div className="su-field-group full-width">
                <label className="su-label-dark">
                  {t('wizard.victim.groupName')} <span className="su-req-red">*</span>
                </label>
                <input
                  type="text"
                  className="su-input-blue"
                  value={filedBy.groupName}
                  onChange={(e) => onFiledByChange({ groupName: e.target.value })}
                  required
                />
              </div>

              <div className="su-field-group full-width" style={{ marginTop: 4 }}>
                <div className="su-section-label" style={{ marginBottom: 8 }}>{t('wizard.victim.representativeSectionLabel')}</div>
              </div>

              <div className="su-field-group">
                <label className="su-label-dark">
                  {t('wizard.victim.representativeName')} <span className="su-req-red">*</span>
                </label>
                <input
                  type="text"
                  className="su-input-blue"
                  value={filedBy.representativeName}
                  onChange={(e) => onFiledByChange({ representativeName: e.target.value })}
                  required
                />
              </div>
              <div className="su-field-group">
                <label className="su-label-dark">
                  {t('common.phone')} <span className="su-req-red">*</span>
                </label>
                <input
                  type="tel"
                  className="su-input-blue"
                  value={filedBy.representativePhone}
                  onChange={(e) => onFiledByChange({ representativePhone: e.target.value })}
                  required
                />
              </div>
              <div className="su-field-group full-width">
                <label className="su-label-dark">{t('common.email')} ({t('wizard.optional')})</label>
                <input
                  type="email"
                  className="su-input-white"
                  value={filedBy.representativeEmail}
                  onChange={(e) => onFiledByChange({ representativeEmail: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        {victims.map((victim, index) => {
          const selectedPopulation = getKeyPopulation(victim.keyPopulationGroup);
          // Only the first victim, on a complainant-facing entry point, with "Myself" actually
          // selected, is ever a genuine self-report — everyone else (staff filing for someone,
          // any victim past the first) gets the depersonalized "they/them" wording below.
          const isSelfReport = isComplainant && index === 0 && victim.relationship === 'self';
          return (
            <div className="multi-person-card" key={index}>
              {victims.length > 1 && (
                <div className="multi-person-card-header">
                  <span className="multi-person-card-title">
                    {index === 0 ? t('wizard.victim.primaryVictim') : t('wizard.victim.victimNumber', { number: index + 1 })}
                  </span>
                  {index > 0 && (
                    <button type="button" className="multi-person-remove" onClick={() => onRemove(index)}>
                      <Trash2 size={14} /> {t('wizard.victim.removeVictim')}
                    </button>
                  )}
                </div>
              )}

              {index === 0 && isComplainant && (
                <>
                  <div className="su-section-label">{t('wizard.victim.whoExperienced')}</div>
                  <div className="toggle-card-row">
                    <button
                      type="button"
                      className={`toggle-card ${victim.relationship === 'self' ? 'selected' : ''}`}
                      onClick={() => onChange(index, { relationship: 'self' })}
                    >
                      {victim.relationship === 'self' && <span className="toggle-card-check"><Check size={11} /></span>}
                      <span className="toggle-card-icon"><UserCircle size={20} /></span>
                      <span className="toggle-card-label">{t('wizard.victim.myself')}</span>
                    </button>
                    <button
                      type="button"
                      className={`toggle-card ${victim.relationship === 'other' ? 'selected' : ''}`}
                      onClick={() => onChange(index, { relationship: 'other' })}
                    >
                      {victim.relationship === 'other' && <span className="toggle-card-check"><Check size={11} /></span>}
                      <span className="toggle-card-icon"><Users size={20} /></span>
                      <span className="toggle-card-label">{t('wizard.victim.someoneElse')}</span>
                    </button>
                  </div>
                </>
              )}

              <div className="victim-form-grid" style={{ marginBottom: 20 }}>
                <div className="su-field-group">
                  <label className="su-label-dark">
                    {t('common.firstName')} <span className="su-req-red">*</span>
                  </label>
                  <input
                    type="text"
                    className="su-input-blue"
                    value={victim.firstName}
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
                    value={victim.lastName}
                    onChange={(e) => onChange(index, { lastName: e.target.value })}
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
                    value={victim.phone}
                    onChange={(e) => onChange(index, { phone: e.target.value })}
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
                      className={`pill-toggle-option ${victim.gender === g ? 'selected' : ''}`}
                      onClick={() => onChange(index, { gender: g })}
                    >
                      {g === 'female' ? t('common.genderFemale') : g === 'male' ? t('common.genderMale') : t('common.genderRatherNotSay')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="su-more-about-section">
                <div className="su-field-group full-width">
                  <label className="su-label-dark">{t('common.email')} ({t('wizard.optional')})</label>
                  <input
                    type="email"
                    className="su-input-white"
                    value={victim.email}
                    onChange={(e) => onChange(index, { email: e.target.value })}
                  />
                </div>

                <div className="su-field-group full-width">
                  <label className="su-label-dark">{t('common.address')} ({t('wizard.optional')})</label>
                  <LocationAutocomplete
                    value={victim.address}
                    onChange={(address) => onChange(index, { address })}
                    placeholder={t('wizard.victim.addressPlaceholder')}
                  />
                </div>

                <div className="su-field-group full-width">
                  <label className="su-label-dark">{t('wizard.landmarkLabel')} ({t('wizard.optional')})</label>
                  <input
                    type="text"
                    className="su-input-white"
                    placeholder={t('wizard.landmarkPlaceholder')}
                    value={victim.landmark}
                    onChange={(e) => onChange(index, { landmark: e.target.value })}
                  />
                </div>

                <div className="su-field-group full-width">
                  <label className="su-label-dark">
                    {t(isSelfReport ? 'wizard.victim.populationQuestion' : 'wizard.victim.populationQuestionOther')}
                  </label>
                  <p className="su-field-hint-dark" style={{ fontSize: 11, marginBottom: 14 }}>{t('wizard.victim.populationHint')}</p>
                  <div className="toggle-card-row">
                    <button
                      type="button"
                      className={`toggle-card ${victim.populationType === 'general' ? 'selected' : ''}`}
                      onClick={() => handlePopulationTypeChange(index, 'general')}
                    >
                      {victim.populationType === 'general' && <span className="toggle-card-check"><Check size={11} /></span>}
                      <span className="toggle-card-label">{t('wizard.victim.generalPopulation')}</span>
                    </button>
                    <button
                      type="button"
                      className={`toggle-card ${victim.populationType === 'key' ? 'selected' : ''}`}
                      onClick={() => handlePopulationTypeChange(index, 'key')}
                    >
                      {victim.populationType === 'key' && <span className="toggle-card-check"><Check size={11} /></span>}
                      <span className="toggle-card-label">{t('wizard.victim.keyPopulation')}</span>
                    </button>
                  </div>

                  {victim.populationType === 'key' && selectedPopulation && (
                    <div className="key-population-chip">
                      <selectedPopulation.icon size={14} />
                      {selectedPopulation.label}
                      <button
                        type="button"
                        onClick={() => { setPendingSelection(victim.keyPopulationGroup); setKeyPopIndex(index); }}
                        aria-label="Change selection"
                      >
                        <Pencil size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <button type="button" className="multi-person-add" onClick={onAdd}>
          <UserPlus size={16} /> {t('wizard.victim.addAnotherVictim')}
        </button>

        <div className="su-step-nav">
          <button type="button" className="su-btn-light-pill" onClick={onBack}>{t('common.back')}</button>
          <button type="submit" className="su-btn-purple-pill">
            {t('common.continue')} <ArrowRight size={18} />
          </button>
        </div>
      </form>

      <KeyPopulationSheet
        open={keyPopIndex !== null}
        selected={pendingSelection}
        onSelect={setPendingSelection}
        onClose={handleCloseSheet}
        onConfirm={handleConfirmKeyPopulation}
      />
    </div>
  );
}
