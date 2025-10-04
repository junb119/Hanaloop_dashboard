export type YearMonth = `${number}-${string}`;

export type GhgEmission = {
  yearMonth: YearMonth;
  source: string;
  emissions: number;
};

export type Country = {
  code: string;
  name: string;
  region: string;
};

export type Company = {
  id: string;
  name: string;
  country: Country["code"];
  emissions: GhgEmission[];
};

export type Post = {
  id: string;
  title: string;
  resourceUid: Company["id"];
  dateTime: YearMonth;
  content: string;
  author: string;
  createdAt: string;
};

export type FetchState<TData> = {
  data: TData | null;
  isLoading: boolean;
  error: string | null;
};

export type YearMonthRange = {
  from: YearMonth;
  to: YearMonth;
};