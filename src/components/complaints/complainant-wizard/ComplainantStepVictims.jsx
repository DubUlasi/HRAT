import React from 'react';
import { ArrowRight, UserCircle, Users, UsersRound, Trash2, UserPlus, ChevronDown } from 'lucide-react';
import AddressPicker, { isAddressValid } from './AddressPicker';
import { FILING_PARTY_TYPE, POPULATION_CLASSIFICATION } from '../../../api/complainantApi';

function toggleKeyPopulation(list, groupId) {
  const exists = list.some((k) => k.keyPopulationGroupId === groupId);
  if (exists) return list.filter((k) => k.keyPopulationGroupId !== groupId);
  return [...list, { keyPopulationGroupId: groupId, customDescription: '' }];
}

export default function ComplainantStepVictims({ states, keyPopulations, genders, victims, onChange, onAdd, onRemove, filedBy, onFiledByChange, onBack, onContinue, error }) {
  const isGroup = filedBy.filingPartyType === FILING_PARTY_TYPE.GROUP_OR_COMMITTEE;

  const victimValid = (v) => v.firstName.trim() && v.lastName.trim() && v.phoneNumber.trim() && v.gender && isAddressValid(v.address);
  const canContinue = victims.every(victimValid) && (!isGroup || (filedBy.groupName.trim() && filedBy.representative.name.trim() && filedBy.representative.phoneNumber.trim()));

  return (
    <div className="su-step active">
      <div className="su-heading left-align">
        <div className="su-step-label">Step 3 of 6</div>
        <h1 className="su-title-dark">Who was affected?</h1>
        <p className="su-subtitle">Tell us about the person this happened to.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (canContinue) onContinue(); }}>
        <div className="multi-person-card">
          <div className="su-section-label">Who is filing this complaint?</div>
          <div className="toggle-card-row">
            <button
              type="button"
              className={`toggle-card ${!isGroup ? 'selected' : ''}`}
              onClick={() => onFiledByChange({ filingPartyType: FILING_PARTY_TYPE.INDIVIDUAL })}
            >
              <span className="toggle-card-icon"><UserCircle size={20} /></span>
              <span className="toggle-card-label">An Individual</span>
            </button>
            <button
              type="button"
              className={`toggle-card ${isGroup ? 'selected' : ''}`}
              onClick={() => onFiledByChange({ filingPartyType: FILING_PARTY_TYPE.GROUP_OR_COMMITTEE })}
            >
              <span className="toggle-card-icon"><UsersRound size={20} /></span>
              <span className="toggle-card-label">A Group / Committee</span>
            </button>
          </div>

          {isGroup && (
            <div className="victim-form-grid">
              <div className="su-field-group full-width">
                <label className="su-label-dark">Group / Committee Name <span className="su-req-red">*</span></label>
                <input type="text" className="su-input-blue" value={filedBy.groupName} onChange={(e) => onFiledByChange({ groupName: e.target.value })} required />
              </div>
              <div className="su-field-group">
                <label className="su-label-dark">Representative's Name <span className="su-req-red">*</span></label>
                <input type="text" className="su-input-blue" value={filedBy.representative.name} onChange={(e) => onFiledByChange({ representative: { ...filedBy.representative, name: e.target.value } })} required />
              </div>
              <div className="su-field-group">
                <label className="su-label-dark">Phone <span className="su-req-red">*</span></label>
                <input type="tel" className="su-input-blue" value={filedBy.representative.phoneNumber} onChange={(e) => onFiledByChange({ representative: { ...filedBy.representative, phoneNumber: e.target.value } })} required />
              </div>
              <div className="su-field-group full-width">
                <label className="su-label-dark">Email (optional)</label>
                <input type="email" className="su-input-white" value={filedBy.representative.email} onChange={(e) => onFiledByChange({ representative: { ...filedBy.representative, email: e.target.value } })} />
              </div>
            </div>
          )}
        </div>

        {victims.map((victim, index) => (
          <div className="multi-person-card" key={index}>
            {victims.length > 1 && (
              <div className="multi-person-card-header">
                <span className="multi-person-card-title">{index === 0 ? 'Victim 1' : `Victim ${index + 1}`}</span>
                {index > 0 && (
                  <button type="button" className="multi-person-remove" onClick={() => onRemove(index)}>
                    <Trash2 size={14} /> Remove
                  </button>
                )}
              </div>
            )}

            {index === 0 && (
              <>
                <div className="su-section-label">Who experienced this?</div>
                <div className="toggle-card-row">
                  <button
                    type="button"
                    className={`toggle-card ${victim.relationship === 'self' ? 'selected' : ''}`}
                    onClick={() => onChange(index, { relationship: 'self' })}
                  >
                    <span className="toggle-card-icon"><UserCircle size={20} /></span>
                    <span className="toggle-card-label">Myself (I am the victim)</span>
                  </button>
                  <button
                    type="button"
                    className={`toggle-card ${victim.relationship === 'other' ? 'selected' : ''}`}
                    onClick={() => onChange(index, { relationship: 'other' })}
                  >
                    <span className="toggle-card-icon"><Users size={20} /></span>
                    <span className="toggle-card-label">Someone else (Reporting on behalf)</span>
                  </button>
                </div>
              </>
            )}

            <div className="victim-form-grid" style={{ marginBottom: 20 }}>
              <div className="su-field-group">
                <label className="su-label-dark">First Name <span className="su-req-red">*</span></label>
                <input type="text" className="su-input-blue" value={victim.firstName} onChange={(e) => onChange(index, { firstName: e.target.value })} required />
              </div>
              <div className="su-field-group">
                <label className="su-label-dark">Last Name <span className="su-req-red">*</span></label>
                <input type="text" className="su-input-blue" value={victim.lastName} onChange={(e) => onChange(index, { lastName: e.target.value })} required />
              </div>
              <div className="su-field-group full-width">
                <label className="su-label-dark">Phone <span className="su-req-red">*</span></label>
                <input type="tel" className="su-input-blue" value={victim.phoneNumber} onChange={(e) => onChange(index, { phoneNumber: e.target.value })} required />
              </div>
            </div>

            <div className="su-field-group full-width" style={{ marginBottom: 20 }}>
              <label className="su-label-dark">Gender <span className="su-req-red">*</span></label>
              <div className="su-select-wrap">
                <select className="su-input-white su-select" value={victim.gender} onChange={(e) => onChange(index, { gender: e.target.value })} required>
                  <option value="" disabled>-- Select Gender --</option>
                  {genders.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                <ChevronDown className="su-select-chevron" size={16} />
              </div>
            </div>

            <div className="su-field-group full-width">
              <label className="su-label-dark">Email (optional)</label>
              <input type="email" className="su-input-white" value={victim.email} onChange={(e) => onChange(index, { email: e.target.value })} />
            </div>

            <AddressPicker
              value={victim.address}
              onChange={(address) => onChange(index, { address })}
              states={states}
              required
              addressLinePlaceholder="Street, city, state"
            />

            <div className="su-field-group full-width">
              <label className="su-label-dark">Do{victim.relationship === 'self' ? ' you' : ' they'} belong to a general or key population?</label>
              <div className="pill-toggle-group">
                <button
                  type="button"
                  className={`pill-toggle-option ${victim.populationClassification === POPULATION_CLASSIFICATION.GENERAL ? 'selected' : ''}`}
                  onClick={() => onChange(index, { populationClassification: POPULATION_CLASSIFICATION.GENERAL, keyPopulations: [] })}
                >
                  General Population
                </button>
                <button
                  type="button"
                  className={`pill-toggle-option ${victim.populationClassification === POPULATION_CLASSIFICATION.KEY ? 'selected' : ''}`}
                  onClick={() => onChange(index, { populationClassification: POPULATION_CLASSIFICATION.KEY })}
                >
                  Key Population
                </button>
              </div>

              {victim.populationClassification === POPULATION_CLASSIFICATION.KEY && (
                <div className="key-population-list" style={{ marginTop: 10 }}>
                  {keyPopulations.map((kp) => {
                    const selected = victim.keyPopulations.some((k) => k.keyPopulationGroupId === kp.id);
                    return (
                      <button
                        type="button"
                        key={kp.id}
                        className={`key-population-option ${selected ? 'selected' : ''}`}
                        onClick={() => onChange(index, { keyPopulations: toggleKeyPopulation(victim.keyPopulations, kp.id) })}
                      >
                        <span className="key-population-text">
                          <span className="key-population-label">{kp.name}</span>
                          <span className="key-population-desc">{kp.description}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        <button type="button" className="multi-person-add" onClick={onAdd}>
          <UserPlus size={16} /> + Add Another Victim
        </button>

        {error && (
          <p className="su-field-hint-dark" style={{ color: 'var(--danger-color)', marginTop: 12 }}>{error}</p>
        )}

        <div className="su-step-nav">
          <button type="button" className="su-btn-light-pill" onClick={onBack}>Back</button>
          <button type="submit" className="su-btn-purple-pill" disabled={!canContinue}>
            Continue <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
