import type { CategorySummary } from '../types';
import { money } from '../format';

interface Props {
  categories: CategorySummary[];
  status?: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#6b7280'];

export default function CategoryChart({ categories, status }: Props) {
  const total = categories.reduce((sum, c) => sum + c.total, 0);

  // 无数据时依然渲染卡片，只显示占位提示
  if (total === 0) {
    return (
      <div className="chart-card">
        <div className="chart-title">📊 {status ? `${status} · ` : ''}分类支出占比</div>
        <div className="chart-empty">暂无数据</div>
      </div>
    );
  }

  // 构建 SVG 饼图
  let cumulativePercent = 0;
  const slices = categories.map((c, i) => {
    const percent = c.total / total;
    const startAngle = cumulativePercent * 360;
    cumulativePercent += percent;
    const endAngle = cumulativePercent * 360;
    return { category: c.category, total: c.total, percent, color: COLORS[i % COLORS.length], startAngle, endAngle };
  });

  const radius = 80;
  const cx = 100;
  const cy = 100;

  const createArcPath = (startAngle: number, endAngle: number, r: number) => {
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    if (endAngle - startAngle >= 360) {
      return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r}`;
    }
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="chart-card">
      <div className="chart-title">📊 {status ? `${status} · ` : ''}分类支出占比</div>
      <div className="chart-container">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {slices.map((s, i) => (
            <path key={i} d={createArcPath(s.startAngle, s.endAngle, radius)} fill={s.color} opacity={0.85}>
              <title>{s.category}: ¥{money(s.total)} ({(s.percent * 100).toFixed(0)}%)</title>
            </path>
          ))}
          <circle cx={cx} cy={cy} r={radius * 0.55} fill="var(--white)" />
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--gray-900)">¥{money(total)}</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fontSize="11" fill="var(--gray-500)">总计</text>
        </svg>
        <div className="chart-legend">
          {slices.map((s, i) => (
            <div key={i} className="legend-item">
              <span className="legend-dot" style={{ background: s.color }} />
              <span className="legend-label">{s.category}</span>
              <span className="legend-value">{((s.percent * 100)).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
