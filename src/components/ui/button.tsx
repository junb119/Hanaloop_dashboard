// 디자인 시스템에 맞춘 버튼 컴포넌트로, 크기·변형·로딩 상태를 한 번에 제어합니다.
import type { ButtonHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "../../lib/cn";

type Variant = "primary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

const base = "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

// 변형별로 적용할 Tailwind 유틸리티 클래스를 매핑합니다.
const variants: Record<Variant, string> = {
  primary: "bg-sky-500/90 text-slate-900 hover:bg-sky-400/90 focus-visible:outline-sky-300",
  ghost: "bg-transparent text-slate-200 hover:bg-white/10 focus-visible:outline-sky-300",
  danger: "bg-rose-500/90 text-white hover:bg-rose-400/90 focus-visible:outline-rose-300",
};

const sizes = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], disabled || loading ? "opacity-60" : "", className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <span className="size-3 animate-ping rounded-full bg-current" />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
