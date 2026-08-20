import React from 'react';
import { useLocation } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import ActionIconButton from './ActionIconButton';
import EmptyState from './EmptyState';
import Avatar from './Avatar';
import { stageProgressPercent } from '../../constants/complaintStatus';
import { CATEGORY_LABELS, CATEGORY_COLOR } from '../../constants/complaintCategories';

export default function ComplaintsTable({ complaints, getActionHref, getReason }) {
  // Stamped onto the Link so the sidebar (Sidebar.jsx) can highlight whichever nav item this
  // list itself lives under once you're on the complaint's own detail page — a detail page's
  // own URL never matches a nav item, so without this nothing would light up.
  const location = useLocation();
  const navState = { from: location.pathname };

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
                    {c.complaintNumber && <span className="complaint-number-tag">{c.complaintNumber}</span>}
                    <span className="complaint-date">{c.dateFiled}</span>
                  </div>
                  <div className="complaint-subject-meta-row">
                    <span className={`category-pill pill-${CATEGORY_COLOR[c.category] || 'info'}`}>{CATEGORY_LABELS[c.category]}</span>
                  </div>
                  {getReason && getReason(c) && <span className="complaint-subject-reason">{getReason(c)}</span>}
                </div>
              </td>
              <td>
                <div className="person-cell">
                  <Avatar name={c.victim.name} size={28} />
                  <span className="person-cell-name">{c.victim.name}</span>
                  {c.additionalVictims?.length > 0 && <span className="person-cell-more">+{c.additionalVictims.length}</span>}
                </div>
              </td>
              <td>
                <div className="person-cell">
                  <Avatar name={c.allegedViolator.name} size={28} />
                  <span className="person-cell-name">{c.allegedViolator.name}</span>
                  {c.additionalViolators?.length > 0 && <span className="person-cell-more">+{c.additionalViolators.length}</span>}
                </div>
              </td>
              <td><StatusBadge status={c.subStatus} /></td>
              <td><ProgressBar percent={stageProgressPercent(c.stageIndex)} /></td>
              <td><ActionIconButton to={getActionHref(c)} state={navState} label={`View ${c.subject}`} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
