import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmActionModal({
  open,
  title = 'Do you want to proceed?',
  description,
  onCancel,
  onConfirm,
  confirmLabel = 'Yes, proceed!',
  cancelLabel = 'No, cancel!',
}) {
  return (
    <Modal open={open} onClose={onCancel} hideClose width="420px">
      <div className="confirm-modal">
        <div className="confirm-modal-icon">
          <AlertTriangle size={28} />
        </div>
        <h3>{title}</h3>
        {description && <p>{description}</p>}
        <div className="confirm-modal-actions">
          <Button variant="secondary" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant="primary" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}
