"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Plus } from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/store/cart-store";
import { useToast } from "@/components/ui/Toast";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCart();
  const { success } = useToast();

  const primaryImage = product.images[0]?.secure_url || "";
  const secondaryImage = product.images[1]?.secure_url || primaryImage;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    success(`Added "${product.name}" to your bag.`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div
      className="group relative flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Frame */}
      <div className="relative w-full aspect-[4/5] bg-[#F5F3EF] overflow-hidden rounded-sm border border-[#E8E5DE]/80">
        <Link href={`/product/${product.slug}`} className="relative block w-full h-full">
          {/* Primary Image */}
          {primaryImage && (
            <Image
              src={primaryImage}
              alt={product.images[0]?.alt_text || product.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={`object-cover object-center transition-all duration-700 ease-out ${
                isHovered && secondaryImage !== primaryImage ? "opacity-0 scale-105" : "opacity-100 scale-100"
              }`}
            />
          )}

          {/* Secondary Hover Image */}
          {secondaryImage && secondaryImage !== primaryImage && (
            <Image
              src={secondaryImage}
              alt={`${product.name} detail view`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={`object-cover object-center transition-all duration-700 ease-out ${
                isHovered ? "opacity-100 scale-105" : "opacity-0 scale-100"
              }`}
            />
          )}
        </Link>

        {/* Badges (Best Seller / New Arrival) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.is_best_seller && (
            <span className="bg-[#0E0E0E] text-[#FAF9F6] text-[10px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-sm shadow-sm">
              Best Seller
            </span>
          )}
          {product.is_new_arrival && (
            <span className="bg-[#C5A880] text-[#0E0E0E] text-[10px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-sm shadow-sm">
              New Arrival
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/85 hover:bg-white text-[#0E0E0E] shadow-sm backdrop-blur-sm transition-all"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? "fill-rose-600 text-rose-600" : "text-[#0E0E0E]"
            }`}
          />
        </button>

        {/* Quick Add To Bag Button on Desktop Hover */}
        <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleQuickAdd}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#0E0E0E]/95 hover:bg-[#0E0E0E] text-[#FAF9F6] text-[11px] font-semibold tracking-[0.18em] uppercase rounded-sm backdrop-blur-md shadow-md transition-all active:scale-[0.99]"
          >
            <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Quick Add</span>
          </button>
        </div>
      </div>

      {/* Product Metadata */}
      <div className="mt-4 flex flex-col space-y-1">
        <span className="text-[11px] uppercase tracking-[0.2em] text-[#73706A] font-semibold">
          {product.categories?.[0]?.name || "Luxury Purse"}
        </span>

        <h3 className="text-sm sm:text-base font-heading font-medium text-[#0E0E0E] tracking-tight">
          <Link href={`/product/${product.slug}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>

        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-sm font-semibold text-[#0E0E0E]">
            {formatPrice(product.price)}
          </span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-xs text-[#8C8983] line-through">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
