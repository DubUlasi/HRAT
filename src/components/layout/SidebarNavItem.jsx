import React from 'react';
import { Link } from 'react-router-dom';

// `active` is resolved by the parent Sidebar (see resolveActiveNavPath in Sidebar.jsx) rather
// than computed here via NavLink's own URL matching — a complaint's own detail page never
// matches any nav item's URL, so that alone can't tell us which item should read as current.
export default function SidebarNavItem({ to, icon: Icon, label, active = false, badge = null, iconSize = 20, collapsed = false, onNavigate }) {
  return (
    <Link
      to={to}
      className={`nav-item${active ? ' active' : ''}`}
      title={collapsed ? label : undefined}
      onClick={onNavigate}
    >
      <div className="nav-item-content">
        <Icon size={iconSize} strokeWidth={1.75} />
        {!collapsed && <span>{label}</span>}
      </div>
      {!collapsed && badge}
    </Link>
  );
}
