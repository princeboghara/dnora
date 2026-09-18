import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "gold" | "success" | "warning" | "danger";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-[#0E0E0E] text-[#FAF9F6] border-transparent",
    secondary: "bg-[#F5F3EF] text-[#3A3835] border-transparent",
    outline: "border-[#E8E5DE] text-[#1C1B1A] bg-transparent",
    gold: "bg-[#F5F3EF] text-[#0E0E0E] border-[#E8E5DE]",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    danger: "bg-rose-50 text-rose-800 border-rose-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide uppercase border transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
