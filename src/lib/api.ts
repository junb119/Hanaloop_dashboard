import { companies as seedCompanies, countries as seedCountries, posts as seedPosts } from "./data";
import { Company, Country, Post } from "./types";

let _countries = [...seedCountries];
let _companies = seedCompanies.map((company) => ({
  ...company,
  emissions: company.emissions.map((emission) => ({ ...emission })),
}));
let _posts = [...seedPosts];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const jitter = () => 200 + Math.random() * 600;
const shouldFail = () => Math.random() < 0.15;

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

async function simulate<T>(value: T): Promise<T> {
  await delay(jitter());
  if (shouldFail()) {
    throw new Error("Network request failed");
  }
  return clone(value);
}

export async function fetchCountries(): Promise<Country[]> {
  return simulate(_countries);
}

export async function fetchCompanies(): Promise<Company[]> {
  return simulate(_companies);
}

export async function fetchPosts(): Promise<Post[]> {
  return simulate(_posts);
}

type UpsertPostInput = {
  id?: string;
  title: string;
  resourceUid: string;
  dateTime: string;
  content: string;
  author: string;
  createdAt?: string;
};

export async function createOrUpdatePost(input: UpsertPostInput): Promise<Post> {
  const existingIndex = _posts.findIndex((item) => item.id === input.id);
  const existing = existingIndex >= 0 ? _posts[existingIndex] : null;

  const base: Post = {
    id: input.id ?? `p-${crypto.randomUUID()}`,
    title: input.title,
    resourceUid: input.resourceUid,
    dateTime: input.dateTime,
    content: input.content,
    author: input.author,
    createdAt: input.createdAt ?? existing?.createdAt ?? new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    _posts[existingIndex] = base;
  } else {
    _posts.push(base);
  }

  try {
    return await simulate(base);
  } catch (error) {
    if (existingIndex >= 0) {
      _posts[existingIndex] = existing ?? clone(seedPosts.find((item) => item.id === base.id) ?? base);
    } else {
      _posts = _posts.filter((item) => item.id !== base.id);
    }
    throw error;
  }
}

export async function deletePost(id: string): Promise<void> {
  const snapshot = [..._posts];
  _posts = _posts.filter((item) => item.id !== id);
  try {
    await simulate(true);
  } catch (error) {
    _posts = snapshot;
    throw error;
  }
}

export function __resetData() {
  _countries = [...seedCountries];
  _companies = seedCompanies.map((company) => ({
    ...company,
    emissions: company.emissions.map((emission) => ({ ...emission })),
  }));
  _posts = [...seedPosts];
}