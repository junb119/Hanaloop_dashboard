// 일관된 스타일과 키보드 접근성을 제공하는 커스텀 드롭다운 컴포넌트입니다.
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../lib/cn";

type DropdownOption = {
  value: string;
  label: string;
  description?: string;
};

type DropdownSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  menuLabel?: string;
};

export function DropdownSelect({
  value,
  onChange,
  options,
  placeholder = "선택하세요",
  disabled = false,
  menuLabel = "옵션 목록",
}: DropdownSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

    // 핸들러 내부에서 길이 계산을 반복하지 않도록 옵션 수를 캐싱합니다.
  const optionsCount = options.length;

  const valueLabel = useMemo(
    () => options.find((option) => option.value === value)?.label ?? "",
    [options, value],
  );

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  const handleSelect = useCallback(
    (selectedValue: string) => {
      if (selectedValue !== value) {
        onChange(selectedValue);
      }
      closeMenu();
      triggerRef.current?.focus();
    },
    [closeMenu, onChange, value],
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (listRef.current?.contains(event.target as Node) || triggerRef.current?.contains(event.target as Node)) {
        return;
      }
      closeMenu();
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, closeMenu]);

  useEffect(() => {
    if (isOpen && optionsCount > 0) {
      const currentIndex = options.findIndex((option) => option.value === value);
      setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  }, [isOpen, options, optionsCount, value]);

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || optionsCount === 0) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((previous) => {
        if (previous === -1) {
          return event.key === "ArrowDown" ? 0 : Math.max(0, optionsCount - 1);
        }
        if (event.key === "ArrowDown") {
          return (previous + 1) % optionsCount;
        }
        return (previous - 1 + optionsCount) % optionsCount;
      });
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsOpen((open) => !open);
    }
  };

  const handleListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (optionsCount === 0) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((previous) => {
        const nextIndex =
          previous === -1
            ? event.key === "ArrowDown"
              ? 0
              : optionsCount - 1
            : event.key === "ArrowDown"
            ? (previous + 1) % optionsCount
            : (previous - 1 + optionsCount) % optionsCount;
        return nextIndex;
      });
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = options[highlightedIndex];
      if (option) {
        handleSelect(option.value);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      triggerRef.current?.focus();
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setIsOpen((open) => !open)}
        disabled={disabled}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-100 transition",
          "focus:border-sky-300/70 focus:outline-none focus:ring-2 focus:ring-sky-500/40",
          disabled ? "opacity-60" : "hover:border-sky-300/40",
        )}
      >
        <span className={cn("truncate", valueLabel ? "text-slate-100" : "text-slate-400/80")}>{valueLabel || placeholder}</span>
        <svg
          aria-hidden
          className={cn("size-4 text-slate-300 transition", isOpen ? "rotate-180" : "rotate-0")}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {isOpen ? (
        <div
          ref={listRef}
          role="listbox"
          aria-label={menuLabel}
          tabIndex={-1}
          onKeyDown={handleListKeyDown}
          className="absolute z-50 mt-2 w-full min-w-[220px] rounded-2xl border border-white/15 bg-[rgba(15,23,42,0.92)] p-1 shadow-xl backdrop-blur"
        >
          {optionsCount === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-400">선택 가능한 항목이 없습니다.</div>
          ) : (
            options.map((option, index) => {
              const isActive = option.value === value;
              const isHighlighted = index === highlightedIndex;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseLeave={() => setHighlightedIndex(-1)}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "flex w-full flex-col items-start rounded-xl px-4 py-2 text-left text-sm transition",
                    isHighlighted ? "bg-sky-500/15 text-sky-100" : "text-slate-200 hover:bg-white/10",
                    isActive ? "border border-sky-500/40" : "border border-transparent",
                  )}
                >
                  <span className="font-medium">{option.label}</span>
                  {option.description ? (
                    <span className="text-xs text-slate-400/80">{option.description}</span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}

