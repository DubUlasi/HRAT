import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function Select({ children, className = '', ...rest }) {
  return (
    <div className="select-wrap">
      <select className={`form-field-input select-input ${className}`.trim()} {...rest}>
        {children}
      </select>
      <ChevronDown className="select-chevron" size={16} />
    </div>
  );
}
