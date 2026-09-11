"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface AnimatedLogoProps {
  className?: string;
  showSubtitle?: boolean;
  defaultMode?: "rise" | "flow";
}

export function AnimatedLogo({
  className = "",
  showSubtitle = true,
  defaultMode = "rise",
}: AnimatedLogoProps) {
  const [animKey, setAnimKey] = useState(0);
  const [mode, setMode] = useState<"rise" | "flow">(defaultMode);
  const [isFilled, setIsFilled] = useState(false);

  // Trigger professional logo fill on page open
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimKey((prev) => prev + 1);
    }, 150);

    const finishTimer = setTimeout(() => {
      setIsFilled(true);
    }, 2100);

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [mode]);

  // Replay smooth fill on hover
  const handleMouseEnter = () => {
    setIsFilled(false);
    setAnimKey((prev) => prev + 1);
    setTimeout(() => {
      setIsFilled(true);
    }, 2000);
  };

  // Toggle between Vertical Liquid Rise & Horizontal Flow on subtitle click
  const toggleMode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFilled(false);
    setMode((prev) => (prev === "rise" ? "flow" : "rise"));
  };

  return (
    <Link
      href="/"
      onMouseEnter={handleMouseEnter}
      className={`inline-flex flex-col items-center group py-0.5 relative select-none cursor-pointer ${className}`}
      aria-label="D'NORA Home"
    >
      {/* Logo Container */}
      <div className="relative flex items-center justify-center overflow-hidden px-1">
        {/* Layer 1: Blueprint / Ghost Unfilled Silhouette (Base Mold) */}
        <img
          src="/images/logo/dnora-logo-dark.png"
          alt="DNORA"
          className="h-7 sm:h-9 lg:h-10 w-auto object-contain opacity-[0.16] select-none transition-transform duration-500 ease-out group-hover:scale-[1.02]"
        />

        {/* Layer 2: Active Liquid / Color Fill Layer */}
        <div
          key={`fill-${mode}-${animKey}`}
          className={`absolute inset-0 pointer-events-none ${
            mode === "rise" ? "animate-logo-rise-fill" : "animate-logo-flow-fill"
          }`}
        >
          <img
            src="/images/logo/dnora-logo-dark.png"
            alt=""
            aria-hidden="true"
            className="h-7 sm:h-9 lg:h-10 w-auto object-contain select-none transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          />
        </div>

        {/* Layer 3: Champagne Gold Surface Tint (Liquid Meniscus Shimmer) */}
        <div
          key={`gold-${mode}-${animKey}`}
          className={`absolute inset-0 pointer-events-none mix-blend-multiply ${
            mode === "rise" ? "animate-logo-rise-gold" : "animate-logo-flow-gold"
          }`}
        >
          <img
            src="/images/logo/dnora-logo-gold.png"
            alt=""
            aria-hidden="true"
            className="h-7 sm:h-9 lg:h-10 w-auto object-contain select-none opacity-0"
          />
        </div>

        {/* Layer 4: Precision Glowing Meniscus / Fill-Edge Beam */}
        {mode === "rise" ? (
          <div
            key={`meniscus-rise-${animKey}`}
            className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#C5A880] to-transparent shadow-[0_0_8px_rgba(197,168,128,0.9)] pointer-events-none opacity-0 animate-logo-rise-meniscus"
          />
        ) : (
          <div
            key={`meniscus-flow-${animKey}`}
            className="absolute inset-y-0 w-[2px] bg-gradient-to-b from-transparent via-[#C5A880] to-transparent shadow-[0_0_8px_rgba(197,168,128,0.9)] pointer-events-none opacity-0 animate-logo-flow-meniscus -skew-x-[15deg]"
          />
        )}
      </div>

      {/* Subtitle: "LUXURY ESSENTIALS" with modern typography */}
      {showSubtitle && (
        <div className="flex items-center gap-1 mt-0.5">
          <span
            key={`sub-${animKey}`}
            className="text-[8px] sm:text-[9px] uppercase tracking-[0.38em] text-[#8C7A6B] font-medium transition-all duration-300 group-hover:text-[#C5A880] group-hover:tracking-[0.44em] animate-logo-subtitle"
          >
            LUXURY ESSENTIALS
          </span>
          {/* Subtle mode switch indicator dot */}
          <button
            type="button"
            onClick={toggleMode}
            title={`Current: ${mode === "rise" ? "Liquid Rise (Bottom-Up)" : "Precision Flow (Left-Right)"}. Click to switch.`}
            className="w-1.5 h-1.5 rounded-full bg-[#C5A880]/30 hover:bg-[#C5A880] transition-colors ml-0.5 cursor-pointer opacity-40 hover:opacity-100"
            aria-label="Toggle logo animation style"
          />
        </div>
      )}
    </Link>
  );
}
