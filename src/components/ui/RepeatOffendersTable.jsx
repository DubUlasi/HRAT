import React from 'react';
import { Calendar } from 'lucide-react';
import Avatar from './Avatar';
import ActionIconButton from './ActionIconButton';
import EmptyState from './EmptyState';
import { CATEGORY_LABELS } from '../../constants/complaintCategories';

// Same divider-row skeleton as ComplaintsTable, with its own modifier class for a slightly
// more "flagged" treatment (bolder header, clickable rows) fitting a watchlist rather than a
// plain record list.
export default function RepeatOffendersTable({ offenders, onViewHistory }) {
  if (!offenders.length) {
    return <EmptyState message="No repeat offenders flagged yet" />;
  }

  return (
    <div className="complaints-table-wrap">
      <table className="complaints-table repeat-offenders-table">
        <thead>
          <tr>
            <th>Alleged Violator</th>
            <th>Complaints</th>
            <th>Categories Involved</th>
            <th>Most Recent Complaint</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {offenders.map((offender) => (
            <tr key={offender.id} onClick={() => onViewHistory(offender)} className="clickable-row">
              <td>
                <div className="person-cell">
                  <Avatar name={offender.name} size={28} />
                  <span>{offender.name}</span>
                </div>
              </td>
              <td><span className="count-badge">{offender.complaintCount}</span></td>
              <td>
                <div className="offender-categories-cell">
                  {offender.categories.map((cat) => (
                    <span key={cat} className="category-pill">{CATEGORY_LABELS[cat] || cat}</span>
                  ))}
                </div>
              </td>
              <td>
                <span className="table-date-cell">
                  <Calendar size={12} /> {new Date(offender.mostRecentDate).toDateString()}
                </span>
              </td>
              <td>
                <ActionIconButton
                  onClick={(e) => { e.stopPropagation(); onViewHistory(offender); }}
                  label={`View history for ${offender.name}`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
