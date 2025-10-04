// 대시보드 집계 결과를 기반으로 월별 추세를 보여 주는 SVG 차트입니다.
import type { DashboardDataset } from "../../lib/transforms";
import { Card } from "../ui/card";
import { formatYearMonth } from "../../lib/utils";

const WIDTH = 720;
const HEIGHT = 320;
const PADDING_X = 40;
const PADDING_Y = 24;

// 점 목록을 SVG 선 패스로 변환해 라인 그래프를 그립니다.
function buildPath(points: { x: number; y: number }[]) {
  if (!points.length) return "";
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");
}

// 선 아래 영역을 채우기 위해 기준선까지 닫힌 면적 경로를 생성합니다.
function buildArea(points: { x: number; y: number }[]) {
  if (!points.length) return "";
  const start = `${points[0].x},${HEIGHT - PADDING_Y}`;
  const end = `${points[points.length - 1].x},${HEIGHT - PADDING_Y}`;
  return `M${start} ${points.map((point) => `L${point.x},${point.y}`).join(" ")} L${end} Z`;
}

type Props = {
  dataset: DashboardDataset;
};

export function TrendChart({ dataset }: Props) {
  const { trend, timeline } = dataset;
  const maxValue = Math.max(...trend.map((point) => point.total), 1);
  const scaleX = (index: number) =>
    PADDING_X + (index / Math.max(1, trend.length - 1)) * (WIDTH - PADDING_X * 2);
  const scaleY = (value: number) =>
    HEIGHT - PADDING_Y - (value / maxValue) * (HEIGHT - PADDING_Y * 2);

  const points = trend.map((point, index) => ({ x: scaleX(index), y: scaleY(point.total) }));

  return (
    <Card className="p-6" translucent={false}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-sky-300/70">월별 추이</p>
          <h3 className="text-xl font-semibold text-slate-50">전체 배출량 흐름</h3>
        </div>
        <p className="text-xs text-slate-300/70">tCO2e</p>
      </div>
      <div className="mt-4 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/40 to-sky-900/40">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full">
          <defs>
            <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(56,189,248,0.5)" />
              <stop offset="100%" stopColor="rgba(15,23,42,0.1)" />
            </linearGradient>
            <linearGradient id="trend-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="url(#grid-bg)" opacity="0" />
          {points.length ? (
            <>
              <path d={buildArea(points)} fill="url(#trend-fill)" opacity="0.85" />
              <path d={buildPath(points)} stroke="url(#trend-line)" strokeWidth={3} fill="none" />
              {points.map((point, index) => (
                <g key={timeline[index]}>
                  <circle cx={point.x} cy={point.y} r={5} fill="#38bdf8" />
                  <circle cx={point.x} cy={point.y} r={9} fill="none" stroke="#38bdf8" strokeOpacity={0.25} />
                </g>
              ))}
            </>
          ) : (
            <text x="50%" y="50%" textAnchor="middle" fill="#94a3b8">데이터 없음</text>
          )}
          {timeline.map((month, index) => {
            const x = scaleX(index);
            return (
              <g key={month}>
                <line x1={x} y1={HEIGHT - PADDING_Y} x2={x} y2={HEIGHT - PADDING_Y + 8} stroke="#475569" strokeWidth={1} />
                <text
                  x={x}
                  y={HEIGHT - PADDING_Y + 20}
                  textAnchor="middle"
                  fill="#cbd5f5"
                  fontSize={10}
                >
                  {formatYearMonth(month)}
                </text>
              </g>
            );
          })}
          {[0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = scaleY(maxValue * ratio);
            return (
              <g key={ratio}>
                <line x1={PADDING_X} x2={WIDTH - PADDING_X} y1={y} y2={y} stroke="#1e293b" strokeDasharray="4 6" />
                <text x={PADDING_X - 8} y={y + 4} textAnchor="end" fill="#64748b" fontSize={10}>
                  {Math.round(maxValue * ratio)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </Card>
  );
}

