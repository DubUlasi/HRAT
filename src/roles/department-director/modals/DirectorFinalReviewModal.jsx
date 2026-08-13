import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import FormField from '../../../components/ui/FormField';
import Select from '../../../components/ui/Select';
import TextArea from '../../../components/ui/TextArea';
import AttachDocumentsField from '../../../components/complaints/AttachDocumentsField';

// Final sign-off once the Supervisor has approved the investigator's findings — forward to the
// Registry (department work complete) or send back to the Supervisor for more work. Escalating
// to the Executive Secretary is independent of that decision (a case can be forwarded/sent back
// AND flagged for ES attention at the same time), so it's a separate opt-in section here.
export default function DirectorFinalReviewModal({ open, onClose, onSubmit }) {
  const [action, setAction] = useState('');
  const [remark, setRemark] = useState('');
  const [escalate, setEscalate] = useState(false);
  const [escalateNote, setEscalateNote] = useState('');
  const [files, setFiles] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!action) return;
    onSubmit({ action, remark, escalate, escalateNote: escalate ? escalateNote : null, files });
    setAction('');
    setRemark('');
    setEscalate(false);
    setEscalateNote('');
    setFiles([]);
  };

  return (
    <Modal open={open} onClose={onClose} title="Final Review" width="480px">
      <form onSubmit={handleSubmit}>
        <FormField label="Decision" required>
          <Select value={action} onChange={(e) => setAction(e.target.value)} required>
            <option value="" disabled>-- Select Decision --</option>
            <option value="forward">Forward, department work complete</option>
            <option value="send_back">Send back to Supervisor</option>
          </Select>
        </FormField>

        <FormField label="Remarks" hint="Add a remark, if any.">
          <TextArea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Agreed, findings are thorough." />
        </FormField>

        <label className="checkbox-row">
          <input type="checkbox" checked={escalate} onChange={(e) => setEscalate(e.target.checked)} />
          Also escalate to the Executive Secretary
        </label>

        {escalate && (
          <FormField label="Note to Executive Secretary" required>
            <TextArea value={escalateNote} onChange={(e) => setEscalateNote(e.target.value)} placeholder="Flagging this for visibility because..." required />
          </FormField>
        )}

        <AttachDocumentsField files={files} onChange={setFiles} />

        <div className="modal-actions">
          <Button type="submit" variant="submit">Submit</Button>
        </div>
      </form>
    </Modal>
  );
}
