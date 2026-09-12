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
    <section className="py-10 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Category Header */}
      <div className="text-center mb-8 sm:mb-10 space-y-1">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B] font-semibold font-mono">
          Explore Handcrafted Silhouettes
        </span>
        <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl text-[#111111] font-light uppercase tracking-[0.15em]">
          Shop By Category
        </h2>
        <div className="w-10 h-[1.5px] bg-[#C5A880] mx-auto mt-2" />
      </div>

      {/* Dynamic Circular Category Rails directly powered by Admin */}
      <div className="flex items-center justify-start md:justify-center gap-4 sm:gap-6 lg:gap-8 overflow-x-auto pb-4 pt-2 no-scrollbar px-2">
        {/* 1. All Creations Pill */}
        <Link
          href="/shop"
          className="group flex flex-col items-center shrink-0 w-20 sm:w-24 text-center transition-transform duration-200 hover:-translate-y-1"
        >
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-white border border-[#E0D8CC] p-1 shadow-xs group-hover:border-[#C5A880] group-hover:shadow-md transition-all">
            <div className="relative w-full h-full rounded-full overflow-hidden bg-[#FAF7F2] flex items-center justify-center">
              <span className="text-xs uppercase tracking-widest font-mono font-bold text-[#111111] group-hover:text-[#9E7D4E]">
                ALL
              </span>
            </div>
            <span className="absolute top-0 right-0 px-1.5 py-0.5 bg-[#C5A880] text-[#111111] text-[8px] font-bold uppercase rounded-full tracking-wider shadow-xs">
              All
            </span>
          </div>
          <span className="mt-2 text-[11px] sm:text-xs text-[#222222] font-semibold group-hover:text-[#9E7D4E] transition-colors leading-tight">
            View All
          </span>
        </Link>

        {/* 2. Admin Driven Dynamic Categories */}
        {liveCategories.map((cat) => (
          <Link
            key={cat.id}
            href={`/shop/${cat.slug}`}
            className="group flex flex-col items-center shrink-0 w-20 sm:w-24 text-center transition-transform duration-200 hover:-translate-y-1"
          >
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-white border border-[#E0D8CC] p-1 shadow-xs group-hover:border-[#C5A880] group-hover:shadow-md transition-all">
              <div className="relative w-full h-full rounded-full overflow-hidden bg-[#FAF7F2]">
                <Image
                  src={cat.image_url}
                  alt={cat.name}
                  fill
                  unoptimized
                  sizes="80px"
                  className="object-contain p-1 group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            </div>
            <span className="mt-2 text-[11px] sm:text-xs text-[#222222] font-medium group-hover:text-[#9E7D4E] transition-colors leading-tight line-clamp-1">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
