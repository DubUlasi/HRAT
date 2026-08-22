// Shared computation helpers for the Business Intelligence and Reports pages — hoisted out of
// RegistryHeadBusinessIntelligencePage.jsx so both pages (and any per-role widget) use one
// source of truth instead of two copies quietly drifting apart.
import { STAGE_ORDER, STAGE_LABELS, SUB_STATUS, getSubStatusMeta } from '../constants/complaintStatus';
import { CATEGORY_LABELS } from '../constants/complaintCategories';
import { MONTH_LABELS } from '../constants/reportPeriods';

export const INACTIVE_STATUSES = [SUB_STATUS.CLOSED, SUB_STATUS.INADMISSIBLE, SUB_STATUS.WITHDRAWN];

export function formatDuration(ms) {
  if (ms == null) return null;
  const hours = ms / (1000 * 60 * 60);
  if (hours < 24) return `${hours.toFixed(1)} hrs`;
  return `${(hours / 24).toFixed(1)} days`;
}

export function daysBetween(a, b) {
  return Math.max(0, (b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

// Stage-entry activity markers — the exact message logged in ComplaintsContext.jsx the moment
// a complaint's stageIndex advances onto that stage. This lets "time in stage" be derived
// purely from activityLog timestamps without inventing any stage vocabulary of its own —
// STAGE_ORDER / STAGE_LABELS stay the single source of truth for stage names.
const STAGE_ENTRY_MARKERS = {
  case_created: 'Complaint number assigned',
  admissibility_check: 'Admissibility check decision added',
  assigned_dept: 'Complaint assigned to department',
  assigned_supervisor: 'Complaint assigned to a supervisor',
};

function findEntry(sortedLog, marker) {
  return sortedLog.find((entry) => entry.message.includes(marker));
}

export function computeStageTimings(complaints) {
  const trackedStages = Object.keys(STAGE_ENTRY_MARKERS);
  const samples = {};
  trackedStages.forEach((key) => { samples[key] = []; });

  complaints.forEach((complaint) => {
    const sorted = [...complaint.activityLog].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    trackedStages.forEach((key, i) => {
      const startEntry = findEntry(sorted, STAGE_ENTRY_MARKERS[key]);
      const nextMarker = STAGE_ENTRY_MARKERS[trackedStages[i + 1]];
      const endEntry = nextMarker ? findEntry(sorted, nextMarker) : null;
      if (startEntry && endEntry) {
        const ms = new Date(endEntry.timestamp) - new Date(startEntry.timestamp);
        if (ms >= 0) samples[key].push(ms);
      }
    });
  });

  const avgFor = (key) => (samples[key].length ? samples[key].reduce((a, b) => a + b, 0) / samples[key].length : null);
  const maxAvg = Math.max(1, ...trackedStages.map((key) => avgFor(key) || 0));

  return STAGE_ORDER.map((key) => {
    const avgMs = trackedStages.includes(key) ? avgFor(key) : null;
    const sampleCount = trackedStages.includes(key) ? samples[key].length : 0;
    return {
      key,
      label: STAGE_LABELS[key],
      avgMs,
      percent: avgMs ? Math.round((avgMs / maxAvg) * 100) : 0,
      displayValue: avgMs ? `${formatDuration(avgMs)} (${sampleCount} case${sampleCount === 1 ? '' : 's'})` : 'No data yet',
    };
  });
}

// Volume + average resolution time for each entity (office/department/officer) — the caller
// picks which roster and which complaint field links a complaint to it, so this same function
// drives office performance, department performance, and per-team-member workload alike.
export function computePerformance(complaints, entities, keyField) {
  const now = new Date();
  return entities
    .map((entity) => {
      const matching = complaints.filter((c) => c[keyField] === entity.id);
      const closed = matching.filter((c) => c.subStatus === SUB_STATUS.CLOSED);
      let avgResolutionMs = null;
      if (closed.length) {
        const total = closed.reduce((sum, c) => {
          const sorted = [...c.activityLog].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          const lastEntry = sorted[0];
          const resolvedAt = lastEntry ? new Date(lastEntry.timestamp) : now;
          return sum + (resolvedAt - new Date(c.dateFiled));
        }, 0);
        avgResolutionMs = total / closed.length;
      }
      return {
        id: entity.id,
        name: entity.name,
        volume: matching.length,
        resolutionLabel: avgResolutionMs != null ? formatDuration(avgResolutionMs) : 'No resolved cases yet',
      };
    })
    .sort((a, b) => b.volume - a.volume);
}

// Generic tally, sorted by count descending — the shared engine behind categoryBreakdown and
// statusBreakdown below, plus anything else that needs a "count + percent of total, by key" list.
export function tally(rows, keyFn, labelFn) {
  const counts = {};
  rows.forEach((row) => {
    const key = keyFn(row);
    if (!key) return;
    counts[key] = (counts[key] || 0) + 1;
  });
  const total = rows.length || 1;
  return Object.entries(counts)
    .map(([key, count]) => ({ key, label: labelFn(key), count, percent: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count);
}

export function categoryBreakdown(complaints) {
  return tally(complaints, (c) => c.category, (key) => CATEGORY_LABELS[key] || key);
}

export function statusBreakdown(complaints) {
  return tally(complaints, (c) => c.subStatus, (key) => getSubStatusMeta(key).label);
}

export function monthlyCountsForYear(complaints, year) {
  const counts = new Array(12).fill(0);
  complaints.forEach((c) => {
    const d = new Date(c.dateFiled);
    if (d.getFullYear() === year) counts[d.getMonth()] += 1;
  });
  return MONTH_LABELS.map((label, i) => ({ label, value: counts[i] }));
}

// The "current" year the trend widget compares against — for "Last Year" this shifts the whole
// comparison back a year too, so the widget stays meaningful for whatever period is selected
// instead of always anchoring to the real calendar year. For the open-ended periods it anchors
// to the most recent year actually present in the data instead of the real calendar year, so
// the comparison stays meaningful even against an older seeded dataset.
export function comparisonYearFor(period, complaints) {
  const now = new Date();
  if (period === 'this_year') return now.getFullYear();
  if (period === 'last_year') return now.getFullYear() - 1;
  const years = complaints.map((c) => new Date(c.dateFiled).getFullYear()).filter((y) => !Number.isNaN(y));
  return years.length ? Math.max(...years) : now.getFullYear();
}

// Which single year a Report's "Monthly Volume" chart should show all 12 months of — reuses
// comparisonYearFor's fallback for the open-ended periods, but a Specific Month report anchors
// to the exact year picked (not "most recent year in the whole dataset"), and a Custom Range
// anchors to the start date's year, so the chart always lines up with what was actually filtered.
export function resolveReportYear(filters, complaints) {
  if (filters.period === 'specific_month' && filters.year != null) return Number(filters.year);
  if (filters.period === 'custom' && filters.customStart) return new Date(filters.customStart).getFullYear();
  return comparisonYearFor(filters.period, complaints);
}

// All-time (period-independent) count of a user's own scoped complaints filed since they
// joined — "how long have I been doing this and how much have I handled," not a filtered slice.
export function computeHandledSince(scopedComplaints, joinedDate) {
  if (!joinedDate) return null;
  const since = new Date(joinedDate);
  return scopedComplaints.filter((c) => new Date(c.dateFiled) >= since).length;
}

export function formatMonthYear(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`;
}

// Hoisted from ESDashboardPage.jsx's own inline predicates — the Executive Secretary's
// escalation/council stat cluster, reused on both BI and Reports instead of re-deriving it.
export function computeEsStats(complaints) {
  return {
    escalated: complaints.filter((c) => c.esEscalation?.escalated && !c.esEscalation.resolved).length,
    readyForCouncil: complaints.filter((c) => c.subStatus === SUB_STATUS.READY_FOR_COUNCIL).length,
    inadmissiblePending: complaints.filter((c) => c.subStatus === SUB_STATUS.INADMISSIBLE).length,
  };
}

export function csvEscape(value) {
  const str = String(value ?? '');
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}
