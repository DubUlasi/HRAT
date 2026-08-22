import React, { useState } from 'react';
import { Radar, ArrowRight } from 'lucide-react';
import Modal from '../ui/Modal';
import QuickComplaintTracker from './QuickComplaintTracker';
import { useTypewriter } from '../../hooks/useTypewriter';

// Nothing about the blob itself signals it's clickable, so this small typing hint sits beside
// it pointing the way — same typewriter rhythm as the hero's own status line, just a much
// shorter, single message that types out, holds, then loops.
const BLOB_HINT_MESSAGES = [{ text: 'Click to track a complaint' }];

// The hero's talking-blob button, repurposed: it no longer opens Call Center, it opens the
// Quick Complaint Tracker in a modal — search a name/complaint number/phone, then decide to
// view a matching complaint's full details.
export default function QuickTrackerBlob() {
  const [open, setOpen] = useState(false);
  const { text } = useTypewriter(BLOB_HINT_MESSAGES);

  return (
    <div className="voice-blob-wrap">
      <span className="voice-blob-hint" aria-hidden="true">
        {text}
        <span className="typewriter-cursor">|</span>
        <ArrowRight size={14} strokeWidth={3} className="voice-blob-hint-arrow" />
      </span>

      <button
        type="button"
        className="voice-blob-btn"
        onClick={() => setOpen(true)}
        title="Quick Complaint Tracker"
        aria-label="Open Quick Complaint Tracker"
      >
        <span className="voice-blob-ring" />
        <span className="voice-blob-shape">
          <span className="voice-blob-shine" />
        </span>
        <Radar size={21} className="voice-blob-icon" />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Quick Complaint Tracker" width="480px">
        <p className="modal-description">
          Search by name, complaint number, or phone number to pull up a complaint, then view its full details.
        </p>
        <QuickComplaintTracker />
      </Modal>
    </div>
  );
}
