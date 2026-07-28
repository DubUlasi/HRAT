import React from 'react';

export default function ProgressBar({ percent = 0 }) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className="progress-bar-track">
      <div className="progress-bar-fill" style={{ width: `${clamped}%` }}></div>
    </div>
  );
}
