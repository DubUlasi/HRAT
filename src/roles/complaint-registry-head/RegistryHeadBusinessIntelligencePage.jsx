import React, { useMemo, useState } from 'react';
import { Download, AlertOctagon, FileText, Clock, CalendarClock, Building2, Timer, CheckCircle2, ShieldCheck, TrendingUp, Award } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import BreakdownList from '../../components/dashboard/BreakdownList';
import OfficePerformanceTable from '../../components/dashboard/OfficePerformanceTable';
import TrendComparisonCard from '../../components/dashboard/TrendComparisonCard';
import ChartCard from '../../components/dashboard/ChartCard';
import ComplaintsDoughnutChart from '../../components/charts/ComplaintsDoughnutChart';
import Pagination from '../../components/ui/Pagination';
import OffenderCaseHistoryDrawer from '../../components/complaints/OffenderCaseHistoryDrawer';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { STAGE_ORDER, STAGE_LABELS, SUB_STATUS, getSubStatusMeta, stageProgressPercent } from '../../constants/complaintStatus';
import { CATEGORY_LABELS } from '../../constants/complaintCategories';
import { offices, departments } from '../../data/mockOfficers';
import { PERIOD_OPTIONS, MONTH_OPTIONS, getAvailableYears, withinPeriod } from '../../constants/reportPeriods';
import { usePagination } from '../../hooks/usePagination';
import { registryHeadNavItems, registryHeadUser } from './navConfig';
import { ROLE_NAV_ITEMS } from '../roleNavMap';
import { scopeComplaintsForUser, scopeRepeatOffendersForUser, REPEAT_VIOLATOR_ROLES } from '../scopeComplaints';
import { getBiRoleConfig } from '../biRoleConfig';
import {
  INACTIVE_STATUSES,
  formatDuration,
  daysBetween,
  computeStageTimings,
  computePerformance,
  categoryBreakdown,
  statusBreakdown,
  monthlyCountsForYear,
  comparisonYearFor,
  computeHandledSince,
  formatMonthYear,
  csvEscape,
} from '../biReportsHelpers';

