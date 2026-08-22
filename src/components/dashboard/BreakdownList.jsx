import React from 'react';
import { Inbox } from 'lucide-react';
import EmptyState from '../ui/EmptyState';

const DOT_COLORS = ['var(--accent-color)', 'var(--info-color)', 'var(--warning-color)', 'var(--danger-color)', 'var(--violet-color)'];

// Generic "label + % bar" breakdown card — reused across Analytics for categories, pipeline
// status, and office breakdowns instead of one hard-coded component per breakdown. A row may
// set `displayValue` to show something other than the bare percent next to the label (e.g. a
// formatted duration for the Business Intelligence page's stage-timing widget) — `percent`
// still drives the bar width either way.
//
// `fillHeight` (opt-in, default off) spreads the rows evenly across whatever height the card
// gets stretched to — used where this list sits next to a taller sibling (a doughnut chart with
// a long legend) so the rows don't sit packed at the top with empty space below.
export default function BreakdownList({ title, rows, fillHeight = false }) {
  return (
    <div className={`categories-card${fillHeight ? ' categories-card-fill' : ''}`}>
      <h2>{title}</h2>
      {rows.length === 0 && <EmptyState icon={Inbox} message="Nothing to break down yet." />}
      <div className={fillHeight ? 'category-row-list-fill' : undefined}>
        {rows.map((row, i) => {
          const color = DOT_COLORS[i % DOT_COLORS.length];
          return (
            <div className="category-row" key={row.key}>
              <div className="category-row-top">
                <span className="category-row-label">
                  <span className="category-dot" style={{ backgroundColor: color }} />
                  {row.label}
                </span>
                <span className="category-percent">{row.displayValue ?? `${row.percent}%`}</span>
              </div>
              <div className="category-bar-track">
                <div className="category-bar-fill" style={{ width: `${row.percent}%`, backgroundColor: color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
