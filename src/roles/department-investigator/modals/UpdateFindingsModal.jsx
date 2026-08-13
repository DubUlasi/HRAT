import React, { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import FormField from '../../../components/ui/FormField';
import TextArea from '../../../components/ui/TextArea';
import AttachDocumentsField from '../../../components/complaints/AttachDocumentsField';

// Progressive findings/recommendation editing — can be saved and revised any number of times
// before the investigator is ready to Submit Final Findings.
export default function UpdateFindingsModal({ open, onClose, complaint, onSubmit }) {
  const [finding, setFinding] = useState(complaint?.investigation.finding || '');
  const [recommendation, setRecommendation] = useState(complaint?.investigation.recommendation || '');
  const [files, setFiles] = useState([]);

  // Resync from the latest saved values every time the modal opens — without this, reopening
  // after a previous save would show stale text (this modal, unlike others in the app, can be
  // opened and saved repeatedly for the same complaint).
  useEffect(() => {
    if (open) {
      setFinding(complaint?.investigation.finding || '');
      setRecommendation(complaint?.investigation.recommendation || '');
      setFiles([]);
    }
  }, [open, complaint]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ finding, recommendation, files });
  };

  return (
    <Modal open={open} onClose={onClose} title="Update Findings" width="480px">
      <form onSubmit={handleSubmit}>
        <FormField label="Findings" hint="What did the investigation turn up so far?">
          <TextArea value={finding} onChange={(e) => setFinding(e.target.value)} rows={5} placeholder="Interviews and evidence gathered so far indicate..." />
        </FormField>

        <FormField label="Recommendation" hint="Your recommended approach or outcome.">
          <TextArea value={recommendation} onChange={(e) => setRecommendation(e.target.value)} placeholder="Recommend..." />
        </FormField>

        <AttachDocumentsField files={files} onChange={setFiles} />

        <div className="modal-actions">
          <Button type="submit" variant="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
}
