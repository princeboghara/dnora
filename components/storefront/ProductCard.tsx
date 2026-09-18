"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, Loader2 } from "lucide-react";
import { Product, ProductColorVariant } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/store/cart-store";
import { useToast } from "@/components/ui/Toast";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductColorVariant | null>(
    product.color_variants && product.color_variants.length > 0 ? product.color_variants[0] : null
  );

  const { addItem } = useCart();
  const { success } = useToast();

  // Determine images based on selected color variant if available
  const variantImages = selectedVariant?.images && selectedVariant.images.length > 0 ? selectedVariant.images : null;
  const primaryImage = variantImages
    ? (typeof variantImages[0] === "string" ? (variantImages[0] as string) : variantImages[0]?.secure_url || "")
    : product.images[0]?.secure_url || "";
  const secondaryImage = variantImages && variantImages[1]
    ? (typeof variantImages[1] === "string" ? (variantImages[1] as string) : variantImages[1]?.secure_url || primaryImage)
    : product.images[1]?.secure_url || primaryImage;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(
      product,
      1,
      selectedVariant
        ? {
            name: selectedVariant.name,
            color_hex: selectedVariant.color_hex || selectedVariant.hex,
            hex: selectedVariant.color_hex || selectedVariant.hex,
          }
        : undefined
    );
    success(`Added "${product.name}"${selectedVariant ? ` (${selectedVariant.name})` : ""} to your bag.`);
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBuying) return;
    setIsBuying(true);

    try {
      addItem(
        product,
        1,
        selectedVariant
          ? {
              name: selectedVariant.name,
              color_hex: selectedVariant.color_hex || selectedVariant.hex,
              hex: selectedVariant.color_hex || selectedVariant.hex,
            }
          : undefined
      );

      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();

      if (data?.isAuthenticated) {
        router.push("/checkout");
      } else {
        router.push(`/login?redirect=${encodeURIComponent("/checkout")}`);
      }
    } catch {
      router.push(`/login?redirect=${encodeURIComponent("/checkout")}`);
    } finally {
      setIsBuying(false);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div
      className="group relative flex flex-col w-full text-left"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. PRODUCT IMAGE FRAME (Controlled height & medium width) */}
      <div className="relative w-full aspect-[4/5] bg-[#F5F3EF] overflow-hidden rounded-xs border border-[#E8E5DE]">
        <Link href={`/product/${product.slug}`} className="relative block w-full h-full">
          {/* Primary Image with subtle crossfade */}
          {primaryImage && (
            <Image
              key={primaryImage}
              src={primaryImage}
              alt={product.images[0]?.alt_text || product.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 380px, 420px"
              className={`object-cover object-center transition-all duration-700 ease-out ${
                isHovered && secondaryImage !== primaryImage ? "opacity-0 scale-[1.03]" : "opacity-100 scale-100"
              }`}
            />
          )}

          {/* Secondary Hover Image */}
          {secondaryImage && secondaryImage !== primaryImage && (
            <Image
              src={secondaryImage}
              alt={`${product.name} alternate angle`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 380px, 420px"
              className={`object-cover object-center transition-all duration-700 ease-out ${
                isHovered ? "opacity-100 scale-[1.03]" : "opacity-0 scale-100"
              }`}
            />
          )}
        </Link>

        {/* Minimal Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {product.is_best_seller && (
            <span className="bg-[#0E0E0E] text-[#FAF9F6] text-[8px] sm:text-[9px] font-bold tracking-[0.18em] uppercase px-2 py-0.5 rounded-xs shadow-xs">
              Best Seller
            </span>
          )}
          {product.is_new_arrival && (
            <span className="bg-[#FAF9F6] text-[#0E0E0E] border border-[#0E0E0E]/20 text-[8px] sm:text-[9px] font-bold tracking-[0.18em] uppercase px-2 py-0.5 rounded-xs shadow-xs">
              New Arrival
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-white/90 hover:bg-white text-[#0E0E0E] shadow-xs backdrop-blur-md transition-all active:scale-95 cursor-pointer"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isWishlisted ? "fill-[#0E0E0E] text-[#0E0E0E]" : "text-[#0E0E0E]"
            }`}
          />
        </button>

        {/* Desktop Quick Actions on Hover */}
        <div className="absolute inset-x-2.5 bottom-2.5 z-10 hidden sm:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 bg-white hover:bg-[#F5F3EF] text-[#0E0E0E] border border-[#0E0E0E] text-[10px] font-medium tracking-[0.14em] uppercase rounded-xs shadow-xs transition-colors cursor-pointer active:scale-[0.98]"
          >
            <ShoppingBag className="w-3 h-3 text-[#0E0E0E]" />
            <span>Add</span>
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isBuying}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 bg-[#0E0E0E] hover:bg-[#262626] text-[#FAF9F6] border border-[#0E0E0E] text-[10px] font-semibold tracking-[0.14em] uppercase rounded-xs shadow-xs transition-colors cursor-pointer active:scale-[0.98] disabled:opacity-60"
          >
            {isBuying ? (
              <Loader2 className="w-3 h-3 animate-spin text-[#FAF9F6]" />
            ) : (
              <span>Buy Now</span>
            )}
          </button>
        </div>
      </div>

      {/* PRODUCT CARD BODY (Exact requested order: Name -> Price -> Colour Swatches) */}
      <div className="mt-2.5 flex flex-col space-y-1">
        {/* 2. PRODUCT NAME */}
        <h3 className="text-xs sm:text-sm font-heading font-medium text-[#0E0E0E] tracking-tight line-clamp-1">
          <Link href={`/product/${product.slug}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>

        {/* 3. PRICE */}
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-[#0E0E0E] tracking-tight">
            {formatPrice(product.price)}
          </span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-[10px] sm:text-[11px] text-[#73706A] line-through">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>

        {/* 4. COLOUR SWATCHES (● ● ● ● with active black ring and dynamic image swap) */}
        {product.color_variants && product.color_variants.length > 0 && (
          <div
            className="flex items-center gap-2 pt-0.5"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="flex items-center gap-1.5">
              {product.color_variants.slice(0, 5).map((variant) => {
                const isSelected = selectedVariant?.name === variant.name;
                const bg = variant.color_hex || variant.hex || "#0E0E0E";
                return (
                  <button
                    key={variant.name}
                    type="button"
                    title={variant.name}
                    onClick={() => setSelectedVariant(variant)}
                    aria-label={`Select ${variant.name} color`}
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "ring-2 ring-[#0E0E0E] ring-offset-1 scale-110 shadow-xs"
                        : "border border-black/20 hover:scale-110 opacity-75 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: bg }}
                  />
                );
              })}
            </div>
            {selectedVariant && (
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#73706A] font-medium truncate">
                {selectedVariant.name}
              </span>
            )}
          </div>
        )}

        {/* 5. MOBILE ACTIONS */}
        <div className="mt-2.5 sm:hidden flex items-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-2 bg-white hover:bg-[#F5F3EF] text-[#0E0E0E] text-[10px] font-medium uppercase tracking-[0.14em] rounded-xs border border-[#0E0E0E] transition-colors active:scale-[0.98]"
          >
            <ShoppingBag className="w-3 h-3 text-[#0E0E0E]" />
            <span>Add</span>
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isBuying}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-2 bg-[#0E0E0E] text-[#FAF9F6] border border-[#0E0E0E] text-[10px] font-semibold uppercase tracking-[0.14em] rounded-xs transition-colors active:scale-[0.98] disabled:opacity-60"
          >
            {isBuying ? (
              <Loader2 className="w-3 h-3 animate-spin text-[#FAF9F6]" />
            ) : (
              <span>Buy Now</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
