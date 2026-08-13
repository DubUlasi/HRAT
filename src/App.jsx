import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ComplaintWizardPage from './pages/ComplaintWizardPage';
import DeskOfficerDashboardPage from './roles/complaint-registry-desk-officer/DeskOfficerDashboardPage';
import DeskOfficerQueuePage from './roles/complaint-registry-desk-officer/DeskOfficerQueuePage';
import DeskOfficerComplaintsPage from './roles/complaint-registry-desk-officer/DeskOfficerComplaintsPage';
import DeskOfficerComplaintDetailPage from './roles/complaint-registry-desk-officer/DeskOfficerComplaintDetailPage';
import DepartmentDirectorDashboardPage from './roles/department-director/DepartmentDirectorDashboardPage';
import DirectorNewAssignmentsPage from './roles/department-director/DirectorNewAssignmentsPage';
import DirectorFinalReviewsPage from './roles/department-director/DirectorFinalReviewsPage';
import DirectorComplaintsPage from './roles/department-director/DirectorComplaintsPage';
import DirectorComplaintDetailPage from './roles/department-director/DirectorComplaintDetailPage';
import SupervisorDashboardPage from './roles/department-supervisor/SupervisorDashboardPage';
import SupervisorToAssignPage from './roles/department-supervisor/SupervisorToAssignPage';
import SupervisorReviewPage from './roles/department-supervisor/SupervisorReviewPage';
import SupervisorComplaintsPage from './roles/department-supervisor/SupervisorComplaintsPage';
import SupervisorComplaintDetailPage from './roles/department-supervisor/SupervisorComplaintDetailPage';
import InvestigatorDashboardPage from './roles/department-investigator/InvestigatorDashboardPage';
import InvestigatorCasesPage from './roles/department-investigator/InvestigatorCasesPage';
import InvestigatorComplaintsPage from './roles/department-investigator/InvestigatorComplaintsPage';
import InvestigatorComplaintDetailPage from './roles/department-investigator/InvestigatorComplaintDetailPage';
import ESDashboardPage from './roles/executive-secretary/ESDashboardPage';
import ESCouncilPage from './roles/executive-secretary/ESCouncilPage';
import ESEscalatedPage from './roles/executive-secretary/ESEscalatedPage';
import ESComplaintsPage from './roles/executive-secretary/ESComplaintsPage';
import ESComplaintDetailPage from './roles/executive-secretary/ESComplaintDetailPage';
import RequireRole from './components/auth/RequireRole';
import { AuthProvider } from './context/AuthContext';
import { ComplaintsProvider } from './context/ComplaintsContext';
import { CallsProvider } from './context/CallsContext';
import { I18nProvider } from './context/I18nContext';
import RegistryHeadDashboardPage from './roles/complaint-registry-head/RegistryHeadDashboardPage';
import RegistryHeadComplaintsPage from './roles/complaint-registry-head/RegistryHeadComplaintsPage';
import RegistryHeadComplaintDetailPage from './roles/complaint-registry-head/RegistryHeadComplaintDetailPage';
import RegistryHeadRepeatOffendersPage from './roles/complaint-registry-head/RegistryHeadRepeatOffendersPage';
import RegistryHeadViolatorDetailPage from './roles/complaint-registry-head/RegistryHeadViolatorDetailPage';
import RegistryHeadCallCenterPage from './roles/complaint-registry-head/RegistryHeadCallCenterPage';
import RegistryHeadBusinessIntelligencePage from './roles/complaint-registry-head/RegistryHeadBusinessIntelligencePage';
import RegistryHeadReportsPage from './roles/complaint-registry-head/RegistryHeadReportsPage';
import RegistryHeadTrackPage from './roles/complaint-registry-head/RegistryHeadTrackPage';
import RegistryHeadHelpPage from './roles/complaint-registry-head/RegistryHeadHelpPage';
import RegistryHeadSettingsPage from './roles/complaint-registry-head/RegistryHeadSettingsPage';

