import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import FormField from '../../../components/ui/FormField';
import SearchableSelect from '../../../components/ui/SearchableSelect';
import TextArea from '../../../components/ui/TextArea';
import AttachDocumentsField from '../../../components/complaints/AttachDocumentsField';
import { offices, departments } from '../../../data/mockOfficers';

// Office + department + remark, all in one step — picking the office no longer needs its own
// separate screen since SearchableSelect makes both fields quick to fill either way.
export default function AssignDepartmentModal({ open, onClose, onSubmit }) {
  const [officeId, setOfficeId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [remark, setRemark] = useState('');
  const [files, setFiles] = useState([]);

  const resetAndClose = () => {
    setOfficeId('');
    setDepartmentId('');
    setRemark('');
    setFiles([]);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!officeId || !departmentId) return;
    const office = offices.find((o) => o.id === officeId);
    const department = departments.find((d) => d.id === departmentId);
    onSubmit({ officeId, officeName: office?.name, departmentId, departmentName: department?.name, remark, files });
    // Don't reset/close here — the parent flips `open` off once it moves to its confirm step,
    // same as AssignPersonModal. Closing here too would race the flow back to null instantly.
  };

  return (
    <Modal open={open} onClose={resetAndClose} title="Assign To Department" width="480px">
      <form onSubmit={handleSubmit}>
        <FormField label="Select the Handling Office" required>
          <SearchableSelect value={officeId} onChange={setOfficeId} options={offices} placeholder="Search offices…" />
        </FormField>
        <FormField label="Select the Handling Department" required>
          <SearchableSelect value={departmentId} onChange={setDepartmentId} options={departments} placeholder="Search departments…" />
        </FormField>
        <FormField label="Remarks" required>
          <TextArea value={remark} onChange={(e) => setRemark(e.target.value)} required />
        </FormField>
        <AttachDocumentsField files={files} onChange={setFiles} />
        <div className="modal-actions">
          <Button type="submit" variant="submit">Submit</Button>
        </div>
      </form>
    </Modal>
  );
}
