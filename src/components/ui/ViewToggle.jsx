import React from 'react';
import { List, LayoutGrid } from 'lucide-react';

const OPTIONS = [
  { value: 'list', icon: List, label: 'List view' },
  { value: 'tile', icon: LayoutGrid, label: 'Tile view' },
];

// Small segmented control for switching a list/table between its "list" and "tile" rendering.
// Purely presentational — callers own the actual view-mode state and swap components.
export default function ViewToggle({ value, onChange }) {
  return (
    <div className="view-toggle" role="group" aria-label="Switch view">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`view-toggle-btn ${value === opt.value ? 'active' : ''}`}
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          title={opt.label}
          aria-label={opt.label}
        >
          <opt.icon size={15} />
        </button>
      ))}
    </div>
  );
}
