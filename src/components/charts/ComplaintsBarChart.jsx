import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { BarChart3 } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import ChartEmptyState from './ChartEmptyState';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

// A single-series bar chart matching ComplaintsLineChart's exact tokens (same accent/grid/
// tooltip colors, same useTheme()-driven light/dark switch, no Chart.js legend plugin) — used
// for monthly volume and for "who has the cases" workload-by-person breakdowns, both of which
// share the same `{ label, value }[]` shape the line chart already takes.
//
// `orientation="horizontal"` flips to a horizontal bar (indexAxis: 'y') — person names read
// better on the y-axis than rotated under a vertical axis.
export default function ComplaintsBarChart({ data, orientation = 'vertical' }) {
  const { isDark } = useTheme();

  const accent = isDark ? '#10B981' : '#079455';
  const gridColor = isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(16, 24, 40, 0.06)';
  const axisTextColor = isDark ? '#64748B' : '#667085';
  const tooltipBg = isDark ? '#F8FAFC' : '#101828';
  const tooltipText = isDark ? '#101828' : '#F8FAFC';

  const horizontal = orientation === 'horizontal';

  const chartData = useMemo(() => ({
    labels: data.map((d) => d.label),
    datasets: [
      {
        data: data.map((d) => d.value),
        backgroundColor: accent,
        borderRadius: 4,
        maxBarThickness: horizontal ? 18 : 32,
        // Guarantees a visible sliver at the baseline even when a bar's value is 0, instead of
        // that category rendering as nothing at all.
        minBarLength: 3,
      },
    ],
  }), [data, accent, horizontal]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' : 'x',
    plugins: {
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        titleFont: { family: 'Inter', weight: '600' },
        bodyFont: { family: 'Inter', weight: '700' },
        callbacks: {
          label: (item) => `${horizontal ? item.parsed.x : item.parsed.y} complaints`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: !horizontal, color: gridColor },
        border: { dash: horizontal ? [4, 4] : undefined },
        beginAtZero: horizontal,
        ticks: { color: axisTextColor, font: { family: 'Inter', size: 11 }, precision: horizontal ? 0 : undefined },
      },
      y: {
        beginAtZero: !horizontal,
        grid: { display: horizontal, color: gridColor },
        border: { dash: !horizontal ? [4, 4] : undefined },
        ticks: { color: axisTextColor, font: { family: 'Inter', size: horizontal ? 12 : 11 }, precision: !horizontal ? 0 : undefined },
      },
    },
  }), [tooltipBg, tooltipText, axisTextColor, gridColor, horizontal]);

  const isEmpty = data.length === 0 || data.every((d) => !d.value);

  return (
    <div className="complaints-bar-chart">
      {isEmpty ? <ChartEmptyState icon={BarChart3} message="No complaints in this range." /> : <Bar data={chartData} options={options} />}
    </div>
  );
}
