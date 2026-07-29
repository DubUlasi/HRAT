import React, { useState } from 'react';
import { Radar } from 'lucide-react';
import Modal from '../ui/Modal';
import QuickComplaintTracker from './QuickComplaintTracker';

// The hero's talking-blob button, repurposed: it no longer opens Call Center, it opens the
// Quick Complaint Tracker in a modal — search a name/complaint number/phone, then decide to
// view a matching complaint's full details.
export default function QuickTrackerBlob() {
  const [open, setOpen] = useState(false);

  return (
    <>
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
    </>
  );
}
