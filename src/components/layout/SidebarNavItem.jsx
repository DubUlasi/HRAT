import React from 'react';
import { NavLink } from 'react-router-dom';

export default function SidebarNavItem({ to, icon: Icon, label, end = false, badge = null, iconSize = 20, collapsed = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
      title={collapsed ? label : undefined}
    >
      <div className="nav-item-content">
        <Icon size={iconSize} strokeWidth={1.75} />
        {!collapsed && <span>{label}</span>}
      </div>
      {!collapsed && badge}
    </NavLink>
  );
}
