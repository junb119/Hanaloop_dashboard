// 로딩 중인 영역을 가볍게 대체하기 위한 스켈레톤 플레이스홀더입니다.
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-2xl bg-slate-600/30", className)} {...props} />;
}
