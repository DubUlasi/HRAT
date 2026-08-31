import React from 'react';
import { FileText, Building2, ShieldCheck, UserRound } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { useRolePermissions } from '../../context/RolePermissionsContext';
import { ROLE_LABELS_FOR_ADMIN } from '../../data/mockManagedUsers';
import { ROLE_HOME } from '../../data/mockUsers';
import { superAdminNavItems, superAdminUser } from './navConfig';

// Groups the 11 hardcoded roles into 4 real categories, each with its own icon/accent — turns a
// flat list of similar-looking cards into something scannable at a glance. Purely a display
// grouping (the roles themselves are still hardcoded elsewhere in the app, see roleNavMap.js).
const CATEGORIES = [
  {
    label: 'Complaint Pipeline',
    icon: FileText,
    accent: 'info',
    roles: ['registry-head', 'desk-officer', 'department-director', 'department-supervisor', 'department-investigator', 'executive-secretary', 'state-coordinator', 'state-personnel'],
  },
  {
    label: 'Administration',
    icon: Building2,
    accent: 'violet',
    roles: ['ict-head', 'ict-personnel'],
  },
  {
    label: 'Governance',
    icon: ShieldCheck,
    accent: 'accent',
    roles: ['super-admin'],
  },
  {
    label: 'Citizen-Facing',
    icon: UserRound,
    accent: 'warning',
    roles: ['complainant'],
  },
];

// Read-only reference — what each role is, and what it currently has access to (live from
// RolePermissionsContext, not a static description that could drift out of sync).
export default function SuperAdminRolesPage() {
  const { user } = useAuth();
  const person = user || superAdminUser;
  const { capabilityDefs, hasCapability } = useRolePermissions();

  return (
    <AppShell navItems={superAdminNavItems} user={person}>
      <PageHeader title="Roles" subtitle="Every role in the system, grouped by kind, and what it currently has access to." />

      {CATEGORIES.map((category) => (
        <div className="roles-category-section" key={category.label}>
          <h2 className="quick-links-title">{category.label}</h2>
          <div className="complaints-card-grid">
            {category.roles.map((role) => {
              const granted = capabilityDefs.filter((cap) => hasCapability(role, cap.id));
              return (
                <div key={role} className="categories-card role-ref-card">
                  <div className="role-ref-header">
                    <div className={`role-ref-icon accent-${category.accent}`}>
                      <category.icon size={19} />
                    </div>
                    <div>
                      <h3 className="role-ref-name">{ROLE_LABELS_FOR_ADMIN[role]}</h3>
                      <span className="role-ref-home">{ROLE_HOME[role] || '—'}</span>
                    </div>
                  </div>

                  {granted.length === 0 ? (
                    <p className="role-ref-empty">No elevated capabilities</p>
                  ) : (
                    <div className="role-ref-badges">
                      {granted.map((cap) => (
                        <span key={cap.id} className={`category-pill pill-${category.accent}`} title={cap.description}>
                          {cap.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </AppShell>
  );
}
