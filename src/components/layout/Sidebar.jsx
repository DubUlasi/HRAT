import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, LogOut, Moon, Sun, MoreVertical, ChevronLeft } from 'lucide-react';
import SidebarNavItem from './SidebarNavItem';
import { useTheme } from '../../hooks/useTheme';

/**
 * Reusable left sidebar shell used by every internal-staff dashboard.
 * navItems: [{ to, icon, label, end?, badge? }]
 * user: { name, email, avatarSrc }
 */
export default function Sidebar({ navItems, user, collapsed = false, onToggleCollapsed, logoHref = '/', logoSrc = '/hrat_nhrc_logo.png' }) {
  const { isDark, toggleTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const settingsHref = navItems.find((item) => item.label === 'Settings')?.to || '/settings';

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button
        type="button"
        className="sidebar-collapse-btn"
        onClick={onToggleCollapsed}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronLeft size={14} className={collapsed ? 'rotated' : ''} />
      </button>

      <div className="sidebar-header">
        <Link to={logoHref} className="logo-container">
          <img src={logoSrc} alt="HRAT Logo" className="logo-icon" />
        </Link>
      </div>

      <nav className="nav-section">
        {navItems.map((item) => (
          <SidebarNavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className={`profile-menu ${showProfileMenu ? 'show' : ''}`}>
          <Link to={settingsHref} className="profile-menu-item">
            <Settings size={16} />
            Account Settings
          </Link>
          <div className="profile-menu-item" onClick={toggleTheme}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            {isDark ? 'Light Theme' : 'Dark Theme'}
          </div>
          <div className="sidebar-divider" style={{ margin: '4px 0' }}></div>
          <Link to="/login" className="profile-menu-item" style={{ color: '#EF4444' }}>
            <LogOut size={16} />
            Sign Out
          </Link>
        </div>

        <div className="profile-card-block">
          <div className="profile-card" onClick={() => setShowProfileMenu((prev) => !prev)}>
            <div className="avatar-container">
              <img src={user.avatarSrc || '/alicia.png'} alt={user.name} className="profile-avatar" />
              <span className="status-indicator"></span>
            </div>
            {!collapsed && (
              <div className="profile-info">
                <span className="profile-name">{user.name}</span>
                <span className="profile-email">{user.email}</span>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              type="button"
              className="settings-btn"
              onClick={() => setShowProfileMenu((prev) => !prev)}
              aria-label="User Options"
            >
              <MoreVertical size={20} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
