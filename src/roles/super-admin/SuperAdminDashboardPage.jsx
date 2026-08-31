import React from 'react';
import { Users, ShieldCheck, Layers, UserCheck } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import HeroBanner from '../../components/dashboard/HeroBanner';
import QuickLinksGrid from '../../components/dashboard/QuickLinksGrid';
import { useAuth } from '../../context/AuthContext';
import { useUserManagement } from '../../context/UserManagementContext';
import { useRolePermissions } from '../../context/RolePermissionsContext';
import { ROLE_LABELS_FOR_ADMIN } from '../../data/mockManagedUsers';
import { superAdminNavItems, superAdminUser } from './navConfig';

// Governance-only: no complaint access, no direct onboarding — just the permission table and a
// read-only window across every other role. Onboarding/user management stays ICT's job.
export default function SuperAdminDashboardPage() {
  const { user } = useAuth();
  const person = user || superAdminUser;
  const { users } = useUserManagement();
  const { capabilities, capabilityDefs } = useRolePermissions();

  const roleCount = Object.keys(ROLE_LABELS_FOR_ADMIN).length;
  const activeCount = users.filter((u) => u.status === 'active').length;
  const grantsCount = Object.values(capabilities).reduce((sum, list) => sum + list.length, 0);

  const situationMessages = [
    { text: `${users.length} staff account${users.length === 1 ? '' : 's'} on file across ${roleCount} role types.` },
    { text: `${grantsCount} capability grant${grantsCount === 1 ? '' : 's'} configured across ${capabilityDefs.length} capabilities.` },
    { text: 'Governance only — no complaint access, no direct user management from here.' },
  ];

  return (
    <AppShell navItems={superAdminNavItems} user={person}>
      <PageHeader
        title="Super Admin Dashboard"
        subtitle={`Welcome back, ${person.name?.split(' ')[0]}. Here's how access is configured across the system.`}
      />

      <HeroBanner
        greetingName={person.name?.split(' ')[0]}
        badge="Super Admin"
        situationMessages={situationMessages}
        stats={[
          { icon: UserCheck, value: activeCount, label: 'Active Accounts' },
          { icon: Users, value: users.length, label: 'Total Staff' },
          { icon: Layers, value: roleCount, label: 'Role Types' },
          { icon: ShieldCheck, value: grantsCount, label: 'Capability Grants' },
        ]}
      />

      <QuickLinksGrid
        title="Quick Links"
        links={[
          { to: '/super-admin/permissions', icon: ShieldCheck, accent: 'violet', title: 'Permissions', description: 'Decide which roles can manage the pipeline, users, and departments.' },
          { to: '/super-admin/users', icon: Users, accent: 'info', title: 'All Users', description: 'Read-only view of every staff account across every role.' },
          { to: '/super-admin/roles', icon: Layers, accent: 'accent', title: 'Roles', description: 'What each role is, and what it currently has access to.' },
        ]}
      />
    </AppShell>
  );
}
