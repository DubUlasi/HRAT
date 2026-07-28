import React from 'react';
import { Check } from 'lucide-react';
import { STAGE_ORDER, STAGE_LABELS } from '../../constants/complaintStatus';

// Horizontal "Case Created -> ... -> Governing Council" stepper used on every complaint detail
// view, regardless of role. Clicking a stage is used to open that stage's activity log.
export default function StageTracker({ stageIndex = -1, onStageClick }) {
  const fillPercent = stageIndex < 0 ? 0 : (stageIndex / (STAGE_ORDER.length - 1)) * 100;

  return (
    <div className="stepper-visualizer-card">
      <div className="stepper-track-row">
        <div className="stepper-line-track">
          <div className="stepper-line-fill" style={{ width: `${fillPercent}%` }} />
        </div>
        <div className="stepper-nodes-grid">
          {STAGE_ORDER.map((key, idx) => {
            const reached = idx <= stageIndex;
            const isCurrent = idx === stageIndex;
            return (
              <button
                type="button"
                key={key}
                className={`stepper-node-item ${reached ? 'reached' : ''} ${isCurrent ? 'current' : ''}`}
                onClick={() => onStageClick?.(key, idx)}
              >
                <span className="stepper-circle">
                  {reached && !isCurrent ? <Check size={14} /> : <span className="stepper-step-num">{idx + 1}</span>}
                </span>
                <span className="stepper-node-label">{STAGE_LABELS[key]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
