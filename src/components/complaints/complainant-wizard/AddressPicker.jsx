import React from 'react';
import { ChevronDown } from 'lucide-react';

// Structured State -> LGA address input for the real complainant flow — replaces
// LocationAutocomplete (a free-text field with static-list suggestions, one string in/out) for
// this flow only, since the backend now requires AddressInput's { addressLine, city, stateId,
// localGovernmentAreaId } shape rather than a single string. `states` comes straight from
// GET /complaint-form/options, each entry already carrying its own nested localGovernmentAreas —
// the LGA select is scoped to whichever state is currently chosen and resets whenever the state
// changes, since an LGA from a different state is meaningless.
export default function AddressPicker({ value, onChange, states, required, addressLinePlaceholder }) {
  const selectedState = states.find((s) => s.id === value?.stateId) || null;
  const lgas = selectedState?.localGovernmentAreas || [];

  const patch = (p) => onChange({ addressLine: '', city: '', stateId: '', localGovernmentAreaId: '', ...value, ...p });

  return (
    <>
      <div className="su-field-group full-width">
        <label className="su-label-dark">
          Address Line {required && <span className="su-req-red">*</span>}
        </label>
        <input
          type="text"
          className="su-input-white"
          placeholder={addressLinePlaceholder || 'Street address'}
          value={value?.addressLine || ''}
          onChange={(e) => patch({ addressLine: e.target.value })}
        />
      </div>

      <div className="victim-form-grid">
        <div className="su-field-group col-2">
          <label className="su-label-dark">
            State {required && <span className="su-req-red">*</span>}
          </label>
          <div className="su-select-wrap">
            <select
              className="su-input-white su-select"
              value={value?.stateId || ''}
              onChange={(e) => patch({ stateId: e.target.value, localGovernmentAreaId: '' })}
            >
              <option value="">-- Select State --</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <ChevronDown className="su-select-chevron" size={16} />
          </div>
        </div>

        <div className="su-field-group col-2">
          <label className="su-label-dark">LGA (optional)</label>
          <div className="su-select-wrap">
            <select
              className="su-input-white su-select"
              value={value?.localGovernmentAreaId || ''}
              onChange={(e) => patch({ localGovernmentAreaId: e.target.value })}
              disabled={!selectedState}
            >
              <option value="">{selectedState ? '-- Select LGA --' : 'Select a state first'}</option>
              {lgas.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
            <ChevronDown className="su-select-chevron" size={16} />
          </div>
        </div>

        <div className="su-field-group col-2">
          <label className="su-label-dark">City (optional)</label>
          <input
            type="text"
            className="su-input-white"
            value={value?.city || ''}
            onChange={(e) => patch({ city: e.target.value })}
          />
        </div>
      </div>
    </>
  );
}

// An address is "empty" (send null to the API) only when nothing at all has been entered — the
// moment any field is touched, addressLine/stateId become the fields worth validating as required
// before continuing, matching AddressInput's own required fields.
export function isAddressEmpty(value) {
  return !value?.addressLine && !value?.city && !value?.stateId && !value?.localGovernmentAreaId;
}

export function isAddressValid(value) {
  return isAddressEmpty(value) || (!!value.addressLine && !!value.stateId);
}

export function toAddressInput(value) {
  if (isAddressEmpty(value)) return null;
  return {
    addressLine: value.addressLine,
    city: value.city || null,
    stateId: value.stateId,
    localGovernmentAreaId: value.localGovernmentAreaId || null,
  };
}
