import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import '../../styles/style.css';
import '../../styles/dashboard-shell.css';
import '../../styles/complaints.css';
import '../../styles/modals.css';
import '../../styles/hero-banner.css';
import '../../styles/voice-report.css';
import '../../styles/help-settings.css';

const COLLAPSE_KEY = 'hrat-sidebar-collapsed';

export default function AppShell({ navItems, user, children }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === 'true');
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, String(next));
      return next;
    });
  };

  return (
    <div className="dashboard-container">
      {mobileOpen && (
        <div className="mobile-nav-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      <Sidebar
        navItems={navItems}
        user={user}
        collapsed={collapsed && !mobileOpen}
        onToggleCollapsed={toggleCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <main className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={18} />
          <span>Menu</span>
        </button>
        {children}
      </main>
    </div>
  );
}
