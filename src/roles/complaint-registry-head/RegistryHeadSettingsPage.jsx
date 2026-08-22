import React, { useState } from 'react';
import { Moon, Sun, Bell, Shield, Mail, Phone, Building2, Briefcase, MapPin, CalendarDays, FileText, Clock, CheckCircle2, Pencil, KeyRound } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import SuccessModal from '../../components/ui/SuccessModal';
import ConfirmActionModal from '../../components/ui/ConfirmActionModal';
import EditProfileModal from '../../components/settings/EditProfileModal';
import ChangePasswordModal from '../../components/settings/ChangePasswordModal';
import TwoFactorSetupModal from '../../components/settings/TwoFactorSetupModal';
import ComplaintNumberFormatCard from '../../components/settings/ComplaintNumberFormatCard';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { useTheme } from '../../hooks/useTheme';
import { SUB_STATUS } from '../../constants/complaintStatus';
import { registryHeadNavItems, registryHeadUser } from './navConfig';
import { ROLE_NAV_ITEMS, ROLE_BOTTOM_NAV, ROLE_MOBILE_CLASS } from '../roleNavMap';

const INACTIVE_STATUSES = [SUB_STATUS.CLOSED, SUB_STATUS.INADMISSIBLE, SUB_STATUS.WITHDRAWN];

const ROLE_LABELS = {
  'registry-head': 'Complaint Registry Head',
  'desk-officer': 'Complaint Registry Desk Officer',
  'department-director': 'Department Director',
  'department-supervisor': 'Department Supervisor',
  'department-investigator': 'Department Investigation Officer',
  'executive-secretary': 'Executive Secretary',
  'ict-head': 'ICT Head',
  'ict-personnel': 'ICT Personnel',
  'complainant': 'Complainant',
};

