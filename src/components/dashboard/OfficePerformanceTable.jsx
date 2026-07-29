import React from 'react';

// Volume + average resolution time per office/department — used twice on the Business
// Intelligence page (once for offices, once for departments), so the entity type is just a
// label the caller picks rather than something baked into this component.
export default function OfficePerformanceTable({ title, rows }) {
  return (
    <div className="analysis-card">
      <h2>{title}</h2>
      <div className="complaints-table-wrap performance-table-wrap">
        <table className="complaints-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Volume</th>
              <th>Avg. Resolution Time</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.volume}</td>
                <td>{row.resolutionLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
