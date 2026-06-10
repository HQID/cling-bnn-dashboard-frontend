"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  className?: string;
}

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 99999,
  step = 1,
  placeholder = "0",
  className,
}: NumberStepperProps) {
  const handleDecrement = () => {
    const next = value - step;
    onChange(Math.max(min, next));
  };

  const handleIncrement = () => {
    const next = value + step;
    onChange(Math.min(max, next));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      onChange(min);
      return;
    }
    const num = parseInt(raw, 10);
    if (!isNaN(num)) {
      onChange(Math.min(max, Math.max(min, num)));
    }
  };

  return (
    <div
      className={cn(
        "flex h-11 items-center rounded-[16px] bg-off-white",
        className
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className="flex h-full w-12 shrink-0 items-center justify-center rounded-l-[16px] text-text-secondary transition-all hover:bg-grey100 disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="h-full min-w-0 flex-1 bg-transparent text-center text-sm font-semibold text-text-primary outline-none placeholder:text-text-tertiary"
      />
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className="flex h-full w-12 shrink-0 items-center justify-center rounded-r-[16px] text-text-secondary transition-all hover:bg-grey100 disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
