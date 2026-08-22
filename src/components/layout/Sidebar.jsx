import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Settings, LogOut, Moon, Sun, MoreVertical, ChevronLeft, X } from 'lucide-react';
import SidebarNavItem from './SidebarNavItem';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { getNavBadgeCounts } from '../../roles/navBadgeCounts';

// A page like a complaint's own detail view never matches a nav item's URL directly, so on its
// own nothing would ever highlight there. Resolves which single nav item should read as
// "active" for the current URL, in priority order:
//   1. An explicit `state.from` stamped onto the link that was clicked to get here (see
//      ComplaintsTable/ActionQueueList/ComplaintCard) — most accurate, reflects exactly which
//      list you actually drilled in from.
//   2. An exact match — we're sitting on a page that IS a nav item's own URL.
//   3. The nav item whose own path is the longest matching prefix of the current URL — a
//      sensible default (e.g. "All Complaints" for a complaint detail page) when there's no
//      explicit signal, such as a direct URL/bookmark, a page refresh, or a link from a
//      cross-cutting feature (Related Complaints, Repeat Violators) that isn't tied to one item.
function resolveActiveNavPath(navItems, pathname, explicitFrom) {
  if (explicitFrom && navItems.some((item) => item.to === explicitFrom)) {
    return explicitFrom;
  }

  const exact = navItems.find((item) => item.to === pathname);
  if (exact) return exact.to;

  let best = null;
  navItems.forEach((item) => {
    if (pathname.startsWith(`${item.to}/`) && (!best || item.to.length > best.length)) {
      best = item.to;
    }
  });
  return best;
}

// Items sharing a `section` collapse into one labeled group; items without one (Dashboard,
// Help, Settings) stay flat top/bottom-level links, same as before this grouping existed.
function groupNavItems(navItems) {
  const blocks = [];
  let currentGroup = null;

  navItems.forEach((item) => {
    if (item.section) {
      if (currentGroup && currentGroup.label === item.section) {
        currentGroup.items.push(item);
      } else {
        currentGroup = { label: item.section, items: [item] };
        blocks.push(currentGroup);
      }
    } else {
      currentGroup = null;
      blocks.push(item);
    }
  });

  return blocks;
}

/**
 * Reusable left sidebar shell used by every internal-staff dashboard.
 * navItems: [{ to, icon, label, end?, badge?, section? }]
 * user: { name, email, avatarSrc }
 */
export default function Sidebar({ navItems, user, collapsed = false, onToggleCollapsed, logoHref = '/', logoSrc = '/hrat_nhrc_logo.png', mobileOpen = false, onCloseMobile }) {
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const { complaints, complaintNumberAuto } = useComplaints();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSignOut = () => {
    logout();
    onCloseMobile?.();
    navigate('/login');
  };
  const settingsHref = navItems.find((item) => item.label === 'Settings')?.to || '/settings';
  const navBlocks = groupNavItems(navItems);
  const activeTo = resolveActiveNavPath(navItems, location.pathname, location.state?.from);
  // Reuses each role's own existing "needs action" predicates (see navBadgeCounts.js) so this
  // number never drifts out of sync with what the dashboard/queue page itself counts.
  const badgeCounts = useMemo(() => getNavBadgeCounts(user, complaints, complaintNumberAuto), [user, complaints, complaintNumberAuto]);
  const badgeFor = (path) => (badgeCounts[path] > 0 ? <span className="nav-count-badge">{badgeCounts[path]}</span> : null);

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <button
        type="button"
        className="sidebar-collapse-btn"
        onClick={onToggleCollapsed}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronLeft size={14} className={collapsed ? 'rotated' : ''} />
      </button>

      {mobileOpen && (
        <button
          type="button"
          className="sidebar-mobile-close-btn"
          onClick={onCloseMobile}
          aria-label="Close menu"
        >
          <X size={16} />
        </button>
      )}

      <div className="sidebar-header">
        <Link to={logoHref} className="logo-container" onClick={onCloseMobile}>
          <img src={logoSrc} alt="HRAT Logo" className="logo-icon" />
        </Link>
      </div>

      <nav className="nav-section">
        {collapsed
          ? navItems.map((item) => (
              <SidebarNavItem key={item.to} {...item} active={item.to === activeTo} badge={badgeFor(item.to)} collapsed={collapsed} onNavigate={onCloseMobile} />
            ))
          : navBlocks.map((block, idx) =>
              Array.isArray(block.items) ? (
                <div key={`${block.label}-${idx}`} className="nav-group">
                  <div className="nav-group-label">{block.label}</div>
                  <div className="nav-group-content">
                    {block.items.map((item) => (
                      <SidebarNavItem key={item.to} {...item} active={item.to === activeTo} badge={badgeFor(item.to)} onNavigate={onCloseMobile} />
                    ))}
                  </div>
                </div>
              ) : (
                <SidebarNavItem key={block.to} {...block} active={block.to === activeTo} badge={badgeFor(block.to)} onNavigate={onCloseMobile} />
              )
            )}
      </nav>

      <div className="sidebar-footer">
        <div className={`profile-menu ${showProfileMenu ? 'show' : ''}`}>
          <Link to={settingsHref} className="profile-menu-item" onClick={onCloseMobile}>
            <Settings size={16} />
            Account Settings
          </Link>
          <div className="profile-menu-item" onClick={toggleTheme}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            {isDark ? 'Light Theme' : 'Dark Theme'}
          </div>
          <div className="sidebar-divider" style={{ margin: '4px 0' }}></div>
          <button type="button" className="profile-menu-item" style={{ color: '#EF4444' }} onClick={handleSignOut}>
            <LogOut size={16} />
            Sign Out
          </button>
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
