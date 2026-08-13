import React from 'react';
import { Moon, Sun, Bell, Shield, Mail, Phone, Building2, Briefcase, MapPin, CalendarDays, FileText, Clock, CheckCircle2 } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import Avatar from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { useTheme } from '../../hooks/useTheme';
import { SUB_STATUS } from '../../constants/complaintStatus';
import { registryHeadNavItems, registryHeadUser } from './navConfig';
import { ROLE_NAV_ITEMS } from '../roleNavMap';

const INACTIVE_STATUSES = [SUB_STATUS.CLOSED, SUB_STATUS.INADMISSIBLE, SUB_STATUS.WITHDRAWN];

const ROLE_LABELS = {
  'registry-head': 'Complaint Registry Head',
  'desk-officer': 'Complaint Registry Desk Officer',
  'department-director': 'Department Director',
  'department-supervisor': 'Department Supervisor',
  'department-investigator': 'Department Investigator',
  'executive-secretary': 'Executive Secretary',
};

export default function RegistryHeadSettingsPage() {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { complaints } = useComplaints();

  // Falls back to the static demo profile if, somehow, this is reached signed out — keeps the
  // page from crashing, though RequireRole should always prevent that in practice.
  const person = user || registryHeadUser;
  const officerId = person.officerId;
  const navItems = ROLE_NAV_ITEMS[user?.role] || registryHeadNavItems;

  const myComplaints = complaints.filter(
    (c) => c.registryOfficerId === officerId || c.admissibilityOfficerId === officerId
  );
  const newCount = myComplaints.filter((c) => c.subStatus === SUB_STATUS.NEW).length;
  const closedCount = myComplaints.filter((c) => c.subStatus === SUB_STATUS.CLOSED).length;
  const activeCount = myComplaints.filter((c) => !INACTIVE_STATUSES.includes(c.subStatus)).length;

  return (
    <AppShell navItems={navItems} user={person}>
      <PageHeader title="Settings" subtitle="Your profile, role details, and preferences." />

      <div className="settings-profile-banner">
        <Avatar name={person.name} size={64} />
        <div className="settings-profile-banner-info">
          <div className="settings-profile-name">{person.name}</div>
          <span className="status-badge status-success">{ROLE_LABELS[person.role] || person.role}</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="categories-card">
          <h2>Contact Details</h2>
          <div className="settings-detail-row">
            <span className="settings-detail-icon accent-info"><Mail size={15} /></span>
            <div>
              <span className="settings-detail-label">Email</span>
              <span className="settings-detail-value">{person.email}</span>
            </div>
          </div>
          <div className="settings-detail-row">
            <span className="settings-detail-icon accent-accent"><Phone size={15} /></span>
            <div>
              <span className="settings-detail-label">Phone Number</span>
              <span className="settings-detail-value">{person.phone || '—'}</span>
            </div>
          </div>
          <div className="settings-detail-row">
            <span className="settings-detail-icon accent-violet"><MapPin size={15} /></span>
            <div>
              <span className="settings-detail-label">Address</span>
              <span className="settings-detail-value">{person.address || '—'}</span>
            </div>
          </div>
        </div>

        <div className="categories-card">
          <h2>Role & Department</h2>
          <div className="settings-detail-row">
            <span className="settings-detail-icon accent-info"><Briefcase size={15} /></span>
            <div>
              <span className="settings-detail-label">Role</span>
              <span className="settings-detail-value">{ROLE_LABELS[person.role] || person.role}</span>
            </div>
          </div>
          <div className="settings-detail-row">
            <span className="settings-detail-icon accent-accent"><Building2 size={15} /></span>
            <div>
              <span className="settings-detail-label">Office</span>
              <span className="settings-detail-value">NHRC Headquarters, Maitama, Abuja</span>
            </div>
          </div>
          <div className="settings-detail-row">
            <span className="settings-detail-icon accent-warning"><CalendarDays size={15} /></span>
            <div>
              <span className="settings-detail-label">Joined</span>
              <span className="settings-detail-value">{person.joinedDate ? new Date(person.joinedDate).toDateString() : '—'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="categories-card" style={{ marginTop: 14 }}>
        <h2>Case Load</h2>
        <div className="settings-caseload-grid">
          <div className="stat-card accent-info">
            <div className="stat-card-icon"><FileText size={16} /></div>
            <h3>New</h3>
            <div className="value">{newCount}</div>
          </div>
          <div className="stat-card accent-warning">
            <div className="stat-card-icon"><Clock size={16} /></div>
            <h3>Active</h3>
            <div className="value">{activeCount}</div>
          </div>
          <div className="stat-card accent-accent">
            <div className="stat-card-icon"><CheckCircle2 size={16} /></div>
            <h3>Closed</h3>
            <div className="value">{closedCount}</div>
          </div>
          <div className="stat-card accent-violet">
            <div className="stat-card-icon"><Briefcase size={16} /></div>
            <h3>Total Handled</h3>
            <div className="value">{myComplaints.length}</div>
          </div>
        </div>
      </div>

      <div className="categories-card" style={{ marginTop: 14 }}>
        <h2>Preferences</h2>
        <div className="settings-row">
          <div className="settings-row-label">
            {isDark ? <Moon size={16} /> : <Sun size={16} />}
            <span>Appearance, {isDark ? 'Dark' : 'Light'} mode</span>
          </div>
          <div className="theme-switch" onClick={toggleTheme} role="button" tabIndex={0}>
            <div className="theme-switch-handle"></div>
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-row-label">
            <Bell size={16} />
            <span>Email notifications for new complaints</span>
          </div>
          <span className="status-badge status-success">On</span>
        </div>

        <div className="settings-row">
          <div className="settings-row-label">
            <Shield size={16} />
            <span>Two-factor authentication</span>
          </div>
          <span className="status-badge status-warning">Not enabled</span>
        </div>
      </div>
    </AppShell>
  );
}
