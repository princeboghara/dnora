"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function PromoBanner() {
  return (
    <section className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link
        href="/product/noane-side-pocket-bucket-bag"
        className="block relative overflow-hidden group border border-[#EAE5DC] aspect-[640/360] sm:aspect-[3840/1200] w-full bg-[#F5F2EC]"
      >
        <img
          src="https://www.charleskeith.in/dw/image/v2/BCWJ_PRD/on/demandware.static/-/Sites-in-products/default/dw76953c89/images/hi-res/2026-L6-CK2-10160273-A-29-3.jpg?sw=1920&q=85"
          alt="D'NORA Noane Bucket Bag Campaign"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent flex flex-col justify-center p-6 sm:p-14 text-white">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold">
            Iconic Silhouette Debut
          </span>
          <h2 className="font-sans font-medium text-2xl sm:text-4xl lg:text-5xl uppercase tracking-[0.12em] max-w-xl text-white mt-1">
            The Noane Bucket Bag
          </h2>
          <p className="text-xs sm:text-sm text-[#E2D8CC] max-w-md mt-2 line-clamp-2 font-light">
            Engineered with dual exterior slip pockets and a detachable two-way shoulder strap for timeless day-to-evening carry.
          </p>
          <div className="mt-4">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C5A880] text-[#111111] text-[11px] font-semibold uppercase tracking-[0.2em] group-hover:bg-white transition-colors">
              Discover Noane (₹12,999) &rarr;
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
