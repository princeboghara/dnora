"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TrendingNowItem } from "@/types";
import { SectionHeading } from "./SectionHeading";

interface TrendingNowSectionProps {
  items: TrendingNowItem[];
}

export function TrendingNowSection({ items }: TrendingNowSectionProps) {
  if (!items || items.length === 0) return null;

  // Duplicate items 4 times to ensure a completely seamless, infinite continuous loop
  const marqueeItems = [...items, ...items, ...items, ...items];

  return (
    <section
      id="trending-now"
      aria-label="Trending Now"
      className="w-full bg-[#FAF9F6] pt-8 pb-8 sm:pt-10 sm:pb-10 md:pt-12 md:pb-12 border-b border-neutral-200/70 overflow-hidden"
    >
      <div className="max-w-[1820px] 2xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 mb-4 sm:mb-6">
        {/* Section Heading with Montserrat Font */}
        <SectionHeading
          title="TRENDING NOW"
          subtitle="Curated visual edits and architectural silhouettes."
        />
      </div>

      {/* Continuous Slow Left-to-Right Moving Track with Tight Spacing */}
      <div className="relative w-full overflow-hidden select-none group/marquee">
        <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 w-max animate-trending-l2r">
          {marqueeItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="w-[160px] sm:w-[200px] md:w-[230px] lg:w-[250px] shrink-0"
            >
              {/* Link: navigates to product details if associated, otherwise to /trending-now */}
              {(() => {
                const itemLink = item.product_slug
                  ? `/product/${item.product_slug}`
                  : (item.target_link && item.target_link.trim()) || "/trending-now";
                const isProductLink = Boolean(
                  item.product_slug ||
                  (item.target_link && item.target_link.includes("/product/"))
                );

                return (
                  <Link
                    href={itemLink}
                    className="group/card block relative aspect-3/4 rounded-lg sm:rounded-xl overflow-hidden bg-neutral-100 shadow-2xs hover:shadow-xl transition-all duration-300 cursor-pointer"
                  >
                    <Image
                      src={item.image_url}
                      alt={item.alt_text || item.title || "DNORA Trending Silhouette"}
                      fill
                      sizes="(max-width: 640px) 160px, (max-width: 1024px) 230px, 250px"
                      className="object-cover transition-transform duration-500 ease-out group-hover/card:scale-106"
                    />

                    {/* Chic Minimalist Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-4">
                      {item.title && (
                        <p className="text-white text-[11px] sm:text-xs font-medium tracking-wide drop-shadow-sm truncate">
                          {item.title}
                        </p>
                      )}
                      <span className="text-[9px] sm:text-[10px] text-white/90 font-semibold tracking-widest uppercase mt-0.5 flex items-center gap-1">
                        <span>{isProductLink ? "Shop Silhouette" : "Lookbook"}</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                );
              })()}
            </div>
          ))}
        </div>
      </div>

      {/* Scoped CSS animation for continuous slow Left-to-Right motion */}
      <style>{`
        @keyframes trendingMarqueeLeftToRight {
          0% {
            transform: translate3d(-50%, 0, 0);
          }
          100% {
            transform: translate3d(0%, 0, 0);
          }
        }
        .animate-trending-l2r {
          animation: trendingMarqueeLeftToRight 55s linear infinite;
          will-change: transform;
        }
        .animate-trending-l2r:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}

export default TrendingNowSection;
