import React, { useMemo, useState } from 'react';
import { FileBarChart, Download, Award, AlertOctagon, Gavel, AlertTriangle, Inbox, ShieldCheck, Send, ClipboardCheck } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import ComplaintsTable from '../../components/ui/ComplaintsTable';
import Pagination from '../../components/ui/Pagination';
import BreakdownList from '../../components/dashboard/BreakdownList';
import ChartCard from '../../components/dashboard/ChartCard';
import ComplaintsBarChart from '../../components/charts/ComplaintsBarChart';
import ComplaintsDoughnutChart from '../../components/charts/ComplaintsDoughnutChart';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { SUB_STATUS, getSubStatusMeta } from '../../constants/complaintStatus';
import { CATEGORY_LABELS } from '../../constants/complaintCategories';
import { offices } from '../../data/mockOfficers';
import { PERIOD_OPTIONS, MONTH_OPTIONS, getAvailableYears, withinPeriod } from '../../constants/reportPeriods';
import { usePagination } from '../../hooks/usePagination';
import { registryHeadNavItems, registryHeadUser } from './navConfig';
import { ROLE_NAV_ITEMS, ROLE_COMPLAINT_DETAIL_BASE } from '../roleNavMap';
import { scopeComplaintsForUser } from '../scopeComplaints';
import { getBiRoleConfig } from '../biRoleConfig';
import {
  categoryBreakdown,
  statusBreakdown,
  monthlyCountsForYear,
  resolveReportYear,
  computePerformance,
  computeHandledSince,
  formatMonthYear,
  computeEsStats,
  csvEscape,
} from '../biReportsHelpers';
import { needsNumberAssignment, needsAdmissibilityAssignment, needsDepartmentAssignment, needsSendToCouncil } from './registryHeadQueue';

const DEFAULT_FILTERS = { period: 'all', category: 'all', status: 'all', office: 'all', customStart: '', customEnd: '', month: new Date().getMonth(), year: null };

function applyFilters(complaints, filters) {
  return complaints.filter((c) => {
    if (!withinPeriod(c.dateFiled, filters.period, { start: filters.customStart, end: filters.customEnd, month: filters.month, year: filters.year })) return false;
    if (filters.category !== 'all' && c.category !== filters.category) return false;
    if (filters.status !== 'all' && c.subStatus !== filters.status) return false;
    if (filters.office !== 'all' && c.office !== filters.office) return false;
    return true;
  });
}

