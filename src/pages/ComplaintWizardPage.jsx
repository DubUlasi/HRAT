import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import ComplainantComplaintWizard from '../components/complaints/complainant-wizard/ComplainantComplaintWizard';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import '../styles/signup.css';

// Filing now requires a real account (no anonymous drafts yet — the API has no guest-filing
// endpoint), so this public page's job changed from "phone-gate then file" to "confirm who's
// filing, then hand off to the real wizard." Not authenticated -> prompt sign in/up instead of
// gating on a phone number; authenticated -> straight into ComplainantComplaintWizard, no gate
// needed since the account is already known.
export default function ComplaintWizardPage() {
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <div className="wizard-page-header">
        <img src="/hrat_nhrc_logo.png" alt="HRAT Logo" className="wizard-page-header-logo" />
        <LanguageSwitcher />
      </div>

      {authLoading ? null : user ? (
        <ComplainantComplaintWizard onComplete={() => navigate('/complainant')} />
      ) : (
        <main className="su-main">
          <div className="su-content" style={{ textAlign: 'center' }}>
            <h1 className="su-title-dark">Sign in to file a complaint</h1>
            <p className="su-subtitle">You'll need an account so you can track your complaint's progress and be notified of updates.</p>
            <div className="su-step-nav" style={{ justifyContent: 'center', borderTop: 'none', gap: 12 }}>
              <Button variant="secondary" icon={LogIn} to="/login">Sign In</Button>
              <Button variant="primary" icon={UserPlus} to="/signup">Create Account</Button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
