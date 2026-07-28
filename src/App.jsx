import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ComplaintWizardPage from './pages/ComplaintWizardPage';
import { ComplaintsProvider } from './context/ComplaintsContext';
import RegistryHeadDashboardPage from './roles/complaint-registry-head/RegistryHeadDashboardPage';
import RegistryHeadComplaintsPage from './roles/complaint-registry-head/RegistryHeadComplaintsPage';
import RegistryHeadComplaintDetailPage from './roles/complaint-registry-head/RegistryHeadComplaintDetailPage';
import RegistryHeadAnalyticsPage from './roles/complaint-registry-head/RegistryHeadAnalyticsPage';
import RegistryHeadTrackPage from './roles/complaint-registry-head/RegistryHeadTrackPage';
import RegistryHeadHelpPage from './roles/complaint-registry-head/RegistryHeadHelpPage';
import RegistryHeadSettingsPage from './roles/complaint-registry-head/RegistryHeadSettingsPage';

export default function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('hrat-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <ComplaintsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/complaint" element={<ComplaintWizardPage />} />

          <Route path="/registry-head" element={<RegistryHeadDashboardPage />} />
          <Route path="/registry-head/complaints" element={<RegistryHeadComplaintsPage />} />
          <Route path="/registry-head/complaints/new" element={<RegistryHeadComplaintsPage filter="new" />} />
          <Route path="/registry-head/complaints/treated" element={<RegistryHeadComplaintsPage filter="treated" />} />
          <Route path="/registry-head/complaints/:complaintId" element={<RegistryHeadComplaintDetailPage />} />
          <Route path="/registry-head/analytics" element={<RegistryHeadAnalyticsPage />} />
          <Route path="/registry-head/track" element={<RegistryHeadTrackPage />} />
          <Route path="/registry-head/help" element={<RegistryHeadHelpPage />} />
          <Route path="/registry-head/settings" element={<RegistryHeadSettingsPage />} />
        </Routes>
      </BrowserRouter>
    </ComplaintsProvider>
  );
}
