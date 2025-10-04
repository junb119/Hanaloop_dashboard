import { Company, GhgEmission, YearMonth, YearMonthRange } from "./types";
import { compareYearMonth, expandYearMonthRange } from "./utils";

type DashboardFilters = {
  companyIds: string[];
  range: YearMonthRange | null;
  taxRatePerTon: number;
};

type TrendPoint = {
  month: YearMonth;
  total: number;
};

type SourceSlice = {
  source: string;
  total: number;
};

type SummaryRow = {
  companyId: string;
  companyName: string;
  country: string;
  totalsByMonth: Record<YearMonth, number>;
  total: number;
  latest: number;
  momDelta: number | null;
  peakMonth: YearMonth | null;
};

type Kpis = {
  latestMonth: YearMonth | null;
  latestTotal: number;
  momDelta: number | null;
  momPercent: number | null;
  ytdTotal: number;
  estimatedTax: number;
};

export type DashboardDataset = {
  timeline: YearMonth[];
  trend: TrendPoint[];
  bySource: SourceSlice[];
  table: SummaryRow[];
  kpis: Kpis;
};

type NormalizedEmission = GhgEmission & {
  companyId: string;
  companyName: string;
  country: string;
};

const isWithinRange = (value: YearMonth, range: YearMonthRange) =>
  value >= range.from && value <= range.to;

const normalize = (companies: Company[]): NormalizedEmission[] =>
  companies.flatMap((company) =>
    company.emissions.map((emission) => ({
      ...emission,
      companyId: company.id,
      companyName: company.name,
      country: company.country,
    })),
  );

const buildTimeline = (
  emissions: NormalizedEmission[],
  range: YearMonthRange | null,
): YearMonth[] => {
  if (range) {
    return expandYearMonthRange(range.from, range.to);
  }

  if (!emissions.length) {
    return [];
  }

  const months = new Set<YearMonth>();
  emissions.forEach((item) => months.add(item.yearMonth as YearMonth));
  const sorted = [...months].sort(compareYearMonth);
  return expandYearMonthRange(sorted[0], sorted[sorted.length - 1]);
};

const mom = (trend: TrendPoint[]): { delta: number | null; percent: number | null } => {
  if (trend.length < 2) {
    return { delta: null, percent: null };
  }
  const latest = trend[trend.length - 1];
  const previous = trend[trend.length - 2];
  const delta = latest.total - previous.total;
  const percent = previous.total === 0 ? null : (delta / previous.total) * 100;
  return { delta, percent };
};

const ytd = (timeline: YearMonth[], trend: TrendPoint[]): number => {
  if (!timeline.length) {
    return 0;
  }
  const latest = timeline[timeline.length - 1];
  const year = latest.split("-")[0];
  const rangeStart = `${year}-01` as YearMonth;
  return trend
    .filter((point) => point.month >= rangeStart && point.month <= latest)
    .reduce((sum, point) => sum + point.total, 0);
};

export function buildDashboardDataset(
  companies: Company[],
  filters: DashboardFilters,
): DashboardDataset {
  const normalized = normalize(companies);

  const filtered = normalized.filter((item) => {
    if (filters.companyIds.length && !filters.companyIds.includes(item.companyId)) {
      return false;
    }
    if (filters.range && !isWithinRange(item.yearMonth as YearMonth, filters.range)) {
      return false;
    }
    return true;
  });

  const timeline = buildTimeline(filtered, filters.range);

  const totalsByMonth = new Map<YearMonth, number>();
  const sourceTotals = new Map<string, number>();
  const rows = new Map<string, SummaryRow>();

  timeline.forEach((month) => {
    totalsByMonth.set(month, 0);
  });

  filtered.forEach((item) => {
    const month = item.yearMonth as YearMonth;
    if (!timeline.includes(month)) {
      return;
    }
    totalsByMonth.set(month, (totalsByMonth.get(month) ?? 0) + item.emissions);
    sourceTotals.set(item.source, (sourceTotals.get(item.source) ?? 0) + item.emissions);

    if (!rows.has(item.companyId)) {
      rows.set(item.companyId, {
        companyId: item.companyId,
        companyName: item.companyName,
        country: item.country,
        totalsByMonth: Object.fromEntries(timeline.map((key) => [key, 0])) as Record<YearMonth, number>,
        total: 0,
        latest: 0,
        momDelta: null,
        peakMonth: null,
      });
    }

    const row = rows.get(item.companyId)!;
    row.totalsByMonth[month] = (row.totalsByMonth[month] ?? 0) + item.emissions;
    row.total += item.emissions;
    if (!row.peakMonth || row.totalsByMonth[month] > (row.totalsByMonth[row.peakMonth] ?? 0)) {
      row.peakMonth = month;
    }
  });

  const trend: TrendPoint[] = timeline.map((month) => ({
    month,
    total: Math.round((totalsByMonth.get(month) ?? 0) * 100) / 100,
  }));

  const table: SummaryRow[] = [...rows.values()].map((row) => {
    const latestMonth = timeline[timeline.length - 1];
    const previousMonth = timeline[timeline.length - 2];
    const latest = latestMonth ? row.totalsByMonth[latestMonth] ?? 0 : 0;
    const previous = previousMonth ? row.totalsByMonth[previousMonth] ?? 0 : 0;
    return {
      ...row,
      latest,
      momDelta: timeline.length >= 2 ? latest - previous : null,
    };
  });

  table.sort((a, b) => b.total - a.total);

  const bySource: SourceSlice[] = [...sourceTotals.entries()]
    .map(([source, total]) => ({ source, total }))
    .sort((a, b) => b.total - a.total);

  const { delta: momDelta, percent: momPercent } = mom(trend);
  const latestMonth = timeline.length ? timeline[timeline.length - 1] : null;
  const latestTotal = trend.length ? trend[trend.length - 1].total : 0;
  const ytdTotal = ytd(timeline, trend);
  const rangeTotal = trend.reduce((sum, point) => sum + point.total, 0);
  const estimatedTax = rangeTotal * filters.taxRatePerTon;

  const kpis: Kpis = {
    latestMonth,
    latestTotal,
    momDelta,
    momPercent,
    ytdTotal,
    estimatedTax,
  };

  return {
    timeline,
    trend,
    bySource,
    table,
    kpis,
  };
}