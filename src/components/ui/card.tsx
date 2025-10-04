// 대시보드 전반에서 사용하는 기본 카드 컨테이너 컴포넌트입니다.
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  translucent?: boolean;
};

export function Card({ className, translucent = true, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/10",
        translucent ? "bg-white/[0.06] backdrop-blur" : "bg-slate-900",
        "shadow-[0_30px_80px_-40px_rgba(15,118,230,0.35)]",
        className,
      )}
      {...props}
    />
  );
}
