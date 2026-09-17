"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, Zap, Loader2 } from "lucide-react";
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
      selectedVariant ? { name: selectedVariant.name, color_hex: selectedVariant.color_hex || selectedVariant.hex, hex: selectedVariant.color_hex || selectedVariant.hex } : undefined
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
        selectedVariant ? { name: selectedVariant.name, color_hex: selectedVariant.color_hex || selectedVariant.hex, hex: selectedVariant.color_hex || selectedVariant.hex } : undefined
      );

      // Check authentication status
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

        {/* Dual Quick Action Buttons on Desktop Hover */}
        <div className="absolute inset-x-2.5 bottom-2.5 z-10 hidden sm:flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 bg-[#0E0E0E]/95 hover:bg-[#0E0E0E] text-[#FAF9F6] text-[10px] font-semibold tracking-[0.12em] uppercase rounded-sm backdrop-blur-md shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            <ShoppingBag className="w-3 h-3 text-[#C5A880]" />
            <span>Add to Bag</span>
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isBuying}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 bg-[#C5A880] hover:bg-[#b5966c] text-[#0E0E0E] text-[10px] font-bold tracking-[0.12em] uppercase rounded-sm backdrop-blur-md shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60"
          >
            {isBuying ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Zap className="w-3 h-3 fill-[#0E0E0E]" />
            )}
            <span>Buy Now</span>
          </button>
        </div>
      </div>

      {/* Product Metadata */}
      <div className="mt-3 sm:mt-4 flex flex-col space-y-1 flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-[#73706A] font-semibold block truncate">
              {product.categories?.[0]?.name || "Luxury Atelier"}
            </span>

            {/* Micro Color Swatches (if product has color variants) */}
            {product.color_variants && product.color_variants.length > 0 && (
              <div className="flex items-center gap-1" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                {product.color_variants.slice(0, 4).map((variant) => (
                  <button
                    key={variant.name}
                    type="button"
                    title={variant.name}
                    onClick={() => setSelectedVariant(variant)}
                    className={`w-3 h-3 rounded-full border transition-transform ${
                      selectedVariant?.name === variant.name
                        ? "ring-1.5 ring-[#0E0E0E] ring-offset-1 scale-110 border-white"
                        : "border-black/20 hover:scale-110"
                    }`}
                    style={{ backgroundColor: variant.color_hex || variant.hex || "#000000" }}
                  />
                ))}
                {product.color_variants.length > 4 && (
                  <span className="text-[9px] text-[#73706A]">+{product.color_variants.length - 4}</span>
                )}
              </div>
            )}
          </div>

          <h3 className="text-xs sm:text-sm md:text-base font-heading font-medium text-[#0E0E0E] tracking-tight line-clamp-1 mt-0.5">
            <Link href={`/product/${product.slug}`} className="hover:underline">
              {product.name}
            </Link>
          </h3>

          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-xs sm:text-sm font-bold text-[#0E0E0E]">
              {formatPrice(product.price)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-[10px] sm:text-xs text-[#8C8983] line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>
        </div>

        {/* Mobile Visible Dual Action Buttons */}
        <div className="mt-2.5 sm:hidden flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-[#F5F3EF] hover:bg-[#E8E5DE] text-[#0E0E0E] text-[10px] font-bold uppercase tracking-wider rounded-sm border border-[#E8E5DE] transition-colors active:scale-[0.98]"
          >
            <ShoppingBag className="w-3 h-3 text-[#0E0E0E]" />
            <span>Add</span>
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isBuying}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-[#0E0E0E] hover:bg-[#C5A880] text-[#FAF9F6] hover:text-[#0E0E0E] text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors active:scale-[0.98] disabled:opacity-60"
          >
            {isBuying ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Zap className="w-3 h-3 fill-[#C5A880] text-[#C5A880]" />
            )}
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
