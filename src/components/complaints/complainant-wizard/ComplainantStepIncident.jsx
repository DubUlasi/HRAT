import React from 'react';
import { ArrowRight } from 'lucide-react';
import AddressPicker, { isAddressValid } from './AddressPicker';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function ComplainantStepIncident({ states, value, onChange, onBack, onContinue, error }) {
  const addressOk = isAddressValid(value.location);
  const canContinue = !!value.title.trim() && !!value.description.trim() && addressOk;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canContinue) return;
    onContinue();
  };

  return (
    <div className="su-step active">
      <div className="su-heading left-align">
        <div className="su-step-label">Step 2 of 6</div>
        <h1 className="su-title-dark">Tell us more</h1>
        <p className="su-subtitle">Share as much detail as you're comfortable with, every detail helps.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="su-field-group full-width">
          <label className="su-label-dark">Give this a short title <span className="su-req-red">*</span></label>
          <input
            type="text"
            className="su-input-white"
            placeholder="Brief title of the incident"
            value={value.title}
            onChange={(e) => onChange({ title: e.target.value })}
            required
          />
        </div>

        <div className="su-field-group full-width">
          <label className="su-label-dark">Tell us what happened <span className="su-req-red">*</span></label>
          <textarea
            className="su-textarea-white"
            rows="6"
            placeholder="Share as much detail as you're comfortable with, every detail helps us understand and respond to your situation."
            value={value.description}
            onChange={(e) => onChange({ description: e.target.value })}
            required
          />
        </div>

        <AddressPicker
          value={value.location}
          onChange={(location) => onChange({ location })}
          states={states}
          required
          addressLinePlaceholder="Where did it happen?"
        />

        <div className="su-field-group full-width">
          <label className="su-label-dark">When did it happen? ({'optional'})</label>
          <input
            type="date"
            className="su-input-white"
            value={value.occurredOn || ''}
            max={todayIso()}
            onChange={(e) => onChange({ occurredOn: e.target.value })}
          />
        </div>

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
