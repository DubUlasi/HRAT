import React from 'react';
import { Link } from 'react-router-dom';

// Mirrors the button treatments that already exist in the app (signup.css's
// su-btn-purple-pill / su-btn-light-pill / su-btn-green-submit, style.css's .btn-primary) —
// intentionally only three variants, since that's all the existing templates use.
const VARIANT_CLASS = {
  primary: 'btn primary',     // green gradient pill — main CTAs / confirmations
  submit: 'btn submit',       // solid green pill — form "Submit" buttons
  secondary: 'btn secondary', // light gray pill — Back / Cancel
};

export default function Button({
  variant = 'primary',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  type = 'button',
  className = '',
  to,
  children,
  ...rest
}) {
  const classes = `${VARIANT_CLASS[variant] || VARIANT_CLASS.primary} ${className}`.trim();
  const content = (
    <>
      {Icon && iconPosition === 'left' && <Icon size={16} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={16} />}
    </>
  );

  // `to` makes this a real navigation link styled as a button, instead of a dead-end button.
  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} {...rest}>
      {content}
    </button>
  );
}
