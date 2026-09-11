"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface AnimatedLogoProps {
  className?: string;
  showSubtitle?: boolean;
}

export function AnimatedLogo({ className = "", showSubtitle = true }: AnimatedLogoProps) {
  const [animKey, setAnimKey] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Trigger luxury cinematic reveal animation on initial website load/mount
  useEffect(() => {
    // Slight delay for smooth browser paint synchronization
    const timer = setTimeout(() => {
      setAnimKey((prev) => prev + 1);
    }, 150);

    // Periodic gentle luxury gleam every 16 seconds
    const interval = setInterval(() => {
      setAnimKey((prev) => prev + 1);
    }, 16000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setAnimKey((prev) => prev + 1);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <Link
      href="/"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`inline-flex flex-col items-center group py-0.5 relative select-none cursor-pointer ${className}`}
      aria-label="D'NORA Home"
    >
      {/* 1. Ambient Cinematic Gold Halo Aura */}
      <div
        key={`aura-${animKey}`}
        className="absolute -inset-x-6 -inset-y-2 pointer-events-none rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(197,168,128,0.22),transparent_70%)] opacity-0 animate-logo-aura"
      />

      {/* 2. Logo Wrapper with layered visual reflection */}
      <div className="relative flex items-center justify-center overflow-hidden px-1">
        {/* Base Logo Image (Dark Noir) */}
        <img
          src="/images/logo/dnora-logo-dark.png"
          alt="DNORA"
          className="h-7 sm:h-9 lg:h-10 w-auto object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />

        {/* Shimmering Metallic Gold Layer (Fades in dynamically during animation sweep) */}
        <img
          key={`gold-${animKey}`}
          src="/images/logo/dnora-logo-gold.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-7 sm:h-9 lg:h-10 w-auto object-contain pointer-events-none opacity-0 animate-logo-gold"
        />

        {/* 3. High-Speed Liquid Light Specular Beam (Video Clip Sheen Effect) */}
        <div
          key={`sweep-${animKey}`}
          className="absolute inset-0 pointer-events-none overflow-hidden"
        >
          <div
            className="w-20 h-full bg-gradient-to-r from-transparent via-white/80 via-[#F3E5D0]/90 to-transparent blur-[1.5px] -translate-x-full animate-logo-sweep"
            style={{
              mixBlendMode: "overlay",
            }}
          />
        </div>

        {/* 4. Luxury 4-Point Diamond Flare Star Glint */}
        <div
          key={`glint-${animKey}`}
          className="absolute top-1 left-2 pointer-events-none opacity-0 animate-star-glint"
        >
          <svg
            className="w-3.5 h-3.5 text-[#E2CEB2] drop-shadow-[0_0_6px_rgba(226,206,178,0.9)]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        </div>

        {/* Secondary Glint on Right Side for extra cinematic depth */}
        <div
          key={`glint2-${animKey}`}
          className="absolute bottom-1 right-2 pointer-events-none opacity-0 animate-star-glint"
          style={{ animationDelay: "1.1s" }}
        >
          <svg
            className="w-2.5 h-2.5 text-[#C5A880] drop-shadow-[0_0_4px_rgba(197,168,128,0.8)]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        </div>
      </div>

      {/* 5. Subtitle: LUXURY ESSENTIALS with expansive tracking */}
      {showSubtitle && (
        <span
          className={`text-[8px] sm:text-[9px] uppercase tracking-[0.38em] text-[#8C7A6B] font-medium mt-0.5 transition-all duration-500 ${
            isHovered ? "text-[#C5A880] tracking-[0.44em]" : "group-hover:text-[#C5A880]"
          }`}
        >
          LUXURY ESSENTIALS
        </span>
      )}
    </Link>
  );
}
