// 대시보드 영역에서 활성 메뉴를 표시하는 세로형 내비게이션입니다.
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/cn";

type NavItem = {
  href: string;
  label: string;
};

type Props = {
  items: NavItem[];
};

export function AppNav({ items }: Props) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition",
              isActive ? "bg-sky-500/20 text-sky-50" : "text-slate-200/80 hover:bg-white/10",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
