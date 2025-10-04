import { YearMonth } from "./types";

export function formatYearMonth(value: YearMonth, locale: string = "ko-KR"): string {
  const [year, month] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short" }).format(date);
}

export function compareYearMonth(a: YearMonth, b: YearMonth): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function expandYearMonthRange(from: YearMonth, to: YearMonth): YearMonth[] {
  const result: YearMonth[] = [];
  let [year, month] = from.split("-").map(Number);
  const [endYear, endMonth] = to.split("-").map(Number);

  while (year < endYear || (year === endYear && month <= endMonth)) {
    const safeMonth = month.toString().padStart(2, "0");
    result.push(`${year}-${safeMonth}` as YearMonth);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return result;
}

export function clampYearMonth(value: YearMonth, min: YearMonth, max: YearMonth): YearMonth {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
