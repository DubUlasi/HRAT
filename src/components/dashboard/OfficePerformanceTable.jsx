import React from 'react';
import { Users } from 'lucide-react';
import Avatar from '../ui/Avatar';
import EmptyState from '../ui/EmptyState';

// Volume + average resolution time per office/department/team-member — used across the
// Business Intelligence and Reports pages, so the entity type is just a label the caller picks
// rather than something baked into this component. A ranked leaderboard-style list (avatar,
// rank, and a relative-volume bar) instead of a plain table, so the numbers are legible at a
// glance rather than requiring a column-by-column read.
export default function OfficePerformanceTable({ title, rows }) {
  const maxVolume = Math.max(1, ...rows.map((r) => r.volume));

  return (
    <div className="analysis-card">
      <h2>{title}</h2>
      {rows.length === 0 ? (
        <EmptyState icon={Users} message="No cases assigned yet." />
      ) : (
        <div className="performance-list">
          {rows.map((row, i) => (
            <div className="performance-row" key={row.id}>
              <span className="performance-rank">{i + 1}</span>
              <Avatar name={row.name} size={30} />
              <div className="performance-row-body">
                <div className="performance-row-top">
                  <span className="performance-row-name">{row.name}</span>
                  <span className="performance-row-volume">{row.volume} case{row.volume === 1 ? '' : 's'}</span>
                </div>
                <div className="category-bar-track">
                  <div className="category-bar-fill" style={{ width: `${Math.round((row.volume / maxVolume) * 100)}%`, backgroundColor: 'var(--accent-color)' }} />
                </div>
                <span className="performance-row-resolution">{row.resolutionLabel}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
