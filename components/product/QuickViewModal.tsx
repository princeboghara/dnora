"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Heart, ShoppingBag, ArrowRight, Check } from "lucide-react";
import { Product, ProductVariant } from "@/types";
import { useCart } from "@/lib/context/cart-context";
import { useWishlist } from "@/lib/context/wishlist-context";
import { formatINR } from "@/lib/utils";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product?.variants?.[0]
  );
  const [selectedImage, setSelectedImage] = useState<string>(
    product?.primary_image || ""
  );
  const [addedNotice, setAddedNotice] = useState(false);

  // Sync state when product opens
  React.useEffect(() => {
    if (product) {
      setSelectedVariant(product.variants?.[0]);
      setSelectedImage(product.primary_image);
      setAddedNotice(false);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, 1);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const isLiked = isInWishlist(product.id);
  const displayPrice =
    (product.sale_price ?? product.base_price) +
    (selectedVariant?.price_adjustment ?? 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#111111]/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-[#FBF9F5] border border-[#E8E2D9] shadow-2xl overflow-hidden z-10 animate-fade-in max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-[#6E6A64] hover:text-[#111111] bg-[#FBF9F5]/80 backdrop-blur rounded-full transition-colors"
          aria-label="Close Preview"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery View */}
          <div className="p-6 bg-[#FAF7F2] flex flex-col justify-between space-y-4">
            <div className="relative aspect-[4/5] w-full bg-[#EFEBE4] overflow-hidden border border-[#E8E2D9]">
              <Image
                src={selectedImage || product.primary_image}
                alt={product.name}
                fill
                unoptimized
                className="object-cover"
              />
            </div>

            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.url)}
                    className={`relative w-16 h-20 flex-shrink-0 border transition-all ${
                      selectedImage === img.url
                        ? "border-[#111111] ring-1 ring-[#111111]"
                        : "border-[#E2DBD0] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt_text}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Acquisition Panel */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C7A6B] font-semibold">
                {product.category_slug} • Atelier Edition
              </span>

              <h2 className="font-sans font-medium text-xl sm:text-2xl text-[#111111] uppercase tracking-wide leading-tight">
                {product.name}
              </h2>

              <p className="text-xs text-[#8C7A6B]">{product.subtitle}</p>

              <div className="flex items-baseline gap-3 pt-1">
                <span className="font-sans text-2xl font-semibold text-[#111111] tracking-tight">
                  {formatINR(displayPrice)}
                </span>
                {product.sale_price && (
                  <span className="text-sm text-[#9C9488] line-through font-sans">
                    {formatINR(product.base_price)}
                  </span>
                )}
              </div>

              <p className="text-xs text-[#6E6A64] leading-relaxed pt-2">
                {product.short_description}
              </p>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#E8E2D9]">
                <label className="text-xs uppercase tracking-widest text-[#8C7A6B] font-medium block">
                  Select Edition / Variant
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const label =
                      v.color_name || v.size || (v.volume_ml ? `${v.volume_ml}ml` : v.sku);
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`text-xs px-3.5 py-2 border transition-all ${
                          isSelected
                            ? "border-[#111111] bg-[#111111] text-[#F5F2EB]"
                            : "border-[#D5CDC0] bg-[#FAF7F2] text-[#2C2926] hover:border-[#111111]"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-[#E8E2D9]">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 bg-[#141414] text-[#F5F2EB] text-xs uppercase tracking-[0.25em] font-medium hover:bg-[#C5A880] hover:text-[#111111] transition-all flex items-center justify-center gap-2"
                >
                  {addedNotice ? (
                    <>
                      <Check className="w-4 h-4 text-[#A3D9B5]" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3.5 border border-[#D5CDC0] transition-colors ${
                    isLiked
                      ? "bg-[#FAF7F2] text-[#C5A880] border-[#C5A880]"
                      : "hover:bg-[#FAF7F2] text-[#6E6A64] hover:text-[#111111]"
                  }`}
                  aria-label="Toggle Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                </button>
              </div>

              <div className="text-center pt-1">
                <Link
                  href={`/product/${product.slug}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#8C7A6B] hover:text-[#111111] underline transition-colors"
                >
                  <span>View Full Creation Details & Atelier Notes</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
