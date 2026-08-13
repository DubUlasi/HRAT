import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import FormField from '../../../components/ui/FormField';
import Select from '../../../components/ui/Select';
import TextArea from '../../../components/ui/TextArea';
import AttachDocumentsField from '../../../components/complaints/AttachDocumentsField';

// Final council verdict on a complaint that made it all the way through the department pipeline
// — closes the case.
export default function RecordVerdictModal({ open, onClose, onSubmit }) {
  const [verdict, setVerdict] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [files, setFiles] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!verdict) return;
    onSubmit({ verdict, recommendation, files });
    setVerdict('');
    setRecommendation('');
    setFiles([]);
  };

  return (
    <Modal open={open} onClose={onClose} title="Record Council Verdict" width="480px">
      <form onSubmit={handleSubmit}>
        <p className="modal-description">This closes the case, the verdict and recommendation are recorded permanently.</p>

        <FormField label="Verdict" required>
          <Select value={verdict} onChange={(e) => setVerdict(e.target.value)} required>
            <option value="" disabled>-- Select Verdict --</option>
            <option value="UPHELD">Complaint upheld</option>
            <option value="DISMISSED">Complaint dismissed</option>
          </Select>
        </FormField>

        <FormField label="Recommendation" hint="The council's formal recommendation, if any.">
          <TextArea value={recommendation} onChange={(e) => setRecommendation(e.target.value)} placeholder="Recommend disciplinary referral and compensation for the complainant." />
        </FormField>

        <AttachDocumentsField files={files} onChange={setFiles} />

        <div className="modal-actions">
          <Button type="submit" variant="submit">Record Verdict</Button>
        </div>
      </form>
    </Modal>
  );
}
