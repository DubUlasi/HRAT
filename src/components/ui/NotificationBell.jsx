import React from 'react';
import { Bell } from 'lucide-react';

export default function NotificationBell({ count = 0, onClick }) {
  return (
    <button type="button" className="notification-bell" onClick={onClick} aria-label="Notifications">
      <Bell size={20} />
      {count > 0 && <span className="notification-dot"></span>}
    </button>
  );
}
