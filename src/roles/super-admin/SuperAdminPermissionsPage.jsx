import React from 'react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { useRolePermissions } from '../../context/RolePermissionsContext';
import { ROLE_LABELS_FOR_ADMIN } from '../../data/mockManagedUsers';
import { superAdminNavItems, superAdminUser } from './navConfig';

export default function SuperAdminPermissionsPage() {
  const { user } = useAuth();
  const person = user || superAdminUser;
  const { capabilityDefs, hasCapability, toggleCapability } = useRolePermissions();
  const roles = Object.keys(ROLE_LABELS_FOR_ADMIN);

  return (
    <AppShell navItems={superAdminNavItems} user={person}>
      <PageHeader
        title="Permissions"
        subtitle="Decide which roles can manage the complaint pipeline, users, and departments."
      />

      <div className="categories-card">
        <div className="complaints-table-wrap">
          <table className="complaints-table permissions-matrix">
            <thead>
              <tr>
                <th>Role</th>
                {capabilityDefs.map((cap) => (
                  <th key={cap.id} title={cap.description}>{cap.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role}>
                  <td className="permissions-matrix-role">{ROLE_LABELS_FOR_ADMIN[role]}</td>
                  {capabilityDefs.map((cap) => {
                    const applicable = cap.applicableRoles.includes(role);
                    const on = hasCapability(role, cap.id);
                    if (!applicable) {
                      return (
                        <td key={cap.id} className="permissions-matrix-na" title="Not wired to any code path for this role">—</td>
                      );
                    }
                    return (
                      <td key={cap.id}>
                        <div
                          className={`theme-switch ${on ? 'on' : ''}`}
                          onClick={() => toggleCapability(role, cap.id, !on)}
                          role="button"
                          tabIndex={0}
                          aria-pressed={on}
                          aria-label={`${cap.label} for ${ROLE_LABELS_FOR_ADMIN[role]}`}
                        >
                          <div className="theme-switch-handle"></div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="categories-card" style={{ marginTop: 14 }}>
        <h2>What each capability actually gates</h2>
        {capabilityDefs.map((cap) => (
          <div className="settings-detail-row" key={cap.id}>
            <div style={{ flex: 1 }}>
              <span className="person-row-name">{cap.label}</span>
              <span className="person-row-caption">{cap.description} — {cap.gatedBy}</span>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
