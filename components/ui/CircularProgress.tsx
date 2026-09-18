"use client";

import React from "react";

interface CircularProgressProps {
  progress?: number; // 0 to 100
  size?: number; // width & height in px
  strokeWidth?: number;
  label?: string;
  isIndeterminate?: boolean;
  className?: string;
}

export function CircularProgress({
  progress = 0,
  size = 56,
  strokeWidth = 4,
  label,
  isIndeterminate = false,
  className = "",
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const offset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className={`-rotate-90 transform ${isIndeterminate ? "animate-spin" : ""}`}
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E8E5DE"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#0E0E0E"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={isIndeterminate ? circumference * 0.75 : offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-200 ease-out"
          />
        </svg>

        {/* Center Percentage Display */}
        {!isIndeterminate && (
          <span className="absolute font-mono text-[11px] font-bold text-[#0E0E0E]">
            {Math.round(clampedProgress)}%
          </span>
        )}
      </div>

      {label && (
        <span className="text-[11px] font-medium uppercase tracking-wider text-[#73706A]">
          {label}
        </span>
      )}
    </div>
  );
}
