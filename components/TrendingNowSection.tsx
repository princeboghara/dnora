"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { TrendingNowItem } from "@/types";
import { formatPrice } from "@/lib/utils";
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
      className="w-full bg-[#FAF9F6] pt-8 pb-10 sm:pt-10 sm:pb-12 md:pt-12 md:pb-14 border-b border-neutral-200/70 overflow-hidden"
    >
      <div className="max-w-[1820px] 2xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 mb-4 sm:mb-6">
        {/* Section Heading linking directly to /trending-now */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <SectionHeading
            title="TRENDING NOW"
            subtitle="Curated visual edits and architectural silhouettes."
          />
          <Link
            href="/trending-now"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-800 hover:text-black group shrink-0"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Continuous Slow Left-to-Right Moving Track with Tight Spacing */}
      <div className="relative w-full overflow-hidden select-none group/marquee">
        <div className="flex items-center gap-2.5 sm:gap-3 md:gap-3.5 w-max animate-trending-l2r">
          {marqueeItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="w-[170px] sm:w-[210px] md:w-[240px] lg:w-[260px] shrink-0"
            >
              {/* Clicking ANY product in the section opens the /trending-now page */}
              <Link
                href="/trending-now"
                className="group/card block relative aspect-3/4 rounded-xl overflow-hidden bg-neutral-100 shadow-2xs hover:shadow-xl transition-all duration-300 cursor-pointer border border-neutral-200/60"
              >
                <Image
                  src={item.image_url}
                  alt={item.alt_text || item.title || "DNORA Trending Silhouette"}
                  fill
                  sizes="(max-width: 640px) 170px, (max-width: 1024px) 240px, 260px"
                  className="object-cover transition-transform duration-500 ease-out group-hover/card:scale-106"
                />

                {/* Always-visible Elegant Glassmorphism / Gradient Price Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent pt-8 pb-3 px-3 sm:px-3.5 flex flex-col justify-end text-white">
                  {item.title && (
                    <p className="text-[11.5px] sm:text-xs font-semibold tracking-wide drop-shadow-sm truncate">
                      {item.title}
                    </p>
                  )}

                  {/* Price Display */}
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.price ? (
                      <>
                        <span className="text-xs sm:text-sm font-bold font-mono tracking-tight text-white drop-shadow-sm">
                          {formatPrice(item.price)}
                        </span>
                        {item.compare_at_price && item.compare_at_price > item.price && (
                          <span className="text-[10px] sm:text-[11px] text-white/60 line-through font-mono">
                            {formatPrice(item.compare_at_price)}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-[10.5px] text-white/80 font-medium">
                        View Details
                      </span>
                    )}
                  </div>

                  {/* Trending Pill / Call to Action */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/15 mt-1.5 opacity-90 group-hover/card:opacity-100 transition-opacity">
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-[#F9A8D4] flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Trending</span>
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-white font-semibold flex items-center gap-0.5 group-hover/card:translate-x-0.5 transition-transform">
                      <span>Shop</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              </Link>
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
