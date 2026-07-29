import React, { useMemo, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../../hooks/useTheme';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

// A smooth gradient-filled line/area chart — reads better than bars for a month-over-month
// trend, which is what "Complaints Analysis" actually is. Built on Chart.js since a real
// charting library is now in the project.
//
// Optionally takes a second `compareData` series (same `{ label, value }[]` shape) to overlay
// a prior period as a dashed reference line — used by the Business Intelligence page's
// period-over-period trend widget. Omitting it renders exactly as before (single series, no
// dataset label in the tooltip), so existing callers are unaffected.
export default function ComplaintsLineChart({ data, compareData, compareLabel }) {
  const { isDark } = useTheme();
  const chartRef = useRef(null);

  const accent = isDark ? '#10B981' : '#079455';
  const gridColor = isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(16, 24, 40, 0.06)';
  const axisTextColor = isDark ? '#64748B' : '#667085';
  const tooltipBg = isDark ? '#F8FAFC' : '#101828';
  const tooltipText = isDark ? '#101828' : '#F8FAFC';
  const compareColor = isDark ? 'rgba(148, 163, 184, 0.85)' : 'rgba(100, 116, 139, 0.75)';

  const chartData = useMemo(() => {
    const datasets = [
      {
        label: compareData ? 'Current' : undefined,
        data: data.map((d) => d.value),
        borderColor: accent,
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: accent,
        pointHoverBorderColor: isDark ? '#0B0F19' : '#FFFFFF',
        pointHoverBorderWidth: 2,
        tension: 0.4,
        fill: true,
        backgroundColor: (context) => {
          const { ctx, chartArea } = context.chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(7, 148, 85, 0.28)');
          gradient.addColorStop(1, isDark ? 'rgba(16, 185, 129, 0)' : 'rgba(7, 148, 85, 0)');
          return gradient;
        },
      },
    ];

    if (compareData) {
      datasets.push({
        label: compareLabel || 'Previous',
        data: compareData.map((d) => d.value),
        borderColor: compareColor,
        borderWidth: 2,
        borderDash: [6, 4],
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: compareColor,
        tension: 0.4,
        fill: false,
      });
    }

    return { labels: data.map((d) => d.label), datasets };
  }, [data, compareData, compareLabel, accent, compareColor, isDark]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
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
          label: (item) => (item.dataset.label ? `${item.dataset.label}: ${item.parsed.y} complaints` : `${item.parsed.y} complaints`),
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: axisTextColor, font: { family: 'Inter', size: 12 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: gridColor },
        border: { dash: [4, 4] },
        ticks: { color: axisTextColor, font: { family: 'Inter', size: 11 }, precision: 0 },
      },
    },
  }), [tooltipBg, tooltipText, axisTextColor, gridColor]);

  return (
    <div className="complaints-line-chart">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
}
