import React from 'react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import ComplaintsAnalysisChart from '../../components/dashboard/ComplaintsAnalysisChart';
import BreakdownList from '../../components/dashboard/BreakdownList';
import { useComplaints } from '../../context/ComplaintsContext';
import { SUB_STATUS, getSubStatusMeta, stageProgressPercent } from '../../constants/complaintStatus';
import { CATEGORY_LABELS } from '../../constants/complaintCategories';
import { offices } from '../../data/mockOfficers';
import { registryHeadNavItems, registryHeadUser } from './navConfig';

const INACTIVE_STATUSES = [SUB_STATUS.CLOSED, SUB_STATUS.INADMISSIBLE, SUB_STATUS.WITHDRAWN];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function monthlyComplaintCounts(complaints) {
  const counts = new Array(12).fill(0);
  complaints.forEach((c) => {
    const monthIndex = new Date(c.dateFiled).getMonth();
    counts[monthIndex] += 1;
  });
  return MONTH_LABELS.map((label, i) => ({ label, value: counts[i] }));
}

function breakdownBy(complaints, keyFn, labelFn) {
  const counts = {};
  complaints.forEach((c) => {
    const key = keyFn(c);
    if (!key) return;
    counts[key] = (counts[key] || 0) + 1;
  });
  const total = complaints.length || 1;
  return Object.entries(counts)
    .map(([key, count]) => ({ key, label: labelFn(key), count, percent: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count);
}

export default function RegistryHeadAnalyticsPage() {
  const { complaints } = useComplaints();

  const resolvedCount = complaints.filter((c) => c.subStatus === SUB_STATUS.CLOSED).length;
  const pendingCount = complaints.filter((c) => !INACTIVE_STATUSES.includes(c.subStatus)).length;

  const decided = complaints.filter((c) => c.admissibility.decision);
  const admissibleCount = decided.filter((c) => c.admissibility.decision === 'ADMISSIBLE').length;
  const admissibleRate = decided.length ? Math.round((admissibleCount / decided.length) * 100) : 0;

  const avgProgress = complaints.length
    ? Math.round(complaints.reduce((sum, c) => sum + stageProgressPercent(c.stageIndex), 0) / complaints.length)
    : 0;

  const chartData = monthlyComplaintCounts(complaints);
  const categoryRows = breakdownBy(complaints, (c) => c.category, (key) => CATEGORY_LABELS[key] || key);
  const statusRows = breakdownBy(complaints, (c) => c.subStatus, (key) => getSubStatusMeta(key).label);
  const officeRows = breakdownBy(
    complaints,
    (c) => c.office,
    (key) => offices.find((o) => o.id === key)?.name || key
  );

  return (
    <AppShell navItems={registryHeadNavItems} user={registryHeadUser}>
      <PageHeader title="Analytics" subtitle="Registry-wide trends across every complaint in the pipeline." />

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Complaints</h3>
          <div className="value">{complaints.length}</div>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <div className="value">{pendingCount}</div>
        </div>
        <div className="stat-card">
          <h3>Resolved</h3>
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

      <div className="dashboard-grid">
        <ComplaintsAnalysisChart data={chartData} />
        <BreakdownList title="Complaints Categories" rows={categoryRows} />
      </div>

      <div className="dashboard-grid">
        <BreakdownList title="Pipeline Status Breakdown" rows={statusRows} />
        <BreakdownList
          title="Complaints By Office"
          rows={officeRows.length ? officeRows : [{ key: 'none', label: 'Not yet assigned to an office', count: 0, percent: 0 }]}
        />
      </div>
    </AppShell>
  );
}
