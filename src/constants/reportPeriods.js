// Shared period-filter options, used by both the Business Intelligence and Reports pages.
export const PERIOD_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'last_30', label: 'Last 30 Days' },
  { value: 'last_90', label: 'Last 90 Days' },
  { value: 'this_year', label: 'This Year' },
  { value: 'last_year', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' },
];

// `customRange` is only read when period === 'custom' — { start, end } as 'YYYY-MM-DD' strings
// straight from a <input type="date">, either of which may be blank (an open-ended range).
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
  if (period === 'custom') {
    if (customRange?.start && d < new Date(customRange.start)) return false;
    if (customRange?.end && d > new Date(`${customRange.end}T23:59:59`)) return false;
    return true;
  }
  return true;
}
