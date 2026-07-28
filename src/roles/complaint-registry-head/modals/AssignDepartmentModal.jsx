import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import FormField from '../../../components/ui/FormField';
import Select from '../../../components/ui/Select';
import TextArea from '../../../components/ui/TextArea';
import Input from '../../../components/ui/Input';
import { offices, departments } from '../../../data/mockOfficers';

// Two-step per the manual: pick the handling office, then pick the department + a remark.
export default function AssignDepartmentModal({ open, onClose, onSubmit }) {
  const [step, setStep] = useState(1);
  const [officeId, setOfficeId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [remark, setRemark] = useState('');

  const office = offices.find((o) => o.id === officeId);

  const resetAndClose = () => {
    setStep(1);
    setOfficeId('');
    setDepartmentId('');
    setRemark('');
    onClose();
  };

  const handleOfficeSubmit = (e) => {
    e.preventDefault();
    if (!officeId) return;
    setStep(2);
  };

  const handleDepartmentSubmit = (e) => {
    e.preventDefault();
    if (!departmentId) return;
    const department = departments.find((d) => d.id === departmentId);
    onSubmit({ officeId, officeName: office?.name, departmentId, departmentName: department?.name, remark });
    // Don't reset/close here — the parent flips `open` off once it moves to its confirm step,
    // same as AssignPersonModal. Closing here too would race the flow back to null instantly.
  };

  return (
    <Modal open={open} onClose={resetAndClose} title="Assign To Department" width="480px">
      {step === 1 && (
        <form onSubmit={handleOfficeSubmit}>
          <FormField label="Select the Handling Office" required>
            <Select value={officeId} onChange={(e) => setOfficeId(e.target.value)} required>
              <option value="" disabled>-- Select Office --</option>
              {offices.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </Select>
          </FormField>
          <div className="modal-actions">
            <Button type="submit" variant="submit">Submit</Button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleDepartmentSubmit}>
          <FormField label="Selected Handling Office">
            <Input value={office?.name || ''} disabled readOnly />
          </FormField>
          <FormField label="Select the Handling Department" required>
            <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required>
              <option value="" disabled>-- Select Department --</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Remarks" required>
            <TextArea value={remark} onChange={(e) => setRemark(e.target.value)} required />
          </FormField>
          <div className="modal-actions">
            <Button type="submit" variant="submit">Submit</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