function exportCsv(complaints, period, customRange) {
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
  const periodSlug = period === 'custom' ? `${customRange?.start || 'any'}_to_${customRange?.end || 'any'}` : period;
  link.download = `hrat-business-intelligence-${periodSlug}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function RegistryHeadBusinessIntelligencePage() {
  const { user } = useAuth();
  const navItems = ROLE_NAV_ITEMS[user?.role] || registryHeadNavItems;
  const { complaints: allComplaints, getRepeatOffenders } = useComplaints();
  const complaints = useMemo(() => scopeComplaintsForUser(allComplaints, user), [allComplaints, user]);
  const config = useMemo(() => getBiRoleConfig(user), [user]);
  const [period, setPeriod] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(() => getAvailableYears(complaints)[0]);
  const [historyComplaintId, setHistoryComplaintId] = useState(null);

  const canSeeRepeatViolators = REPEAT_VIOLATOR_ROLES.includes(user?.role);
  const repeatOffenders = useMemo(
    () => (canSeeRepeatViolators ? scopeRepeatOffendersForUser(getRepeatOffenders(), user) : []),
    [getRepeatOffenders, user, canSeeRepeatViolators]
  );
  const topRepeatOffenders = repeatOffenders.slice(0, 3);

  const filtered = useMemo(
    () => complaints.filter((c) => withinPeriod(c.dateFiled, period, { start: customStart, end: customEnd, month, year })),
    [complaints, period, customStart, customEnd, month, year]
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
  const categoryRows = useMemo(() => categoryBreakdown(filtered), [filtered]);

  // Period-independent — always counts against the full role-scoped history, not the Period
  // filter above, since the point is "how long have I been doing this," not a filtered slice.
  const handledSince = config.showHandledSinceStat ? computeHandledSince(complaints, user?.joinedDate) : null;
  const handledSinceLabel = formatMonthYear(user?.joinedDate);

  const officePerformance = useMemo(() => computePerformance(filtered, offices, 'office'), [filtered]);
  const departmentPerformance = useMemo(() => computePerformance(filtered, departments, 'department'), [filtered]);
  const officePagination = usePagination(officePerformance, 10, `${period}|${customStart}|${customEnd}|${month}|${year}`);
  const departmentPagination = usePagination(departmentPerformance, 10, `${period}|${customStart}|${customEnd}|${month}|${year}`);

  const comparisonYear = comparisonYearFor(period, complaints);
  const currentYearTrend = useMemo(() => monthlyCountsForYear(complaints, comparisonYear), [complaints, comparisonYear]);
  const previousYearTrend = useMemo(() => monthlyCountsForYear(complaints, comparisonYear - 1), [complaints, comparisonYear]);

  return (
    <AppShell navItems={navItems} user={user || registryHeadUser}>
      <PageHeader
        title="Business Intelligence"
        subtitle="Trends, cycle times, and performance for the complaints in your scope."
        actions={
          <Button variant="secondary" icon={Download} onClick={() => exportCsv(filtered, period, { start: customStart, end: customEnd })}>
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
        {period === 'specific_month' && (
          <>
            <FormField label="Month">
              <Select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {MONTH_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Year">
              <Select value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {getAvailableYears(complaints).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </Select>
            </FormField>
          </>
        )}
        {period === 'custom' && (
          <>
            <FormField label="From">
              <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
            </FormField>
            <FormField label="To">
              <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
            </FormField>
          </>
        )}
      </div>

      <div className="stats-grid bi-stats-grid">
        <div className="stat-card accent-info">
          <div className="stat-card-icon"><FileText size={16} /></div>
          <h3>Complaints In Period</h3>
          <div className="value">{filtered.length}</div>
        </div>
        <div className="stat-card accent-warning">
          <div className="stat-card-icon"><Clock size={16} /></div>
          <h3>Pending In Period</h3>
          <div className="value">{pendingCount}</div>
        </div>
        <div className="stat-card accent-violet">
          <div className="stat-card-icon"><CalendarClock size={16} /></div>
          <h3>Avg. Case Age</h3>
          <div className="value">{avgCaseAgeDays}d</div>
        </div>
        {config.showActiveOfficesStat && (
          <div className="stat-card accent-accent">
            <div className="stat-card-icon"><Building2 size={16} /></div>
            <h3>Active Offices</h3>
            <div className="value">{activeOffices}</div>
          </div>
        )}
        {config.showAdmissibilityStats && (
          <div className="stat-card accent-info">
            <div className="stat-card-icon"><Timer size={16} /></div>
            <h3>Avg. Admissibility Turnaround</h3>
            <div className="value">{admissibilityTiming?.avgMs != null ? formatDuration(admissibilityTiming.avgMs) : '—'}</div>
          </div>
        )}
        <div className="stat-card accent-accent">
          <div className="stat-card-icon"><CheckCircle2 size={16} /></div>
          <h3>Resolved In Period</h3>
          <div className="value">{resolvedCount}</div>
        </div>
        {config.showAdmissibilityStats && (
          <div className="stat-card accent-accent">
            <div className="stat-card-icon"><ShieldCheck size={16} /></div>
            <h3>Admissible Rate</h3>
            <div className="value">{admissibleRate}%</div>
          </div>
        )}
        <div className="stat-card accent-violet">
          <div className="stat-card-icon"><TrendingUp size={16} /></div>
          <h3>Avg. Pipeline Progress</h3>
          <div className="value">{avgProgress}%</div>
        </div>
        {config.showHandledSinceStat && handledSince != null && (
          <div className="stat-card accent-accent">
            <div className="stat-card-icon"><Award size={16} /></div>
            <h3>{handledSinceLabel ? `Cases Handled Since ${handledSinceLabel}` : 'Cases Handled'}</h3>
            <div className="value">{handledSince}</div>
          </div>
        )}
      </div>

      {canSeeRepeatViolators && (
        <div className="stat-card accent-danger repeat-offenders-teaser">
          <div className="repeat-offenders-teaser-header">
            <div>
              <h3><AlertOctagon size={13} /> Repeat Violators Flagged</h3>
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
      )}

      <TrendComparisonCard
        title={config.trend.title}
        currentLabel={String(comparisonYear)}
        previousLabel={String(comparisonYear - 1)}
        data={currentYearTrend}
        compareData={previousYearTrend}
      />

      <div className="dashboard-grid">
        <BreakdownList title="Complaints By Category" rows={categoryRows} fillHeight />
        <ChartCard title="Category Distribution"><ComplaintsDoughnutChart rows={categoryRows} /></ChartCard>
      </div>

      <div className="dashboard-grid">
        <BreakdownList title="Pipeline Status Breakdown" rows={pipelineStatusRows} fillHeight />
        <ChartCard title="Status Distribution"><ComplaintsDoughnutChart rows={pipelineStatusRows} /></ChartCard>
      </div>

      {config.showStageTimings && (
        <BreakdownList title="Average Time In Stage" rows={stageTimings} />
      )}

      {config.teams.length > 0 && (
        <div className="dashboard-grid">
          {config.teams.map((team) => (
            <OfficePerformanceTable
              key={team.label}
              title={team.label}
              rows={computePerformance(filtered, team.entities, team.keyField)}
            />
          ))}
        </div>
      )}

      {config.showOrgPerformance && (
        <>
          <div>
            <OfficePerformanceTable title="Office Performance" rows={officePagination.pageItems} />
            <Pagination
              page={officePagination.page}
              pageCount={officePagination.pageCount}
              pageSize={officePagination.pageSize}
              totalItems={officePagination.totalItems}
              onPageChange={officePagination.setPage}
              onPageSizeChange={officePagination.setPageSize}
            />
          </div>

          <div>
            <OfficePerformanceTable title="Department Performance" rows={departmentPagination.pageItems} />
            <Pagination
              page={departmentPagination.page}
              pageCount={departmentPagination.pageCount}
              pageSize={departmentPagination.pageSize}
              totalItems={departmentPagination.totalItems}
              onPageChange={departmentPagination.setPage}
              onPageSizeChange={departmentPagination.setPageSize}
            />
          </div>
        </>
      )}

      <OffenderCaseHistoryDrawer
        open={!!historyComplaintId}
        onClose={() => setHistoryComplaintId(null)}
        complaintId={historyComplaintId}
      />
    </AppShell>
  );
}
