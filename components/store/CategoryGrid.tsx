"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Category } from "@/types";
import { getAdminCategoriesOverride } from "@/lib/services/catalog-service";

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const [liveCategories, setLiveCategories] = useState<Category[]>(categories);

  // Sync with Admin Category Overrides in real-time
  useEffect(() => {
    const updateCategories = () => {
      const override = getAdminCategoriesOverride();
      if (override !== null) {
        setLiveCategories(
          override
            .filter((c) => c.is_active !== false)
            .sort((a, b) => a.display_order - b.display_order)
        );
      } else {
        setLiveCategories(
          categories
            .filter((c) => c.is_active !== false)
            .sort((a, b) => a.display_order - b.display_order)
        );
      }
    };

    updateCategories();

    window.addEventListener("storage", updateCategories);
    window.addEventListener("dnora_categories_updated", updateCategories);
    return () => {
      window.removeEventListener("storage", updateCategories);
      window.removeEventListener("dnora_categories_updated", updateCategories);
    };
  }, [categories]);

  return (
    <section className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Category Header */}
      <div className="text-center mb-5 sm:mb-7 space-y-1">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B] font-semibold font-mono">
          Explore Handcrafted Silhouettes
        </span>
        <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl text-[#111111] font-light uppercase tracking-[0.15em]">
          Shop By Category
        </h2>
        <div className="w-10 h-[1.5px] bg-[#C5A880] mx-auto mt-2" />
      </div>

      {/* Dynamic Circular Category Rails directly powered by Admin */}
      <div className="flex items-center justify-start md:justify-center gap-5 sm:gap-7 lg:gap-9 overflow-x-auto pb-5 pt-2 no-scrollbar px-2">
        {/* 1. All Creations Luxury Pill */}
        <Link
          href="/shop"
          className="group flex flex-col items-center shrink-0 w-24 sm:w-28 md:w-32 text-center transition-transform duration-200 hover:-translate-y-1"
        >
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-white border-2 border-[#E0D8CC] p-1 shadow-xs group-hover:border-[#C5A880] group-hover:shadow-md transition-all">
            <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#141414] flex flex-col items-center justify-center p-2 text-white shadow-inner group-hover:scale-105 transition-transform duration-300">
              <span className="font-sans text-xs sm:text-sm md:text-base font-light tracking-[0.25em] text-[#FAF8F5] uppercase">
                ALL
              </span>
              <span className="text-[7.5px] sm:text-[9px] uppercase tracking-[0.22em] text-[#C5A880] font-mono mt-0.5 font-semibold">
                Explore
              </span>
            </div>
          </div>
          <span className="mt-2.5 text-xs sm:text-sm text-[#111111] font-medium tracking-wide group-hover:text-[#9E7D4E] transition-colors leading-tight">
            View All
          </span>
        </Link>

        {/* 2. Admin Driven Dynamic Categories */}
        {liveCategories.map((cat) => (
          <Link
            key={cat.id}
            href={`/shop/${cat.slug}`}
            className="group flex flex-col items-center shrink-0 w-24 sm:w-28 md:w-32 text-center transition-transform duration-200 hover:-translate-y-1"
          >
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-white border-2 border-[#E0D8CC] p-1 shadow-xs group-hover:border-[#C5A880] group-hover:shadow-md transition-all">
              <div className="relative w-full h-full rounded-full overflow-hidden bg-[#FAF7F2]">
                  <Image
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    unoptimized
                    sizes="120px"
                    style={{
                      transform: `scale(${cat.image_zoom || 1}) translate(${cat.image_x || 0}%, ${cat.image_y || 0}%)`,
                      transformOrigin: "center center",
                    }}
                    className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  />
              </div>
            </div>
            <span className="mt-2.5 text-xs sm:text-sm text-[#111111] font-medium tracking-wide group-hover:text-[#9E7D4E] transition-colors leading-tight line-clamp-1 max-w-[110px]">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
