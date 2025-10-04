// 대시보드 주요 화면으로, 필터·쿼리·시각화 위젯을 한 번에 조합합니다.
"use client";

import { useMemo } from "react";
import { GlobalFiltersBar } from "@/components/filters/global-filters";
import { KpiRow } from "@/components/kpi/kpi-row";
import { TrendChart } from "@/components/charts/trend-chart";
import { SourceChart } from "@/components/charts/source-chart";
import { SummaryTable } from "@/components/tables/summary-table";
import { PostsPanel } from "@/components/posts/posts-panel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useCompaniesQuery } from "@/lib/api-hooks";
import { useFiltersStore } from "@/lib/store";
import { buildDashboardDataset } from "@/lib/transforms";

export default function DashboardPage() {
  const { data: companies, isLoading, error, refetch } = useCompaniesQuery();
  const selectedCompanyIds = useFiltersStore((state) => state.selectedCompanyIds);
  const yearMonthRange = useFiltersStore((state) => state.yearMonthRange);
  const taxRatePerTon = useFiltersStore((state) => state.taxRatePerTon);

  // 회사 데이터를 받아오면 대시보드에서 사용할 집계 데이터를 생성합니다.
  const dataset = useMemo(() => {
    if (!companies?.length) return null;
    return buildDashboardDataset(companies, {
      companyIds: selectedCompanyIds,
      range: yearMonthRange,
      taxRatePerTon,
    });
  }, [companies, selectedCompanyIds, yearMonthRange, taxRatePerTon]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.35em] text-sky-300/70">HanaLoop 탄소배출 대시보드</p>
        <h2 className="text-4xl font-semibold text-slate-50">탄소 인텔리전스</h2>
        <p className="max-w-2xl text-sm text-slate-300/80">
          기업 전반의 배출 추세를 모니터링하고 이상치를 드러내며, 감축 행동을 체계적으로 실행하도록 지원합니다.
        </p>
        <p className="text-xs text-slate-400/70">* 배출량 수치는 tCO2e 기준입니다.</p>
      </header>

      <GlobalFiltersBar />

      {error && (
        <Card className="border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-semibold">대시보드 데이터를 불러오지 못했습니다</p>
              <p className="text-xs">{error}</p>
            </div>
            <Button variant="ghost" onClick={refetch}>
              다시 시도
            </Button>
          </div>
        </Card>
      )}

      {isLoading && !dataset && !error && <DashboardSkeleton />}

      {dataset && !error && (
        <div className="space-y-6">
          <KpiRow kpis={dataset.kpis} />
          <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <TrendChart dataset={dataset} />
            <SourceChart dataset={dataset} />
          </section>
          <section className="grid gap-6 xl:grid-cols-[1fr]">
            <SummaryTable dataset={dataset} isLoading={isLoading} />
            
          </section>
          <section className="grid gap-6 xl:grid-cols-[1fr]">
            <PostsPanel />
          </section>
        </div>
      )}

      {!isLoading && !error && !dataset && (
        <Card className="border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-300/80">
          표시할 배출 데이터가 없습니다. 필터를 조정하거나 회사를 추가해 주세요.
        </Card>
      )}
    </div>
  );
}

// 로딩 중에도 레이아웃이 유지되도록 만든 가벼운 플레이스홀더입니다.
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}



