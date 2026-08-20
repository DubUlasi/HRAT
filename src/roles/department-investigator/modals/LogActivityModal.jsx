import React, { useState, useEffect } from 'react';
import { Paperclip } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import FormField from '../../../components/ui/FormField';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import TextArea from '../../../components/ui/TextArea';
import AttachDocumentsField from '../../../components/complaints/AttachDocumentsField';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

// Logs a discrete investigation activity (a call, a meeting, a note) — these get summarized in
// the activity timeline for everyone the case has passed through. `happenedOn` is when the call/
// meeting/note actually took place, kept separate from `loggedAt` (stamped by ComplaintsContext
// as whenever this form gets submitted) — an investigation officer writing this up a few days
// after the fact shouldn't have the case record silently claim it happened the day it was typed
// up. Passing `initialData` (an existing activity entry) switches the form into edit mode —
// prefilled fields, different title/button copy, same shape of payload on submit.
export default function LogActivityModal({ open, onClose, onSubmit, initialData }) {
  const isEdit = !!initialData;
  const alreadyAttached = initialData?.documents || [];
  const [type, setType] = useState('');
  const [withParty, setWithParty] = useState('');
  const [happenedOn, setHappenedOn] = useState(todayIso());
  const [summary, setSummary] = useState('');
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (!open) return;
    setType(initialData?.type || '');
    setWithParty(initialData?.withParty || '');
    setHappenedOn(initialData?.happenedOn || todayIso());
    setSummary(initialData?.summary || '');
    setFiles([]);
  }, [open, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!type || !withParty || !happenedOn || !summary) return;
    onSubmit({ type, withParty, happenedOn, summary, files });
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Activity' : 'Log Activity'} width="480px">
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

        <FormField label="Date It Happened" hint="Defaults to today — change it if you're logging this after the fact." required>
          <Input type="date" value={happenedOn} onChange={(e) => setHappenedOn(e.target.value)} max={todayIso()} required />
        </FormField>

        <FormField label="Summary" required>
          <TextArea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="What happened during this activity?" required />
        </FormField>

        {alreadyAttached.length > 0 && (
          <FormField label="Already Attached">
            <div className="activity-attachment-list">
              {alreadyAttached.map((doc) => (
                <a key={doc.id} href={doc.url} download={doc.name} target="_blank" rel="noreferrer" className="activity-attachment-row">
                  <Paperclip size={12} />
                  <span>{doc.name}</span>
                </a>
              ))}
            </div>
          </FormField>
        )}

        <AttachDocumentsField files={files} onChange={setFiles} label={isEdit ? 'Attach More Documents (optional)' : 'Attach Documents (optional)'} />

        <div className="modal-actions">
          <Button type="submit" variant="submit">{isEdit ? 'Save Changes' : 'Log Activity'}</Button>
        </div>
      </form>
    </Modal>
  );
}
