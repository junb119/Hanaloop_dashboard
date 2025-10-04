// 단일 KPI 값을 아이콘과 톤 정보와 함께 보여 주는 카드 컴포넌트입니다.
import type { ReactNode } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/cn";

type KpiCardProps = {
  label: string;
  value: string;
  caption?: string;
  tone?: "neutral" | "up" | "down";
  icon?: ReactNode;
};

export function KpiCard({ label, value, caption, tone = "neutral", icon }: KpiCardProps) {
  return (
    <Card className="flex flex-col gap-3 p-6">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-xs uppercase tracking-[0.35em] text-slate-300/70">{label}</span>
      </div>
      <p className="text-3xl font-semibold text-slate-50">{value}</p>
      {caption ? (
        <Badge
          tone={tone}
          className={cn(
            "self-start text-[11px]",
            tone === "neutral" ? "bg-white/10 text-slate-200/80" : undefined,
          )}
        >
          {caption}
        </Badge>
      ) : null}
    </Card>
  );
}
