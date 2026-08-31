import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import FormField from '../../../components/ui/FormField';
import TextArea from '../../../components/ui/TextArea';

// Submits the local review's findings for the State Coordinator to review — the state-level
// analog of a SubmitInvestigationFindingsModal.
export default function SubmitStateFindingsModal({ open, onClose, onSubmit }) {
  const [findingSummary, setFindingSummary] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!findingSummary.trim()) return;
    onSubmit({ findingSummary: findingSummary.trim() });
    setFindingSummary('');
  };

  return (
    <Modal open={open} onClose={onClose} title="Submit Findings" width="480px">
      <form onSubmit={handleSubmit}>
        <p className="modal-description">Summarize what you found so the State Coordinator can review it before sending this back to head office.</p>

        <FormField label="Findings Summary" required>
          <TextArea value={findingSummary} onChange={(e) => setFindingSummary(e.target.value)} placeholder="Interviewed the complainant and two witnesses, confirmed the incident occurred as described." />
        </FormField>

        <div className="modal-actions">
          <Button type="submit" variant="submit" disabled={!findingSummary.trim()}>Submit for Review</Button>
        </div>
      </form>
    </Modal>
  );
}
