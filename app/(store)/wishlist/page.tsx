"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useWishlist } from "@/lib/context/wishlist-context";
import { useCart } from "@/lib/context/cart-context";
import { formatINR } from "@/lib/utils";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product: any) => {
    addToCart(product, product.variants?.[0], 1);
    removeFromWishlist(product.id);
  };

  if (wishlist.length === 0) {
    return (
      <div className="py-24 max-w-2xl mx-auto text-center px-4 space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center mx-auto text-[#8C7A6B]">
          <Heart className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h1 className="font-sans font-medium text-2xl sm:text-3xl text-[#111111] uppercase tracking-[0.12em]">
            Your Wishlist Is Empty
          </h1>
          <p className="text-xs text-[#6E6A64] max-w-sm mx-auto">
            Save creations that captivate your senses to review or acquire at your leisure.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#141414] text-[#F5F2EB] text-xs uppercase tracking-[0.25em] font-medium hover:bg-[#C5A880] hover:text-[#111111] transition-all"
        >
          <span>Explore Atelier Catalog</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-1">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B] font-semibold">
          Saved Aspirations
        </span>
        <h1 className="font-sans text-2xl sm:text-3xl lg:text-4xl text-[#111111] uppercase tracking-[0.12em] font-light">
          Your Curated Wishlist ({wishlist.length})
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <div
            key={product.id}
            className="group bg-[#FAF7F2] border border-[#E8E2D9] p-3 flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[3/4] w-full bg-[#EFEBE4] overflow-hidden mb-3">
                <Image
                  src={product.primary_image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-2 right-2 p-1.5 bg-[#FAF7F2]/80 hover:bg-[#FAF7F2] text-[#8C7A6B] hover:text-[#8B0000] rounded-full"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="text-[9px] uppercase tracking-widest text-[#8C7A6B]">
                {product.category_slug}
              </span>
              <h3 className="font-sans font-medium text-xs sm:text-sm text-[#111111] line-clamp-1 mt-0.5 uppercase tracking-wide">
                <Link href={`/product/${product.slug}`} className="hover:text-[#9E7D4E]">
                  {product.name}
                </Link>
              </h3>
              <p className="text-xs font-semibold text-[#111111] mt-1">
                {formatINR(product.sale_price ?? product.base_price)}
              </p>
            </div>

            <div className="pt-4 mt-3 border-t border-[#E8E2D9]">
              <button
                onClick={() => handleMoveToCart(product)}
                className="w-full py-2.5 bg-[#141414] hover:bg-[#C5A880] hover:text-[#111111] text-[#F5F2EB] text-[10px] uppercase tracking-[0.2em] font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-3 h-3" />
                <span>Move To Bag</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
