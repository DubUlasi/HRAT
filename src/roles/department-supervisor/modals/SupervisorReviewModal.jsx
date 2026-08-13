import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import FormField from '../../../components/ui/FormField';
import Select from '../../../components/ui/Select';
import TextArea from '../../../components/ui/TextArea';
import AttachDocumentsField from '../../../components/complaints/AttachDocumentsField';

// Reviews the investigator's submitted findings — approve (forwards to the Director) or send
// back to the investigator for more work, a real bounce-back loop.
export default function SupervisorReviewModal({ open, onClose, complaint, onSubmit }) {
  const [satisfied, setSatisfied] = useState('');
  const [remark, setRemark] = useState('');
  const [files, setFiles] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!satisfied) return;
    onSubmit({ satisfied: satisfied === 'yes', remark, files });
    setSatisfied('');
    setRemark('');
    setFiles([]);
  };

  return (
    <Modal open={open} onClose={onClose} title="Review Investigation Findings" width="480px">
      <form onSubmit={handleSubmit}>
        {complaint?.investigation.finding && (
          <div className="decision-summary">
            <div>
              <span className="label">Finding</span>
              <p className="value">{complaint.investigation.finding}</p>
            </div>
            {complaint.investigation.recommendation && (
              <div>
                <span className="label">Recommendation</span>
                <p className="value">{complaint.investigation.recommendation}</p>
              </div>
            )}
          </div>
        )}

        <FormField label="Are you satisfied with these findings?" required>
          <Select value={satisfied} onChange={(e) => setSatisfied(e.target.value)} required>
            <option value="" disabled>-- Select --</option>
            <option value="yes">Yes, forward to Director</option>
            <option value="no">No, send back to investigator</option>
          </Select>
        </FormField>

        <FormField label="Remarks" hint="Add a remark, if any.">
          <TextArea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Solid findings, agree with the recommendation." />
        </FormField>

        <AttachDocumentsField files={files} onChange={setFiles} />

        <div className="modal-actions">
          <Button type="submit" variant="submit">Submit</Button>
        </div>
      </form>
    </Modal>
  );
}
