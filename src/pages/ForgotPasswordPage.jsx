import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import ShowcaseGrid from '../components/ShowcaseGrid';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import { useAuth } from '../context/AuthContext';
import { DEMO_OTP } from '../constants/demoAuth';
import { requestPasswordReset, verifyPasswordResetCode, completePasswordReset } from '../api/authApi';
import '../styles/login.css';
import '../styles/modals.css';

// Real password reset now exists (POST /auth/password-reset/request|verify|complete) — but it's
// keyed by email address alone, and its "request a code" step deliberately returns the same
// response whether or not the email is real (anti-enumeration), so there's no server signal to
// branch on up front. Instead, the split happens locally: if the email matches a MOCK roster
// account, keep the entirely-local demo flow (10 roles have no real backend at all); otherwise
// assume it's a real account and drive the actual 3-endpoint API flow. Same dual-path shape
// used throughout (AuthContext's login(), RegistryHeadTrackPage's role branch, etc.).
const REAL_PASSWORD_HINT = 'At least 12 characters, with uppercase, lowercase, a number, and a special character.';
const REAL_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { findUserByEmail, resetPassword } = useAuth();
  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'reset' | 'success'
  const [usingRealFlow, setUsingRealFlow] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [email, setEmail] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const mockMatch = findUserByEmail(email);
    if (mockMatch) {
      setUsingRealFlow(false);
      setOtpInput('');
      setStep('otp');
      setSubmitting(false);
      return;
    }

    try {
      await requestPasswordReset(email);
      setUsingRealFlow(true);
      setOtpInput('');
      setStep('otp');
    } catch (err) {
      setError(err.problem?.detail || err.message);
    }
    setSubmitting(false);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!usingRealFlow) {
      if (otpInput.trim() !== DEMO_OTP) {
        setError('That code is incorrect. Please try again.');
        return;
      }
      setStep('reset');
      return;
    }

    setSubmitting(true);
    try {
      const result = await verifyPasswordResetCode(email, otpInput.trim());
      setResetToken(result.resetToken);
      setStep('reset');
    } catch (err) {
      setError(err.problem?.detail || err.message);
    }
    setSubmitting(false);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (usingRealFlow) {
      if (!REAL_PASSWORD_REGEX.test(newPassword)) {
        setError(REAL_PASSWORD_HINT);
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New password and confirmation don\'t match.');
        return;
      }
      setSubmitting(true);
      try {
        await completePasswordReset(resetToken, newPassword, confirmPassword);
        setStep('success');
      } catch (err) {
        setError(err.problem?.detail || err.message);
      }
      setSubmitting(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation don\'t match.');
      return;
    }
    const result = resetPassword(email, newPassword);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setStep('success');
  };

  const headerCopy = {
    email: { title: 'Forgot Password?', subtitle: 'Enter the email address on your account and we\'ll send you a verification code.' },
    otp: { title: 'Enter Verification Code', subtitle: `We sent a 6-digit code for ${email}.` },
    reset: { title: 'Set A New Password', subtitle: usingRealFlow ? REAL_PASSWORD_HINT : `Choose a new password for ${email}.` },
    success: { title: 'Password Reset', subtitle: 'You can now sign in with your new password.' },
  }[step];

  return (
    <div className="login-container">
      <ShowcaseGrid />

      <div className="login-form-container">
        <div className="login-card">
          <div className="login-card-header">
            <div className="login-card-header-top">
              <img src="/hrat_nhrc_logo.png" alt="HRAT Logo" className="login-card-logo" />
              <LanguageSwitcher />
            </div>
            <h2>{headerCopy.title}</h2>
            <p>{headerCopy.subtitle}</p>
          </div>

          {error && step !== 'success' && (
            <div className="form-error">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={handleEmailSubmit}>
              <div className="form-group">
                <label htmlFor="resetEmail" className="form-label">Email</label>
                <input
                  type="email"
                  id="resetEmail"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send Code'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit}>
              <div className="form-group">
                <label htmlFor="resetOtp" className="form-label">Verification Code</label>
                <input
                  type="text"
                  id="resetOtp"
                  className="form-input"
                  placeholder="000000"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>

              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetSubmit}>
              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">New Password</label>
                <div className="password-wrapper">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="newPassword"
                    className="form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    autoFocus
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowNewPassword((v) => !v)} aria-label="Toggle password visibility">
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmNewPassword" className="form-label">Confirm New Password</label>
                <div className="password-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmNewPassword"
                    className="form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword((v) => !v)} aria-label="Toggle password visibility">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="confirm-modal">
              <div className="confirm-modal-icon success">
                <CheckCircle2 size={28} />
              </div>
              <button type="button" className="btn-submit" onClick={() => navigate('/login')}>Back to Login</button>
            </div>
          )}

          {step !== 'success' && (
            <div className="login-card-footer">
              <p>
                Remembered your password?{' '}
                <Link to="/login" className="signup-link">Sign In</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
