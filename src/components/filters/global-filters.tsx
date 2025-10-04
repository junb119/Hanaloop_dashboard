// 대시보드 전체 데이터를 조정하는 전역 필터 영역을 구성합니다.
"use client";

import { useEffect, useMemo } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useCompaniesQuery } from "../../lib/api-hooks";
import { useFiltersStore } from "../../lib/store";
import type { Company, YearMonth } from "../../lib/types";
import { cn } from "../../lib/cn";

const sumEmissions = (company: Company) =>
  company.emissions.reduce((total, emission) => total + emission.emissions, 0);

export function GlobalFiltersBar() {
  const { data: companies, isLoading, error, refetch } = useCompaniesQuery();
  const selectedCompanyIds = useFiltersStore((state) => state.selectedCompanyIds);
  const yearMonthRange = useFiltersStore((state) => state.yearMonthRange);
  const taxRatePerTon = useFiltersStore((state) => state.taxRatePerTon);
  const setSelectedCompanyIds = useFiltersStore((state) => state.setSelectedCompanyIds);
  const setYearMonthRange = useFiltersStore((state) => state.setYearMonthRange);
  const setTaxRatePerTon = useFiltersStore((state) => state.setTaxRatePerTon);
  const reset = useFiltersStore((state) => state.reset);

  // 회사 데이터가 갱신될 때마다 사용 가능한 월 목록과 정렬된 회사를 미리 계산해 둡니다.
  const catalog = useMemo(() => {
    if (!companies?.length) return { months: [] as YearMonth[], sorted: [] as Company[] };
    const allMonths = new Set<YearMonth>();
    companies.forEach((company) => {
      company.emissions.forEach((emission) => {
        allMonths.add(emission.yearMonth as YearMonth);
      });
    });
    const months = [...allMonths].sort();
    const sortedCompanies = [...companies].sort((a, b) => sumEmissions(b) - sumEmissions(a));
    return { months, sorted: sortedCompanies };
  }, [companies]);

  useEffect(() => {
    if (!catalog.months.length) return;
    const defaultRange = { from: catalog.months[0], to: catalog.months[catalog.months.length - 1] } as const;
    if (!yearMonthRange) {
      setYearMonthRange(defaultRange);
      return;
    }
    const from = yearMonthRange.from < defaultRange.from ? defaultRange.from : yearMonthRange.from;
    const to = yearMonthRange.to > defaultRange.to ? defaultRange.to : yearMonthRange.to;
    if (from !== yearMonthRange.from || to !== yearMonthRange.to) {
      setYearMonthRange({ from, to });
    }
  }, [catalog.months, setYearMonthRange, yearMonthRange]);

  if (isLoading && !companies) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <p className="text-sm text-slate-300/70">필터 데이터를 불러오는 중입니다…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-rose-500/40 bg-rose-500/10 p-6">
        <div>
          <p className="text-sm font-medium text-rose-200">필터 데이터를 불러오지 못했습니다</p>
          <p className="text-xs text-rose-200/80">{error}</p>
        </div>
        <Button variant="ghost" onClick={refetch}>
          다시 시도
        </Button>
      </div>
    );
  }

  if (!companies?.length || !yearMonthRange) {
    return null;
  }

  const toggleCompany = (id: string) => {
    if (selectedCompanyIds.includes(id)) {
      setSelectedCompanyIds(selectedCompanyIds.filter((value) => value !== id));
    } else {
      setSelectedCompanyIds([...selectedCompanyIds, id]);
    }
  };

  const setRangeFrom = (value: YearMonth) => {
    const to = yearMonthRange.to;
    setYearMonthRange({ from: value <= to ? value : to, to });
  };

  const setRangeTo = (value: YearMonth) => {
    const from = yearMonthRange.from;
    setYearMonthRange({ from, to: value >= from ? value : from });
  };

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-sky-300/70">공통 필터</p>
        </div>
        <Button variant="ghost" size="sm" onClick={reset}>
          초기화
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300/70">
          회사 선택
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCompanyIds([])}
            className={cn(
              "rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-slate-200/80 transition",
              selectedCompanyIds.length === 0 ? "bg-sky-500/20 text-sky-50" : "hover:bg-white/10",
            )}
          >
            전체 보기
          </button>
          {catalog.sorted.map((company) => {
            const isActive = selectedCompanyIds.includes(company.id);
            return (
              <button
                key={company.id}
                type="button"
                onClick={() => toggleCompany(company.id)}
                className={cn(
                  "rounded-full border border-white/10 px-4 py-2 text-xs font-medium transition",
                  isActive ? "bg-sky-500/30 text-sky-50" : "text-slate-200/80 hover:bg-white/10",
                )}
              >
                {company.name}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300/70">
            기간 시작
          </label>
          <Input
            type="month"
            value={yearMonthRange.from}
            min={catalog.months[0]}
            max={yearMonthRange.to}
            onChange={(event) => setRangeFrom(event.target.value as YearMonth)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300/70">
            기간 종료
          </label>
          <Input
            type="month"
            value={yearMonthRange.to}
            min={yearMonthRange.from}
            max={catalog.months[catalog.months.length - 1]}
            onChange={(event) => setRangeTo(event.target.value as YearMonth)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300/70">
            탄소세 (tCO2e 당)
          </label>
          <Input
            type="number"
            min={0}
            step={1}
            value={taxRatePerTon}
            onChange={(event) => setTaxRatePerTon(Number(event.target.value) || 0)}
            inputMode="decimal"
          />
          <div className="text-xs text-slate-400/80">
            비용 민감도를 확인하려면 값을 조정하세요.
          </div>
        </div>
      </div>
    </div>
  );
}

