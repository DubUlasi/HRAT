import React from 'react';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import ActionIconButton from './ActionIconButton';
import EmptyState from './EmptyState';
import Avatar from './Avatar';
import { stageProgressPercent } from '../../constants/complaintStatus';
import { CATEGORY_LABELS, CATEGORY_COLOR } from '../../constants/complaintCategories';

export default function ComplaintsTable({ complaints, getActionHref, getReason }) {
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
                  <div className="complaint-subject-meta-row">
                    <span className="complaint-date">{c.dateFiled}</span>
                    <span className={`category-pill pill-${CATEGORY_COLOR[c.category] || 'info'}`}>{CATEGORY_LABELS[c.category]}</span>
                  </div>
                  {getReason && getReason(c) && <span className="complaint-subject-reason">{getReason(c)}</span>}
                </div>
              </td>
              <td>
                <div className="person-cell">
                  <Avatar name={c.victim.name} size={28} />
                  <span>{c.victim.name}</span>
                  {c.additionalVictims?.length > 0 && <span className="person-cell-more">+{c.additionalVictims.length}</span>}
                </div>
              </td>
              <td>
                <div className="person-cell">
                  <Avatar name={c.allegedViolator.name} size={28} />
                  <span>{c.allegedViolator.name}</span>
                  {c.additionalViolators?.length > 0 && <span className="person-cell-more">+{c.additionalViolators.length}</span>}
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
