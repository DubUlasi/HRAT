import React from 'react';

const DOT_COLORS = ['var(--accent-color)', 'var(--info-color)', 'var(--warning-color)', 'var(--danger-color)', 'var(--violet-color)'];

// Generic "label + % bar" breakdown card — reused across Analytics for categories, pipeline
// status, and office breakdowns instead of one hard-coded component per breakdown.
export default function BreakdownList({ title, rows }) {
  return (
    <div className="categories-card">
      <h2>{title}</h2>
      {rows.map((row, i) => {
        const color = DOT_COLORS[i % DOT_COLORS.length];
        return (
          <div className="category-row" key={row.key}>
            <div className="category-row-top">
              <span className="category-row-label">
                <span className="category-dot" style={{ backgroundColor: color }} />
                {row.label}
              </span>
              <span className="category-percent">{row.percent}%</span>
            </div>
            <div className="category-bar-track">
              <div className="category-bar-fill" style={{ width: `${row.percent}%`, backgroundColor: color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
