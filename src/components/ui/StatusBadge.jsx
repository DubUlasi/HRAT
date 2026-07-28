import React from 'react';
import { getSubStatusMeta } from '../../constants/complaintStatus';

// Pass `status` to drive both label and color from a SUB_STATUS key, or override either
// independently with `label`/`color` (e.g. for the ADMISSIBLE/INADMISSIBLE decision tag, which
// isn't itself a pipeline sub-status).
export default function StatusBadge({ status, label, color }) {
  const meta = getSubStatusMeta(status);
  return <span className={`status-badge status-${color || meta.color}`}>{label || meta.label}</span>;
}
