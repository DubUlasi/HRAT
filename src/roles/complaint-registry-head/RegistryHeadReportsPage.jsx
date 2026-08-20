import React, { useState } from 'react';
import { FileBarChart, Download } from 'lucide-react';
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
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { SUB_STATUS, getSubStatusMeta } from '../../constants/complaintStatus';
import { CATEGORY_LABELS } from '../../constants/complaintCategories';
import { offices } from '../../data/mockOfficers';
import { PERIOD_OPTIONS, withinPeriod } from '../../constants/reportPeriods';
import { usePagination } from '../../hooks/usePagination';
import { registryHeadNavItems, registryHeadUser } from './navConfig';
import { ROLE_NAV_ITEMS, ROLE_COMPLAINT_DETAIL_BASE } from '../roleNavMap';
import { scopeComplaintsForUser } from '../scopeComplaints';

const DEFAULT_FILTERS = { period: 'all', category: 'all', status: 'all', office: 'all', customStart: '', customEnd: '' };

function applyFilters(complaints, filters) {
  return complaints.filter((c) => {
    if (!withinPeriod(c.dateFiled, filters.period, { start: filters.customStart, end: filters.customEnd })) return false;
    if (filters.category !== 'all' && c.category !== filters.category) return false;
    if (filters.status !== 'all' && c.subStatus !== filters.status) return false;
    if (filters.office !== 'all' && c.office !== filters.office) return false;
    return true;
  });
}

function tally(rows, keyFn, labelFn) {
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

function csvEscape(value) {
  const str = String(value ?? '');
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
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
  const periodSlug = filters.period === 'custom' ? `${filters.customStart || 'any'}_to_${filters.customEnd || 'any'}` : filters.period;
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
  const complaints = scopeComplaintsForUser(allComplaints, user);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [report, setReport] = useState(null);

  const patchFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const handleGenerate = () => {
    setReport({ rows: applyFilters(complaints, filters), filters: { ...filters }, generatedAt: Date.now() });
  };

  const pagination = usePagination(report?.rows || [], 10, report?.generatedAt);

  return (
    <AppShell navItems={navItems} user={user || registryHeadUser}>
      <PageHeader
        title="Reports"
        subtitle="Build a custom report from whatever combination of filters you need, then download it."
      />

      <div className="filter-toolbar filter-toolbar-fill">
        <FormField label="Period">
          <Select value={filters.period} onChange={(e) => patchFilter('period', e.target.value)}>
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </FormField>
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
              <div className="dashboard-grid">
                <BreakdownList
                  title="By Category"
                  rows={tally(report.rows, (c) => c.category, (key) => CATEGORY_LABELS[key] || key)}
                />
                <BreakdownList
                  title="By Status"
                  rows={tally(report.rows, (c) => c.subStatus, (key) => getSubStatusMeta(key).label)}
                />
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
