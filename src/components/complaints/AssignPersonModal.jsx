import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import SearchableSelect from '../ui/SearchableSelect';
import TextArea from '../ui/TextArea';
import AttachDocumentsField from './AttachDocumentsField';

/**
 * Generic "select a person + add a remark" modal, reused for every assignment step in the
 * pipeline (assign registry officer for numbering, assign registry officer for admissibility,
 * assign supervisor, assign investigator, ...).
 */
export default function AssignPersonModal({ open, onClose, title, description, personLabel = 'Officer', people, onSubmit }) {
  const [personId, setPersonId] = useState('');
  const [remark, setRemark] = useState('');
  const [files, setFiles] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!personId) return;
    const person = people.find((p) => p.id === personId);
    onSubmit({ personId, personName: person?.name, remark, files });
    setPersonId('');
    setRemark('');
    setFiles([]);
  };

  return (
    <Modal open={open} onClose={onClose} title={title} width="480px">
      <form onSubmit={handleSubmit}>
        {description && <p className="modal-description">{description}</p>}

        <FormField label={personLabel} required>
          <SearchableSelect
            value={personId}
            onChange={setPersonId}
            options={people}
            placeholder={`Search ${personLabel.toLowerCase()}s…`}
          />
        </FormField>

        <FormField label="Remarks" hint="Add a remark, if any.">
          <TextArea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Look into this." />
        </FormField>

        <AttachDocumentsField files={files} onChange={setFiles} />

        <div className="modal-actions">
          <Button type="submit" variant="submit">Submit</Button>
        </div>
      </form>
    </Modal>
  );
}
