import React from 'react';
import NotificationBell from '../ui/NotificationBell';

export default function PageHeader({ title, subtitle, actions, notificationCount }) {
  return (
    <header className="content-header">
      <div className="header-title-area">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="header-actions">
        {typeof notificationCount === 'number' && <NotificationBell count={notificationCount} />}
        {actions}
      </div>
    </header>
  );
}
