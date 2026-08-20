import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, KeyRound } from 'lucide-react';
import ShowcaseGrid from '../components/ShowcaseGrid';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import Modal from '../components/ui/Modal';
import { useTranslation } from '../context/I18nContext';
import { useAuth } from '../context/AuthContext';
import { mockUsers, ROLE_HOME } from '../data/mockUsers';
import '../styles/login.css';
import '../styles/modals.css';

const ROLE_LABELS = {
  'registry-head': 'Complaint Registry Head',
  'desk-officer': 'Complaint Registry Desk Officer',
  'department-director': 'Department Director',
  'department-supervisor': 'Department Supervisor',
  'department-investigator': 'Department Investigation Officer',
  'executive-secretary': 'Executive Secretary',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    setTimeout(() => {
      const user = login(email, password);
      if (user) {
        navigate(ROLE_HOME[user.role] || '/registry-head');
      } else {
        setError(t('login.errorInvalid'));
        setSubmitting(false);
      }
    }, 600);
  };

  const handleGoogleSignIn = () => {
    setGoogleSubmitting(true);
    setTimeout(() => {
      login('sampete@example.com', 'password123');
      navigate('/registry-head');
    }, 600);
  };

  return (
    <div className="login-container">
      {/* Left Showcase Panel */}
      <ShowcaseGrid />

      {/* Right Form Panel */}
      <div className="login-form-container">
        <div className="login-card">
          <div className="login-card-header">
            <div className="login-card-header-top">
              <img src="/hrat_nhrc_logo.png" alt="HRAT Logo" className="login-card-logo" />
              <LanguageSwitcher />
            </div>
            <h2>{t('login.title')}</h2>
            <p>{t('login.subtitle')}</p>
          </div>

          <button
            type="button"
            className="btn-google"
            onClick={handleGoogleSignIn}
            disabled={googleSubmitting}
          >
            <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {googleSubmitting ? t('login.googleAuthenticating') : t('login.googleSignIn')}
          </button>

          <div className="divider">{t('login.orDivider')}</div>

          {error && (
            <div className="form-error">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="loginEmail" className="form-label">{t('login.emailLabel')}</label>
              <input
                type="email"
                id="loginEmail"
                className="form-input"
                placeholder={t('login.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="loginPassword" className="form-label">{t('login.passwordLabel')}</label>
                <Link to="/forgot-password" className="forgot-password-link">Forgot password?</Link>
              </div>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="loginPassword"
                  className="form-input"
                  placeholder={t('login.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? t('login.signingIn') : t('login.signIn')}
            </button>
          </form>

          <button type="button" className="demo-credentials-link" onClick={() => setShowCredentials(true)}>
            <KeyRound size={13} /> View demo login credentials
          </button>

          <div className="login-card-footer">
            <p>
              {t('login.noAccount')}{' '}
              <Link to="/signup" className="signup-link">
                {t('login.signUpLink')}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Modal open={showCredentials} onClose={() => setShowCredentials(false)} title="Demo Accounts" width="440px">
        <p className="modal-description">One mock account per role, for testing only. This list will be removed before going live.</p>
        <ul className="demo-hint-list">
          {mockUsers.map((demoUser) => (
            <li key={demoUser.id}>
              <strong>{ROLE_LABELS[demoUser.role]}:</strong> {t('login.demoAccessLabel', { email: demoUser.email, password: demoUser.password })}
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}
