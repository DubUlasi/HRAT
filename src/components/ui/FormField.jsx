import React from 'react';

export default function FormField({ label, required, children, hint }) {
  return (
    <div className="form-field">
      {label && (
        <label className="form-field-label">
          {label}
          {required && <span className="required-mark"> *</span>}
        </label>
      )}
      {children}
      {hint && <p className="form-field-hint">{hint}</p>}
    </div>
  );
}
