import React, { useMemo, useState } from 'react';
import SearchBar from '../ui/SearchBar';
import StatusBadge from '../ui/StatusBadge';
import ActionIconButton from '../ui/ActionIconButton';
import Avatar from '../ui/Avatar';
import EmptyState from '../ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { ROLE_COMPLAINT_DETAIL_BASE } from '../../roles/roleNavMap';
import { scopeComplaintsForUser } from '../../roles/scopeComplaints';
import '../../styles/quickComplaintTracker.css';

const RESULT_LIMIT = 6;
const RECENT_LIMIT = 5;

// Search-by-name/complaint-number/phone widget shown inside QuickTrackerBlob's modal, on every
// role's dashboard. Pure client-side substring match, scoped to whatever the current role can
// otherwise see (scopeComplaintsForUser — Registry Head/ES get everything, everyone else only
// their own assigned complaints), with results linking into that role's own detail route. With
// no query typed yet, it shows the most recently filed complaints instead of an empty panel.
export default function QuickComplaintTracker() {
  const { user } = useAuth();
  const { complaints: allComplaints } = useComplaints();
  const complaints = useMemo(() => scopeComplaintsForUser(allComplaints, user), [allComplaints, user]);
  const detailBase = ROLE_COMPLAINT_DETAIL_BASE[user?.role] || '/registry-head/complaints';
  const [query, setQuery] = useState('');
  const searched = query.trim().length > 0;

  const recent = useMemo(
    () => [...complaints].sort((a, b) => new Date(b.dateFiled) - new Date(a.dateFiled)).slice(0, RECENT_LIMIT),
    [complaints]
  );

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

  const rows = searched ? results : recent;

  return (
    <div className="qt-tracker">
      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search by name, complaint number, or phone number"
      />

      {rows.length > 0 && (
        <span className="qt-results-label">{searched ? 'Search Results' : 'Recent Complaints'}</span>
      )}

      {searched && results.length === 0 && (
        <EmptyState message="No matching complaints found." />
      )}

      {rows.length > 0 && (
        <div className="qt-results">
          {rows.map((c) => (
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
                to={`${detailBase}/${c.id}`}
                state={{ from: '/registry-head/track' }}
                label={`View details for ${c.victim?.name || 'complaint'}`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
