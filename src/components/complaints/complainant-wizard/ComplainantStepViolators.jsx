import React from 'react';
import { ArrowRight, ChevronDown, Trash2, UserPlus, UserCheck, UserX } from 'lucide-react';
import AddressPicker, { isAddressValid } from './AddressPicker';
import { ALLEGED_VIOLATOR_TYPE, VIOLATOR_IDENTIFICATION_STATUS } from '../../../api/complainantApi';

const TYPE_OPTIONS = [
  { value: ALLEGED_VIOLATOR_TYPE.INDIVIDUAL, label: 'An Individual' },
  { value: ALLEGED_VIOLATOR_TYPE.ORGANISATION, label: 'An Organisation' },
  { value: ALLEGED_VIOLATOR_TYPE.PUBLIC_OFFICER, label: 'A Public Officer' },
];

function violatorValid(v) {
  if (v.identificationStatus === VIOLATOR_IDENTIFICATION_STATUS.UNIDENTIFIED) return true;
  if (v.type === ALLEGED_VIOLATOR_TYPE.INDIVIDUAL) return v.individual.firstName.trim() && v.individual.lastName.trim() && isAddressValid(v.individual.address);
  if (v.type === ALLEGED_VIOLATOR_TYPE.ORGANISATION) return v.organisation.organisationName.trim() && isAddressValid(v.organisation.address);
  if (v.type === ALLEGED_VIOLATOR_TYPE.PUBLIC_OFFICER) return v.officer.firstName.trim() && v.officer.lastName.trim() && v.officer.agency.trim() && isAddressValid(v.officer.address);
  return false;
}

