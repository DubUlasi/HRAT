import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import Input from '../ui/Input';
import { DEMO_OTP } from '../../constants/demoAuth';

// Email-based 2FA (not an authenticator app) — mirrors ForgotPasswordPage's OTP step (same fixed
// demo code, since there's no real email delivery in this mock app to send one through).
export default function TwoFactorSetupModal({ open, onClose, onEnable, email }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleClose = () => {
    setCode('');
    setError('');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (code.trim() !== DEMO_OTP) {
      setError('That code is incorrect. Please try again.');
      return;
    }
    onEnable();
    setCode('');
  };

  return (
    <Modal open={open} onClose={handleClose} title="Enable Two-Factor Authentication" width="420px">
      <form onSubmit={handleSubmit}>
        <p className="modal-description">
          We'll email a 6-digit code to {email} each time you sign in. Enter the code below to confirm setup and turn on two-factor authentication.
        </p>

        {error && (
          <div className="form-error">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <FormField label="Verification Code" required>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            autoFocus
            required
          />
        </FormField>

        <div className="modal-actions">
          <Button type="submit" variant="submit">Verify &amp; Enable</Button>
        </div>
      </form>
    </Modal>
  );
}
