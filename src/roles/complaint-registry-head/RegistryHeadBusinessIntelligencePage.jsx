import React, { useMemo, useState } from 'react';
import { Download, AlertOctagon } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Select from '../../components/ui/Select';
import BreakdownList from '../../components/dashboard/BreakdownList';
import OfficePerformanceTable from '../../components/dashboard/OfficePerformanceTable';
import TrendComparisonCard from '../../components/dashboard/TrendComparisonCard';
import OffenderCaseHistoryDrawer from '../../components/complaints/OffenderCaseHistoryDrawer';
import { useComplaints } from '../../context/ComplaintsContext';
import { STAGE_ORDER, STAGE_LABELS, SUB_STATUS, getSubStatusMeta, stageProgressPercent } from '../../constants/complaintStatus';
import { CATEGORY_LABELS } from '../../constants/complaintCategories';
import { offices, departments } from '../../data/mockOfficers';
import { PERIOD_OPTIONS, withinPeriod } from '../../constants/reportPeriods';
import { registryHeadNavItems, registryHeadUser } from './navConfig';

const INACTIVE_STATUSES = [SUB_STATUS.CLOSED, SUB_STATUS.INADMISSIBLE, SUB_STATUS.WITHDRAWN];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// The "current" year the trend widget compares against — for "Last Year" this shifts the
// whole comparison back a year too, so the widget stays meaningful for whatever period is
// selected instead of always anchoring to the real calendar year. For the open-ended periods
// ("All Time", "Last 30/90 Days") it anchors to the most recent year actually present in the
// data instead of the real calendar year, so the comparison stays meaningful even against an
// older seeded dataset rather than showing two empty years.
function comparisonYearFor(period, complaints) {
  const now = new Date();
  if (period === 'this_year') return now.getFullYear();
  if (period === 'last_year') return now.getFullYear() - 1;
  const years = complaints.map((c) => new Date(c.dateFiled).getFullYear()).filter((y) => !Number.isNaN(y));
  return years.length ? Math.max(...years) : now.getFullYear();
}

function monthlyCountsForYear(complaints, year) {
  const counts = new Array(12).fill(0);
  complaints.forEach((c) => {
    const d = new Date(c.dateFiled);
    if (d.getFullYear() === year) counts[d.getMonth()] += 1;
  });
  return MONTH_LABELS.map((label, i) => ({ label, value: counts[i] }));
}

function formatDuration(ms) {
  if (ms == null) return null;
  const hours = ms / (1000 * 60 * 60);
  if (hours < 24) return `${hours.toFixed(1)} hrs`;
  return `${(hours / 24).toFixed(1)} days`;
}

