import React from 'react';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import ActionIconButton from './ActionIconButton';
import EmptyState from './EmptyState';
import Avatar from './Avatar';
import { stageProgressPercent } from '../../constants/complaintStatus';

export default function ComplaintsTable({ complaints, getActionHref }) {
  if (!complaints.length) {
    return <EmptyState />;
  }

  return (
    <div className="complaints-table-wrap">
      <table className="complaints-table">
        <thead>
          <tr>
            <th>Complaint Subject</th>
            <th>Victim</th>
            <th>Alleged Violator</th>
            <th>Status</th>
            <th>Case Progress</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((c) => (
            <tr key={c.id}>
              <td>
                <div className="complaint-subject-cell">
                  <span className="complaint-subject">{c.subject}</span>
                  <span className="complaint-date">{c.dateFiled}</span>
                </div>
              </td>
              <td>
                <div className="person-cell">
                  <Avatar name={c.victim.name} size={28} />
                  <span>{c.victim.name}</span>
                </div>
              </td>
              <td>
                <div className="person-cell">
                  <Avatar name={c.allegedViolator.name} size={28} />
                  <span>{c.allegedViolator.name}</span>
                </div>
              </td>
              <td><StatusBadge status={c.subStatus} /></td>
              <td><ProgressBar percent={stageProgressPercent(c.stageIndex)} /></td>
              <td><ActionIconButton to={getActionHref(c)} label={`View ${c.subject}`} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
