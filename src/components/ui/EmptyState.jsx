import React from 'react';
import { SearchX } from 'lucide-react';

export default function EmptyState({ icon: Icon = SearchX, message = 'Whoops! Nothing here' }) {
  return (
    <div className="empty-state">
      <Icon size={40} />
      <p>{message}</p>
    </div>
  );
}
