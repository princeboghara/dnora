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
                className={`relative w-18 h-24 sm:w-20 sm:h-28 rounded-xl overflow-hidden bg-slate-50 border transition-all cursor-pointer ${
                  idx === safeImageIndex
                    ? "border-slate-900 ring-2 ring-slate-900"
                    : "border-slate-200 opacity-70 hover:opacity-100"
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
          className={`relative flex-1 aspect-[4/5] min-h-[440px] sm:min-h-[540px] lg:min-h-[620px] bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 shadow-sm select-none group transition-all ${
            isZoomActive ? "cursor-zoom-out ring-2 ring-slate-900" : "cursor-zoom-in"
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
              <span className="bg-slate-900 text-white text-[10px] font-bold tracking-[0.16em] uppercase px-3 py-1 rounded-sm shadow-xs">
                Best Seller
              </span>
            )}
            {product.is_new_arrival && (
              <span className="bg-white text-slate-900 border border-slate-300 text-[10px] font-bold tracking-[0.16em] uppercase px-3 py-1 rounded-sm shadow-xs">
                New In
              </span>
            )}
          </div>

          {/* Floating Zoom Action Badge */}
          <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none z-10">
            {isZoomActive ? (
              <span className="bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-md border border-white/20 flex items-center gap-1.5">
                <ZoomOut className="w-3.5 h-3.5 text-white" />
                <span>Click to Exit Zoom</span>
              </span>
            ) : (
              <span className="bg-white/95 backdrop-blur-md text-slate-900 text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-xs border border-slate-200 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-3.5 h-3.5 text-slate-900" />
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
          <div className="flex items-center justify-between text-xs text-slate-500 uppercase tracking-[0.2em] font-semibold mb-2">
            <span>{product.categories?.[0]?.name || "DNORA Atelier"}</span>
            <span>SKU: {product.sku}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-center gap-3 pb-5 border-b border-slate-200">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">
              {formatPrice(product.price)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-base text-slate-400 line-through">
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
            <div className="py-5 border-b border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-[0.18em] font-bold text-slate-900">
                  Color:{" "}
                  <span className="font-semibold text-slate-500">
                    {activeVariant?.name || "Original Edition"}
                  </span>
                </span>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                  {product.color_variants.length} Colors
                </span>
              </div>

              {/* Normal / Big comfortable swatch buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                {product.color_variants.map((v) => {
                  const isSelected = v.id === selectedVariantId;
                  const bg = v.color_hex || v.hex || "#0F172A";
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
                          ? "border-slate-900 ring-2 ring-slate-900 ring-offset-2 scale-105 shadow-sm"
                          : "border-slate-200 hover:border-slate-900 opacity-80 hover:opacity-100"
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
          <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 mb-6">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-slate-900" />
              Artisan Details
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Quantity and Purchase Action Buttons */}
          <div className="space-y-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Quantity:
              </span>
              <div className="flex items-center border border-slate-200 bg-white rounded-lg overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-xs font-bold text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* GLOBAL BUTTON REDESIGN: BUY NOW + ADD TO CART (Exact Same Size, Rectangular, Luxury) */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 pt-1">
              {/* ADD TO CART */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="w-full sm:flex-1 h-11 sm:h-13 flex items-center justify-center gap-2 px-3 sm:px-6 bg-white border border-slate-300 hover:bg-slate-50 text-slate-900 text-xs font-bold uppercase tracking-normal sm:tracking-[0.14em] rounded-xl transition-all shadow-2xs disabled:opacity-50 active:scale-[0.99] cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-slate-900 shrink-0" />
                <span className="truncate whitespace-nowrap">Add to Bag</span>
              </button>

              {/* BUY NOW */}
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={product.stock <= 0 || buyingNow}
                className="w-full sm:flex-1 h-11 sm:h-13 flex items-center justify-center gap-2 px-3 sm:px-6 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-normal sm:tracking-[0.14em] rounded-xl transition-all shadow-md disabled:opacity-50 active:scale-[0.99] cursor-pointer border border-slate-900"
              >
                {buyingNow ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                ) : (
                  <>
                    <span className="truncate whitespace-nowrap">Buy Now</span>
                    <ArrowRight className="w-4 h-4 text-white shrink-0" />
                  </>
                )}
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => setIsWishlisted(!isWishlisted)}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className="hidden sm:flex h-12 sm:h-13 w-12 sm:w-13 items-center justify-center rounded-xl border border-slate-200 bg-white hover:border-slate-900 transition-colors shrink-0 cursor-pointer shadow-2xs"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    isWishlisted ? "fill-slate-900 text-slate-900" : "text-slate-700"
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
