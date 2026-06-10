"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectionOption {
  value: string;
  label: string;
  description?: string;
}

interface SelectionCardProps {
  options: SelectionOption[];
  value: string | null;
  onChange: (value: string) => void;
  multiple?: boolean;
  className?: string;
}

export function SelectionCard({
  options,
  value,
  onChange,
  multiple = false,
  className,
}: SelectionCardProps) {
  const selectedValues = multiple && value ? value.split(",") : [];

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const next = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange(next.join(","));
    } else {
      onChange(optionValue);
    }
  };

  const isSelected = (optionValue: string) => {
    if (multiple) return selectedValues.includes(optionValue);
    return value === optionValue;
  };

  return (
    <div className={cn("space-y-2.5", className)}>
      {options.map((option) => {
        const selected = isSelected(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            className={cn(
              "flex w-full items-center gap-4 rounded-[14px] border px-5 py-3 text-left transition-all duration-200",
              selected
                ? "border-text-primary bg-text-primary text-white"
                : "border-grey200 bg-grey50 text-text-primary"
            )}
          >
            {/* Indicator */}
            <div
              className={cn(
                "flex h-[22px] w-[22px] shrink-0 items-center justify-center border-[1.5px] transition-all duration-200",
                multiple ? "rounded-[6px]" : "rounded-full",
                selected
                  ? "border-white bg-white"
                  : "border-grey300 bg-transparent"
              )}
            >
              {selected && (
                <Check
                  className="h-3.5 w-3.5 text-text-primary"
                  strokeWidth={3}
                />
              )}
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm font-medium transition-colors duration-200",
                  selected ? "text-white" : "text-grey800"
                )}
              >
                {option.label}
              </p>
              {option.description && (
                <p
                  className={cn(
                    "mt-0.5 text-xs transition-colors duration-200",
                    selected ? "text-white/70" : "text-text-tertiary"
                  )}
                >
                  {option.description}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
