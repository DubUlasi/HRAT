import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import FormField from '../../../components/ui/FormField';
import Select from '../../../components/ui/Select';
import TextArea from '../../../components/ui/TextArea';

export default function ConfirmAdmissibilityCheckModal({ open, onClose, complaint, onSubmit }) {
  const [agree, setAgree] = useState('yes');
  const [remark, setRemark] = useState('');

  if (!complaint) return null;
  const { admissibility } = complaint;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ agree: agree === 'yes', remark });
    setRemark('');
    setAgree('yes');
  };

  return (
    <Modal open={open} onClose={onClose} title="Confirm Admissibility Check" width="480px">
      <div className="decision-summary">
        <div>
          <div className="label">Remarks</div>
          <div className="value">{admissibility.officerRemark || '—'}</div>
        </div>
        <div>
          <div className="label">Decision</div>
          <div className="value">{admissibility.decision}</div>
        </div>
        <div>
          <div className="label">Decision Explanation</div>
          <div className="value">{admissibility.explanation}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <FormField label="Do you agree with the above decision?" required>
          <Select value={agree} onChange={(e) => setAgree(e.target.value)}>
            <option value="yes">Yes, I agree</option>
            <option value="no">No, I disagree</option>
          </Select>
        </FormField>

        <FormField label="Further Remarks" required>
          <TextArea value={remark} onChange={(e) => setRemark(e.target.value)} required />
        </FormField>

        <div className="modal-actions">
          <Button type="submit" variant="submit">Submit</Button>
        </div>
      </form>
    </Modal>
  );
}
