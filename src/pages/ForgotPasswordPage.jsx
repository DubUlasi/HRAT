import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import ShowcaseGrid from '../components/ShowcaseGrid';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import { useAuth } from '../context/AuthContext';
import { DEMO_OTP } from '../constants/demoAuth';
import '../styles/login.css';
import '../styles/modals.css';

// There's no real backend/SMS/email delivery in this mock app, so a real "we sent you a code,
// check your inbox" step would be a dead end nobody could ever actually complete. This keeps the
// same three-part shape a real reset flow has (identify the account, verify a one-time code,
// then set a new password) with a fixed demo code.

// A full page rather than a modal (was a modal, moved here) — a 4-step flow with its own
// validation at each step needs the same room Login/Signup/the complaint wizard already get as
// dedicated pages, rather than being squeezed into a modal a step at a time.
export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { findUserByEmail, resetPassword } = useAuth();
  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'reset' | 'success'
  const [email, setEmail] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    setTimeout(() => {
      const match = findUserByEmail(email);
      if (!match) {
        setError('No account found with that email address.');
        setSubmitting(false);
        return;
      }
      setOtpInput('');
      setStep('otp');
      setSubmitting(false);
    }, 400);
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (otpInput.trim() !== DEMO_OTP) {
      setError('That code is incorrect. Please try again.');
      return;
    }
    setStep('reset');
  };

  const handleResetSubmit = (e) => {
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
    reset: { title: 'Set A New Password', subtitle: `Choose a new password for ${email}.` },
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

              <button type="submit" className="btn-submit">Verify Code</button>
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

              <button type="submit" className="btn-submit">Reset Password</button>
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
