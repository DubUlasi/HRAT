import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import Input from '../ui/Input';

// `onChangePassword` is AuthContext's changePassword(current, next) — returns { ok, error }
// synchronously (no real backend round-trip), so validation/error display all happens inline
// here rather than via a separate confirm step.
export default function ChangePasswordModal({ open, onClose, onChangePassword, onSuccess }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const reset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation don\'t match.');
      return;
    }
    const result = onChangePassword(currentPassword, newPassword);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    reset();
    onSuccess();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Change Password" width="420px">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="form-error">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <FormField label="Current Password" required>
          <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" required />
        </FormField>

        <FormField label="New Password" required hint="At least 6 characters.">
          <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" required />
        </FormField>

        <FormField label="Confirm New Password" required>
          <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required />
        </FormField>

        <div className="modal-actions">
          <Button type="submit" variant="submit">Change Password</Button>
        </div>
      </form>
    </Modal>
  );
}
