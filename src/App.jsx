import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
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
import GlobalTooltip from './components/ui/GlobalTooltip';
import { AuthProvider } from './context/AuthContext';
import { ComplaintsProvider } from './context/ComplaintsContext';
import { CallsProvider } from './context/CallsContext';
import { I18nProvider } from './context/I18nContext';
import { UserManagementProvider } from './context/UserManagementContext';
import { RolePermissionsProvider, useRolePermissions } from './context/RolePermissionsContext';
import IctHeadDashboardPage from './roles/ict-head/IctHeadDashboardPage';
import IctHeadUserManagementPage from './roles/ict-head/IctHeadUserManagementPage';
import IctHeadUserProfilePage from './roles/ict-head/IctHeadUserProfilePage';
import IctHeadOnboardingPage from './roles/ict-head/IctHeadOnboardingPage';
import IctHeadDepartmentsPage from './roles/ict-head/IctHeadDepartmentsPage';
import IctPersonnelDashboardPage from './roles/ict-personnel/IctPersonnelDashboardPage';
import ComplainantDashboardPage from './roles/complainant/ComplainantDashboardPage';
import ComplainantSupportPage from './roles/complainant/ComplainantSupportPage';
import ComplainantRightsPage from './roles/complainant/ComplainantRightsPage';
import SuperAdminDashboardPage from './roles/super-admin/SuperAdminDashboardPage';
import SuperAdminPermissionsPage from './roles/super-admin/SuperAdminPermissionsPage';
import SuperAdminUsersPage from './roles/super-admin/SuperAdminUsersPage';
import SuperAdminRolesPage from './roles/super-admin/SuperAdminRolesPage';
import StateCoordinatorDashboardPage from './roles/state-coordinator/StateCoordinatorDashboardPage';
import StateCoordinatorIncomingPage from './roles/state-coordinator/StateCoordinatorIncomingPage';
import StateCoordinatorComplaintsPage from './roles/state-coordinator/StateCoordinatorComplaintsPage';
import StateCoordinatorComplaintDetailPage from './roles/state-coordinator/StateCoordinatorComplaintDetailPage';
import StateCoordinatorPersonnelPage from './roles/state-coordinator/StateCoordinatorPersonnelPage';
import StatePersonnelDashboardPage from './roles/state-personnel/StatePersonnelDashboardPage';
import StatePersonnelCasesPage from './roles/state-personnel/StatePersonnelCasesPage';
import StatePersonnelComplaintsPage from './roles/state-personnel/StatePersonnelComplaintsPage';
import StatePersonnelComplaintDetailPage from './roles/state-personnel/StatePersonnelComplaintDetailPage';
import RegistryHeadDashboardPage from './roles/complaint-registry-head/RegistryHeadDashboardPage';
import RegistryHeadComplaintsPage from './roles/complaint-registry-head/RegistryHeadComplaintsPage';
import RegistryHeadComplaintDetailPage from './roles/complaint-registry-head/RegistryHeadComplaintDetailPage';
import RegistryHeadRepeatOffendersPage from './roles/complaint-registry-head/RegistryHeadRepeatOffendersPage';
import RegistryHeadViolatorDetailPage from './roles/complaint-registry-head/RegistryHeadViolatorDetailPage';
import RegistryHeadCallCenterPage from './roles/complaint-registry-head/RegistryHeadCallCenterPage';
import RegistryHeadBusinessIntelligencePage from './roles/complaint-registry-head/RegistryHeadBusinessIntelligencePage';
import RegistryHeadReportsPage from './roles/complaint-registry-head/RegistryHeadReportsPage';
import RegistryHeadTrackPage from './roles/complaint-registry-head/RegistryHeadTrackPage';
import RegistryHeadFlaggedComplaintsPage from './roles/complaint-registry-head/RegistryHeadFlaggedComplaintsPage';
import RegistryHeadHelpPage from './roles/complaint-registry-head/RegistryHeadHelpPage';
import RegistryHeadSettingsPage from './roles/complaint-registry-head/RegistryHeadSettingsPage';
import { REPEAT_VIOLATOR_ROLES } from './roles/scopeComplaints';

