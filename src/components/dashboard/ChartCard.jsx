import React from 'react';

// Small reuse wrapper for the ".analysis-card" + header pattern TrendComparisonCard.jsx and the
// Reports preview header already hand-roll — so new chart placements don't each re-hand-roll it.
export default function ChartCard({ title, actions, children }) {
  return (
    <div className="analysis-card">
      <div className="section-header-flex">
        <h2>{title}</h2>
        {actions}
      </div>
      {children}
    </div>
  );
}
