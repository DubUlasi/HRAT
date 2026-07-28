import React, { useState } from 'react';
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

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, String(next));
      return next;
    });
  };

  return (
    <div className="dashboard-container">
      <Sidebar navItems={navItems} user={user} collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
      <main className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>{children}</main>
    </div>
  );
}
