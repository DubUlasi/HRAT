import React, { useMemo, useState } from 'react';
import SearchBar from '../ui/SearchBar';
import StatusBadge from '../ui/StatusBadge';
import ActionIconButton from '../ui/ActionIconButton';
import Avatar from '../ui/Avatar';
import EmptyState from '../ui/EmptyState';
import { useComplaints } from '../../context/ComplaintsContext';
import '../../styles/quickComplaintTracker.css';

const RESULT_LIMIT = 6;

// Search-by-name/complaint-number/phone widget shown inside QuickTrackerBlob's modal. Pure
// client-side substring match over the complaints already in ComplaintsContext.
export default function QuickComplaintTracker() {
  const { complaints } = useComplaints();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return complaints
      .filter((c) => {
        const name = c.victim?.name?.toLowerCase() || '';
        const phone = c.victim?.phone?.toLowerCase() || '';
        const number = c.complaintNumber?.toLowerCase() || '';
        return name.includes(q) || phone.includes(q) || number.includes(q);
      })
      .slice(0, RESULT_LIMIT);
  }, [complaints, query]);

  const searched = query.trim().length > 0;

  return (
    <div className="qt-tracker">
      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search by name, complaint number, or phone number"
      />

      {searched && results.length === 0 && (
        <EmptyState message="No matching complaints found." />
      )}

      {results.length > 0 && (
        <div className="qt-results">
          {results.map((c) => (
            <div key={c.id} className="qt-result-row">
              <Avatar name={c.victim?.name || 'Unknown'} size={32} />
              <div className="qt-result-info">
                <span className="qt-result-name">{c.victim?.name || 'Unnamed victim'}</span>
                <span className="qt-result-meta">
                  {c.complaintNumber || 'No number yet'} · {c.victim?.phone || 'No phone on file'}
                </span>
              </div>
              <StatusBadge status={c.subStatus} />
              <ActionIconButton
                to={`/registry-head/complaints/${c.id}`}
                label={`View details for ${c.victim?.name || 'complaint'}`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
