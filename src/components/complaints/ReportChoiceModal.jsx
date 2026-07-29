import React from 'react';
import { Keyboard, Mic } from 'lucide-react';
import Modal from '../ui/Modal';

// The "Make a Complaint" entry point — sits in front of MakeComplaintModal and
// VoiceReportModal so the Make a Complaint button offers a real choice instead of always
// jumping straight into the typed wizard.
export default function ReportChoiceModal({ open, onClose, onSelectType, onSelectSpeak }) {
  return (
    <Modal open={open} onClose={onClose} title="Make a Complaint" width="480px">
      <p className="report-choice-intro">Choose how you'd like to file this complaint.</p>
      <div className="report-choice-grid">
        <button type="button" className="report-choice-card" onClick={onSelectType}>
          <span className="report-choice-icon"><Keyboard size={20} /></span>
          <span className="report-choice-title">Type it</span>
          <span className="report-choice-desc">Fill out the complaint form step by step.</span>
        </button>
        <button type="button" className="report-choice-card" onClick={onSelectSpeak}>
          <span className="report-choice-icon"><Mic size={20} /></span>
          <span className="report-choice-title">Speak it</span>
          <span className="report-choice-desc">Describe what happened out loud, we'll transcribe and autofill the form.</span>
        </button>
      </div>
    </Modal>
  );
}
