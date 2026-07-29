import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { searchLocations } from '../../constants/nigeriaLocations';

// Simple client-side autocomplete for address/location fields — no real geocoding service
// wired up (consistent with the rest of this app's mock-data-driven approach), so it just
// suggests matches from a static Nigerian cities/states list as the user types. Selecting a
// suggestion fills the input; typing a value not in the list is still allowed (free text).
export default function LocationAutocomplete({ value, onChange, placeholder, className = '' }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestions = searchLocations(value);

  const handleSelect = (suggestion) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className={`location-input-wrap ${className}`.trim()}>
      <MapPin size={16} className="location-input-icon" />
      <input
        type="text"
        className="su-input-white location-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => { onChange(e.target.value); setShowSuggestions(true); }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="location-suggestions">
          {suggestions.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                className="location-suggestion-item"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(suggestion)}
              >
                <MapPin size={12} />
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
