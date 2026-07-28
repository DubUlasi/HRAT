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
export default function ComplaintsLineChart({ data }) {
  const { isDark } = useTheme();
  const chartRef = useRef(null);

  const accent = isDark ? '#10B981' : '#079455';
  const gridColor = isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(16, 24, 40, 0.06)';
  const axisTextColor = isDark ? '#64748B' : '#667085';
  const tooltipBg = isDark ? '#F8FAFC' : '#101828';
  const tooltipText = isDark ? '#101828' : '#F8FAFC';

  const chartData = useMemo(() => ({
    labels: data.map((d) => d.label),
    datasets: [
      {
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
    ],
  }), [data, accent, isDark]);

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
          label: (item) => `${item.parsed.y} complaints`,
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