function downloadCsv(rows, filters) {
  const headers = ['Subject', 'Category', 'Status', 'Victim', 'Alleged Violator', 'Office', 'Date Filed'];
  const csvRows = rows.map((c) => [
    c.subject,
    CATEGORY_LABELS[c.category] || c.category,
    getSubStatusMeta(c.subStatus).label,
    c.victim?.name || '',
    c.allegedViolator?.name || '',
    offices.find((o) => o.id === c.office)?.name || '',
    c.dateFiled,
  ]);
  const csv = [headers, ...csvRows].map((row) => row.map(csvEscape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const periodSlug = filters.period === 'custom'
    ? `${filters.customStart || 'any'}_to_${filters.customEnd || 'any'}`
    : filters.period === 'specific_month'
      ? `${filters.year}-${String(filters.month + 1).padStart(2, '0')}`
      : filters.period;
  link.download = `hrat-report-${periodSlug}-${filters.category}-${filters.status}-${filters.office}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// A self-serve report builder: pick any combination of filters, Generate to snapshot a
// preview (so the results don't shift under you while you're still adjusting filters),
// then Download to export that exact snapshot as CSV.
export default function RegistryHeadReportsPage() {
  const { user } = useAuth();
  const navItems = ROLE_NAV_ITEMS[user?.role] || registryHeadNavItems;
  const detailBase = ROLE_COMPLAINT_DETAIL_BASE[user?.role] || '/registry-head/complaints';
  const { complaints: allComplaints } = useComplaints();
  const complaints = useMemo(() => scopeComplaintsForUser(allComplaints, user), [allComplaints, user]);
  const config = useMemo(() => getBiRoleConfig(user), [user]);
  const [filters, setFilters] = useState(() => ({ ...DEFAULT_FILTERS, year: getAvailableYears(complaints)[0] }));
  const [report, setReport] = useState(null);

  const patchFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const handleGenerate = () => {
    setReport({ rows: applyFilters(complaints, filters), filters: { ...filters }, generatedAt: Date.now() });
  };

  const pagination = usePagination(report?.rows || [], 10, report?.generatedAt);

  // Standing personal facts, always current — computed off the full role-scoped data, not the
  // report filters above, so they answer "how many cases, who has them, since when" regardless
  // of whatever report someone's currently building.
  const handledSince = config.showHandledSinceStat ? computeHandledSince(complaints, user?.joinedDate) : null;
  const handledSinceLabel = formatMonthYear(user?.joinedDate);
  const esStats = config.showEsStats ? computeEsStats(complaints) : null;
  const headQueueStats = config.showRegistryHeadQueueStats
    ? {
      awaitingNumber: complaints.filter(needsNumberAssignment).length,
      awaitingAdmissibility: complaints.filter(needsAdmissibilityAssignment).length,
      awaitingDepartment: complaints.filter(needsDepartmentAssignment).length,
      readyForCouncil: complaints.filter(needsSendToCouncil).length,
    }
    : null;

  // Always all 12 months of one year (zero-filled), not just the months that happened to have
  // data — the year itself tracks whatever period/month/year filter the report was generated
  // with, so regenerating with a different filter recomputes both the year and the bars.
  const reportYear = useMemo(() => (report ? resolveReportYear(report.filters, complaints) : null), [report, complaints]);
  const monthlyVolume = useMemo(() => (report ? monthlyCountsForYear(report.rows, reportYear) : []), [report, reportYear]);
  const categoryRows = useMemo(() => (report ? categoryBreakdown(report.rows) : []), [report]);
  const statusRows = useMemo(() => (report ? statusBreakdown(report.rows) : []), [report]);

  // "Who has the cases" — org-wide by office for the two oversight roles, by team for
  // Director/Supervisor, omitted for solo roles (Desk Officer, Investigator) who have no team.
  const workloadCharts = useMemo(() => {
    if (!report) return [];
    if (config.showOrgPerformance) {
      return [{ label: 'Volume By Office', data: computePerformance(report.rows, offices, 'office').map((r) => ({ label: r.name, value: r.volume })) }];
    }
    return config.teams.map((team) => ({
      label: team.label,
      data: computePerformance(report.rows, team.entities, team.keyField).map((r) => ({ label: r.name, value: r.volume })),
    }));
  }, [report, config]);

  return (
    <AppShell navItems={navItems} user={user || registryHeadUser}>
      <PageHeader
        title="Reports"
        subtitle="Build a custom report from whatever combination of filters you need, then download it."
      />

      <div className="stats-grid">
        {config.showHandledSinceStat && handledSince != null && (
          <div className="stat-card accent-accent">
            <div className="stat-card-icon"><Award size={16} /></div>
            <h3>{handledSinceLabel ? `Cases Handled Since ${handledSinceLabel}` : 'Cases Handled'}</h3>
            <div className="value">{handledSince}</div>
          </div>
        )}
        {esStats && (
          <>
            <div className="stat-card accent-danger">
              <div className="stat-card-icon"><AlertOctagon size={16} /></div>
              <h3>Escalated To Me</h3>
              <div className="value">{esStats.escalated}</div>
            </div>
            <div className="stat-card accent-accent">
              <div className="stat-card-icon"><Gavel size={16} /></div>
              <h3>Ready For Council</h3>
              <div className="value">{esStats.readyForCouncil}</div>
            </div>
            <div className="stat-card accent-warning">
              <div className="stat-card-icon"><AlertTriangle size={16} /></div>
              <h3>Inadmissible Pending</h3>
              <div className="value">{esStats.inadmissiblePending}</div>
            </div>
          </>
        )}
        {headQueueStats && (
          <>
            <div className="stat-card accent-info">
              <div className="stat-card-icon"><Inbox size={16} /></div>
              <h3>Awaiting Number Assignment</h3>
              <div className="value">{headQueueStats.awaitingNumber}</div>
            </div>
            <div className="stat-card accent-warning">
              <div className="stat-card-icon"><ShieldCheck size={16} /></div>
              <h3>Awaiting Admissibility Assignment</h3>
              <div className="value">{headQueueStats.awaitingAdmissibility}</div>
            </div>
            <div className="stat-card accent-violet">
              <div className="stat-card-icon"><ClipboardCheck size={16} /></div>
              <h3>Awaiting Department Assignment</h3>
              <div className="value">{headQueueStats.awaitingDepartment}</div>
            </div>
            <div className="stat-card accent-accent">
              <div className="stat-card-icon"><Send size={16} /></div>
              <h3>Ready To Send To Council</h3>
              <div className="value">{headQueueStats.readyForCouncil}</div>
            </div>
          </>
        )}
      </div>

      <div className="filter-toolbar filter-toolbar-fill">
        <FormField label="Period">
          <Select value={filters.period} onChange={(e) => patchFilter('period', e.target.value)}>
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </FormField>
        {filters.period === 'specific_month' && (
          <>
            <FormField label="Month">
              <Select value={filters.month} onChange={(e) => patchFilter('month', Number(e.target.value))}>
                {MONTH_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Year">
              <Select value={filters.year} onChange={(e) => patchFilter('year', Number(e.target.value))}>
                {getAvailableYears(complaints).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </Select>
            </FormField>
          </>
        )}
        {filters.period === 'custom' && (
          <>
            <FormField label="From">
              <Input type="date" value={filters.customStart} onChange={(e) => patchFilter('customStart', e.target.value)} />
            </FormField>
            <FormField label="To">
              <Input type="date" value={filters.customEnd} onChange={(e) => patchFilter('customEnd', e.target.value)} />
            </FormField>
          </>
        )}
        <FormField label="Category">
          <Select value={filters.category} onChange={(e) => patchFilter('category', e.target.value)}>
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Status">
          <Select value={filters.status} onChange={(e) => patchFilter('status', e.target.value)}>
            <option value="all">All Statuses</option>
            {Object.values(SUB_STATUS).map((status) => (
              <option key={status} value={status}>{getSubStatusMeta(status).label}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Office">
          <Select value={filters.office} onChange={(e) => patchFilter('office', e.target.value)}>
            <option value="all">All Offices</option>
            {offices.map((office) => (
              <option key={office.id} value={office.id}>{office.name}</option>
            ))}
          </Select>
        </FormField>
        <Button variant="primary" icon={FileBarChart} onClick={handleGenerate}>
          Generate Report
        </Button>
      </div>

      {!report && (
        <EmptyState icon={FileBarChart} message="Choose your filters above and generate a report to see a preview here." />
      )}

      {report && (
        <>
          <div className="section-header-flex">
            <h2 className="report-preview-title">Report Preview ({report.rows.length} complaint{report.rows.length === 1 ? '' : 's'})</h2>
            <Button variant="secondary" icon={Download} onClick={() => downloadCsv(report.rows, report.filters)}>
              Download CSV
            </Button>
          </div>

          {report.rows.length === 0 ? (
            <EmptyState message="No complaints match these filters." />
          ) : (
            <>
              <ChartCard title={`Monthly Volume In This Report (${reportYear})`}>
                <ComplaintsBarChart data={monthlyVolume} />
              </ChartCard>

              {workloadCharts.length > 0 && (
                <div className={workloadCharts.length > 1 ? 'dashboard-grid' : undefined}>
                  {workloadCharts.map((chart) => (
                    <ChartCard key={chart.label} title={chart.label}>
                      <ComplaintsBarChart data={chart.data} orientation="horizontal" />
                    </ChartCard>
                  ))}
                </div>
              )}

              <div className="dashboard-grid">
                <BreakdownList title="By Category" rows={categoryRows} fillHeight />
                <ChartCard title="Category Distribution"><ComplaintsDoughnutChart rows={categoryRows} /></ChartCard>
              </div>
              <div className="dashboard-grid">
                <BreakdownList title="By Status" rows={statusRows} fillHeight />
                <ChartCard title="Status Distribution"><ComplaintsDoughnutChart rows={statusRows} /></ChartCard>
              </div>

              <ComplaintsTable
                complaints={pagination.pageItems}
                getActionHref={(c) => `${detailBase}/${c.id}`}
              />

              <Pagination
                page={pagination.page}
                pageCount={pagination.pageCount}
                pageSize={pagination.pageSize}
                totalItems={pagination.totalItems}
                onPageChange={pagination.setPage}
                onPageSizeChange={pagination.setPageSize}
              />
            </>
          )}
        </>
      )}
    </AppShell>
  );
}
