import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function ActionIconButton({ to, state, onClick, label = 'View' }) {
  const className = 'action-icon-btn';
  const content = <ArrowRight size={16} />;

  if (to) {
    return (
      <Link to={to} state={state} className={className} aria-label={label}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick} aria-label={label}>
      {content}
    </button>
  );
}
