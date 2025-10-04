// 배출 총량을 원인별로 분해하고, 비중 계산 및 하이라이트를 제공하는 차트입니다.
import type { DashboardDataset } from "../../lib/transforms";
import { Card } from "../ui/card";

// 고정된 색상 팔레트를 사용해 렌더링될 때마다 동일한 색상 매핑을 유지합니다.
const colors = [
  "#38bdf8",
  "#7a371a",
  "#a855f7",
  "#f97316",
  "#22c55e",
  "#fbbf24",
  "#4ade80",
];

const tonsFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

type Props = {
  dataset: DashboardDataset;
};

export function SourceChart({ dataset }: Props) {
  const total = dataset.bySource.reduce((sum, slice) => sum + slice.total, 0);

  if (!dataset.bySource.length || total === 0) {
    return (
      <Card className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-sm text-slate-300/70">
        <p>선택한 조건에 해당하는 배출원 데이터가 없습니다.</p>
        <p className="text-xs text-slate-400">
          필터를 조정해 다른 기간이나 회사를 선택해 보세요.
        </p>
      </Card>
    );
  }

  const enriched = dataset.bySource.map((slice, index) => {
    const rawPercent = total ? (slice.total / total) * 100 : 0;
    return { ...slice, rawPercent, index };
  });

  const basePercents = enriched.map((entry) => Math.floor(entry.rawPercent));
  let remaining = Math.max(
    0,
    100 - basePercents.reduce((sum, value) => sum + value, 0)
  );

  const orderByFraction = [...enriched]
    .map((entry, index) => ({
      index,
      fractional: entry.rawPercent - basePercents[index],
    }))
    .sort((a, b) => b.fractional - a.fractional);

  for (const { index } of orderByFraction) {
    if (remaining <= 0) break;
    basePercents[index] += 1;
    remaining -= 1;
  }

  const displaySlices = enriched.map((entry, index) => ({
    ...entry,
    displayPercent: total ? basePercents[index] : 0,
    ratio: total ? entry.rawPercent / 100 : 0,
  }));

  const topSlice = displaySlices[0];

  return (
    <Card className="flex h-full flex-col gap-6 p-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-sky-300/70">
              배출원별
            </p>
            <h3 className="text-xl font-semibold text-slate-50">배출 구성</h3>
          </div>
          <p className="text-xs text-slate-400">단위: tCO2e</p>
        </div>
        <p className="text-xs text-slate-300/70">
          가장 크게 기여하는 배출원을 중심으로 비중을 살펴보고, 감축 타깃
          우선순위를 잡아 보세요.
        </p>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-sky-200/80">
          최대 배출원
        </p>
        <div className="mt-2 flex items-baseline justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-100">
              {topSlice.source}
            </p>
            <p className="text-xs text-slate-300/80">
              {tonsFormatter.format(topSlice.total)}
            </p>
          </div>
          <span className="text-2xl font-semibold text-sky-200">
            {percentFormatter.format(topSlice.displayPercent)}%
          </span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(100, topSlice.ratio * 100)}%`,
              background: colors[topSlice.index % colors.length],
            }}
          />
        </div>
      </section>

      <ul className="space-y-3">
        {displaySlices.map((slice, index) => (
          <li key={slice.source} className="space-y-1">
            <div className="flex items-center justify-between text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex size-3 rounded-full"
                  style={{ background: colors[index % colors.length] }}
                />
                <span className="font-medium">{slice.source}</span>
                <div className="text-xs text-slate-300/80">
                  {percentFormatter.format(slice.displayPercent)}%
                </div>{" "}
              </div>
              <div className="text-xs text-slate-300/80">
                {tonsFormatter.format(slice.total)}
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, slice.ratio * 100)}%`,
                  background: colors[index % colors.length],
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

