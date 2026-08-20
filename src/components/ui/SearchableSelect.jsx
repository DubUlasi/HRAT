import React, { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

// A searchable dropdown for "assign to X" fields with more than a couple of options (officers,
// departments, offices) — behaves like <Select> (id in, id out via onChange) but lets you type
// to filter instead of scrolling a long native <option> list. `options` items just need an
// `id` plus a label (via `getLabel`, defaults to `.name`) — no other shape assumptions.
export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Search…',
  getLabel = (option) => option.name,
  disabled = false,
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const selected = options.find((option) => option.id === value);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return options;
    return options.filter((option) => getLabel(option).toLowerCase().includes(term));
  }, [options, query, getLabel]);

  const handleSelect = (option) => {
    onChange(option.id);
    setQuery('');
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      e.currentTarget.blur();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered.length === 1) handleSelect(filtered[0]);
    }
  };

  return (
    <div className={`searchable-select-wrap ${disabled ? 'disabled' : ''}`}>
      <input
        type="text"
        className="searchable-select-input"
        placeholder={placeholder}
        value={open ? query : (selected ? getLabel(selected) : '')}
        onChange={(e) => { setQuery(e.target.value); if (!open) setOpen(true); }}
        onFocus={() => { setQuery(''); setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        autoComplete="off"
      />
      <ChevronDown size={16} className="searchable-select-chevron" />

      {open && (
        <ul className="searchable-select-menu">
          {filtered.length === 0 ? (
            <li className="searchable-select-empty">No matches found</li>
          ) : (
            filtered.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  className={`searchable-select-option ${option.id === value ? 'selected' : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(option)}
                >
                  {getLabel(option)}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
