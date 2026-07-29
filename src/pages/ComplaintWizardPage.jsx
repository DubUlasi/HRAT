import React from 'react';
import { useNavigate } from 'react-router-dom';
import ComplaintWizardForm from '../components/complaints/ComplaintWizardForm';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import '../styles/signup.css';

export default function ComplaintWizardPage() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <div className="wizard-page-header">
        <img src="/hrat_nhrc_logo.png" alt="HRAT Logo" className="wizard-page-header-logo" />
        <LanguageSwitcher />
      </div>
      <ComplaintWizardForm onComplete={() => navigate('/')} />
    </div>
  );
}
