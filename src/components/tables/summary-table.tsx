"use client";

// 회사별 집계와 월별 상세 정보를 펼쳐 볼 수 있는 반응형 요약 표입니다.
import { Fragment, useEffect, useMemo, useState } from "react";
import type { DashboardDataset } from "../../lib/transforms";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { formatYearMonth } from "../../lib/utils";

// 공통 숫자 포매터로 합계와 비율을 읽기 쉬운 형태로 보여 줍니다.
const tonsFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

type Props = {
  dataset: DashboardDataset;
  isLoading?: boolean;
};

export function SummaryTable({ dataset, isLoading = false }: Props) {
  const timeline = dataset.timeline;
  const monthsCount = timeline.length;
  const latestMonth = timeline.at(-1) ?? null;

  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(
    null
  );
  const [isMobile, setIsMobile] = useState(false);
  const [selectedMobileCompanyId, setSelectedMobileCompanyId] = useState<
    string | null
  >(null);

  const showSkeleton = isLoading && dataset.table.length === 0;
  const showEmpty = !isLoading && dataset.table.length === 0;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 767px)");
    const updateMatches = () => setIsMobile(media.matches);
    updateMatches();
    media.addEventListener("change", updateMatches);
    return () => media.removeEventListener("change", updateMatches);
  }, []);

  const selectedMobileRow = useMemo(
    () =>
      dataset.table.find((row) => row.companyId === selectedMobileCompanyId) ??
      null,
    [dataset.table, selectedMobileCompanyId]
  );

  if (isMobile) {
    return (
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-sky-300/70">
              요약
            </p>
            <h3 className="text-xl font-semibold text-slate-50">
              회사별 배출 현황
            </h3>
          </div>
          <p className="text-xs text-slate-300/70">단위: tCO2e</p>
        </div>
        <div className="space-y-3 px-4 pb-6">
          {showSkeleton ? (
            <MobileSkeletonCards />
          ) : showEmpty ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-center text-xs text-slate-300/70">
              표시할 데이터가 없습니다. 필터를 조정해 다시 확인하세요.
            </div>
          ) : (
            dataset.table.map((row) => {
              const latestValue = latestMonth
                ? row.totalsByMonth[latestMonth] ?? 0
                : 0;
              const average = monthsCount ? row.total / monthsCount : 0;
              return (
                <button
                  key={row.companyId}
                  type="button"
                  className="flex w-full flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-left transition hover:border-sky-400/40 hover:bg-white/10"
                  onClick={() => setSelectedMobileCompanyId(row.companyId)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-100">
                      {row.companyName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {row.country}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300/80">
                    <span>
                      최근월 {latestMonth ? formatYearMonth(latestMonth) : "-"}
                      <strong className="ml-1 text-slate-50">
                        {tonsFormatter.format(latestValue)}
                      </strong>
                    </span>
                    <span>
                      합계{" "}
                      <strong className="ml-1 text-slate-50">
                        {tonsFormatter.format(row.total)}
                      </strong>
                    </span>
                  </div>
                  <div className="text-xs text-slate-400/80">
                    월 평균 {tonsFormatter.format(average)}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {selectedMobileRow ? (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-slate-950/70 backdrop-blur"
              onClick={() => setSelectedMobileCompanyId(null)}
            />
            <div className="absolute left-1/2 top-1/2 w-[min(92vw,360px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/15 bg-[rgba(15,23,42,0.96)] p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-sky-300/70">
                    상세 보기
                  </p>
                  <h4 className="text-lg font-semibold text-slate-100">
                    {selectedMobileRow.companyName}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {selectedMobileRow.country}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMobileCompanyId(null)}
                >
                  닫기
                </Button>
              </div>
              <div className="space-y-3 text-sm text-slate-200">
                <DetailRow
                  label="최근 월"
                  value={latestMonth ? formatYearMonth(latestMonth) : "-"}
                />
                <DetailRow
                  label="최신 값"
                  value={`${tonsFormatter.format(
                    latestMonth
                      ? selectedMobileRow.totalsByMonth[latestMonth] ?? 0
                      : 0
                  )} `}
                />
                <DetailRow
                  label="기간 합계"
                  value={`${tonsFormatter.format(selectedMobileRow.total)} `}
                />
                <DetailRow
                  label="월 평균"
                  value={`${tonsFormatter.format(
                    monthsCount ? selectedMobileRow.total / monthsCount : 0
                  )} `}
                />
                <DetailRow
                  label="최대 월"
                  value={
                    selectedMobileRow.peakMonth
                      ? `${formatYearMonth(
                          selectedMobileRow.peakMonth
                        )} · ${tonsFormatter.format(
                          selectedMobileRow.totalsByMonth[
                            selectedMobileRow.peakMonth
                          ] ?? 0
                        )}`
                      : "-"
                  }
                />
                <DetailRow
                  label="전월 대비"
                  value={
                    selectedMobileRow.momDelta !== null
                      ? `${
                          selectedMobileRow.momDelta >= 0 ? "+" : ""
                        }${tonsFormatter.format(selectedMobileRow.momDelta)} `
                      : "N/A"
                  }
                  tone={
                    selectedMobileRow.momDelta !== null
                      ? selectedMobileRow.momDelta > 0
                        ? "down"
                        : "up"
                      : "neutral"
                  }
                />
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-300/70">
                  월별 추이
                </p>
                <div className="mt-2 max-h-40 space-y-2 overflow-y-auto pr-1 text-xs text-slate-200">
                  {timeline.map((month) => {
                    const value = selectedMobileRow.totalsByMonth[month] ?? 0;
                    const percent = selectedMobileRow.total
                      ? (value / selectedMobileRow.total) * 100
                      : 0;
                    return (
                      <div
                        key={`${selectedMobileRow.companyId}-${month}`}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2"
                      >
                        <span>{formatYearMonth(month)} </span>

                        <span className="text-[11px] text-slate-400/80">
                          {percentFormatter.format(percent)}%
                        </span>
                        <span className="font-medium text-slate-50">
                          {tonsFormatter.format(value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between px-6 py-5">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-sky-300/70">
            요약
          </p>
          <h3 className="text-xl font-semibold text-slate-50">
            회사·기간별 배출 현황
          </h3>
        </div>
        <p className="text-xs text-slate-300/70">단위: tCO2e</p>
      </div>
      <div className="max-h-[420px] overflow-auto px-2">
        <table className="min-w-full border-separate border-spacing-y-2 px-4 pb-6">
          <thead className="sticky top-0 z-10 bg-[rgba(15,23,42,0.95)]">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-300/70">
                회사
              </th>
              <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-300/70">
                최신 월
              </th>
              <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-300/70">
                기간 합계
              </th>
              <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-300/70">
                월 평균
              </th>
              <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-300/70">
                최대 월
              </th>
              <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-300/70">
                전월 대비
              </th>
              <th className="px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-300/70">
                상세
              </th>
            </tr>
          </thead>
          <tbody>
            {showSkeleton ? (
              <SkeletonRows />
            ) : showEmpty ? (
              <tr>
                <td
                  className="px-6 py-8 text-center text-xs text-slate-300/70"
                  colSpan={7}
                >
                  표시할 데이터가 없습니다. 필터를 조정해 다시 확인하세요.
                </td>
              </tr>
            ) : (
              dataset.table.map((row) => {
                const latestValue = latestMonth
                  ? row.totalsByMonth[latestMonth] ?? 0
                  : 0;
                const average = monthsCount ? row.total / monthsCount : 0;
                const peakMonthLabel = row.peakMonth
                  ? formatYearMonth(row.peakMonth)
                  : "-";
                const momLabel =
                  row.momDelta !== null
                    ? `${row.momDelta >= 0 ? "+" : ""}${tonsFormatter.format(
                        row.momDelta
                      )}`
                    : "-";
                const tone =
                  row.momDelta !== null
                    ? row.momDelta > 0
                      ? "down"
                      : "up"
                    : "neutral";
                const isExpanded = expandedCompanyId === row.companyId;

                return (
                  <Fragment key={row.companyId}>
                    <tr className="rounded-2xl border border-white/5 bg-white/[0.04] text-sm text-slate-200">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-50">
                            {row.companyName}
                          </span>
                          <span className="text-xs text-slate-400">
                            {row.country}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {latestMonth ? (
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-slate-400/80">
                              {formatYearMonth(latestMonth)}
                            </span>
                            <span className="font-semibold text-slate-50">
                              {tonsFormatter.format(latestValue)}
                            </span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-slate-50">
                          {tonsFormatter.format(row.total)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-slate-50">
                          {tonsFormatter.format(average)}
                        </span>
                        {monthsCount > 0 ? (
                          <span className="ml-1 text-xs text-slate-400/80">
                            / {monthsCount}개월
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-slate-400/80">
                            {peakMonthLabel}
                          </span>
                          <span className="font-semibold text-slate-50">
                            {row.peakMonth
                              ? tonsFormatter.format(
                                  row.totalsByMonth[row.peakMonth] ?? 0
                                )
                              : "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.momDelta !== null ? (
                          <Badge tone={tone} className="text-[11px]">
                            {momLabel}
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-400/80">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedCompanyId(
                              isExpanded ? null : row.companyId
                            )
                          }
                          className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 transition hover:border-sky-400/40 hover:text-sky-200"
                        >
                          {isExpanded ? "닫기" : "상세"}
                        </button>
                      </td>
                    </tr>
                    {isExpanded ? (
                      <tr>
                        <td colSpan={7} className="px-6 pb-6">
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                            <div className="mb-3 flex items-center justify-between">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-300/70">
                                월별 추이
                              </p>
                              <span className="text-xs text-slate-400/80">
                                표시 단위: tCO2e
                              </span>
                            </div>
                            <div className="flex gap-3 overflow-x-auto pr-1 text-xs text-slate-200">
                              {timeline.map((month) => {
                                const value = row.totalsByMonth[month] ?? 0;
                                const percent = row.total
                                  ? (value / row.total) * 100
                                  : 0;
                                return (
                                  <div
                                    key={`${row.companyId}-${month}`}
                                    className="min-w-[140px] rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3"
                                  >
                                    <p className="text-[11px] text-slate-400/80">
                                      {formatYearMonth(month)}
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-slate-50">
                                      {tonsFormatter.format(value)}
                                    </p>
                                    <p className="mt-2 text-[11px] text-slate-300/70">
                                      범위 비중{" "}
                                      {percentFormatter.format(percent)}%
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// 스켈레톤, 빈 데이터, 실제 데이터 중 어떤 상태를 보여줄지 판별합니다.
function SkeletonRows() {
  return (
    <>
      {[0, 1, 2].map((key) => (
        <tr
          key={key}
          className="rounded-2xl border border-white/5 bg-white/[0.04]"
        >
          {[...Array(7).keys()].map((cell) => (
            <td key={cell} className="px-4 py-4">
              <Skeleton className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function MobileSkeletonCards() {
  return (
    <>
      {[0, 1, 2].map((key) => (
        <div
          key={key}
          className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4"
        >
          <Skeleton className="h-4 w-1/3" />
          <div className="mt-2 space-y-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </>
  );
}

function DetailRow({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "up" | "down";
}) {
  return (
    <div className="flex items-center justify-between text-xs text-slate-300/80">
      <span>{label}</span>
      {tone === "neutral" ? (
        <span className="font-medium text-slate-100">{value}</span>
      ) : (
        <Badge tone={tone} className="text-[11px]">
          {value}
        </Badge>
      )}
    </div>
  );
}
