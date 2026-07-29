import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Avatar from '../ui/Avatar';
import StatusBadge from '../ui/StatusBadge';
import { STAGE_ORDER, STAGE_LABELS, stageProgressPercent } from '../../constants/complaintStatus';
import { CATEGORY_LABELS } from '../../constants/complaintCategories';

// Compact tile used by the Complaints / New / Treated list views — a step-by-step mini stepper
// stands in for the full StageTracker so it's still clear where a case sits in the pipeline
// without needing the detail page's full-size version.
export default function ComplaintCard({ complaint }) {
  const { stageIndex } = complaint;
  const currentStageLabel = stageIndex >= 0 ? STAGE_LABELS[STAGE_ORDER[stageIndex]] : 'Not yet started';
  const fillPercent = stageProgressPercent(stageIndex);

  return (
    <Link to={`/registry-head/complaints/${complaint.id}`} className="complaint-card">
      <div className="complaint-card-top">
        <span className="category-pill">{CATEGORY_LABELS[complaint.category]}</span>
        {complaint.complaintNumber && <span className="detail-tracking-code">{complaint.complaintNumber}</span>}
      </div>

      <h3 className="complaint-card-subject">{complaint.subject}</h3>
      <p className="complaint-card-date">Filed {new Date(complaint.dateFiled).toDateString()}</p>

      <div className="complaint-card-people">
        <div className="person-cell">
          <Avatar name={complaint.victim.name} size={21} />
          <span>{complaint.victim.name}</span>
        </div>
        <div className="person-cell">
          <Avatar name={complaint.allegedViolator.name} size={21} />
          <span>{complaint.allegedViolator.name}</span>
        </div>
      </div>

      <div className="mini-stepper">
        <div className="mini-stepper-track-bg">
          <div className="mini-stepper-track-fill" style={{ width: `${fillPercent}%` }} />
        </div>
        <div className="mini-stepper-dots">
          {STAGE_ORDER.map((key, idx) => (
            <span key={key} className={`mini-stepper-dot ${idx <= stageIndex ? 'reached' : ''}`} />
          ))}
        </div>
      </div>
      <span className="mini-stepper-label">{currentStageLabel}</span>

      <div className="complaint-card-footer">
        <StatusBadge status={complaint.subStatus} />
        <span className="complaint-card-view">
          View <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}
