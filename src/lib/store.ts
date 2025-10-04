import { create } from "zustand";
import { YearMonthRange } from "./types";

type FiltersState = {
  selectedCompanyIds: string[];
  yearMonthRange: YearMonthRange | null;
  taxRatePerTon: number;
  setSelectedCompanyIds: (ids: string[]) => void;
  setYearMonthRange: (range: YearMonthRange | null) => void;
  setTaxRatePerTon: (value: number) => void;
  reset: () => void;
};

const defaultState = {
  selectedCompanyIds: [],
  yearMonthRange: null,
  taxRatePerTon: 50,
} satisfies Pick<FiltersState, "selectedCompanyIds" | "yearMonthRange" | "taxRatePerTon">;

export const useFiltersStore = create<FiltersState>((set) => ({
  ...defaultState,
  setSelectedCompanyIds: (ids) => set({ selectedCompanyIds: ids }),
  setYearMonthRange: (range) => set({ yearMonthRange: range }),
  setTaxRatePerTon: (value) => set({ taxRatePerTon: value }),
  reset: () => set(defaultState),
}));