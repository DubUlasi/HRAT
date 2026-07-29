import React from 'react';
import { Search, X } from 'lucide-react';

// Plain controlled text search input, styled to slot into a page's filter row alongside
// Select filters (see .filter-toolbar). Callers own the actual filtering logic.
export default function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`search-bar ${className}`.trim()}>
      <Search size={15} className="search-bar-icon" />
      <input
        type="text"
        className="search-bar-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          type="button"
          className="search-bar-clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
