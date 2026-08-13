import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import FormField from '../../../components/ui/FormField';
import Select from '../../../components/ui/Select';
import TextArea from '../../../components/ui/TextArea';
import AttachDocumentsField from '../../../components/complaints/AttachDocumentsField';
import { suggestDepartmentFromText } from '../../../constants/departmentKeywords';
import { CATEGORY_LABELS } from '../../../constants/complaintCategories';
import { departments } from '../../../data/mockOfficers';

// Accept/reject a complaint newly routed to this department. Rejecting shows a lightweight
// keyword-based department suggestion (same pattern as the existing category suggester) so the
// Director can point the Registry Head somewhere useful in their remark.
export default function DepartmentReviewModal({ open, onClose, complaint, onSubmit }) {
  const [accepted, setAccepted] = useState('');
  const [remark, setRemark] = useState('');
  const [files, setFiles] = useState([]);

  const suggestedDeptId = complaint ? suggestDepartmentFromText(complaint.description) : null;
  const suggestedDeptName = suggestedDeptId ? departments.find((d) => d.id === suggestedDeptId)?.name : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!accepted) return;
    onSubmit({ accepted: accepted === 'yes', remark, files });
    setAccepted('');
    setRemark('');
    setFiles([]);
  };

  return (
    <Modal open={open} onClose={onClose} title="Review Department Assignment" width="480px">
      <form onSubmit={handleSubmit}>
        <p className="modal-description">
          {complaint?.subject}, currently filed under {complaint ? CATEGORY_LABELS[complaint.category] : ''}. Is this the right department?
        </p>

        <FormField label="Is this complaint for your department?" required>
          <Select value={accepted} onChange={(e) => setAccepted(e.target.value)} required>
            <option value="" disabled>-- Select --</option>
            <option value="yes">Yes, accept it</option>
            <option value="no">No, wrong department</option>
          </Select>
        </FormField>

        {accepted === 'no' && suggestedDeptName && (
          <p className="ai-suggestion-chip">
            <Sparkles size={13} /> Based on the description, this might belong in <strong>{suggestedDeptName}</strong> instead.
          </p>
        )}

        <FormField label="Remarks" hint="Explain why, especially if rejecting, this goes back to the Registry Head.">
          <TextArea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="This looks like it belongs to a different department." />
        </FormField>

        <AttachDocumentsField files={files} onChange={setFiles} />

        <div className="modal-actions">
          <Button type="submit" variant="submit">Submit</Button>
        </div>
      </form>
    </Modal>
  );
}
