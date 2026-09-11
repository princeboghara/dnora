"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ShoppingBag, Check } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/lib/context/cart-context";
import { formatINR } from "@/lib/utils";

interface CompleteTheLookProps {
  products: Product[];
}

export function CompleteTheLook({ products }: CompleteTheLookProps) {
  const { addToCart, openCart } = useCart();
  const [isBundleAdded, setIsBundleAdded] = useState(false);

  // Default selection: Handbag + Charm + Jewellery + Perfume
  const selectedItems = products.slice(0, 4);

  const totalOriginal = selectedItems.reduce(
    (acc, p) => acc + (p.sale_price ?? p.base_price),
    0
  );

  const handleAddAll = () => {
    selectedItems.forEach((p) => {
      addToCart(p, p.variants?.[0], 1);
    });
    setIsBundleAdded(true);
    setTimeout(() => {
      setIsBundleAdded(false);
      openCart();
    }, 1200);
  };

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
        <div className="inline-flex items-center gap-2 text-[#C5A880] text-xs uppercase tracking-[0.3em] font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated Styling • The Ensemble</span>
        </div>
        <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl text-[#111111] font-light uppercase tracking-[0.15em]">
          Complete The Look
        </h2>
        <div className="w-12 h-[1.5px] bg-[#C5A880] mx-auto mt-2" />
        <p className="text-xs sm:text-sm text-[#6E6A64] font-light leading-relaxed">
          An impeccably orchestrated symphony across our leatherwork, haute parfumerie, talismans, and heritage pearls.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-[#FAF7F2] border border-[#E8E2D9] p-6 sm:p-10">
        {/* Left: 4-Item Grid */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {selectedItems.map((item, idx) => (
            <div
              key={item.id}
              className="group bg-[#FBF9F5] border border-[#E8E2D9] p-3 flex flex-col justify-between"
            >
              <div className="relative aspect-[3/4] w-full bg-[#EFEBE4] overflow-hidden mb-3">
                <Image
                  src={item.primary_image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 20vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2 left-2 w-5 h-5 bg-[#141414] text-[#F5F2EB] text-[10px] font-mono flex items-center justify-center">
                  0{idx + 1}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-[#8C7A6B]">
                  {item.category_slug}
                </span>
                <h4 className="font-sans font-medium text-xs sm:text-sm text-[#111111] line-clamp-1">
                  <Link href={`/product/${item.slug}`} className="hover:text-[#9E7D4E]">
                    {item.name}
                  </Link>
                </h4>
                <p className="text-xs font-semibold text-[#111111]">
                  {formatINR(item.sale_price ?? item.base_price)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Summary Box */}
        <div className="lg:col-span-4 bg-[#FBF9F5] border border-[#E8E2D9] p-6 sm:p-8 space-y-6 flex flex-col justify-between h-full">
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C7A6B] font-semibold">
              The Grand Atelier Edit
            </span>
            <h3 className="font-sans text-2xl text-[#111111] font-normal tracking-wide leading-snug">
              The Sovereign Trousseau Curation
            </h3>
            <p className="text-xs text-[#6E6A64] leading-relaxed">
              Acquire this four-piece cohesive ensemble with bespoke gift packaging, insured delivery, and complimentary fragrance discovery miniatures.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#E8E2D9]">
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-widest text-[#6E6A64]">
                Total Ensemble (4 Creations)
              </span>
              <span className="font-sans text-2xl font-semibold text-[#111111] tracking-tight">
                {formatINR(totalOriginal)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleAddAll}
              className="w-full py-4 bg-[#141414] text-[#F5F2EB] hover:bg-[#C5A880] hover:text-[#111111] text-xs uppercase tracking-[0.25em] font-medium transition-all flex items-center justify-center gap-2 shadow-md"
            >
              {isBundleAdded ? (
                <>
                  <Check className="w-4 h-4 text-[#A3D9B5]" />
                  <span>All 4 Creations Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Acquire Complete Look</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-[#8C7A6B] italic">
              Complimentary White-Glove Shipping & Bespoke Monogramming included.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
