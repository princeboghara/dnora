"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { AnnouncementConfig, AnnouncementItem } from "@/types";

interface TopBarProps {
  topbarConfig?: {
    enabled: boolean;
    text?: string;
    link?: string;
  };
}

export function TopBar({ topbarConfig }: TopBarProps) {
  const [config, setConfig] = useState<AnnouncementConfig>({
    id: "default",
    interval_seconds: 4,
    is_active: true,
    items: [],
  });
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch dynamic announcements configuration from database API
  useEffect(() => {
    let isMounted = true;
    async function loadConfig() {
      try {
        const res = await fetch("/api/announcements");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && Array.isArray(data.items)) {
            setConfig(data);
          }
        }
      } catch (err) {
        console.error("Failed to load announcements for TopBar:", err);
      }
    }

    loadConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  // Use active announcements loaded strictly from database
  const activeItems: AnnouncementItem[] = (config.items || []).filter((i) => i.is_active);

  const goToNext = useCallback(() => {
    if (activeItems.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % activeItems.length);
      setIsTransitioning(false);
    }, 200);
  }, [activeItems.length]);

  const goToPrev = useCallback(() => {
    if (activeItems.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setIndex((prev) => (prev - 1 + activeItems.length) % activeItems.length);
      setIsTransitioning(false);
    }, 200);
  }, [activeItems.length]);

  // Auto-swipe timer with pause-on-hover support
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!config.is_active || activeItems.length <= 1 || isHovered) return;

    const intervalMs = Math.max(1, config.interval_seconds) * 1000;
    timerRef.current = setInterval(() => {
      goToNext();
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [config.interval_seconds, config.is_active, activeItems.length, isHovered, goToNext]);

  if ((topbarConfig && topbarConfig.enabled === false) || !config.is_active || activeItems.length === 0) {
    return null;
  }

  const safeIndex = activeItems.length > 0 ? index % activeItems.length : 0;
  const current = activeItems[safeIndex] || activeItems[0];
  if (!current) return null;

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-slate-950 text-white border-b border-slate-800/80 select-none relative z-50 transition-colors"
      aria-label="Store Announcement"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between text-xs min-h-[36px]">
        {/* Left Arrow (Miraggio Style) */}
        {activeItems.length > 1 ? (
          <button
            type="button"
            onClick={goToPrev}
            aria-label="Previous announcement"
            className="text-white/70 hover:text-white p-1 transition-colors rounded hover:bg-white/10 shrink-0 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="w-6" />
        )}

        {/* Center Auto-Swiping Content */}
        <div className="flex-1 px-2 text-center overflow-hidden">
          <div
            className={`inline-flex items-center justify-center gap-2 transition-all duration-200 ${
              isTransitioning ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
            }`}
          >
            {/* Optional Badge */}
            {current.badge && (
              <span className="hidden sm:inline-block text-[9px] uppercase tracking-wider font-bold bg-white/15 text-white border border-white/20 px-2 py-0.5 rounded-sm shrink-0">
                {current.badge}
              </span>
            )}

            {/* Announcement Text / Link */}
            {current.link ? (
              <Link
                href={current.link}
                className="inline-flex items-center gap-1.5 font-medium tracking-wider uppercase text-[10px] sm:text-[11px] text-white hover:text-white/80 hover:underline transition-colors"
              >
                <span>{current.text}</span>
              </Link>
            ) : (
              <span className="font-medium tracking-wider uppercase text-[10px] sm:text-[11px] text-white">
                {current.text}
              </span>
            )}
          </div>
        </div>

        {/* Right Arrow (Miraggio Style) */}
        {activeItems.length > 1 ? (
          <button
            type="button"
            onClick={goToNext}
            aria-label="Next announcement"
            className="text-white/70 hover:text-white p-1 transition-colors rounded hover:bg-white/10 shrink-0 cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="w-6" />
        )}
      </div>
    </aside>
  );
}
