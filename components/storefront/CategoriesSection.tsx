"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { ProductCategory } from "@/types";

interface CategoriesSectionProps {
  categories: ProductCategory[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 260;
    scrollRef.current.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  if (!categories || categories.length === 0) return null;

  return (
    <section id="categories" className="py-10 sm:py-14 bg-white border-t border-[#E8E5DE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Section Header */}
        <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-[#0E0E0E] tracking-tight uppercase">
            CATEGORIES
          </h2>
        </div>

        {/* Carousel Container with Subtle Chevron Controls */}
        <div className="relative max-w-5xl mx-auto px-2 sm:px-6">
          <button
            type="button"
            onClick={() => handleScroll("left")}
            aria-label="Previous categories"
            className="hidden sm:flex absolute -left-4 lg:-left-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-[#E8E5DE] shadow-sm items-center justify-center text-[#0E0E0E] hover:bg-[#F5F3EF] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => handleScroll("right")}
            aria-label="Next categories"
            className="hidden sm:flex absolute -right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-[#E8E5DE] shadow-sm items-center justify-center text-[#0E0E0E] hover:bg-[#F5F3EF] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Horizontal Scrolling Medium Circular Cards Carousel */}
          <div
            ref={scrollRef}
            className="flex items-start justify-start sm:justify-center overflow-x-auto snap-x snap-mandatory scrollbar-none gap-5 sm:gap-7 md:gap-8 pb-3 pt-1 px-2"
            style={{ scrollBehavior: "smooth" }}
          >
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group flex flex-col items-center shrink-0 snap-start select-none cursor-pointer focus:outline-none"
              >
                {/* Medium-Sized Circle (Controlled dimensions: w-24 to w-32, not oversized) */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden bg-[#F5F3EF] border border-[#E8E5DE] group-hover:border-[#0E0E0E] shadow-xs transition-all duration-300">
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 96px, 128px"
                      className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#EAE6DF] text-[#73706A] text-xs font-semibold uppercase">
                      {category.name.slice(0, 2)}
                    </div>
                  )}

                  {/* Subtle Inner Ring */}
                  <div className="absolute inset-0 rounded-full border border-black/5 pointer-events-none group-hover:border-black/20 transition-colors" />
                </div>

                {/* Category Name Below Circle */}
                <div className="mt-2.5 text-center">
                  <span className="text-[11px] sm:text-xs font-heading font-medium uppercase tracking-[0.14em] text-[#0E0E0E] group-hover:underline block transition-all">
                    {category.name}
                  </span>
                </div>
              </Link>
            ))}

            {/* View All Silhouettes Circle */}
            <Link
              href="/shop"
              className="group flex flex-col items-center shrink-0 snap-start select-none cursor-pointer focus:outline-none"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden bg-[#0E0E0E] text-[#FAF9F6] border border-[#0E0E0E] flex flex-col items-center justify-center p-2 text-center transition-all duration-300 group-hover:bg-[#262626] shadow-xs">
                <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#EAE6DF]">
                  All
                </span>
                <span className="text-[10px] sm:text-xs font-heading font-bold tracking-wider uppercase mt-0.5">
                  Bags
                </span>
                <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center mt-1.5 group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="mt-2.5 text-center">
                <span className="text-[11px] sm:text-xs font-heading font-medium uppercase tracking-[0.14em] text-[#0E0E0E] group-hover:underline block">
                  View All
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
