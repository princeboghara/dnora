"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight, ShoppingBag, ShieldCheck } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/lib/context/cart-context";
import { formatINR } from "@/lib/utils";

interface PerfumeShowcaseProps {
  perfume: Product;
}

export function PerfumeShowcase({ perfume }: PerfumeShowcaseProps) {
  const { addToCart } = useCart();
  const [selectedVol, setSelectedVol] = useState<number>(50);

  const attributes = perfume.attributes?.type === "perfumes" ? perfume.attributes.data : null;
  const variant = perfume.variants?.find((v) => v.volume_ml === selectedVol) || perfume.variants?.[0];
  const price = (perfume.sale_price ?? perfume.base_price) + (variant?.price_adjustment ?? 0);

  return (
    <section className="bg-[#141414] text-[#FBF9F5] py-24 sm:py-32 border-y border-[#262626] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Editorial Visual of Flacon */}
          <div className="lg:col-span-6 relative aspect-[4/5] bg-[#1F1E1D] border border-[#2D2A26] overflow-hidden group">
            <Image
              src={perfume.primary_image}
              alt={perfume.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />

            {/* Corner Badge */}
            <div className="absolute top-6 left-6 z-10 px-3 py-1 bg-[#141414]/80 backdrop-blur-md border border-[#C5A880]/50 text-[#C5A880] text-[10px] uppercase tracking-[0.25em]">
              Haute Parfumerie
            </div>

            <div className="absolute bottom-6 left-6 right-6 z-10">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880]">
                Pure Extrait Formulation
              </span>
              <p className="font-sans text-base text-[#E8E2D9] font-light tracking-wide">
                &ldquo;A sensory hymn to royal Indian twilight gardens and aged Assamese agarwood.&rdquo;
              </p>
            </div>
          </div>

          {/* Right: Olfactory Notes & Acquisition */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#C5A880] text-xs uppercase tracking-[0.25em]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The Scent of Sovereign Nobility</span>
              </div>

              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-light text-[#FBF9F5] tracking-[0.12em] uppercase leading-tight">
                {perfume.name}
              </h2>

              <p className="text-xs sm:text-sm text-[#A89F91] leading-relaxed">
                {perfume.full_description}
              </p>
            </div>

            {/* Olfactory Pyramid Breakdown */}
            {attributes && (
              <div className="space-y-4 pt-4 border-t border-[#2A2A2A]">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold block">
                  Olfactory Architecture
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  {/* Top Notes */}
                  <div className="p-4 bg-[#1C1B1A] border border-[#2D2A26] space-y-2">
                    <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-medium block">
                      Top Notes
                    </span>
                    <p className="text-xs text-[#E8E2D9] leading-snug">
                      {attributes.top_notes.join(" • ")}
                    </p>
                  </div>

                  {/* Heart Notes */}
                  <div className="p-4 bg-[#1C1B1A] border border-[#2D2A26] space-y-2">
                    <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-medium block">
                      Heart Notes
                    </span>
                    <p className="text-xs text-[#E8E2D9] leading-snug">
                      {attributes.heart_notes.join(" • ")}
                    </p>
                  </div>

                  {/* Base Notes */}
                  <div className="p-4 bg-[#1C1B1A] border border-[#2D2A26] space-y-2">
                    <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-medium block">
                      Base Notes
                    </span>
                    <p className="text-xs text-[#E8E2D9] leading-snug">
                      {attributes.base_notes.join(" • ")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-2 text-[11px] text-[#A89F91]">
                  <span><strong>Concentration:</strong> {attributes.concentration} (32% Pure Oil)</span>
                  <span>•</span>
                  <span><strong>Sillage:</strong> Enveloping & Magnetic</span>
                  <span>•</span>
                  <span><strong>Gender:</strong> Unisex</span>
                </div>
              </div>
            )}

            {/* Volume Selector & Pricing */}
            <div className="space-y-4 pt-4 border-t border-[#2A2A2A]">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedVol(50)}
                    className={`px-4 py-2 text-xs uppercase tracking-wider border transition-all ${
                      selectedVol === 50
                        ? "bg-[#C5A880] text-[#111111] border-[#C5A880] font-semibold"
                        : "bg-transparent text-[#E8E2D9] border-[#3A3A3A] hover:border-[#C5A880]"
                    }`}
                  >
                    50ml Flacon
                  </button>
                  <button
                    onClick={() => setSelectedVol(100)}
                    className={`px-4 py-2 text-xs uppercase tracking-wider border transition-all ${
                      selectedVol === 100
                        ? "bg-[#C5A880] text-[#111111] border-[#C5A880] font-semibold"
                        : "bg-transparent text-[#E8E2D9] border-[#3A3A3A] hover:border-[#C5A880]"
                    }`}
                  >
                    100ml Flacon
                  </button>
                </div>

                <div className="text-right">
                  <span className="font-sans text-2xl font-semibold text-[#FBF9F5] tracking-tight">
                    {formatINR(price)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={() => addToCart(perfume, variant, 1)}
                  className="flex-1 py-4 bg-[#C5A880] hover:bg-[#DFCAAB] text-[#111111] text-xs uppercase tracking-[0.25em] font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Acquire Extrait ({selectedVol}ml)</span>
                </button>

                <Link
                  href="/shop/perfumes"
                  className="px-6 py-4 bg-transparent border border-[#3A3A3A] hover:border-[#E8E2D9] text-xs uppercase tracking-[0.2em] font-medium text-[#E8E2D9] transition-all flex items-center justify-center gap-2"
                >
                  <span>All Parfums</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#A89F91]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Includes 2 complimentary 2ml extrait trial miniatures with your order.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
