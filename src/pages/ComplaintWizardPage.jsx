import React from 'react';
import { useNavigate } from 'react-router-dom';
import ComplaintWizardForm from '../components/complaints/ComplaintWizardForm';

export default function ComplaintWizardPage() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <ComplaintWizardForm onComplete={() => navigate('/')} />
    </div>
  );
}
