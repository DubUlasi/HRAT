import React from 'react';

// Theme-aware CSS vars, not fixed hex, so avatars pick up the brighter dark-mode shades too.
const PALETTE = [
  'var(--info-color)',
  'var(--warning-color)',
  'var(--danger-color)',
  'var(--violet-color)',
  'var(--accent-color)',
];

function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
}

function colorForName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export default function Avatar({ name, size = 32 }) {
  return (
    <span
      className="avatar-chip"
      style={{ width: size, height: size, fontSize: size * 0.4, backgroundColor: colorForName(name) }}
    >
      {getInitials(name)}
    </span>
  );
}
