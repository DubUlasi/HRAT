import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { PieChart } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import ChartEmptyState from './ChartEmptyState';

ChartJS.register(ArcElement, Tooltip);

// Evenly-spaced hues around the color wheel, one per row — guarantees every slice (and its
// legend entry) is visually distinct no matter how many rows there are. A fixed short palette
// (e.g. 5 colors) would repeat once a breakdown has more rows than colors — status breakdowns
// commonly have a dozen-plus rows, which made a repeating palette actively misleading in a
// legend whose whole job is telling two same-colored things apart. Starts near the app's own
// accent green (~150°) so the largest/first slice still reads close to brand color.
function generateColors(count, isDark) {
  const saturation = isDark ? 68 : 60;
  const lightness = isDark ? 62 : 45;
  const startHue = 150;
  const n = Math.max(count, 1);
  return Array.from({ length: n }, (_, i) => `hsl(${(startHue + (360 / n) * i) % 360}, ${saturation}%, ${lightness}%)`);
}

// A ring/doughnut chart for a category or status distribution — takes the exact `{ key, label,
// count, percent }[]` shape categoryBreakdown/statusBreakdown/tally already return, so no new
// data-shaping is needed at call sites. No Chart.js legend plugin (matches the app's convention
// elsewhere) — a plain HTML legend below the ring instead, colored the same way as the slices.
export default function ComplaintsDoughnutChart({ rows }) {
  const { isDark } = useTheme();
  const colors = useMemo(() => generateColors(rows.length, isDark), [rows.length, isDark]);
  const tooltipBg = isDark ? '#F8FAFC' : '#101828';
  const tooltipText = isDark ? '#101828' : '#F8FAFC';

  const chartData = useMemo(() => ({
    labels: rows.map((r) => r.label),
    datasets: [
      {
        data: rows.map((r) => r.count),
        backgroundColor: colors,
        borderColor: isDark ? '#0B0F19' : '#FFFFFF',
        borderWidth: 2,
      },
    ],
  }), [rows, colors, isDark]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { display: false },
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
          label: (item) => `${item.label}: ${item.parsed} (${rows[item.dataIndex]?.percent ?? 0}%)`,
        },
      },
    },
  }), [tooltipBg, tooltipText, rows]);

  if (rows.length === 0) {
    return (
      <div className="complaints-doughnut-chart">
        <ChartEmptyState icon={PieChart} message="No complaints in this range." />
      </div>
    );
  }

  return (
    <div>
      <div className="complaints-doughnut-chart">
        <Doughnut data={chartData} options={options} />
      </div>
      <div className="chart-legend">
        {rows.map((row, i) => (
          <span className="chart-legend-item" key={row.key}>
            <span className="chart-legend-dot" style={{ backgroundColor: colors[i] }} />
            {row.label}
          </span>
        ))}
      </div>
    </div>
  );
}
