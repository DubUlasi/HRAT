import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import FormField from '../../../components/ui/FormField';
import Select from '../../../components/ui/Select';
import TextArea from '../../../components/ui/TextArea';
import AttachDocumentsField from '../../../components/complaints/AttachDocumentsField';

// Council's decision on a complaint the Registry Head ruled inadmissible — reopen it for a
// fresh admissibility decision, or uphold the ruling and close the case.
export default function ReopenOrCloseModal({ open, onClose, complaint, onSubmit }) {
  const [decision, setDecision] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [files, setFiles] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!decision) return;
    onSubmit({ decision, recommendation, files });
    setDecision('');
    setRecommendation('');
    setFiles([]);
  };

  return (
    <Modal open={open} onClose={onClose} title="Council Decision" width="480px">
      <form onSubmit={handleSubmit}>
        {complaint?.admissibility?.explanation && (
          <div className="decision-summary">
            <div>
              <span className="label">Inadmissibility Reason</span>
              <p className="value">{complaint.admissibility.explanation}</p>
            </div>
          </div>
        )}

        <FormField label="Decision" required>
          <Select value={decision} onChange={(e) => setDecision(e.target.value)} required>
            <option value="" disabled>-- Select Decision --</option>
            <option value="REOPEN">Reopen for re-review</option>
            <option value="CLOSE">Uphold, close the case</option>
          </Select>
        </FormField>

        <FormField label="Recommendation" hint="A note for the record, if any.">
          <TextArea value={recommendation} onChange={(e) => setRecommendation(e.target.value)} placeholder="New evidence warrants another look." />
        </FormField>

        <AttachDocumentsField files={files} onChange={setFiles} />

        <div className="modal-actions">
          <Button type="submit" variant="submit">Submit</Button>
        </div>
      </form>
    </Modal>
  );
}
