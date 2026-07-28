import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export default function SuccessModal({ open, message, onClose, okLabel = 'OK' }) {
  return (
    <Modal open={open} onClose={onClose} hideClose width="420px">
      <div className="confirm-modal">
        <div className="confirm-modal-icon success">
          <CheckCircle2 size={28} />
        </div>
        <h3>Success</h3>
        {message && <p>{message}</p>}
        <div className="confirm-modal-actions center">
          <Button variant="primary" onClick={onClose}>{okLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}
