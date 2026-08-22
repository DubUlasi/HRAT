import React from 'react';
import { useParams } from 'react-router-dom';
import { Mail, Briefcase, Building2, CalendarDays, Clock } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import BackButton from '../../components/ui/BackButton';
import Avatar from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useUserManagement } from '../../context/UserManagementContext';
import { ROLE_LABELS_FOR_ADMIN } from '../../data/mockManagedUsers';
import { ROLE_NAV_ITEMS } from '../roleNavMap';
import { ictHeadNavItems, ictHeadUser } from './navConfig';

const STATUS_BADGE = { active: 'status-success', pending: 'status-warning', inactive: 'status-danger' };

export default function IctHeadUserProfilePage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navItems = ROLE_NAV_ITEMS[user?.role] || ictHeadNavItems;
  const { getUserById, departments } = useUserManagement();
  const managedUser = getUserById(userId);

  if (!managedUser) {
    return (
      <AppShell navItems={navItems} user={user || ictHeadUser}>
        <div className="detail-top-nav-bar">
          <BackButton navItems={navItems} fallbackTo="/ict-head/users" />
        </div>
        <h1>User not found</h1>
        <p>This account may have been removed.</p>
      </AppShell>
    );
  }

  const departmentName = departments.find((d) => d.id === managedUser.departmentId)?.name;

  return (
    <AppShell navItems={navItems} user={user || ictHeadUser}>
      <div className="detail-top-nav-bar">
        <BackButton navItems={navItems} fallbackTo="/ict-head/users" />
      </div>

      <PageHeader title={managedUser.name} subtitle={ROLE_LABELS_FOR_ADMIN[managedUser.role] || managedUser.role} />

      <div className="settings-profile-banner">
        <Avatar name={managedUser.name} size={64} />
        <div className="settings-profile-banner-info">
          <div className="settings-profile-name">{managedUser.name}</div>
          <span className={`status-badge ${STATUS_BADGE[managedUser.status]}`}>{managedUser.status}</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="categories-card">
          <h2>Contact Details</h2>
          <div className="settings-detail-row">
            <span className="settings-detail-icon accent-info"><Mail size={15} /></span>
            <div>
              <span className="settings-detail-label">Email</span>
              <span className="settings-detail-value">{managedUser.email}</span>
            </div>
          </div>
        </div>

        <div className="categories-card">
          <h2>Role & Department</h2>
          <div className="settings-detail-row">
            <span className="settings-detail-icon accent-info"><Briefcase size={15} /></span>
            <div>
              <span className="settings-detail-label">Role</span>
              <span className="settings-detail-value">{ROLE_LABELS_FOR_ADMIN[managedUser.role] || managedUser.role}</span>
            </div>
          </div>
          <div className="settings-detail-row">
            <span className="settings-detail-icon accent-accent"><Building2 size={15} /></span>
            <div>
              <span className="settings-detail-label">Department</span>
              <span className="settings-detail-value">{departmentName || '—'}</span>
            </div>
          </div>
          <div className="settings-detail-row">
            <span className="settings-detail-icon accent-warning"><CalendarDays size={15} /></span>
            <div>
              <span className="settings-detail-label">Joined</span>
              <span className="settings-detail-value">{new Date(managedUser.joinedDate).toDateString()}</span>
            </div>
          </div>
          <div className="settings-detail-row">
            <span className="settings-detail-icon accent-violet"><Clock size={15} /></span>
            <div>
              <span className="settings-detail-label">Last Login</span>
              <span className="settings-detail-value">{managedUser.lastLoginAt ? new Date(managedUser.lastLoginAt).toLocaleString() : 'Never'}</span>
            </div>
          </div>
        </div>
      </div>

      {managedUser.status === 'inactive' && managedUser.deactivationReason && (
        <div className="categories-card" style={{ marginTop: 14 }}>
          <h2>Deactivation Reason</h2>
          <p className="review-summary-line">{managedUser.deactivationReason}</p>
        </div>
      )}
    </AppShell>
  );
}
