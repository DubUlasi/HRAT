import React from 'react';
import { Mail } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { statePersonnel } from '../../data/mockOfficers';
import { stateCoordinatorNavItems } from './navConfig';

// Read-only roster of the personnel officers at this coordinator's own office — assignment
// itself happens from a complaint's own detail page (Assign State Personnel Officer), same
// division of labor as every other role's staff-roster-vs-assignment-flow split in this app.
export default function StateCoordinatorPersonnelPage() {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const officeId = user?.officeId;
  const officePersonnel = statePersonnel.filter((p) => p.officeId === officeId);

  const activeCaseCount = (officerId) => complaints.filter(
    (c) => c.stateOffice?.assignedPersonnelId === officerId && !c.stateOffice?.returnedAt
  ).length;

  return (
    <AppShell navItems={stateCoordinatorNavItems} user={user}>
      <PageHeader title="State Personnel" subtitle="The personnel officers at your state office." />

      {officePersonnel.length === 0 ? (
        <EmptyState message="No personnel officers on file for your office" />
      ) : (
        <div className="complaints-table-wrap">
          <table className="complaints-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Active Cases</th>
              </tr>
            </thead>
            <tbody>
              {officePersonnel.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="person-cell">
                      <Avatar name={p.name} size={28} />
                      <span className="person-cell-name">{p.name}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                      <Mail size={13} style={{ color: 'var(--text-muted)' }} /> {p.email}
                    </span>
                  </td>
                  <td><span className="count-badge">{activeCaseCount(p.id)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
