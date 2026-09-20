"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, Loader2 } from "lucide-react";
import { Product, ProductColorVariant } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/store/cart-store";
import { useWishlist } from "@/lib/store/wishlist-store";
import { useToast } from "@/components/ui/Toast";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const router = useRouter();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
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
    toggleWishlist(product);
    if (!isWishlisted) {
      success(`Added "${product.name}" to your wishlist.`);
    }
  };

  return (
    <div
      className="group relative flex flex-col w-full text-left"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. PRODUCT IMAGE FRAME (Controlled height & medium width) */}
      <div className="relative w-full aspect-[4/5] bg-slate-100 overflow-hidden rounded-xl border border-slate-200 shadow-xs">
        {/* Low-Internet Shimmer Shine Skeleton Placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-slate-100 flex items-center justify-center pointer-events-none z-0">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer-shine" />
            <div className="w-8 h-8 rounded-full border border-slate-200/80 bg-white/70 flex items-center justify-center">
              <span className="text-[8px] font-bold text-slate-400 tracking-wider">DNORA</span>
            </div>
          </div>
        )}

        <Link href={`/product/${product.slug}`} className="relative block w-full h-full">
          {/* Primary Image with subtle crossfade */}
          {primaryImage && (
            <Image
              key={primaryImage}
              src={primaryImage}
              alt={product.images[0]?.alt_text || product.name}
              fill
              priority={priority}
              onLoad={() => setImageLoaded(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 380px, 420px"
              className={`object-cover object-center transition-all duration-700 ease-out ${
                !imageLoaded
                  ? "opacity-0"
                  : isHovered && secondaryImage !== primaryImage
                  ? "opacity-0 scale-[1.03]"
                  : "opacity-100 scale-100"
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
            <span className="bg-slate-900 text-white text-[8px] sm:text-[9px] font-bold tracking-[0.16em] uppercase px-2 py-0.5 rounded-sm shadow-xs">
              Best Seller
            </span>
          )}
          {product.is_new_arrival && (
            <span className="bg-white text-slate-900 border border-slate-300 text-[8px] sm:text-[9px] font-bold tracking-[0.16em] uppercase px-2 py-0.5 rounded-sm shadow-xs">
              New Arrival
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-white/95 hover:bg-white text-slate-900 shadow-xs backdrop-blur-md transition-all active:scale-95 cursor-pointer border border-slate-200"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isWishlisted ? "fill-slate-900 text-slate-900" : "text-slate-700"
            }`}
          />
        </button>
      </div>

      {/* PRODUCT CARD BODY (Exact requested order: Name -> Price -> Colour Swatches) */}
      <div className="mt-2.5 flex flex-col space-y-1">
        {/* 2. PRODUCT NAME */}
        <h3 className="text-xs sm:text-sm font-heading font-medium text-slate-900 tracking-tight line-clamp-1">
          <Link href={`/product/${product.slug}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>

        {/* 3. PRICE */}
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
            {formatPrice(product.price)}
          </span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-[10px] sm:text-[11px] text-slate-400 line-through">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>

        {/* 4. COLOUR SWATCHES */}
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
                const bg = variant.color_hex || variant.hex || "#0F172A";
                return (
                  <button
                    key={variant.name}
                    type="button"
                    title={variant.name}
                    onClick={() => setSelectedVariant(variant)}
                    aria-label={`Select ${variant.name} color`}
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "ring-2 ring-slate-900 ring-offset-1 scale-110 shadow-xs"
                        : "border border-slate-300 hover:scale-110 opacity-75 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: bg }}
                  />
                );
              })}
            </div>
            {selectedVariant && (
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-500 font-medium truncate">
                {selectedVariant.name}
              </span>
            )}
          </div>
        )}

        {/* 5. PRODUCT ACTIONS (Normal Small Buttons: balanced height, clean typography) */}
        <div className="mt-2 grid grid-cols-2 gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="w-full h-8 sm:h-8.5 flex items-center justify-center gap-1 px-2 bg-white hover:bg-slate-50 text-slate-900 text-[10px] sm:text-[11px] font-semibold uppercase tracking-tight rounded-md border border-slate-300 transition-all duration-200 active:scale-[0.98] hover:shadow-2xs cursor-pointer shadow-2xs overflow-hidden"
          >
            <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-900 shrink-0" />
            <span className="truncate whitespace-nowrap">
              <span className="hidden min-[380px]:inline">Add to Cart</span>
              <span className="min-[380px]:hidden">Add</span>
            </span>
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isBuying}
            className="w-full h-8 sm:h-8.5 flex items-center justify-center gap-1 px-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] sm:text-[11px] font-semibold uppercase tracking-tight rounded-md border border-slate-900 transition-all duration-200 active:scale-[0.98] hover:shadow-2xs disabled:opacity-60 cursor-pointer shadow-xs overflow-hidden"
          >
            {isBuying && (
              <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin text-white shrink-0" />
            )}
            <span className="truncate whitespace-nowrap">Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
