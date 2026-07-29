import React from 'react';
import { Moon, Sun, Bell, Shield } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import Avatar from '../../components/ui/Avatar';
import { useTheme } from '../../hooks/useTheme';
import { registryHeadNavItems, registryHeadUser } from './navConfig';

export default function RegistryHeadSettingsPage() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <AppShell navItems={registryHeadNavItems} user={registryHeadUser}>
      <PageHeader title="Settings" subtitle="Manage your profile and preferences." />

      <div className="dashboard-grid">
        <div className="categories-card">
          <h2>Profile</h2>
          <div className="settings-profile-row">
            <Avatar name={registryHeadUser.name} size={56} />
            <div>
              <div className="settings-profile-name">{registryHeadUser.name}</div>
              <div className="settings-profile-email">{registryHeadUser.email}</div>
              <span className="status-badge status-success">Complaint Registry Head</span>
            </div>
          </div>
        </div>

        <div className="categories-card">
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
      </div>
    </AppShell>
  );
}
