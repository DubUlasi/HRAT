import React from 'react';

export default function Input({ className = '', ...rest }) {
  return <input className={`form-field-input ${className}`.trim()} {...rest} />;
}