// A child of RolePermissionsProvider (not App itself) so it can read rolesWithCapability() —
// the /ict-head/users, /onboarding, /departments routes are gated by whichever roles Super
// Admin has actually granted manage_users/manage_departments to, not a hardcoded array.
function AppRoutes() {
  const { rolesWithCapability } = useRolePermissions();
  const manageUsersRoles = rolesWithCapability('manage_users');
  const manageDepartmentsRoles = rolesWithCapability('manage_departments');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
        <Route path="/registry-head/repeat-offenders" element={<RequireRole role={REPEAT_VIOLATOR_ROLES}><RegistryHeadRepeatOffendersPage /></RequireRole>} />
        <Route path="/registry-head/repeat-offenders/:violatorId" element={<RequireRole role={REPEAT_VIOLATOR_ROLES}><RegistryHeadViolatorDetailPage /></RequireRole>} />
        <Route path="/registry-head/call-center" element={<RequireRole role="registry-head"><RegistryHeadCallCenterPage /></RequireRole>} />

        {/* Shared across every role's sidebar (Insights/Support sections) — any
            authenticated staff member can view these, not just the Registry Head. */}
        <Route path="/registry-head/track" element={<RegistryHeadTrackPage />} />
        <Route path="/registry-head/flagged" element={<RegistryHeadFlaggedComplaintsPage />} />
        <Route path="/registry-head/business-intelligence" element={<RegistryHeadBusinessIntelligencePage />} />
        <Route path="/registry-head/reports" element={<RegistryHeadReportsPage />} />
        <Route path="/registry-head/help" element={<RegistryHeadHelpPage />} />
        <Route path="/registry-head/settings" element={<RegistryHeadSettingsPage />} />

        {/* ICT Head: view-only complaint access (reuses the Registry Head complaint
            pages, action buttons gated off internally, see rolePermissions.js) plus new
            admin routes shared with ICT Personnel. */}
        <Route path="/ict-head" element={<RequireRole role="ict-head"><IctHeadDashboardPage /></RequireRole>} />
        <Route path="/ict-head/complaints" element={<RequireRole role={['registry-head', 'ict-head']}><RegistryHeadComplaintsPage /></RequireRole>} />
        <Route path="/ict-head/complaints/:complaintId" element={<RequireRole role={['registry-head', 'ict-head']}><RegistryHeadComplaintDetailPage /></RequireRole>} />
        <Route path="/ict-head/users" element={<RequireRole role={manageUsersRoles}><IctHeadUserManagementPage /></RequireRole>} />
        <Route path="/ict-head/users/:userId" element={<RequireRole role={manageUsersRoles}><IctHeadUserProfilePage /></RequireRole>} />
        <Route path="/ict-head/onboarding" element={<RequireRole role={manageUsersRoles}><IctHeadOnboardingPage /></RequireRole>} />
        <Route path="/ict-head/departments" element={<RequireRole role={manageDepartmentsRoles}><IctHeadDepartmentsPage /></RequireRole>} />

        {/* ICT Personnel: onboarding + user management + departments only, zero
            complaint access (no complaint routes list this role — see scopeComplaints.js). */}
        <Route path="/ict-personnel" element={<RequireRole role="ict-personnel"><IctPersonnelDashboardPage /></RequireRole>} />

        {/* Complainant Portal: demo-account only. Track Complaint and My Profile reuse
            the same shared /registry-head/track and /registry-head/settings routes every
            other role already uses — scopeComplaints.js restricts what a complainant
            sees there to their own case(s). */}
        <Route path="/complainant" element={<RequireRole role="complainant"><ComplainantDashboardPage /></RequireRole>} />
        <Route path="/complainant/support" element={<RequireRole role="complainant"><ComplainantSupportPage /></RequireRole>} />
        <Route path="/complainant/rights" element={<RequireRole role="complainant"><ComplainantRightsPage /></RequireRole>} />

        {/* Super Admin: governance only — permissions and a read-only view across every
            role's users, zero complaint access, doesn't touch day-to-day onboarding
            (that stays ICT Head/Personnel's job). */}
        <Route path="/super-admin" element={<RequireRole role="super-admin"><SuperAdminDashboardPage /></RequireRole>} />
        <Route path="/super-admin/permissions" element={<RequireRole role="super-admin"><SuperAdminPermissionsPage /></RequireRole>} />
        <Route path="/super-admin/users" element={<RequireRole role="super-admin"><SuperAdminUsersPage /></RequireRole>} />
        <Route path="/super-admin/roles" element={<RequireRole role="super-admin"><SuperAdminRolesPage /></RequireRole>} />

        {/* State Coordinator / State Personnel: the receiving side of the Registry Head's
            "Reassign To State Office" detour (see reassignToStateOffice/returnFromStateOffice in
            ComplaintsContext.jsx) — mirrors the Department Director/Supervisor/Investigator
            pattern, just scoped to an office instead of a department. */}
        <Route path="/state-coordinator" element={<RequireRole role="state-coordinator"><StateCoordinatorDashboardPage /></RequireRole>} />
        <Route path="/state-coordinator/incoming" element={<RequireRole role="state-coordinator"><StateCoordinatorIncomingPage /></RequireRole>} />
        <Route path="/state-coordinator/complaints" element={<RequireRole role="state-coordinator"><StateCoordinatorComplaintsPage /></RequireRole>} />
        <Route path="/state-coordinator/complaints/:complaintId" element={<RequireRole role="state-coordinator"><StateCoordinatorComplaintDetailPage /></RequireRole>} />
        <Route path="/state-coordinator/personnel" element={<RequireRole role="state-coordinator"><StateCoordinatorPersonnelPage /></RequireRole>} />

        <Route path="/state-personnel" element={<RequireRole role="state-personnel"><StatePersonnelDashboardPage /></RequireRole>} />
        <Route path="/state-personnel/cases" element={<RequireRole role="state-personnel"><StatePersonnelCasesPage /></RequireRole>} />
        <Route path="/state-personnel/complaints" element={<RequireRole role="state-personnel"><StatePersonnelComplaintsPage /></RequireRole>} />
        <Route path="/state-personnel/complaints/:complaintId" element={<RequireRole role="state-personnel"><StatePersonnelComplaintDetailPage /></RequireRole>} />
      </Routes>
    </BrowserRouter>
  );
}

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
            <UserManagementProvider>
              <RolePermissionsProvider>
                <GlobalTooltip />
                <AppRoutes />
              </RolePermissionsProvider>
            </UserManagementProvider>
          </CallsProvider>
        </ComplaintsProvider>
      </I18nProvider>
    </AuthProvider>
  );
}
