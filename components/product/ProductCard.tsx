"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Eye, ShoppingBag, Check } from "lucide-react";
import { Product, ProductVariant } from "@/types";
import { useCart } from "@/lib/context/cart-context";
import { useWishlist } from "@/lib/context/wishlist-context";
import { formatINR } from "@/lib/utils";
import { QuickViewModal } from "@/components/product/QuickViewModal";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants?.[0]
  );
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isLiked = isInWishlist(product.id);
  const basePrice = product.sale_price ?? product.base_price;
  const currentPrice = basePrice + (selectedVariant?.price_adjustment ?? 0);
  const hasDiscount = Boolean(product.sale_price && product.sale_price < product.base_price);
  const discountPercent = hasDiscount
    ? Math.round(((product.base_price - (product.sale_price || 0)) / product.base_price) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, selectedVariant, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const handleSwatchSelect = (e: React.MouseEvent, variant: ProductVariant) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedVariant(variant);
  };

  return (
    <>
      <div
        className="group relative flex flex-col bg-white border border-[#EAE5DC] overflow-hidden hover:border-[#111111]/70 hover:shadow-lg transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Visual Box with Image Hover Swap */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F8F6F2]">
          <Link href={`/product/${product.slug}`} className="relative block h-full w-full">
            {/* Primary Image */}
            <Image
              src={product.primary_image}
              alt={product.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover object-center transition-opacity duration-700 ease-out ${
                isHovered && product.secondary_image ? "opacity-0" : "opacity-100"
              }`}
            />

            {/* Secondary Lifestyle/Angle Image on Hover */}
            {product.secondary_image && (
              <Image
                src={product.secondary_image}
                alt={`${product.name} angle`}
                fill
                unoptimized
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-cover object-center absolute inset-0 transition-opacity duration-700 ease-out ${
                  isHovered ? "opacity-100 scale-105" : "opacity-0 scale-100"
                }`}
              />
            )}
          </Link>

          {/* Luxury Tags Top Left */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
            {product.is_new && (
              <span className="px-2 py-0.5 bg-[#111111] text-[#F5F2EB] text-[9px] uppercase tracking-[0.2em] font-medium shadow-xs">
                New Arrival
              </span>
            )}
            {product.is_bestseller && !product.is_new && (
              <span className="px-2 py-0.5 bg-[#C5A880] text-[#111111] text-[9px] uppercase tracking-[0.2em] font-semibold shadow-xs">
                Bestseller
              </span>
            )}
            {hasDiscount && (
              <span className="px-2 py-0.5 bg-[#8B0000] text-white text-[9px] uppercase tracking-wider font-semibold shadow-xs">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Wishlist Heart Top Right */}
          <button
            type="button"
            onClick={handleWishlistClick}
            className={`absolute top-2.5 right-2.5 z-20 p-2 rounded-full backdrop-blur-md transition-all duration-200 ${
              isLiked
                ? "bg-white text-[#DC2626] shadow-sm scale-110"
                : "bg-white/80 text-[#555555] hover:text-[#DC2626] hover:bg-white shadow-xs"
            }`}
            aria-label="Save to Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current text-[#DC2626]" : ""}`} />
          </button>

          {/* Quick Action Overlay on Hover */}
          <div className="absolute inset-x-3 bottom-3 z-20 flex gap-1.5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button
              type="button"
              onClick={handleQuickViewClick}
              className="flex-1 py-2 px-1 bg-white/95 hover:bg-white text-[#111111] text-[10px] uppercase tracking-[0.15em] font-medium border border-[#D5CFC5] transition-colors flex items-center justify-center gap-1 shadow-sm"
            >
              <Eye className="w-3 h-3 text-[#555555]" />
              <span>Quick View</span>
            </button>

            <button
              type="button"
              onClick={handleQuickAdd}
              className="flex-1 py-2 px-1 bg-[#111111] hover:bg-[#C5A880] hover:text-[#111111] text-white text-[10px] uppercase tracking-[0.15em] font-medium transition-colors flex items-center justify-center gap-1 shadow-sm"
            >
              {isAdded ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3 h-3" />
                  <span>Quick Add</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Product Information */}
        <div className="p-3.5 flex flex-col flex-1 justify-between bg-white">
          <div>
            {/* Color Swatch Dots */}
            {product.variants && product.variants.length > 0 && (
              <div className="flex items-center gap-1.5 mb-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={(e) => handleSwatchSelect(e, v)}
                      onMouseEnter={(e) => handleSwatchSelect(e, v)}
                      title={v.color_name}
                      className={`w-3.5 h-3.5 rounded-full border transition-all ${
                        isSelected
                          ? "ring-1 ring-offset-1 ring-[#111111] scale-110"
                          : "border-black/20 hover:scale-105"
                      }`}
                      style={{ backgroundColor: v.color_hex || "#111111" }}
                    />
                  );
                })}
                {product.variants.length > 1 && (
                  <span className="text-[10px] text-[#8C7A6B] ml-1 uppercase tracking-wider font-light">
                    {product.variants.length} shades
                  </span>
                )}
              </div>
            )}

            {/* Atelier Line / Silhouette Tag */}
            <div className="text-[9px] uppercase tracking-[0.2em] text-[#8C7A6B] font-medium mb-1">
              D&apos;NORA ATELIER • {product.category_slug.replace("-", " ")}
            </div>

            {/* Product Title */}
            <h3 className="text-xs sm:text-sm font-medium text-[#111111] uppercase tracking-wide line-clamp-1 group-hover:text-[#9E7D4E] transition-colors">
              <Link href={`/product/${product.slug}`}>{product.name}</Link>
            </h3>

            {/* Subtitle / SKU hint */}
            <p className="text-[11px] text-[#736357] line-clamp-1 mt-0.5 font-light">
              {product.subtitle}
            </p>
          </div>

          {/* Pricing Row */}
          <div className="flex items-baseline justify-between mt-3 pt-2.5 border-t border-[#F2ECE4]">
            <div className="flex items-baseline gap-2">
              <span className="text-sm sm:text-base font-semibold text-[#111111]">
                {formatINR(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-[#999999] line-through font-light">
                  {formatINR(product.base_price)}
                </span>
              )}
            </div>

            <span className="text-[10px] text-[#245744] font-medium">
              Tax Incl.
            </span>
          </div>
        </div>
      </div>

      {/* Quick View Modal instance */}
      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}
