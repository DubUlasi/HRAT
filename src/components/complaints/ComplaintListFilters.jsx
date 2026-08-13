import React from 'react';
import Select from '../ui/Select';
import { SUB_STATUS_META } from '../../constants/complaintStatus';
import { CATEGORY_LABELS } from '../../constants/complaintCategories';
import { KEY_POPULATIONS } from '../../constants/keyPopulations';

// Shared matching helpers — kept next to the filter UI itself so every list page (Complaints,
// Track Complaint) filters identically instead of each page growing its own slightly-different
// predicate.
export function matchesStatusFilter(complaint, statusFilter) {
  return statusFilter === 'all' || complaint.subStatus === statusFilter;
}

export function matchesCategoryFilter(complaint, categoryFilter) {
  return categoryFilter === 'all' || complaint.category === categoryFilter;
}

// General/key population lives on the victim record. Complaints filed before this field existed
// have no populationType at all, which reads as General (the common case) rather than being
// excluded from every filter.
export function matchesPopulationFilter(complaint, populationFilter, keyGroupFilter) {
  if (populationFilter === 'all') return true;
  const isKey = complaint.victim?.populationType === 'key';
  if (populationFilter === 'general') return !isKey;
  if (!isKey) return false;
  return keyGroupFilter === 'all' || complaint.victim?.keyPopulationGroup === keyGroupFilter;
}

// Status + Category + Population(/key group) selects, meant to sit inside a .filter-toolbar
// alongside a SearchBar. Population intentionally reveals the key-group select only once "Key
// Population" is chosen, mirroring the two-step question the wizard itself asks.
export default function ComplaintListFilters({
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  populationFilter,
  onPopulationChange,
  keyGroupFilter,
  onKeyGroupChange,
}) {
  return (
    <>
      <Select value={statusFilter} onChange={(e) => onStatusChange(e.target.value)}>
        <option value="all">All Statuses</option>
        {Object.entries(SUB_STATUS_META).map(([key, meta]) => (
          <option key={key} value={key}>{meta.label}</option>
        ))}
      </Select>

      <Select value={categoryFilter} onChange={(e) => onCategoryChange(e.target.value)}>
        <option value="all">All Categories</option>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </Select>

      <Select
        value={populationFilter}
        onChange={(e) => {
          onPopulationChange(e.target.value);
          if (e.target.value !== 'key') onKeyGroupChange('all');
        }}
      >
        <option value="all">All Populations</option>
        <option value="general">General Population</option>
        <option value="key">Key Population</option>
      </Select>

      {populationFilter === 'key' && (
        <Select value={keyGroupFilter} onChange={(e) => onKeyGroupChange(e.target.value)}>
          <option value="all">All Key Groups</option>
          {KEY_POPULATIONS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </Select>
      )}
    </>
  );
}
