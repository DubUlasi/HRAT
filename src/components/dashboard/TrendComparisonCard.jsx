import React from 'react';
import ComplaintsLineChart from '../charts/ComplaintsLineChart';

// Composes ComplaintsLineChart's optional `compareData` series into a period-over-period
// trend widget for the Business Intelligence page, with a small custom legend (the chart
// itself has no built-in legend plugin registered, so this stays plain HTML/CSS).
export default function TrendComparisonCard({ title, currentLabel, previousLabel, data, compareData }) {
  return (
    <div className="analysis-card">
      <div className="section-header-flex">
        <h2>{title}</h2>
        <div className="trend-legend">
          <span className="trend-legend-item">
            <span className="trend-legend-dot current" />
            {currentLabel}
          </span>
          <span className="trend-legend-item">
            <span className="trend-legend-dot previous" />
            {previousLabel}
          </span>
        </div>
      </div>
      <ComplaintsLineChart data={data} compareData={compareData} compareLabel={previousLabel} />
    </div>
  );
}
