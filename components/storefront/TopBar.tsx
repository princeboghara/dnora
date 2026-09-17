"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

const ANNOUNCEMENTS = [
  {
    text: "Complimentary Worldwide Express Delivery on orders over $250",
    link: "/shop",
  },
  {
    text: "Spring / Summer 2026 Collection — Architectural Silhouettes Now Live",
    link: "/#new-arrivals",
  },
  {
    text: "Artisan Handcrafted in Florence, Italy • Limited Batch Production",
    link: "/#editorial",
  },
];

export function TopBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = ANNOUNCEMENTS[index];

  return (
    <div className="bg-[#0E0E0E] text-[#FAF9F6] text-xs py-2 px-4 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-center text-center">
        <Link
          href={current.link}
          className="inline-flex items-center gap-1.5 font-medium tracking-wider uppercase text-[11px] hover:text-[#C5A880] transition-colors"
        >
          <span>{current.text}</span>
          <ChevronRight className="w-3 h-3 text-[#C5A880]" />
        </Link>
      </div>
    </div>
  );
}