export default function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('hrat-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <AuthProvider>
      <I18nProvider>
        <ComplaintsProvider>
          <CallsProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/complaint" element={<ComplaintWizardPage />} />

                <Route path="/desk-officer" element={<RequireRole role="desk-officer"><DeskOfficerDashboardPage /></RequireRole>} />
                <Route path="/desk-officer/queue" element={<RequireRole role="desk-officer"><DeskOfficerQueuePage /></RequireRole>} />
                <Route path="/desk-officer/complaints" element={<RequireRole role="desk-officer"><DeskOfficerComplaintsPage /></RequireRole>} />
                <Route path="/desk-officer/complaints/:complaintId" element={<RequireRole role="desk-officer"><DeskOfficerComplaintDetailPage /></RequireRole>} />
                <Route path="/department-director" element={<RequireRole role="department-director"><DepartmentDirectorDashboardPage /></RequireRole>} />
                <Route path="/department-director/new" element={<RequireRole role="department-director"><DirectorNewAssignmentsPage /></RequireRole>} />
                <Route path="/department-director/final-review" element={<RequireRole role="department-director"><DirectorFinalReviewsPage /></RequireRole>} />
                <Route path="/department-director/complaints" element={<RequireRole role="department-director"><DirectorComplaintsPage /></RequireRole>} />
                <Route path="/department-director/complaints/:complaintId" element={<RequireRole role="department-director"><DirectorComplaintDetailPage /></RequireRole>} />
                <Route path="/department-supervisor" element={<RequireRole role="department-supervisor"><SupervisorDashboardPage /></RequireRole>} />
                <Route path="/department-supervisor/to-assign" element={<RequireRole role="department-supervisor"><SupervisorToAssignPage /></RequireRole>} />
                <Route path="/department-supervisor/review" element={<RequireRole role="department-supervisor"><SupervisorReviewPage /></RequireRole>} />
                <Route path="/department-supervisor/complaints" element={<RequireRole role="department-supervisor"><SupervisorComplaintsPage /></RequireRole>} />
                <Route path="/department-supervisor/complaints/:complaintId" element={<RequireRole role="department-supervisor"><SupervisorComplaintDetailPage /></RequireRole>} />
                <Route path="/department-investigator" element={<RequireRole role="department-investigator"><InvestigatorDashboardPage /></RequireRole>} />
                <Route path="/department-investigator/cases" element={<RequireRole role="department-investigator"><InvestigatorCasesPage /></RequireRole>} />
                <Route path="/department-investigator/complaints" element={<RequireRole role="department-investigator"><InvestigatorComplaintsPage /></RequireRole>} />
                <Route path="/department-investigator/complaints/:complaintId" element={<RequireRole role="department-investigator"><InvestigatorComplaintDetailPage /></RequireRole>} />
                <Route path="/executive-secretary" element={<RequireRole role="executive-secretary"><ESDashboardPage /></RequireRole>} />
                <Route path="/executive-secretary/council" element={<RequireRole role="executive-secretary"><ESCouncilPage /></RequireRole>} />
                <Route path="/executive-secretary/escalated" element={<RequireRole role="executive-secretary"><ESEscalatedPage /></RequireRole>} />
                <Route path="/executive-secretary/complaints" element={<RequireRole role="executive-secretary"><ESComplaintsPage /></RequireRole>} />
                <Route path="/executive-secretary/complaints/:complaintId" element={<RequireRole role="executive-secretary"><ESComplaintDetailPage /></RequireRole>} />

                <Route path="/registry-head" element={<RequireRole role="registry-head"><RegistryHeadDashboardPage /></RequireRole>} />
                <Route path="/registry-head/complaints" element={<RequireRole role="registry-head"><RegistryHeadComplaintsPage /></RequireRole>} />
                <Route path="/registry-head/complaints/new" element={<RequireRole role="registry-head"><RegistryHeadComplaintsPage filter="new" /></RequireRole>} />
                <Route path="/registry-head/complaints/treated" element={<RequireRole role="registry-head"><RegistryHeadComplaintsPage filter="treated" /></RequireRole>} />
                <Route path="/registry-head/complaints/needs-action" element={<RequireRole role="registry-head"><RegistryHeadComplaintsPage filter="needs-action" /></RequireRole>} />
                <Route path="/registry-head/complaints/:complaintId" element={<RequireRole role="registry-head"><RegistryHeadComplaintDetailPage /></RequireRole>} />
                {/* Repeat Violators: Registry Head, Department Director, and the Executive
                    Secretary get the full list/detail pages. Supervisor/Investigator/Desk
                    Officer only ever see the repeat-violator flag inline on a complaint's own
                    detail page, no dedicated page of their own. */}
                <Route path="/registry-head/repeat-offenders" element={<RequireRole role={['registry-head', 'department-director', 'executive-secretary']}><RegistryHeadRepeatOffendersPage /></RequireRole>} />
                <Route path="/registry-head/repeat-offenders/:violatorId" element={<RequireRole role={['registry-head', 'department-director', 'executive-secretary']}><RegistryHeadViolatorDetailPage /></RequireRole>} />
                <Route path="/registry-head/call-center" element={<RequireRole role="registry-head"><RegistryHeadCallCenterPage /></RequireRole>} />

                {/* Shared across every role's sidebar (Insights/Support sections) — any
                    authenticated staff member can view these, not just the Registry Head. */}
                <Route path="/registry-head/track" element={<RegistryHeadTrackPage />} />
                <Route path="/registry-head/business-intelligence" element={<RegistryHeadBusinessIntelligencePage />} />
                <Route path="/registry-head/reports" element={<RegistryHeadReportsPage />} />
                <Route path="/registry-head/help" element={<RegistryHeadHelpPage />} />
                <Route path="/registry-head/settings" element={<RegistryHeadSettingsPage />} />
              </Routes>
            </BrowserRouter>
          </CallsProvider>
        </ComplaintsProvider>
      </I18nProvider>
    </AuthProvider>
  );
}
