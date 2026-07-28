import React from 'react';
import ComplaintCard from './ComplaintCard';
import EmptyState from '../ui/EmptyState';

export default function ComplaintsCardGrid({ complaints }) {
  if (!complaints.length) return <EmptyState message="No complaints here yet" />;

  return (
    <div className="complaints-card-grid">
      {complaints.map((c) => (
        <ComplaintCard key={c.id} complaint={c} />
      ))}
    </div>
  );
}
