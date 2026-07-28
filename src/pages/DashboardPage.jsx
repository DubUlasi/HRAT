import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  FolderKanban,
  Settings,
  LogOut,
  Moon,
  Sun,
  MoreVertical
} from 'lucide-react';
import '../styles/style.css';

export default function DashboardPage() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('hrat-theme') === 'dark';
  });

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('hrat-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('hrat-theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <Link to="/" className="logo-container">
            <img src="/hrat_nhrc_logo.png" alt="HRAT Logo" className="logo-icon" />
            
          </Link>
          
          {/* Dark Theme Toggle Switch */}
          <div
            className="theme-switch"
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            role="button"
            tabIndex={0}
          >
            <div className="theme-switch-handle"></div>
          </div>
        </div>

        {/* Primary Navigation Section */}
        <nav className="nav-section">
          <Link to="/" className="nav-item active">
            <div className="nav-item-content">
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </div>
            <span className="dot"></span>
          </Link>

          <Link to="/complaint" className="nav-item">
            <div className="nav-item-content">
              <FileText size={20} />
              <span>My Complaints</span>
            </div>
          </Link>

          <Link to="/complaint" className="nav-item">
            <div className="nav-item-content">
              <PlusCircle size={20} />
              <span>Make a Complaint</span>
            </div>
            <span className="plus-btn">+</span>
          </Link>

          <div className="sidebar-divider"></div>

          <details className="collapsible-group" open>
            <summary>
              <span>Complaint Categories</span>
            </summary>
            <div className="collapsible-content">
              <Link to="/complaint" className="nav-item">
                <div className="nav-item-content">
                  <FolderKanban size={18} />
                  <span>Women & Children</span>
                </div>
              </Link>

              <Link to="/complaint" className="nav-item">
                <div className="nav-item-content">
                  <FolderKanban size={18} />
                  <span>Economic & Social</span>
                </div>
              </Link>

              <Link to="/complaint" className="nav-item">
                <div className="nav-item-content">
                  <FolderKanban size={18} />
                  <span>Civil & Political</span>
                </div>
              </Link>
            </div>
          </details>
        </nav>

        {/* Sidebar Footer / User Profile */}
        <div className="sidebar-footer">
          {/* Profile Menu Popup */}
          <div className={`profile-menu ${showProfileMenu ? 'show' : ''}`}>
            <Link to="/settings" className="profile-menu-item">
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

          <div className="profile-card" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <div className="avatar-container">
              <img src="/alicia.png" alt="Alicia Keys" className="profile-avatar" />
              <span className="status-indicator"></span>
            </div>
            <div className="profile-info">
              <span className="profile-name">Alicia Keys</span>
              <span className="profile-email">alicia@example.com</span>
            </div>
          </div>

          <button
            type="button"
            className="settings-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-label="User Options"
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="content-header">
          <div className="header-title-area">
            <h1>Dashboard Overview</h1>
            <p>Welcome back, Alicia. Track and manage your human rights complaints.</p>
          </div>

          <div className="header-actions">
            <Link to="/complaint" className="btn-primary">
              <PlusCircle size={18} />
              Make a Complaint
            </Link>
          </div>
        </header>
      </main>
    </div>
  );
}
