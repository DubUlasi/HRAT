import React from 'react';
import { Users, UserPlus, Building2, UserCheck } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import HeroBanner from '../../components/dashboard/HeroBanner';
import QuickTrackerBlob from '../../components/dashboard/QuickTrackerBlob';
import QuickLinksGrid from '../../components/dashboard/QuickLinksGrid';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useUserManagement } from '../../context/UserManagementContext';
import { ROLE_LABELS_FOR_ADMIN } from '../../data/mockManagedUsers';
import { ictPersonnelNavItems, ictPersonnelUser } from './navConfig';

// ICT Personnel has no complaint access at all — this dashboard is admin stats only, computed
// from the same UserManagementContext data ICT Head's dashboard reads (one shared roster, not a
// separate mock dataset).
export default function IctPersonnelDashboardPage() {
  const { user } = useAuth();
  const { users, departments } = useUserManagement();
  const person = user || ictPersonnelUser;

  const activeCount = users.filter((u) => u.status === 'active').length;
  const pendingCount = users.filter((u) => u.status === 'pending').length;
  const inactiveCount = users.filter((u) => u.status === 'inactive').length;
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate))
    .slice(0, 6);

  const situationMessages = [
    {
      text: pendingCount > 0
        ? `${pendingCount} onboarded staff account${pendingCount === 1 ? '' : 's'} still pending activation.`
        : 'Every onboarded account is active, nothing pending right now.',
    },
    {
      text: `${users.length} staff account${users.length === 1 ? '' : 's'} across ${departments.length} department${departments.length === 1 ? '' : 's'}.`,
    },
  ];

  return (
    <AppShell navItems={ictPersonnelNavItems} user={person}>
      <PageHeader
        title="ICT Personnel Dashboard"
        subtitle={`Welcome back, ${person.name?.split(' ')[0]}. Here's the state of staffing and departments.`}
        actions={<Button variant="primary" icon={UserPlus} to="/ict-head/onboarding">Onboard Someone</Button>}
      />

      <HeroBanner
        greetingName={person.name?.split(' ')[0]}
        badge="ICT Personnel"
        situationMessages={situationMessages}
        rightSlot={<QuickTrackerBlob />}
        stats={[
          { icon: UserCheck, value: activeCount, label: 'Active Accounts' },
          { icon: UserPlus, value: pendingCount, label: 'Pending Onboarding' },
          { icon: Users, value: inactiveCount, label: 'Deactivated' },
          { icon: Building2, value: departments.length, label: 'Departments' },
        ]}
      />

      <QuickLinksGrid
        title="Quick Links"
        links={[
          { to: '/ict-head/users', icon: Users, accent: 'info', title: 'User Management', description: 'Search, activate, deactivate, or remove staff accounts.' },
          { to: '/ict-head/departments', icon: Building2, accent: 'violet', title: 'Departments', description: 'Create departments and assign staff into them.' },
        ]}
      />

      <div className="categories-card">
        <div className="section-header-flex">
          <h2>Recently Onboarded</h2>
          <Button variant="secondary" to="/ict-head/users">View All Users</Button>
        </div>
        {recentUsers.length === 0 ? (
          <EmptyState icon={Users} message="No staff accounts yet" />
        ) : (
          recentUsers.map((u) => (
            <div className="settings-detail-row" key={u.id}>
              <Avatar name={u.name} size={32} />
              <div style={{ flex: 1 }}>
                <span className="person-row-name">{u.name}</span>
                <span className="person-row-caption">{ROLE_LABELS_FOR_ADMIN[u.role] || u.role}</span>
              </div>
              <span className={`status-badge ${u.status === 'active' ? 'status-success' : u.status === 'pending' ? 'status-warning' : 'status-danger'}`}>
                {u.status}
              </span>
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}
