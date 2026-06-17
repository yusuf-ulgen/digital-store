"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActiveToggleProps {
  active: boolean;
  onChange: (active: boolean) => void;
  className?: string;
}

export function ActiveToggle({ active, onChange, className }: ActiveToggleProps) {
  return (
    <div
      className={cn(
        "flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300 select-none shrink-0",
        active 
          ? "bg-stone-200 border border-stone-300" 
          : "bg-stone-50 border border-stone-200",
        className
      )}
      onClick={() => onChange(!active)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onChange(!active);
        }
      }}
    >
      <div className="flex justify-between items-center w-full relative h-full">
        {/* Slider Bubble */}
        <div
          className={cn(
            "flex justify-center items-center w-5 h-5 rounded-full transition-transform duration-300 z-10 shadow-sm",
            active 
              ? "transform translate-x-8 bg-stone-700" 
              : "transform translate-x-0 bg-stone-350"
          )}
        >
          {active ? (
            <Check 
              className="w-3.5 h-3.5 text-stone-100" 
              strokeWidth={2.5}
            />
          ) : (
            <X 
              className="w-3.5 h-3.5 text-stone-600" 
              strokeWidth={2.5}
            />
          )}
        </div>
        
        {/* Background Icons/Text */}
        <div className="absolute inset-0 flex justify-between items-center px-1.5 pointer-events-none select-none text-[9px] font-bold text-stone-400">
          <span className={cn("transition-opacity duration-200", active ? "opacity-100 text-stone-600" : "opacity-0")}>
            A
          </span>
          <span className={cn("transition-opacity duration-200", active ? "opacity-0" : "opacity-100 text-stone-400")}>
            P
          </span>
        </div>
      </div>
    </div>
  );
}
