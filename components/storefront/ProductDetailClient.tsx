"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, Plus, Minus, Check, ShoppingBag, Sparkles, ZoomIn, ZoomOut, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { Product, ProductImage } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/store/cart-store";
import { useToast } from "@/components/ui/Toast";

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isZoomActive, setIsZoomActive] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [buyingNow, setBuyingNow] = useState(false);

  // Color Variants System
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.color_variants && product.color_variants.length > 0
      ? product.color_variants[0].id
      : null
  );

  const { addItem } = useCart();
  const { success } = useToast();

  const activeVariant = product.color_variants?.find((v) => v.id === selectedVariantId);
  const currentGalleryImages: ProductImage[] =
    activeVariant && activeVariant.images.length > 0
      ? activeVariant.images
      : product.images;

  const currentImage = currentGalleryImages[selectedImageIndex] || currentGalleryImages[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
    setIsZoomActive((prev) => !prev);
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    success(`Added ${quantity} × "${product.name}" to your shopping bag.`);
  };

  const handleBuyNow = async () => {
    if (product.stock <= 0) return;
    setBuyingNow(true);
    addItem(product, quantity);

    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.isAuthenticated) {
        router.push("/checkout");
      } else {
        router.push("/login?redirect=/checkout");
      }
    } catch {
      router.push("/checkout");
    } finally {
      setBuyingNow(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
      {/* Left Column: Image Gallery */}
      <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
        {/* Thumbnails list */}
        {currentGalleryImages.length > 1 && (
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible shrink-0 pb-2 sm:pb-0 custom-scrollbar">
            {currentGalleryImages.map((img, idx) => (
              <button
                key={img.id || img.cloudinary_public_id || idx}
                onClick={() => {
                  setSelectedImageIndex(idx);
                  setIsZoomActive(false);
                }}
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

        {/* Active Large Image Display with Interactive Click-to-Zoom */}
        <div
          onClick={handleImageClick}
          onMouseLeave={() => setIsZoomActive(false)}
          onMouseMove={handleMouseMove}
          className={`relative flex-1 aspect-[4/5] bg-[#F5F3EF] rounded-sm overflow-hidden border border-[#E8E5DE] shadow-lg select-none group transition-all ${
            isZoomActive ? "cursor-zoom-out ring-2 ring-[#0E0E0E]" : "cursor-zoom-in"
          }`}
          title={isZoomActive ? "Click to exit zoom" : "Click to activate zoom"}
        >
          {currentImage && (
            <div
              className="w-full h-full relative transition-transform duration-200 ease-out will-change-transform"
              style={{
                transform: isZoomActive ? "scale(2.3)" : "scale(1)",
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
              }}
            >
              <Image
                src={currentImage.secure_url}
                alt={currentImage.alt_text || product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover object-center pointer-events-none"
              />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
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

          {/* Floating Zoom Action Badge */}
          <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none z-10">
            {isZoomActive ? (
              <span className="bg-[#0E0E0E]/90 backdrop-blur-md text-[#FAF9F6] text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-xl border border-white/20 flex items-center gap-1.5">
                <ZoomOut className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Click to Exit Zoom</span>
              </span>
            ) : (
              <span className="bg-white/90 backdrop-blur-md text-[#0E0E0E] text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-md border border-[#E8E5DE] flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Click Image to Zoom</span>
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

          {/* Dynamic Color Variants Swatch Selector */}
          {product.color_variants && product.color_variants.length > 0 && (
            <div className="py-5 border-b border-[#E8E5DE]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-[0.18em] font-bold text-[#0E0E0E]">
                  Color:{" "}
                  <span className="font-semibold text-[#73706A]">
                    {activeVariant?.name || "Original Edition"}
                  </span>
                </span>
                <span className="text-[11px] text-[#C5A880] uppercase tracking-wider font-semibold">
                  {product.color_variants.length} Available
                </span>
              </div>

              <div className="flex items-center gap-3">
                {product.color_variants.map((v) => {
                  const isSelected = v.id === selectedVariantId;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setSelectedVariantId(v.id);
                        setSelectedImageIndex(0);
                        setIsZoomActive(false);
                      }}
                      className={`relative p-1 rounded-full border-2 transition-all flex items-center justify-center ${
                        isSelected
                          ? "border-[#0E0E0E] scale-110 shadow-sm"
                          : "border-transparent hover:border-[#E8E5DE]"
                      }`}
                      title={v.name}
                    >
                      <span
                        className="w-6 h-6 rounded-full border border-black/15 block"
                        style={{ backgroundColor: v.color_hex }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Short Description */}
          <p className="text-sm text-[#3A3835] leading-relaxed my-5 font-medium">
            {product.short_description}
          </p>

          {/* Detailed Full Description */}
          <div className="bg-white p-5 rounded-sm border border-[#E8E5DE] mb-6">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#0E0E0E] mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              Artisan Craftsmanship &amp; Details
            </h3>
            <p className="text-xs text-[#73706A] leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Purchase CTA Buttons (Add to Bag & Buy Now) */}
          <div className="space-y-3">
            {/* Quantity Selector */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0E0E0E]">
                Quantity:
              </span>
              <div className="flex items-center border border-[#E8E5DE] bg-white rounded-sm">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-[#73706A] hover:text-[#0E0E0E] transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-xs font-bold text-[#0E0E0E]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 text-[#73706A] hover:text-[#0E0E0E] transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Add to Bag CTA */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3.5 px-4 bg-white border border-[#0E0E0E] hover:bg-[#FAF9F6] text-[#0E0E0E] text-xs font-bold uppercase tracking-[0.18em] rounded-sm transition-all shadow-xs disabled:opacity-50 active:scale-[0.99]"
              >
                <ShoppingBag className="w-4 h-4 text-[#C5A880]" />
                <span>Add to Bag</span>
              </button>

              {/* Buy Now CTA */}
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={product.stock <= 0 || buyingNow}
                className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3.5 px-4 bg-[#0E0E0E] hover:bg-[#2C2B29] text-[#FAF9F6] text-xs font-bold uppercase tracking-[0.18em] rounded-sm transition-all shadow-md disabled:opacity-50 active:scale-[0.99]"
              >
                {buyingNow ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#C5A880]" />
                ) : (
                  <>
                    <span>Buy Now</span>
                    <ArrowRight className="w-4 h-4 text-[#C5A880]" />
                  </>
                )}
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => setIsWishlisted(!isWishlisted)}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className="hidden sm:flex p-3.5 rounded-sm border border-[#E8E5DE] bg-white hover:border-[#0E0E0E] transition-colors shrink-0"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    isWishlisted ? "fill-rose-600 text-rose-600" : "text-[#0E0E0E]"
                  }`}
                />
              </button>
            </div>

            {/* Guarantee Badge */}
            <div className="pt-2 flex items-center gap-2 text-[11px] text-[#73706A]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Complimentary insured shipping &amp; 14-day atelier exchange policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

