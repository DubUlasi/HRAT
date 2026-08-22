import React from 'react';

// Fills the same fixed-height box the real chart would've rendered into (see
// .complaints-bar-chart / .complaints-doughnut-chart / .complaints-line-chart in
// dashboard-shell.css) so an empty chart doesn't collapse its card or leave a blank canvas.
export default function ChartEmptyState({ icon: Icon, message = 'No data for this selection yet.' }) {
  return (
    <div className="chart-empty-state">
      <Icon size={26} />
      <p>{message}</p>
    </div>
  );
}
