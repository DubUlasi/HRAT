import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import FormField from '../../../components/ui/FormField';
import Select from '../../../components/ui/Select';
import TextArea from '../../../components/ui/TextArea';
import AttachDocumentsField from '../../../components/complaints/AttachDocumentsField';

// Logs a discrete investigation activity (a call, a meeting, a note) — these get summarized in
// the activity timeline for everyone the case has passed through.
export default function LogActivityModal({ open, onClose, onSubmit }) {
  const [type, setType] = useState('');
  const [withParty, setWithParty] = useState('');
  const [summary, setSummary] = useState('');
  const [files, setFiles] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!type || !withParty || !summary) return;
    onSubmit({ type, withParty, summary, files });
    setType('');
    setWithParty('');
    setSummary('');
    setFiles([]);
  };

  return (
    <Modal open={open} onClose={onClose} title="Log Activity" width="480px">
      <form onSubmit={handleSubmit}>
        <FormField label="Activity Type" required>
          <Select value={type} onChange={(e) => setType(e.target.value)} required>
            <option value="" disabled>-- Select Type --</option>
            <option value="call">Call</option>
            <option value="meeting">Meeting</option>
            <option value="note">Note</option>
          </Select>
        </FormField>

        <FormField label="With" required>
          <Select value={withParty} onChange={(e) => setWithParty(e.target.value)} required>
            <option value="" disabled>-- Select --</option>
            <option value="victim">Victim</option>
            <option value="violator">Alleged Violator</option>
            <option value="other">Other</option>
          </Select>
        </FormField>

        <FormField label="Summary" required>
          <TextArea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="What happened during this activity?" required />
        </FormField>

        <AttachDocumentsField files={files} onChange={setFiles} />

        <div className="modal-actions">
          <Button type="submit" variant="submit">Log Activity</Button>
        </div>
      </form>
    </Modal>
  );
}