export default function ComplainantStepViolators({ states, violators, onChange, onAdd, onRemove, onBack, onContinue, error }) {
  const canContinue = violators.every(violatorValid);

  return (
    <div className="su-step active">
      <div className="su-heading left-align">
        <div className="su-step-label">Step 4 of 6</div>
        <h1 className="su-title-dark">Who is responsible?</h1>
        <p className="su-subtitle">Provide details of the individual, organization, or officer responsible, if known.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (canContinue) onContinue(); }}>
        <p className="su-field-hint-dark optional-note">All fields below are optional except the name, share whatever you know.</p>

        {violators.map((violator, index) => {
          const isUnidentified = violator.identificationStatus === VIOLATOR_IDENTIFICATION_STATUS.UNIDENTIFIED;
          return (
            <div className="multi-person-card" key={index}>
              {violators.length > 1 && (
                <div className="multi-person-card-header">
                  <span className="multi-person-card-title">{index === 0 ? 'Violator 1' : `Violator ${index + 1}`}</span>
                  {index > 0 && (
                    <button type="button" className="multi-person-remove" onClick={() => onRemove(index)}>
                      <Trash2 size={14} /> Remove
                    </button>
                  )}
                </div>
              )}

              <div className="su-section-label">Do you know who is responsible?</div>
              <div className="toggle-card-row">
                <button
                  type="button"
                  className={`toggle-card ${!isUnidentified ? 'selected' : ''}`}
                  onClick={() => onChange(index, { identificationStatus: VIOLATOR_IDENTIFICATION_STATUS.KNOWN })}
                >
                  <span className="toggle-card-icon"><UserCheck size={20} /></span>
                  <span className="toggle-card-label">Violator Is Known</span>
                </button>
                <button
                  type="button"
                  className={`toggle-card ${isUnidentified ? 'selected' : ''}`}
                  onClick={() => onChange(index, { identificationStatus: VIOLATOR_IDENTIFICATION_STATUS.UNIDENTIFIED })}
                >
                  <span className="toggle-card-icon"><UserX size={20} /></span>
                  <span className="toggle-card-label">Violator Is Unidentified</span>
                </button>
              </div>

              {isUnidentified ? (
                <p className="su-field-hint-dark">You can skip the details below, we'll add them once identified during the investigation.</p>
              ) : (
                <>
                  <div className="su-field-group full-width" style={{ marginTop: 12 }}>
                    <label className="su-label-dark">Type</label>
                    <div className="su-select-wrap">
                      <select
                        className="su-input-white su-select"
                        value={violator.type}
                        onChange={(e) => onChange(index, { type: Number(e.target.value) })}
                      >
                        {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      <ChevronDown className="su-select-chevron" size={16} />
                    </div>
                  </div>

                  {violator.type === ALLEGED_VIOLATOR_TYPE.INDIVIDUAL && (
                    <IndividualFields value={violator.individual} onChange={(patch) => onChange(index, { individual: { ...violator.individual, ...patch } })} states={states} />
                  )}
                  {violator.type === ALLEGED_VIOLATOR_TYPE.ORGANISATION && (
                    <OrganisationFields value={violator.organisation} onChange={(patch) => onChange(index, { organisation: { ...violator.organisation, ...patch } })} states={states} />
                  )}
                  {violator.type === ALLEGED_VIOLATOR_TYPE.PUBLIC_OFFICER && (
                    <OfficerFields value={violator.officer} onChange={(patch) => onChange(index, { officer: { ...violator.officer, ...patch } })} states={states} />
                  )}
                </>
              )}
            </div>
          );
        })}

        <button type="button" className="multi-person-add" onClick={onAdd}>
          <UserPlus size={16} /> + Add Another Violator
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

// AddressPicker renders its own grid internally, so it's always rendered as a SIBLING after the
// name/contact grid closes, never nested inside one — nesting one .victim-form-grid inside
// another breaks column spans (a plain nested grid div has no span rule of its own, so it'd get
// squashed to a single implicit track instead of the full row).
function IndividualFields({ value, onChange, states }) {
  return (
    <>
      <div className="victim-form-grid">
        <div className="su-field-group">
          <label className="su-label-dark">First Name <span className="su-req-red">*</span></label>
          <input type="text" className="su-input-blue" value={value.firstName} onChange={(e) => onChange({ firstName: e.target.value })} />
        </div>
        <div className="su-field-group">
          <label className="su-label-dark">Last Name <span className="su-req-red">*</span></label>
          <input type="text" className="su-input-blue" value={value.lastName} onChange={(e) => onChange({ lastName: e.target.value })} />
        </div>
        <div className="su-field-group">
          <label className="su-label-dark">Phone (optional)</label>
          <input type="tel" className="su-input-blue" value={value.phoneNumber} onChange={(e) => onChange({ phoneNumber: e.target.value })} />
        </div>
        <div className="su-field-group full-width">
          <label className="su-label-dark">Email (optional)</label>
          <input type="email" className="su-input-white" value={value.email} onChange={(e) => onChange({ email: e.target.value })} />
        </div>
      </div>
      <AddressPicker value={value.address} onChange={(address) => onChange({ address })} states={states} required />
    </>
  );
}

function OrganisationFields({ value, onChange, states }) {
  return (
    <>
      <div className="victim-form-grid">
        <div className="su-field-group full-width">
          <label className="su-label-dark">Organisation Name <span className="su-req-red">*</span></label>
          <input type="text" className="su-input-blue" value={value.organisationName} onChange={(e) => onChange({ organisationName: e.target.value })} />
        </div>
        <div className="su-field-group">
          <label className="su-label-dark">Phone (optional)</label>
          <input type="tel" className="su-input-blue" value={value.phoneNumber} onChange={(e) => onChange({ phoneNumber: e.target.value })} />
        </div>
        <div className="su-field-group">
          <label className="su-label-dark">Email (optional)</label>
          <input type="email" className="su-input-white" value={value.email} onChange={(e) => onChange({ email: e.target.value })} />
        </div>
      </div>
      <AddressPicker value={value.address} onChange={(address) => onChange({ address })} states={states} required />
    </>
  );
}

function OfficerFields({ value, onChange, states }) {
  return (
    <>
      <div className="victim-form-grid">
        <div className="su-field-group">
          <label className="su-label-dark">First Name <span className="su-req-red">*</span></label>
          <input type="text" className="su-input-blue" value={value.firstName} onChange={(e) => onChange({ firstName: e.target.value })} />
        </div>
        <div className="su-field-group">
          <label className="su-label-dark">Last Name <span className="su-req-red">*</span></label>
          <input type="text" className="su-input-blue" value={value.lastName} onChange={(e) => onChange({ lastName: e.target.value })} />
        </div>
        <div className="su-field-group full-width">
          <label className="su-label-dark">Agency <span className="su-req-red">*</span></label>
          <input type="text" className="su-input-blue" value={value.agency} onChange={(e) => onChange({ agency: e.target.value })} />
        </div>
        <div className="su-field-group">
          <label className="su-label-dark">Rank / Service Number (optional)</label>
          <input type="text" className="su-input-blue" value={value.rankOrServiceNumber} onChange={(e) => onChange({ rankOrServiceNumber: e.target.value })} />
        </div>
        <div className="su-field-group">
          <label className="su-label-dark">Phone (optional)</label>
          <input type="tel" className="su-input-blue" value={value.phoneNumber} onChange={(e) => onChange({ phoneNumber: e.target.value })} />
        </div>
        <div className="su-field-group full-width">
          <label className="su-label-dark">Email (optional)</label>
          <input type="email" className="su-input-white" value={value.email} onChange={(e) => onChange({ email: e.target.value })} />
        </div>
      </div>
      <AddressPicker value={value.address} onChange={(address) => onChange({ address })} states={states} required />
    </>
  );
}
