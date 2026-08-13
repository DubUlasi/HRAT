import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export default function SuccessModal({ open, title, message, onClose, okLabel = 'OK', variant = 'success' }) {
  const isError = variant === 'error';
  return (
    <Modal open={open} onClose={onClose} hideClose width="420px">
      <div className="confirm-modal">
        <div className={`confirm-modal-icon ${isError ? 'error' : 'success'}`}>
          {isError ? <XCircle size={28} /> : <CheckCircle2 size={28} />}
        </div>
        <h3>{title || (isError ? 'Something Went Wrong' : 'Success')}</h3>
        {message && <p>{message}</p>}
        <div className="confirm-modal-actions center">
          <Button variant="primary" onClick={onClose}>{okLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}
