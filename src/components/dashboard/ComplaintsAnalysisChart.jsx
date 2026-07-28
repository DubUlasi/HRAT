import React from 'react';
import ComplaintsLineChart from '../charts/ComplaintsLineChart';

// Shown on every role's dashboard per the manual (Registry Head, Officer, Department roles all
// have a "Complaints Analysis" chart), so this lives as a shared dashboard component.
export default function ComplaintsAnalysisChart({ data }) {
  return (
    <div className="analysis-card">
      <h2>Complaints Analysis</h2>
      <ComplaintsLineChart data={data} />
    </div>
  );
}
