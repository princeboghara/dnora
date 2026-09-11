"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface AnimatedLogoProps {
  className?: string;
  showSubtitle?: boolean;
}

interface LetterDef {
  id: string;
  char: string;
  dark: string;
  gold: string;
  width: number;
  height: number;
}

const LETTERS: LetterDef[] = [
  {
    id: "d",
    char: "D",
    dark: "/images/logo/letters/dark/d.png",
    gold: "/images/logo/letters/gold/d.png",
    width: 142,
    height: 170,
  },
  {
    id: "n",
    char: "N",
    dark: "/images/logo/letters/dark/n.png",
    gold: "/images/logo/letters/gold/n.png",
    width: 132,
    height: 170,
  },
  {
    id: "o",
    char: "O",
    dark: "/images/logo/letters/dark/o.png",
    gold: "/images/logo/letters/gold/o.png",
    width: 161,
    height: 170,
  },
  {
    id: "r",
    char: "R",
    dark: "/images/logo/letters/dark/r.png",
    gold: "/images/logo/letters/gold/r.png",
    width: 133,
    height: 170,
  },
  {
    id: "a",
    char: "A",
    dark: "/images/logo/letters/dark/a.png",
    gold: "/images/logo/letters/gold/a.png",
    width: 160,
    height: 170,
  },
];

export function AnimatedLogo({
  className = "",
  showSubtitle = true,
}: AnimatedLogoProps) {
  const [animKey, setAnimKey] = useState(0);
  const [isFormed, setIsFormed] = useState(false);
  const [staggerMode, setStaggerMode] = useState<"together" | "stagger">("together");

  // Trigger individual character formation on initial website open
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimKey((prev) => prev + 1);
    }, 150);

    const finishTimer = setTimeout(() => {
      setIsFormed(true);
    }, 1800);

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [staggerMode]);

  // Replay smooth character formation on hover
  const handleMouseEnter = () => {
    setIsFormed(false);
    setAnimKey((prev) => prev + 1);
    setTimeout(() => {
      setIsFormed(true);
    }, 1700);
  };

  // Toggle between all characters together vs micro-wave
  const toggleTiming = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFormed(false);
    setStaggerMode((prev) => (prev === "together" ? "stagger" : "together"));
  };

  return (
    <Link
      href="/"
      onMouseEnter={handleMouseEnter}
      className={`inline-flex flex-col items-center group py-0.5 relative select-none cursor-pointer ${className}`}
      aria-label="D'NORA Home"
    >
      {/* 5-Character Composite Logo Row (D N O R A) */}
      <div className="relative flex items-center justify-center h-7 sm:h-9 lg:h-10">
        {LETTERS.map((letter, index) => {
          const delaySec = staggerMode === "together" ? 0 : index * 0.05;
          const delayStyle = {
            animationDelay: `${delaySec}s`,
          };

          return (
            <div
              key={`${letter.id}-${animKey}`}
              className="relative h-full overflow-hidden select-none transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              style={{
                aspectRatio: `${letter.width} / ${letter.height}`,
              }}
            >
              {/* 1. Ghost Blueprint Mold (Muted 16% opacity base outline) */}
              <img
                src={letter.dark}
                alt={letter.char}
                className="h-full w-full object-contain opacity-[0.16] select-none pointer-events-none"
              />

              {/* 2. Character Active Formation & Color Fill */}
              <div
                className="absolute inset-0 pointer-events-none animate-char-fill"
                style={delayStyle}
              >
                <img
                  src={letter.dark}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full object-contain select-none"
                />
              </div>

              {/* 3. Meniscus Gold Shimmer Surface */}
              <div
                className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-0 animate-char-gold"
                style={delayStyle}
              >
                <img
                  src={letter.gold}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full object-contain select-none"
                />
              </div>

              {/* 4. Rising Liquid Meniscus Beam on this specific character */}
              <div
                className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#C5A880] to-transparent shadow-[0_0_6px_rgba(197,168,128,0.9)] pointer-events-none opacity-0 animate-char-meniscus"
                style={delayStyle}
              >
                {/* Micro accent center dot on the meniscus */}
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[#FFF5EA] shadow-[0_0_4px_#FFF]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Subtitle: "LUXURY ESSENTIALS" */}
      {showSubtitle && (
        <div className="flex items-center gap-1 mt-0.5">
          <span
            className="text-[8px] sm:text-[9px] uppercase tracking-[0.38em] text-[#8C7A6B] font-medium transition-all duration-300 group-hover:text-[#C5A880] group-hover:tracking-[0.44em]"
          >
            LUXURY ESSENTIALS
          </span>
          {/* Subtle mode switch indicator dot */}
          <button
            type="button"
            onClick={toggleTiming}
            title={`Mode: ${staggerMode === "together" ? "All Characters Together (Aeksathe)" : "Sequential Flow"}. Click to switch.`}
            className="w-1.5 h-1.5 rounded-full bg-[#C5A880]/30 hover:bg-[#C5A880] transition-colors ml-0.5 cursor-pointer opacity-30 hover:opacity-100"
            aria-label="Toggle character animation timing"
          />
        </div>
      )}
    </Link>
  );
}
