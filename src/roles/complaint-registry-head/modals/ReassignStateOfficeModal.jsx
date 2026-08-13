import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import FormField from '../../../components/ui/FormField';
import Select from '../../../components/ui/Select';
import TextArea from '../../../components/ui/TextArea';
import AttachDocumentsField from '../../../components/complaints/AttachDocumentsField';
import { offices } from '../../../data/mockOfficers';

const STATE_OFFICES = offices.filter((o) => o.id !== 'hq');

// The single-tier State Office detour — a State Coordinator assigns one State Personnel who
// handles the full local review themselves, then it returns here and the normal head-office
// flow resumes (see reassignToStateOffice/returnFromStateOffice in ComplaintsContext).
export default function ReassignStateOfficeModal({ open, onClose, onSubmit }) {
  const [officeId, setOfficeId] = useState('');
  const [remark, setRemark] = useState('');
  const [files, setFiles] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!officeId) return;
    onSubmit({ officeId, remark, files });
    setOfficeId('');
    setRemark('');
    setFiles([]);
  };

  return (
    <Modal open={open} onClose={onClose} title="Reassign To State Office" width="480px">
      <form onSubmit={handleSubmit}>
        <p className="modal-description">
          The state office's coordinator will assign someone to handle it locally, then send it back here once done.
        </p>

        <FormField label="State Office" required>
          <Select value={officeId} onChange={(e) => setOfficeId(e.target.value)} required>
            <option value="" disabled>-- Select State Office --</option>
            {STATE_OFFICES.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </Select>
        </FormField>

        <FormField label="Remarks" hint="Add a remark, if any.">
          <TextArea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Closer to the state where the incident occurred." />
        </FormField>

        <AttachDocumentsField files={files} onChange={setFiles} />

        <div className="modal-actions">
          <Button type="submit" variant="submit">Reassign</Button>
        </div>
      </form>
    </Modal>
  );
}
