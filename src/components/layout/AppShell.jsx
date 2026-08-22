import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import '../../styles/style.css';
import '../../styles/dashboard-shell.css';
import '../../styles/complaints.css';
import '../../styles/modals.css';
import '../../styles/hero-banner.css';
import '../../styles/voice-report.css';
import '../../styles/help-settings.css';
import '../../styles/complainant-mobile.css';

const COLLAPSE_KEY = 'hrat-sidebar-collapsed';

// `bottomNavItems`/`mobileClassName` are only passed by pages the Complainant role reaches —
// everyone else gets the plain desktop-sidebar-only shell exactly as before. When present, the
// hamburger menu (irrelevant once there's a bottom tab bar) is skipped and a fixed bottom nav
// renders instead; complainant-mobile.css (gated behind `mobileClassName`, so inert for every
// other role) handles the rest of the mobile-first layout.
export default function AppShell({ navItems, user, children, bottomNavItems, mobileClassName }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === 'true');
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, String(next));
      return next;
    });
  };

  const hasMobileNav = bottomNavItems && bottomNavItems.length > 0;

  return (
    <div className={`dashboard-container ${mobileClassName || ''}`}>
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
        {!hasMobileNav && (
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={18} />
            <span>Menu</span>
          </button>
        )}
        {children}
      </main>

      {hasMobileNav && (
        <nav className="mobile-bottom-nav">
          <div className="mobile-bottom-nav-inner">
            {bottomNavItems.map((item) => {
              const isActive = item.end
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              return (
                <Link key={item.to} to={item.to} className={`mobile-bottom-nav-item ${isActive ? 'active' : ''}`}>
                  <item.icon size={22} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
