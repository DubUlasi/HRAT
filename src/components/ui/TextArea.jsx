import React from 'react';

export default function TextArea({ rows = 4, className = '', ...rest }) {
  return <textarea className={`form-field-textarea ${className}`.trim()} rows={rows} {...rest} />;
}
