import { Company, Country, Post } from "./types";

export const countries: Country[] = [
  { code: "US", name: "United States", region: "North America" },
  { code: "DE", name: "Germany", region: "Europe" },
  { code: "KR", name: "South Korea", region: "Asia Pacific" },
];

export const companies: Company[] = [
  {
    id: "c1",
    name: "Acme Corp",
    country: "US",
    emissions: [
      { yearMonth: "2024-01", source: "diesel", emissions: 120 },
      { yearMonth: "2024-02", source: "diesel", emissions: 110 },
      { yearMonth: "2024-03", source: "diesel", emissions: 95 },
      { yearMonth: "2024-03", source: "electricity", emissions: 45 },
    ],
  },
  {
    id: "c2",
    name: "Globex",
    country: "DE",
    emissions: [
      { yearMonth: "2024-01", source: "gasoline", emissions: 80 },
      { yearMonth: "2024-02", source: "gasoline", emissions: 105 },
      { yearMonth: "2024-03", source: "gasoline", emissions: 120 },
      { yearMonth: "2024-03", source: "diesel", emissions: 38 },
    ],
  },
  {
    id: "c3",
    name: "Hana Manufacturing",
    country: "KR",
    emissions: [
      { yearMonth: "2024-01", source: "lpg", emissions: 64 },
      { yearMonth: "2024-02", source: "lpg", emissions: 70 },
      { yearMonth: "2024-03", source: "lpg", emissions: 68 },
      { yearMonth: "2024-03", source: "electricity", emissions: 52 },
    ],
  },
];

export const posts: Post[] = [
  {
    id: "p1",
    title: "Sustainability Report",
    resourceUid: "c1",
    dateTime: "2024-02",
    content: "Quarterly CO2 update and mitigation plans.",
    author: "",
    createdAt: "",
  },
  {
    id: "p2",
    title: "Energy Efficiency Retrofits",
    resourceUid: "c3",
    dateTime: "2024-03",
    content: "Facility upgrades expected to cut LPG use by 12%.",
    author: "",
    createdAt: "",
  },
];
