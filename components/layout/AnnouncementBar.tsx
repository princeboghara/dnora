"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Truck, ShieldCheck, Sparkles } from "lucide-react";

const ANNOUNCEMENTS = [
  {
    icon: Sparkles,
    text: "GET EXTRA 10% OFF ON PREPAID ORDERS | USE CODE: DNORA10",
    link: "/shop",
  },
  {
    icon: Truck,
    text: "FREE EXPRESS DELIVERY ACROSS INDIA ON ORDERS OVER ₹999",
    link: "/shop",
  },
  {
    icon: ShieldCheck,
    text: "HASSLE-FREE 7 DAYS RETURNS & CASH ON DELIVERY AVAILABLE",
    link: "/faq",
  },
];

export function AnnouncementBar() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  // Auto-swipe effect every 3.5 seconds with pause-on-hover
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused]);

  const prevAnnouncement = () => {
    setCurrentIdx((prev) => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);
  };

  const nextAnnouncement = () => {
    setCurrentIdx((prev) => (prev + 1) % ANNOUNCEMENTS.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    if (diff > 40) {
      prevAnnouncement();
    } else if (diff < -40) {
      nextAnnouncement();
    }
    touchStartXRef.current = null;
  };

  return (
    <div
      className="bg-[#111111] text-[#F5F2EB] text-[11px] tracking-[0.15em] uppercase py-2 px-3 border-b border-[#222222] select-none relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left branding tag */}
        <div className="hidden md:flex items-center gap-2 text-[#C5A880] text-[10px] tracking-[0.2em] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-pulse" />
          <span>DNORA LUXURY ESSENTIALS</span>
        </div>

        {/* Center auto-swiping announcement carousel */}
        <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 overflow-hidden">
          <button
            type="button"
            onClick={prevAnnouncement}
            className="p-1 hover:text-[#C5A880] text-[#777777] transition-colors cursor-pointer shrink-0"
            aria-label="Previous announcement"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Smooth Swiping Carousel Track */}
          <div className="relative h-6 w-full max-w-lg overflow-hidden flex items-center justify-center">
            {ANNOUNCEMENTS.map((item, idx) => {
              const IconComponent = item.icon;
              const isActive = idx === currentIdx;
              return (
                <div
                  key={idx}
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isActive
                      ? "opacity-100 translate-x-0 pointer-events-auto"
                      : idx < currentIdx
                      ? "opacity-0 -translate-x-full pointer-events-none"
                      : "opacity-0 translate-x-full pointer-events-none"
                  }`}
                >
                  <Link
                    href={item.link}
                    className="flex items-center gap-2 text-center text-[10px] sm:text-xs font-medium hover:text-[#C5A880] transition-colors truncate px-2"
                  >
                    <IconComponent className="w-3.5 h-3.5 text-[#C5A880] shrink-0 animate-pulse" />
                    <span className="truncate max-w-[270px] sm:max-w-none">{item.text}</span>
                  </Link>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={nextAnnouncement}
            className="p-1 hover:text-[#C5A880] text-[#777777] transition-colors cursor-pointer shrink-0"
            aria-label="Next announcement"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right currency & help */}
        <div className="hidden md:flex items-center gap-4 text-[10px] text-[#A89F91]">
          <Link href="/contact" className="hover:text-[#F5F2EB] transition-colors">
            Help & Concierge
          </Link>
          <span className="text-[#333333]">|</span>
          <span className="font-semibold text-[#F5F2EB]">INR (₹)</span>
        </div>
      </div>
    </div>
  );
}
