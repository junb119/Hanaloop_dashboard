// 대시보드 집계 결과에서 핵심 지표 카드들을 묶어 보여 줍니다.
import { memo } from "react";
import type { DashboardDataset } from "../../lib/transforms";
import { formatYearMonth } from "../../lib/utils";
import { KpiCard } from "./kpi-card";

// 카드들 간 숫자 표현을 통일하기 위해 로캘을 적용한 포매터를 사용합니다.
const tonsFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

type Props = {
  kpis: DashboardDataset["kpis"];
};

function KpiRowComponent({ kpis }: Props) {
  const {
    latestMonth,
    latestTotal,
    momDelta,
    momPercent,
    ytdTotal,
    estimatedTax,
  } = kpis;

  const displayMonth = latestMonth ? formatYearMonth(latestMonth) : "-";
  const latestValue = tonsFormatter.format(latestTotal);
  const momValue =
    momDelta !== null
      ? `${momDelta >= 0 ? "+" : ""}${tonsFormatter.format(momDelta)}`
      : "이전 월 데이터 없음";
  const momTone = momDelta !== null && momDelta > 0 ? "down" : "up";
  const momPercentValue =
    momPercent !== null ? `${percentFormatter.format(momPercent)}%` : null;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="최근 배출량"
        value={latestValue}
        caption={latestMonth ? `${displayMonth} 기준` : undefined}
      />
      <KpiCard
        label="전월 대비 증감"
        value={momValue}
        caption={momPercentValue ? `전월 대비 ${momPercentValue}` : undefined}
        tone={momDelta !== null ? momTone : "neutral"}
      />
      <KpiCard
        label="누적치"
        value={tonsFormatter.format(ytdTotal)}
        caption={
          latestMonth ? `${latestMonth.split("-")[0]}년 누적` : undefined
        }
      />
      <KpiCard
        label="탄소세 비용 추정"
        value={currencyFormatter.format(estimatedTax)}
        caption="현재 세율 기준 시나리오"
      />
    </div>
  );
}

// 상위 KPI 값이 변하지 않는 한 재렌더링을 피하기 위해 메모이제이션합니다.
export const KpiRow = memo(KpiRowComponent);