function daysBetween(a, b) {
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

function computeStageTimings(complaints) {
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

function computePerformance(complaints, entities, keyField) {
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

function categoryBreakdown(complaints) {
  const counts = {};
  complaints.forEach((c) => {
    counts[c.category] = (counts[c.category] || 0) + 1;
  });
  const total = complaints.length || 1;
  return Object.entries(counts).map(([key, count]) => ({
    key,
    label: CATEGORY_LABELS[key] || key,
    count,
    percent: Math.round((count / total) * 100),
  }));
}

function statusBreakdown(complaints) {
  const counts = {};
  complaints.forEach((c) => {
    counts[c.subStatus] = (counts[c.subStatus] || 0) + 1;
  });
  const total = complaints.length || 1;
  return Object.entries(counts)
    .map(([key, count]) => ({ key, label: getSubStatusMeta(key).label, count, percent: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count);
}

function csvEscape(value) {
  const str = String(value ?? '');
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function exportCsv(complaints, period) {
  const headers = ['Subject', 'Category', 'Status', 'Stage', 'Date Filed', 'Office', 'Department'];
  const rows = complaints.map((c) => [
    c.subject,
    CATEGORY_LABELS[c.category] || c.category,
    getSubStatusMeta(c.subStatus).label,
    c.stageIndex >= 0 ? STAGE_LABELS[STAGE_ORDER[c.stageIndex]] : 'Not Started',
    c.dateFiled,
    offices.find((o) => o.id === c.office)?.name || '',
    departments.find((d) => d.id === c.department)?.name || '',
  ]);

  const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `hrat-business-intelligence-${period}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function RegistryHeadBusinessIntelligencePage() {
  const { complaints, getRepeatOffenders } = useComplaints();
  const [period, setPeriod] = useState('all');
  const [historyComplaintId, setHistoryComplaintId] = useState(null);

  const repeatOffenders = useMemo(() => getRepeatOffenders(), [getRepeatOffenders]);
  const topRepeatOffenders = repeatOffenders.slice(0, 3);

  const filtered = useMemo(
    () => complaints.filter((c) => withinPeriod(c.dateFiled, period)),
    [complaints, period]
  );

  const pendingCount = filtered.filter((c) => !INACTIVE_STATUSES.includes(c.subStatus)).length;
  const resolvedCount = filtered.filter((c) => c.subStatus === SUB_STATUS.CLOSED).length;
  const activeOffices = new Set(filtered.map((c) => c.office).filter(Boolean)).size;

  const decided = filtered.filter((c) => c.admissibility.decision);
  const admissibleCount = decided.filter((c) => c.admissibility.decision === 'ADMISSIBLE').length;
  const admissibleRate = decided.length ? Math.round((admissibleCount / decided.length) * 100) : 0;

  const avgProgress = filtered.length
    ? Math.round(filtered.reduce((sum, c) => sum + stageProgressPercent(c.stageIndex), 0) / filtered.length)
    : 0;

  const avgCaseAgeDays = useMemo(() => {
    if (!filtered.length) return 0;
    const now = new Date();
    const total = filtered.reduce((sum, c) => sum + daysBetween(new Date(c.dateFiled), now), 0);
    return Math.round(total / filtered.length);
  }, [filtered]);

  const stageTimings = useMemo(() => computeStageTimings(filtered), [filtered]);
  const admissibilityTiming = stageTimings.find((row) => row.key === 'admissibility_check');
  const pipelineStatusRows = useMemo(() => statusBreakdown(filtered), [filtered]);

  const officePerformance = useMemo(() => computePerformance(filtered, offices, 'office'), [filtered]);
  const departmentPerformance = useMemo(() => computePerformance(filtered, departments, 'department'), [filtered]);

  const comparisonYear = comparisonYearFor(period, complaints);
  const currentYearTrend = useMemo(() => monthlyCountsForYear(complaints, comparisonYear), [complaints, comparisonYear]);
  const previousYearTrend = useMemo(() => monthlyCountsForYear(complaints, comparisonYear - 1), [complaints, comparisonYear]);

  return (
    <AppShell navItems={registryHeadNavItems} user={registryHeadUser}>
      <PageHeader
        title="Business Intelligence"
        subtitle="Registry-wide trends, cycle times, office/department performance, and period-over-period trends."
        actions={
          <Button variant="secondary" icon={Download} onClick={() => exportCsv(filtered, period)}>
            Export Report
          </Button>
        }
      />

      <div className="bi-filter-row">
        <FormField label="Period">
          <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Complaints In Period</h3>
          <div className="value">{filtered.length}</div>
        </div>
        <div className="stat-card">
          <h3>Pending In Period</h3>
          <div className="value">{pendingCount}</div>
        </div>
        <div className="stat-card">
          <h3>Avg. Case Age</h3>
          <div className="value">{avgCaseAgeDays}d</div>
        </div>
        <div className="stat-card">
          <h3>Active Offices</h3>
          <div className="value">{activeOffices}</div>
        </div>
        <div className="stat-card">
          <h3>Avg. Admissibility Turnaround</h3>
          <div className="value">{admissibilityTiming?.avgMs != null ? formatDuration(admissibilityTiming.avgMs) : '—'}</div>
        </div>
        <div className="stat-card">
          <h3>Resolved In Period</h3>
          <div className="value">{resolvedCount}</div>
        </div>
        <div className="stat-card">
          <h3>Admissible Rate</h3>
          <div className="value">{admissibleRate}%</div>
        </div>
        <div className="stat-card">
          <h3>Avg. Pipeline Progress</h3>
          <div className="value">{avgProgress}%</div>
        </div>
      </div>

      <div className="stat-card repeat-offenders-teaser">
        <div className="repeat-offenders-teaser-header">
          <div>
            <h3><AlertOctagon size={13} /> Repeat Offenders Flagged</h3>
            <div className="value">{repeatOffenders.length}</div>
          </div>
          <Button variant="secondary" to="/registry-head/repeat-offenders">View All</Button>
        </div>
        {topRepeatOffenders.length > 0 && (
          <ul className="repeat-offenders-preview-list">
            {topRepeatOffenders.map((offender) => (
              <li key={offender.id}>
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => setHistoryComplaintId(offender.anchorComplaintId)}
                >
                  {offender.name}
                </button>
                <span>{offender.complaintCount} complaints</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <TrendComparisonCard
        title="Complaints Filed, Year-over-Year Trend"
        currentLabel={String(comparisonYear)}
        previousLabel={String(comparisonYear - 1)}
        data={currentYearTrend}
        compareData={previousYearTrend}
      />

      <div className="dashboard-grid">
        <BreakdownList title="Average Time In Stage" rows={stageTimings} />
        <BreakdownList title="Complaints By Category" rows={categoryBreakdown(filtered)} />
      </div>

      <div className="dashboard-grid">
        <BreakdownList title="Pipeline Status Breakdown" rows={pipelineStatusRows} />
        <OfficePerformanceTable title="Office Performance" rows={officePerformance} />
      </div>

      <OfficePerformanceTable title="Department Performance" rows={departmentPerformance} />

      <OffenderCaseHistoryDrawer
        open={!!historyComplaintId}
        onClose={() => setHistoryComplaintId(null)}
        complaintId={historyComplaintId}
      />
    </AppShell>
  );
}
