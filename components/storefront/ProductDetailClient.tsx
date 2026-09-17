"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Heart, Plus, Minus, Check, ShoppingBag, Sparkles } from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/store/cart-store";
import { useToast } from "@/components/ui/Toast";

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItem } = useCart();
  const { success } = useToast();

  const currentImage = product.images[selectedImageIndex] || product.images[0];

  const handleAddToCart = () => {
    addItem(product, quantity);
    success(`Added ${quantity} × "${product.name}" to your shopping bag.`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
      {/* Left Column: Image Gallery */}
      <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
        {/* Thumbnails list */}
        {product.images.length > 1 && (
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible shrink-0 pb-2 sm:pb-0">
            {product.images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-sm overflow-hidden bg-[#F5F3EF] border transition-all ${
                  idx === selectedImageIndex
                    ? "border-[#0E0E0E] ring-1 ring-[#0E0E0E]"
                    : "border-[#E8E5DE] opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.secure_url}
                  alt={img.alt_text || `${product.name} ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Active Large Image Display */}
        <div className="relative flex-1 aspect-[4/5] bg-[#F5F3EF] rounded-sm overflow-hidden border border-[#E8E5DE] shadow-lg">
          {currentImage && (
            <Image
              src={currentImage.secure_url}
              alt={currentImage.alt_text || product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover object-center transition-all duration-500"
            />
          )}

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            {product.is_best_seller && (
              <span className="bg-[#0E0E0E] text-[#FAF9F6] text-xs font-bold tracking-[0.18em] uppercase px-3 py-1.5 rounded-sm shadow-md">
                Best Seller
              </span>
            )}
            {product.is_new_arrival && (
              <span className="bg-[#C5A880] text-[#0E0E0E] text-xs font-bold tracking-[0.18em] uppercase px-3 py-1.5 rounded-sm shadow-md">
                New Arrival
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Handbag Specifications & Purchase Options */}
      <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
        <div>
          {/* Category & SKU */}
          <div className="flex items-center justify-between text-xs text-[#73706A] uppercase tracking-[0.2em] font-semibold mb-2">
            <span>{product.categories?.[0]?.name || "Purse"}</span>
            <span>SKU: {product.sku}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#0E0E0E] tracking-tight leading-tight mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-center gap-3 pb-6 border-b border-[#E8E5DE]">
            <span className="text-2xl sm:text-3xl font-bold text-[#0E0E0E]">
              {formatPrice(product.price)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-lg text-[#8C8983] line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
            {product.stock > 0 ? (
              <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <Check className="w-3.5 h-3.5" />
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="ml-auto text-xs font-semibold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                Sold Out
              </span>
            )}
          </div>

          {/* Short Description */}
          <p className="text-sm text-[#3A3835] leading-relaxed my-6 font-medium">
            {product.short_description}
          </p>

          {/* Detailed Full Description */}
          <div className="bg-white p-6 rounded-sm border border-[#E8E5DE] mb-8">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#0E0E0E] mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              Artisan Craftsmanship &amp; Details
            </h3>
            <p className="text-xs text-[#73706A] leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Quantity and Add to Bag */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {/* Quantity Counter */}
              <div className="flex items-center border border-[#E8E5DE] bg-white rounded-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3.5 text-[#73706A] hover:text-[#0E0E0E] transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-bold text-[#0E0E0E]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-3.5 text-[#73706A] hover:text-[#0E0E0E] transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Bag CTA */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 flex items-center justify-center gap-3 py-4 px-8 bg-[#0E0E0E] hover:bg-[#2C2B29] text-[#FAF9F6] text-xs font-semibold uppercase tracking-[0.2em] rounded-sm transition-all shadow-md disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4 text-[#C5A880]" />
                <span>{product.stock > 0 ? "Add to Bag" : "Currently Unavailable"}</span>
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className="p-4 rounded-sm border border-[#E8E5DE] bg-white hover:border-[#0E0E0E] transition-colors"
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isWishlisted ? "fill-rose-600 text-rose-600" : "text-[#0E0E0E]"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
