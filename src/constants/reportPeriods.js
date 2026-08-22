// Shared period-filter options, used by both the Business Intelligence and Reports pages.
export const PERIOD_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'last_30', label: 'Last 30 Days' },
  { value: 'last_90', label: 'Last 90 Days' },
  { value: 'this_year', label: 'This Year' },
  { value: 'last_year', label: 'Last Year' },
  { value: 'specific_month', label: 'Specific Month' },
  { value: 'custom', label: 'Custom Range' },
];

export const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTH_OPTIONS = MONTH_LABELS.map((label, value) => ({ value, label }));

// Unique years actually present in `dateFiled` across the given complaints, most recent first —
// populates the Year <Select> for the "Specific Month" filter so it never offers a year with no
// data in it.
export function getAvailableYears(complaints) {
  const years = new Set(complaints.map((c) => new Date(c.dateFiled).getFullYear()).filter((y) => !Number.isNaN(y)));
  years.add(new Date().getFullYear());
  return [...years].sort((a, b) => b - a);
}

// `customRange` carries whatever fields the active `period` needs — { start, end } as
// 'YYYY-MM-DD' strings for 'custom', { month (0-11), year } for 'specific_month' — either of
// which may be blank/null. Callers can pass one combined object with all four fields set;
// only the ones the active period actually reads are used.
export function withinPeriod(dateFiled, period, customRange) {
  if (period === 'all') return true;
  const d = new Date(dateFiled);
  const now = new Date();
  if (period === 'last_30') {
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 30);
    return d >= cutoff;
  }
  if (period === 'last_90') {
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 90);
    return d >= cutoff;
  }
  if (period === 'this_year') return d.getFullYear() === now.getFullYear();
  if (period === 'last_year') return d.getFullYear() === now.getFullYear() - 1;
  if (period === 'specific_month') {
    if (customRange?.year != null && d.getFullYear() !== Number(customRange.year)) return false;
    if (customRange?.month != null && d.getMonth() !== Number(customRange.month)) return false;
    return true;
  }
  if (period === 'custom') {
    if (customRange?.start && d < new Date(customRange.start)) return false;
    if (customRange?.end && d > new Date(`${customRange.end}T23:59:59`)) return false;
    return true;
  }
  return true;
}
