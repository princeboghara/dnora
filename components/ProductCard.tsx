"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Check } from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/store/cart-store";
import { useWishlist } from "@/lib/store/wishlist-store";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [added, setAdded] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const primaryImage = product.images?.[0]?.secure_url || "";
  const hoverImage = product.images?.[1]?.secure_url || primaryImage;

  const discountPercent =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group flex flex-col justify-between bg-white relative">
      {/* Product Image Frame with Smooth Rounded Edges */}
      <div className="relative aspect-3/4 rounded-xl overflow-hidden bg-[#FAF8F5] border border-neutral-200/70">
        <Link href={`/product/${product.slug}`} className="block relative w-full h-full">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              className={`object-cover transition-opacity duration-500 ${
                hoverImage !== primaryImage ? "group-hover:opacity-0" : ""
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-300">
              <ShoppingBag className="w-10 h-10" />
            </div>
          )}

          {hoverImage && hoverImage !== primaryImage && (
            <Image
              src={hoverImage}
              alt={`${product.name} alternate`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover absolute inset-0 opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
            />
          )}
        </Link>

        {/* Optional Sale Discount Badge Overlay */}
        {discountPercent && discountPercent > 0 && (
          <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
            <span className="px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-widest bg-rose-600 text-white rounded-md shadow-xs">
              -{discountPercent}%
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-xs cursor-pointer ${
            isFavorited
              ? "bg-rose-50 text-rose-600"
              : "bg-white/90 text-neutral-700 hover:text-black hover:bg-white hover:scale-105 opacity-90 group-hover:opacity-100"
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
        </button>

        {/* Quick Add To Bag Overlay (Desktop Hover Slide Up) */}
        <div className="absolute inset-x-2 bottom-2 z-10 transition-all duration-300 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full py-2.5 px-3 bg-black/95 text-white hover:bg-black text-[11px] font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] cursor-pointer"
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-white" />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="pt-3 space-y-1">
        <Link
          href={`/product/${product.slug}`}
          className="block text-xs sm:text-[13px] font-semibold tracking-wider uppercase text-neutral-900 hover:text-black line-clamp-1 transition-colors"
        >
          {product.name}
        </Link>

        {product.short_description && (
          <p className="text-[11px] text-neutral-500 line-clamp-1 font-light">
            {product.short_description}
          </p>
        )}

        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-xs sm:text-sm font-bold text-neutral-950">
            {formatPrice(product.price)}
          </span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-[11px] text-neutral-400 line-through">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>

        {/* Mobile Quick Add Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="md:hidden mt-2 w-full py-2 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center justify-center gap-1.5 active:bg-black"
        >
          {added ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3 h-3" />
              <span>Add to Bag</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
