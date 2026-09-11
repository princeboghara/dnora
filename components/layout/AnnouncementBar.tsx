"use client";

import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const prevAnnouncement = () => {
    setCurrentIdx((prev) => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);
  };

  const nextAnnouncement = () => {
    setCurrentIdx((prev) => (prev + 1) % ANNOUNCEMENTS.length);
  };

  const current = ANNOUNCEMENTS[currentIdx];
  const IconComponent = current.icon;

  return (
    <div className="bg-[#111111] text-[#F5F2EB] text-[11px] tracking-[0.15em] uppercase py-2 px-3 border-b border-[#222222] transition-colors select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left branding tag */}
        <div className="hidden md:flex items-center gap-2 text-[#C5A880] text-[10px] tracking-[0.2em] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-pulse" />
          <span>DNORA LUXURY ESSENTIALS</span>
        </div>

        {/* Center announcement carousel */}
        <div className="flex-1 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={prevAnnouncement}
            className="p-1 hover:text-[#C5A880] text-[#888888] transition-colors"
            aria-label="Previous announcement"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <Link
            href={current.link}
            className="flex items-center gap-2 text-center text-xs font-medium hover:text-[#C5A880] transition-all duration-300 transform"
          >
            <IconComponent className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
            <span className="truncate max-w-[280px] sm:max-w-none">{current.text}</span>
          </Link>

          <button
            type="button"
            onClick={nextAnnouncement}
            className="p-1 hover:text-[#C5A880] text-[#888888] transition-colors"
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
