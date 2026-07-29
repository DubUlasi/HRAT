import React from 'react';
import { Phone, Clock } from 'lucide-react';
import StatusBadge from './StatusBadge';
import ActionIconButton from './ActionIconButton';
import EmptyState from './EmptyState';
import { getCallerTypeMeta, getCallOutcomeMeta } from '../../constants/callCenter';
import { CATEGORY_LABELS } from '../../constants/complaintCategories';

// Same divider-row skeleton as ComplaintsTable, with its own modifier class (bolder header,
// clickable rows) — the row action opens the call detail drawer rather than navigating, since
// call details live in a drawer, not their own route.
export default function CallLogTable({ calls, onViewDetails }) {
  if (!calls.length) {
    return <EmptyState message="No calls logged yet" />;
  }

  return (
    <div className="complaints-table-wrap">
      <table className="complaints-table call-log-table">
        <thead>
          <tr>
            <th>Phone Number</th>
            <th>Caller Type</th>
            <th>Suggested Category</th>
            <th>Handled By</th>
            <th>Timestamp</th>
            <th>Outcome</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {calls.map((call) => {
            const callerMeta = getCallerTypeMeta(call.callerType);
            const outcomeMeta = getCallOutcomeMeta(call.outcome);
            return (
              <tr key={call.id} onClick={() => onViewDetails(call)} className="clickable-row">
                <td>
                  <span className="call-phone-cell">
                    <Phone size={12} /> {call.phoneNumber}
                  </span>
                </td>
                <td><StatusBadge label={callerMeta.label} color={callerMeta.color} /></td>
                <td>{call.suggestedCategory ? CATEGORY_LABELS[call.suggestedCategory] || call.suggestedCategory : '—'}</td>
                <td>{call.handledBy}</td>
                <td>
                  <span className="table-date-cell">
                    <Clock size={12} /> {new Date(call.timestamp).toLocaleString()}
                  </span>
                </td>
                <td><StatusBadge label={outcomeMeta.label} color={outcomeMeta.color} /></td>
                <td>
                  <ActionIconButton
                    onClick={(e) => { e.stopPropagation(); onViewDetails(call); }}
                    label={`View call details for ${call.phoneNumber}`}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