export default function RegistryHeadSettingsPage() {
  const { isDark, toggleTheme } = useTheme();
  const { user, updateProfile, changePassword } = useAuth();
  const {
    complaints, complaintNumberFormat, updateComplaintNumberFormat, complaintNumberSeq, updateComplaintNumberSeq,
    complaintNumberAuto, updateComplaintNumberAuto,
  } = useComplaints();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [showDisableTwoFactor, setShowDisableTwoFactor] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Falls back to the static demo profile if, somehow, this is reached signed out — keeps the
  // page from crashing, though RequireRole should always prevent that in practice.
  const person = user || registryHeadUser;
  const officerId = person.officerId;
  const navItems = ROLE_NAV_ITEMS[user?.role] || registryHeadNavItems;
  const bottomNavItems = ROLE_BOTTOM_NAV[user?.role];
  const mobileClassName = ROLE_MOBILE_CLASS[user?.role];
  // Only the Registry Head owns the numbering scheme; the fallback demo profile has no role at
  // all and stands in for that same seat, so it's treated as one too.
  const isRegistryHead = !person.role || person.role === 'registry-head';

  const handleSaveComplaintNumberFormat = (format, seq) => {
    updateComplaintNumberFormat(format);
    updateComplaintNumberSeq(seq);
    setSuccessMessage('Complaint number format updated!');
  };

  const handleToggleComplaintNumberAuto = (on) => {
    updateComplaintNumberAuto(on);
    setSuccessMessage(on ? 'Complaint numbers will now be assigned automatically.' : 'Complaint numbers will now be assigned by a Desk Officer.');
  };

  const myComplaints = complaints.filter(
    (c) => c.registryOfficerId === officerId || c.admissibilityOfficerId === officerId
  );
  const newCount = myComplaints.filter((c) => c.subStatus === SUB_STATUS.NEW).length;
  const closedCount = myComplaints.filter((c) => c.subStatus === SUB_STATUS.CLOSED).length;
  const activeCount = myComplaints.filter((c) => !INACTIVE_STATUSES.includes(c.subStatus)).length;

  const handleSaveProfile = (patch) => {
    updateProfile(patch);
    setShowEditProfile(false);
    setSuccessMessage('Profile updated successfully!');
  };

  const handleChangePassword = (currentPassword, newPassword) => changePassword(currentPassword, newPassword);

  const handlePasswordChanged = () => {
    setShowChangePassword(false);
    setSuccessMessage('Password changed successfully!');
  };

  const emailNotificationsOn = person.emailNotifications !== false;
  const twoFactorEnabled = !!person.twoFactorEnabled;

  const handleToggleEmailNotifications = () => {
    updateProfile({ emailNotifications: !emailNotificationsOn });
  };

  const handleTwoFactorEnabled = () => {
    updateProfile({ twoFactorEnabled: true });
    setShowTwoFactorSetup(false);
    setSuccessMessage('Two-factor authentication enabled!');
  };

  const handleTwoFactorDisabled = () => {
    updateProfile({ twoFactorEnabled: false });
    setShowDisableTwoFactor(false);
    setSuccessMessage('Two-factor authentication disabled.');
  };

  return (
    <AppShell navItems={navItems} user={person} bottomNavItems={bottomNavItems} mobileClassName={mobileClassName}>
      <PageHeader title="Settings" subtitle="Your profile, role details, and preferences." />

      <div className="settings-profile-banner">
        <Avatar name={person.name} size={64} />
        <div className="settings-profile-banner-info">
          <div className="settings-profile-name">{person.name}</div>
          <span className="status-badge status-success">{ROLE_LABELS[person.role] || person.role}</span>
        </div>
        <Button
          variant="secondary"
          icon={Pencil}
          className="settings-edit-profile-btn"
          style={{ marginLeft: 'auto' }}
          onClick={() => setShowEditProfile(true)}
        >
          Edit Profile
        </Button>
      </div>

      <div className="dashboard-grid">
        <div className="categories-card">
          <div className="section-header-flex">
            <h2>Contact Details</h2>
            <button type="button" className="btn-link" onClick={() => setShowEditProfile(true)}>Edit</button>
          </div>
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

      {!!officerId && (
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
      )}

      {isRegistryHead && (
        <ComplaintNumberFormatCard
          currentFormat={complaintNumberFormat}
          currentSeq={complaintNumberSeq}
          autoAssign={complaintNumberAuto}
          onToggleAuto={handleToggleComplaintNumberAuto}
          onSave={handleSaveComplaintNumberFormat}
        />
      )}

      <div className="categories-card" style={{ marginTop: 14 }}>
        <h2>Preferences</h2>
        <div className="settings-row">
          <div className="settings-row-label">
            {isDark ? <Moon size={16} /> : <Sun size={16} />}
            <span>Appearance, {isDark ? 'Dark' : 'Light'} mode</span>
          </div>
          <div className="theme-switch theme-mode-switch" onClick={toggleTheme} role="button" tabIndex={0}>
            <div className="theme-switch-handle"></div>
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-row-label">
            <Bell size={16} />
            <span>Email notifications for new complaints</span>
          </div>
          <div
            className={`theme-switch ${emailNotificationsOn ? 'on' : ''}`}
            onClick={handleToggleEmailNotifications}
            role="button"
            tabIndex={0}
            aria-pressed={emailNotificationsOn}
          >
            <div className="theme-switch-handle"></div>
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-row-label">
            <KeyRound size={16} />
            <span>Password</span>
          </div>
          <Button variant="secondary" onClick={() => setShowChangePassword(true)}>Change Password</Button>
        </div>

        <div className="settings-row">
          <div className="settings-row-label">
            <Shield size={16} />
            <span>Two-factor authentication (via email)</span>
          </div>
          <div className="settings-row-actions">
            <span className={`status-badge ${twoFactorEnabled ? 'status-success' : 'status-warning'}`}>
              {twoFactorEnabled ? 'Enabled' : 'Not enabled'}
            </span>
            {twoFactorEnabled ? (
              <Button variant="secondary" onClick={() => setShowDisableTwoFactor(true)}>Disable</Button>
            ) : (
              <Button variant="secondary" onClick={() => setShowTwoFactorSetup(true)}>Enable</Button>
            )}
          </div>
        </div>
      </div>

      <EditProfileModal
        open={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        person={person}
        onSubmit={handleSaveProfile}
      />
      <ChangePasswordModal
        open={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onChangePassword={handleChangePassword}
        onSuccess={handlePasswordChanged}
      />
      <TwoFactorSetupModal
        open={showTwoFactorSetup}
        onClose={() => setShowTwoFactorSetup(false)}
        onEnable={handleTwoFactorEnabled}
        email={person.email}
      />
      <ConfirmActionModal
        open={showDisableTwoFactor}
        title="Disable Two-Factor Authentication?"
        description="Your account will only need a password to sign in."
        confirmLabel="Yes, disable it"
        cancelLabel="Cancel"
        onCancel={() => setShowDisableTwoFactor(false)}
        onConfirm={handleTwoFactorDisabled}
      />
      <SuccessModal
        open={!!successMessage}
        message={successMessage || ''}
        onClose={() => setSuccessMessage(null)}
      />
    </AppShell>
  );
}
