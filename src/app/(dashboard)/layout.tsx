"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { AppNav } from "../../components/ui/app-nav";
import { Button } from "../../components/ui/button";

const navItems = [
  { href: "/dashboard", label: "대시보드" },
  { href: "/posts", label: "게시물" },
  { href: "/settings", label: "설정" },
];

export default function DashboardGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const closeMobileNav = () => setIsMobileNavOpen(false);

  return (
    <div className="min-h-screen bg-[rgba(2,6,23,0.9)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col gap-6 px-4 py-6 md:flex-row md:gap-8 md:px-8 md:py-10">
        <aside className="hidden md:flex md:w-64 md:flex-col md:gap-6">
          <div className="rounded-[var(--radius-xl)] border border-white/10 bg-[rgba(15,23,42,0.55)] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-sky-300/80">HanaLoop</p>
            <h1 className="mt-2 text-2xl font-semibold">탄소 인텔리전스</h1>
          </div>
          <div className="rounded-[var(--radius-xl)] border border-white/10 bg-[rgba(15,23,42,0.55)] p-4">
            <AppNav items={navItems} />
          </div>
        </aside>

        <header className="sticky top-0 z-40 flex w-full items-center justify-between rounded-[var(--radius-xl)] border border-white/10 bg-[rgba(15,23,42,0.75)] px-4 py-3 backdrop-blur md:hidden">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sky-300/80">HanaLoop</p>
            <h1 className="text-lg font-semibold">탄소 인텔리전스</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="모바일 메뉴 열기"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 text-slate-100">
              <path
                d="M3.75 6.75h16.5m-16.5 5.25h16.5m-16.5 5.25h16.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span className="sr-only">모바일 메뉴 열기</span>
          </Button>
        </header>

        {isMobileNavOpen ? (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur" onClick={closeMobileNav} />
            <div className="absolute left-4 right-4 top-16 rounded-3xl border border-white/15 bg-[rgba(15,23,42,0.95)] p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-100">탐색 메뉴</p>
                <Button variant="ghost" size="sm" onClick={closeMobileNav}>
                  닫기
                </Button>
              </div>
              <AppNav items={navItems} />
            </div>
          </div>
        ) : null}

        <main className="flex-1 space-y-6 pb-8 md:space-y-6 md:pb-10">{children}</main>
      </div>
    </div>
  );
}
