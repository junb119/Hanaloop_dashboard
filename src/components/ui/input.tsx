// 대시보드 스타일에 맞춘 기본 입력 필드 컴포넌트입니다.
import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "../../lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-400/80 focus:border-sky-300/70 focus:outline-none focus:ring-2 focus:ring-sky-500/40",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
