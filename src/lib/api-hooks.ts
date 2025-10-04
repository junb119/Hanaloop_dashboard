"use client";

import { useQuery } from "./queries";
import { fetchCompanies, fetchCountries, fetchPosts } from "./api";
import type { Company, Country, Post } from "./types";

const keys = {
  countries: "countries",
  companies: "companies",
  posts: "posts",
};

export function useCountriesQuery() {
  return useQuery<Country[]>(keys.countries, fetchCountries);
}

export function useCompaniesQuery() {
  return useQuery<Company[]>(keys.companies, fetchCompanies);
}

export function usePostsQuery() {
  return useQuery<Post[]>(keys.posts, fetchPosts);
}

export const queryKeys = keys;