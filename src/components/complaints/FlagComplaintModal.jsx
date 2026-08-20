import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import TextArea from '../ui/TextArea';

// Flag a complaint for attention, or clear an existing flag — reused across every role's detail
// page. `flagged` is the complaint's CURRENT state (what onSubmit is about to flip).
export default function FlagComplaintModal({ open, onClose, flagged, onSubmit }) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ flagged: !flagged, reason });
    setReason('');
  };

  return (
    <Modal open={open} onClose={onClose} title={flagged ? 'Remove Flag' : 'Flag This Complaint'} width="440px">
      <form onSubmit={handleSubmit}>
        {flagged ? (
          <p className="modal-description">This removes the flag from this complaint.</p>
        ) : (
          <FormField label="Reason" hint="Why does this need attention? (optional)">
            <TextArea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Sensitive case, needs senior review."
            />
          </FormField>
        )}
        <div className="modal-actions">
          <Button type="submit" variant="submit">{flagged ? 'Remove Flag' : 'Flag Complaint'}</Button>
        </div>
      </form>
    </Modal>
  );
}
