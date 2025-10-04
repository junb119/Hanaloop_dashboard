// 기본 입력 필드와 어울리는 스타일의 다중 행 텍스트 입력 컴포넌트입니다.
import type { TextareaHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "../../lib/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400/80 focus:border-sky-300/70 focus:outline-none focus:ring-2 focus:ring-sky-500/40",
        "min-h-[120px]",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
