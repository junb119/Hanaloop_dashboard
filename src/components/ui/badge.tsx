// KPI 증감이나 필터 상태를 표현하기 위한 소형 배지 컴포넌트입니다.
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "up" | "down";
};

const tones = {
  neutral: "bg-white/10 text-slate-200",
  up: "bg-emerald-400/15 text-emerald-300",
  down: "bg-orange-400/20 text-orange-300",
};

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
