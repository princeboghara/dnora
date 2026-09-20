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

  // Strictly filter gallery to ONLY the selected colour's uploaded images
  const rawVariantImages = activeVariant?.images && activeVariant.images.length > 0
    ? activeVariant.images
    : product.images;

  const currentGalleryImages: ProductImage[] = (rawVariantImages || [])
    .map((img: string | Partial<ProductImage>, idx: number): ProductImage => ({
      id: typeof img === "object" && img?.id ? img.id : `img-${idx}`,
      cloudinary_public_id:
        typeof img === "object" && img?.cloudinary_public_id ? img.cloudinary_public_id : `var-img-${idx}`,
      secure_url: typeof img === "string" ? img : img?.secure_url || "",
      alt_text:
        typeof img === "object" && img?.alt_text
          ? img.alt_text
          : `${product.name} in ${activeVariant?.name || "Original Edition"} - View ${idx + 1}`,
      sort_order: idx + 1,
    }))
    .filter((img: ProductImage) => Boolean(img.secure_url));

  // Fallback to primary product image if empty
  const safeGalleryImages = currentGalleryImages.length > 0 ? currentGalleryImages : product.images;
  const safeImageIndex = selectedImageIndex < safeGalleryImages.length ? selectedImageIndex : 0;
  const currentImage = safeGalleryImages[safeImageIndex] || safeGalleryImages[0];

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
    addItem(
      product,
      quantity,
      activeVariant
        ? {
            name: activeVariant.name,
            color_hex: activeVariant.color_hex || activeVariant.hex,
            hex: activeVariant.color_hex || activeVariant.hex,
          }
        : undefined
    );
    success(`Added ${quantity} × "${product.name}"${activeVariant ? ` (${activeVariant.name})` : ""} to your shopping bag.`);
  };

  const handleBuyNow = async () => {
    if (product.stock <= 0 || buyingNow) return;
    setBuyingNow(true);
    addItem(
      product,
      quantity,
      activeVariant
        ? {
            name: activeVariant.name,
            color_hex: activeVariant.color_hex || activeVariant.hex,
            hex: activeVariant.color_hex || activeVariant.hex,
          }
        : undefined
    );

    try {
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
      setBuyingNow(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
      {/* Left Column: Normal / Large Substantial Product Image Gallery */}
      <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4 sm:gap-6">
        {/* Thumbnails list (Selected Colour Images ONLY) */}
        {safeGalleryImages.length > 1 && (
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible shrink-0 pb-2 sm:pb-0 scrollbar-none">
            {safeGalleryImages.map((img, idx) => (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => {
                  setSelectedImageIndex(idx);
                  setIsZoomActive(false);
                }}
                className={`relative w-18 h-24 sm:w-20 sm:h-28 rounded-xs overflow-hidden bg-[#F5F3EF] border transition-all cursor-pointer ${
                  idx === safeImageIndex
                    ? "border-[#0E0E0E] ring-2 ring-[#0E0E0E]"
                    : "border-[#E8E5DE] opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.secure_url}
                  alt={img.alt_text || `${product.name} view ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover object-center"
                />
              </button>
            ))}
          </div>
        )}

        {/* Large Premium Main Image Frame with Interactive Zoom */}
        <div
          onClick={handleImageClick}
          onMouseLeave={() => setIsZoomActive(false)}
          onMouseMove={handleMouseMove}
          className={`relative flex-1 aspect-[4/5] min-h-[440px] sm:min-h-[540px] lg:min-h-[620px] bg-[#F5F3EF] rounded-xs overflow-hidden border border-[#E8E5DE] shadow-sm select-none group transition-all ${
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
                key={currentImage.secure_url}
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
              <span className="bg-[#0E0E0E] text-[#FAF9F6] text-[10px] font-bold tracking-[0.18em] uppercase px-3 py-1 rounded-xs shadow-xs">
                Best Seller
              </span>
            )}
            {product.is_new_arrival && (
              <span className="bg-[#FAF9F6] text-[#0E0E0E] border border-[#0E0E0E]/20 text-[10px] font-bold tracking-[0.18em] uppercase px-3 py-1 rounded-xs shadow-xs">
                New In
              </span>
            )}
          </div>

          {/* Floating Zoom Action Badge */}
          <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none z-10">
            {isZoomActive ? (
              <span className="bg-[#0E0E0E]/90 backdrop-blur-md text-[#FAF9F6] text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-md border border-white/20 flex items-center gap-1.5">
                <ZoomOut className="w-3.5 h-3.5 text-white" />
                <span>Click to Exit Zoom</span>
              </span>
            ) : (
              <span className="bg-white/90 backdrop-blur-md text-[#0E0E0E] text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-xs border border-[#E8E5DE] flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-3.5 h-3.5 text-[#0E0E0E]" />
                <span>Click to Zoom</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Handbag Specifications & Purchase Options */}
      <div className="lg:col-span-5 flex flex-col space-y-6">
        <div>
          {/* Category & SKU */}
          <div className="flex items-center justify-between text-xs text-[#73706A] uppercase tracking-[0.2em] font-semibold mb-2">
            <span>{product.categories?.[0]?.name || "DNORA Atelier"}</span>
            <span>SKU: {product.sku}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-[#0E0E0E] tracking-tight leading-tight mb-3">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-center gap-3 pb-5 border-b border-[#E8E5DE]">
            <span className="text-2xl sm:text-3xl font-bold text-[#0E0E0E]">
              {formatPrice(product.price)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-base text-[#73706A] line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
            {product.stock > 0 ? (
              <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <Check className="w-3.5 h-3.5" />
                In Stock ({product.stock})
              </span>
            ) : (
              <span className="ml-auto text-xs font-semibold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                Sold Out
              </span>
            )}
          </div>

          {/* PRODUCT COLOUR SELECTOR — NORMAL / BIG COMFORTABLE BUTTONS */}
          {product.color_variants && product.color_variants.length > 0 && (
            <div className="py-5 border-b border-[#E8E5DE]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-[0.18em] font-bold text-[#0E0E0E]">
                  Color:{" "}
                  <span className="font-semibold text-[#73706A]">
                    {activeVariant?.name || "Original Edition"}
                  </span>
                </span>
                <span className="text-[11px] text-[#73706A] uppercase tracking-wider font-semibold">
                  {product.color_variants.length} Colors
                </span>
              </div>

              {/* Normal / Big comfortable swatch buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                {product.color_variants.map((v) => {
                  const isSelected = v.id === selectedVariantId;
                  const bg = v.color_hex || v.hex || "#0E0E0E";
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setSelectedVariantId(v.id);
                        setSelectedImageIndex(0);
                        setIsZoomActive(false);
                      }}
                      className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? "border-[#0E0E0E] ring-2 ring-[#0E0E0E] ring-offset-2 scale-105 shadow-sm"
                          : "border-[#E8E5DE] hover:border-[#0E0E0E] opacity-80 hover:opacity-100"
                      }`}
                      title={v.name}
                      aria-label={`Select ${v.name} color`}
                    >
                      <span
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-black/15 block"
                        style={{ backgroundColor: bg }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Short Description */}
          <p className="text-sm text-[#3A3835] leading-relaxed my-5 font-normal">
            {product.short_description}
          </p>

          {/* Detailed Full Description */}
          <div className="bg-[#FAF9F6] p-4 sm:p-5 rounded-xs border border-[#E8E5DE] mb-6">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#0E0E0E] mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0E0E0E]" />
              Artisan Details
            </h3>
            <p className="text-xs text-[#73706A] leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Quantity and Purchase Action Buttons */}
          <div className="space-y-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0E0E0E]">
                Quantity:
              </span>
              <div className="flex items-center border border-[#E8E5DE] bg-white rounded-xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-[#73706A] hover:text-[#0E0E0E] transition-colors cursor-pointer"
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
                  className="p-2 text-[#73706A] hover:text-[#0E0E0E] transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* GLOBAL BUTTON REDESIGN: BUY NOW + ADD TO CART (Clean, Professional, Rectangular) */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              {/* ADD TO CART */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-4 px-6 bg-white border border-[#0E0E0E] hover:bg-[#FAF9F6] text-[#0E0E0E] text-xs font-bold uppercase tracking-[0.18em] rounded-xs transition-colors shadow-xs disabled:opacity-50 active:scale-[0.99] cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#0E0E0E]" />
                <span>Add to Cart</span>
              </button>

              {/* BUY NOW */}
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={product.stock <= 0 || buyingNow}
                className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-4 px-6 bg-[#0E0E0E] hover:bg-[#262626] text-[#FAF9F6] text-xs font-bold uppercase tracking-[0.18em] rounded-xs transition-colors shadow-md disabled:opacity-50 active:scale-[0.99] cursor-pointer"
              >
                {buyingNow ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>Buy Now</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </>
                )}
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => setIsWishlisted(!isWishlisted)}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className="hidden sm:flex p-3.5 rounded-xs border border-[#E8E5DE] bg-white hover:border-[#0E0E0E] transition-colors shrink-0 cursor-pointer"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    isWishlisted ? "fill-[#0E0E0E] text-[#0E0E0E]" : "text-[#0E0E0E]"
                  }`}
                />
              </button>
            </div>

            {/* Guarantee Badge */}
            <div className="pt-2 flex items-center gap-2 text-[11px] text-[#73706A]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Complimentary insured shipping &amp; 14-day atelier exchange guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
