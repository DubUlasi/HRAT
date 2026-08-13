import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import FormField from '../../../components/ui/FormField';
import Select from '../../../components/ui/Select';
import TextArea from '../../../components/ui/TextArea';
import AttachDocumentsField from '../../../components/complaints/AttachDocumentsField';

// The Desk Officer's own record of an ADMISSIBLE/INADMISSIBLE decision — separate from the
// Registry Head's earlier "assign an officer to check this" step, and from the Head's later
// confirm/disagree review of what gets submitted here.
export default function SubmitAdmissibilityDecisionModal({ open, onClose, onSubmit }) {
  const [decision, setDecision] = useState('');
  const [explanation, setExplanation] = useState('');
  const [remark, setRemark] = useState('');
  const [files, setFiles] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!decision) return;
    onSubmit({ decision, explanation, remark, files });
    setDecision('');
    setExplanation('');
    setRemark('');
    setFiles([]);
  };

  return (
    <Modal open={open} onClose={onClose} title="Submit Admissibility Decision" width="480px">
      <form onSubmit={handleSubmit}>
        <p className="modal-description">Record your admissibility decision, this goes back to the Complaint Registry Head for confirmation.</p>

        <FormField label="Decision" required>
          <Select value={decision} onChange={(e) => setDecision(e.target.value)} required>
            <option value="" disabled>-- Select Decision --</option>
            <option value="ADMISSIBLE">Admissible</option>
            <option value="INADMISSIBLE">Inadmissible</option>
          </Select>
        </FormField>

        <FormField label="Explanation" required hint="Shown wherever this complaint's outcome is summarized.">
          <TextArea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="The complaint has been thoroughly inspected and..."
            required
          />
        </FormField>

        <FormField label="Remarks" hint="An internal note for the Registry Head, if any.">
          <TextArea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Look into this." />
        </FormField>

        <AttachDocumentsField files={files} onChange={setFiles} />

        <div className="modal-actions">
          <Button type="submit" variant="submit">Submit</Button>
        </div>
      </form>
    </Modal>
  );
}
