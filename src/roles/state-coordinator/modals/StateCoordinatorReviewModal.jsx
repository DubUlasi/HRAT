import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import FormField from '../../../components/ui/FormField';
import Select from '../../../components/ui/Select';
import TextArea from '../../../components/ui/TextArea';

// Reviews the state personnel officer's submitted findings — satisfied sends the complaint back
// to head office for real (returnFromStateOffice), not satisfied bounces it back to the same
// officer for more work. Mirrors SupervisorReviewModal.jsx exactly.
export default function StateCoordinatorReviewModal({ open, onClose, complaint, onSubmit }) {
  const [satisfied, setSatisfied] = useState('');
  const [remark, setRemark] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!satisfied) return;
    onSubmit({ satisfied: satisfied === 'yes', remark });
    setSatisfied('');
    setRemark('');
  };

  return (
    <Modal open={open} onClose={onClose} title="Review State Personnel Findings" width="480px">
      <form onSubmit={handleSubmit}>
        {complaint?.stateOffice?.findingSummary && (
          <div className="decision-summary">
            <div>
              <span className="label">Findings Summary</span>
              <p className="value">{complaint.stateOffice.findingSummary}</p>
            </div>
          </div>
        )}

        <FormField label="Are you satisfied with this work?" required>
          <Select value={satisfied} onChange={(e) => setSatisfied(e.target.value)} required>
            <option value="" disabled>-- Select --</option>
            <option value="yes">Yes, send back to head office</option>
            <option value="no">No, send back to the personnel officer</option>
          </Select>
        </FormField>

        <FormField label="Remarks" hint="Add a remark, if any.">
          <TextArea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Thorough review, ready to resume at head office." />
        </FormField>

        <div className="modal-actions">
          <Button type="submit" variant="submit">Submit</Button>
        </div>
      </form>
    </Modal>
  );
}
