import React, { useState } from 'react';
import { Hash, Zap } from 'lucide-react';
import Button from '../ui/Button';
import ComplaintNumberFormatModal from './ComplaintNumberFormatModal';
import { formatComplaintNumber } from '../../context/ComplaintsContext';

// Inline summary + "Configure format" launcher for the Registry Head's Settings page — the
// actual segment-by-segment builder lives in ComplaintNumberFormatModal, mirroring the
// admission-number / staff-ID format configurators elsewhere in the product.
export default function ComplaintNumberFormatCard({ currentFormat, currentSeq, autoAssign, onToggleAuto, onSave }) {
  const [showModal, setShowModal] = useState(false);
  const preview = formatComplaintNumber(currentFormat, currentSeq);

  return (
    <div className="categories-card" style={{ marginTop: 14 }}>
      <h2>Complaint Numbering</h2>

      <div className="settings-row">
        <div className="settings-row-label">
          <Zap size={16} />
          <span>Automatically assign complaint numbers</span>
        </div>
        <div
          className={`theme-switch ${autoAssign ? 'on' : ''}`}
          onClick={() => onToggleAuto(!autoAssign)}
          role="button"
          tabIndex={0}
          aria-pressed={autoAssign}
        >
          <div className="theme-switch-handle"></div>
        </div>
      </div>

      <p className="form-field-hint" style={{ marginTop: -4, marginBottom: 14 }}>
        {autoAssign
          ? 'New complaints are numbered the moment they are submitted, using the format below — no Desk Officer needs to process them first.'
          : 'New complaints will need a Desk Officer assigned to process their number before it appears, using the format below.'}
      </p>

      <div className="settings-row">
        <div className="settings-row-label">
          <Hash size={16} />
          <span>Next complaint number: <strong>{preview}</strong></span>
        </div>
        <Button variant="secondary" onClick={() => setShowModal(true)}>Configure format</Button>
      </div>

      <ComplaintNumberFormatModal
        open={showModal}
        onClose={() => setShowModal(false)}
        currentFormat={currentFormat}
        currentSeq={currentSeq}
        onSave={(format, seq) => {
          onSave(format, seq);
          setShowModal(false);
        }}
      />
    </div>
  );
}
