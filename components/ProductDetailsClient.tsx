"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Truck,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronRight,
  Minus,
  Plus,
} from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/store/cart-store";
import { useWishlist } from "@/lib/store/wishlist-store";
import { ProductCard } from "@/components/ProductCard";

interface ProductDetailsClientProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailsClient({ product, relatedProducts }: ProductDetailsClientProps) {
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // State
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(
    product.color_variants && product.color_variants.length > 0 ? 0 : null
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string>("details");

  const isFavorited = isInWishlist(product.id);

  // Active color variant
  const activeVariant =
    selectedColorIndex !== null && product.color_variants && product.color_variants[selectedColorIndex]
      ? product.color_variants[selectedColorIndex]
      : null;

  // Combine variant images and all base product images (main + hover + extra) so no images are ever lost
  const displayImages = React.useMemo(() => {
    const list: typeof product.images = [];
    const seen = new Set<string>();

    const addImg = (img?: { id?: string; secure_url?: string; alt_text?: string; sort_order?: number; cloudinary_public_id?: string }) => {
      if (img?.secure_url && !seen.has(img.secure_url)) {
        seen.add(img.secure_url);
        list.push({
          id: img.id || `img-${seen.size}`,
          secure_url: img.secure_url,
          cloudinary_public_id: img.cloudinary_public_id || "",
          alt_text: img.alt_text || product.name,
          sort_order: img.sort_order || list.length,
        });
      }
    };

    // If active variant has images, add them first
    if (activeVariant?.images && activeVariant.images.length > 0) {
      activeVariant.images.forEach(addImg);
    }
    // Add all base product images (index 0 is main, index 1 is hover, extra images follow)
    if (product.images && product.images.length > 0) {
      product.images.forEach(addImg);
    }

    if (list.length === 0) {
      list.push({
        id: "fallback",
        secure_url: "/images/placeholder.jpg",
        alt_text: product.name,
        sort_order: 0,
        cloudinary_public_id: "",
      });
    }

    return list;
  }, [activeVariant, product.images, product.name]);

  const currentImage = displayImages[activeImageIndex] || displayImages[0];
  const hoverImage = displayImages[1]?.secure_url || currentImage.secure_url;

  const discountPercent =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : null;

  // Handlers
  const handleAddToCart = () => {
    setIsAdding(true);
    addItem(product, quantity, activeVariant || undefined);
    setTimeout(() => {
      setIsAdding(false);
      openCart();
    }, 400);
  };

  const handleBuyNow = () => {
    addItem(product, quantity, activeVariant || undefined);
    router.push("/checkout");
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordion((prev) => (prev === id ? "" : id));
  };

  return (
    <div className="w-full bg-white text-neutral-900 pb-20">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-neutral-100 bg-[#FAF9F6]">
        <div className="max-w-[1820px] 2xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-3.5 flex items-center gap-2 text-[11px] text-neutral-500 font-light overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />
          <Link href="/shop" className="hover:text-black transition-colors">
            Shop
          </Link>
          {product.category_name && (
            <>
              <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />
              <Link
                href={`/category/${product.category_slug || "handbags"}`}
                className="hover:text-black transition-colors"
              >
                {product.category_name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />
          <span className="text-neutral-900 font-medium truncate">{product.name}</span>
        </div>
      </div>

      {/* Main Product Showcase Section */}
      <div className="max-w-[1820px] 2xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* LEFT: Image Gallery (7 Cols on LG) */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnail Strip */}
            {displayImages.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[640px] pb-2 sm:pb-0 scrollbar-none shrink-0">
                {displayImages.map((img, idx) => (
                  <button
                    key={`${img.id || idx}-${idx}`}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden border cursor-pointer transition-all shrink-0 bg-[#FAF8F5] group/thumb ${
                      activeImageIndex === idx
                        ? "border-neutral-950 ring-1 ring-neutral-950 scale-102"
                        : "border-neutral-200 hover:border-neutral-400 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img.secure_url}
                      alt={img.alt_text || `${product.name} thumbnail ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                    <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded-xs bg-black/60 text-white text-[8px] font-mono opacity-80 group-hover/thumb:opacity-100">
                      {idx === 0 ? "Main" : idx === 1 ? "Hover" : `#${idx + 1}`}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Main Stage Image Frame with Hover Reveal */}
            <div className="group/stage relative flex-1 aspect-3/4 rounded-2xl overflow-hidden bg-[#FAF8F5] border border-neutral-200/80 shadow-2xs">
              <Image
                src={currentImage.secure_url}
                alt={currentImage.alt_text || product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className={`object-cover transition-opacity duration-500 ${
                  activeImageIndex === 0 && hoverImage !== currentImage.secure_url
                    ? "group-hover/stage:opacity-0"
                    : ""
                }`}
              />

              {/* Hover Image Reveal when hovering over primary image */}
              {activeImageIndex === 0 && hoverImage !== currentImage.secure_url && (
                <Image
                  src={hoverImage}
                  alt={`${product.name} alternate hover`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover absolute inset-0 opacity-0 transition-all duration-500 group-hover/stage:opacity-100 group-hover/stage:scale-103"
                />
              )}

              {/* Luxury Discount Pill */}
              {discountPercent && discountPercent > 0 && (
                <div className="absolute top-4 left-4 z-10">
                  <div className="px-2.5 py-1 rounded-full bg-rose-600/95 text-white flex items-center gap-1 shadow-sm border border-white/20 select-none backdrop-blur-xs">
                    <span className="text-xs font-bold tracking-tight">-{discountPercent}%</span>
                    <span className="text-[9px] font-semibold uppercase tracking-wider">OFF</span>
                  </div>
                </div>
              )}

              {/* Wishlist Button on Image */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
                className={`absolute top-4 right-4 z-10 p-2.5 rounded-full backdrop-blur-md shadow-xs transition-transform active:scale-90 cursor-pointer ${
                  isFavorited
                    ? "bg-rose-50 text-rose-600"
                    : "bg-white/80 text-neutral-700 hover:bg-white hover:text-black"
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>

          {/* RIGHT: Product Information & Purchase Controls (5 Cols on LG) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* Header Titles */}
            <div className="space-y-2 border-b border-neutral-100 pb-5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                <span>Handcrafted in Florence</span>
                <span>•</span>
                <span className="font-mono text-neutral-400">{product.sku}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif text-neutral-950 font-normal leading-tight">
                {product.name}
              </h1>

              {/* Price & Savings */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-xl sm:text-2xl font-bold text-neutral-950 font-mono tracking-tight">
                  {formatPrice(product.price)}
                </span>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <>
                    <span className="text-sm text-neutral-400 line-through font-mono">
                      {formatPrice(product.compare_at_price)}
                    </span>
                    <span className="text-xs font-semibold text-rose-600 tracking-wide uppercase">
                      Save {formatPrice(product.compare_at_price - product.price)}
                    </span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-neutral-500 font-light">
                Price includes Florentine artisan tailoring, export duties, and luxury presentation box.
              </p>
            </div>

            {/* Color Variant Selector */}
            {product.color_variants && product.color_variants.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wider text-neutral-900">
                    Color:{" "}
                    <strong className="font-medium text-neutral-600">
                      {activeVariant ? activeVariant.name : "Select Variant"}
                    </strong>
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    {product.color_variants.length} available
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.color_variants.map((variant, idx) => {
                    const isSelected = selectedColorIndex === idx;
                    return (
                      <button
                        key={`${variant.name}-${idx}`}
                        type="button"
                        onClick={() => {
                          setSelectedColorIndex(idx);
                          setActiveImageIndex(0);
                        }}
                        className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all cursor-pointer ${
                          isSelected
                            ? "border-neutral-950 bg-neutral-950 text-white font-medium shadow-xs"
                            : "border-neutral-200 hover:border-neutral-400 bg-white text-neutral-800"
                        }`}
                      >
                        {variant.color_hex && (
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                            style={{ backgroundColor: variant.color_hex }}
                          />
                        )}
                        <span>{variant.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-neutral-300 rounded-lg p-1 bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 text-neutral-500 hover:text-black transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-semibold text-neutral-900 font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2 text-neutral-500 hover:text-black transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Bag Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="flex-1 py-3.5 px-6 bg-neutral-950 text-white text-xs font-semibold uppercase tracking-[0.2em] hover:bg-black transition-all rounded-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-75"
                >
                  {isAdding ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>
              </div>

              {/* Instant Buy Now Button */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-3.5 px-6 border-2 border-neutral-950 text-neutral-950 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-neutral-950 hover:text-white transition-all rounded-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
              >
                <span>Instant Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Artisan Value Propositions */}
            <div className="p-4 bg-[#FAF9F6] rounded-xl border border-neutral-200/70 space-y-2.5 text-xs text-neutral-700 font-light">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-neutral-900 shrink-0" />
                <span>Certified 100% Italian Vegetable-Tanned Leather</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-neutral-900 shrink-0" />
                <span>Complimentary Express Delivery & Signature Dispatch</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-neutral-900 shrink-0" />
                <span>14-Day Complimentary Atelier Returns & Size Exchanges</span>
              </div>
            </div>

            {/* Accordion Tabs */}
            <div className="border-t border-neutral-200 divide-y divide-neutral-200 pt-2">
              {/* Description & Craft */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleAccordion("details")}
                  className="w-full py-3.5 flex items-center justify-between text-left cursor-pointer group"
                >
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-900 group-hover:text-neutral-600 transition-colors">
                    Florentine Craftsmanship & Details
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${
                      openAccordion === "details" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openAccordion === "details" && (
                  <div className="pb-4 text-xs text-neutral-600 leading-relaxed font-light space-y-2">
                    <p>{product.description || "Architectural silhouettes engineered with artisanal discipline. Every piece is hand-sculpted in Florence, Italy using sustainably-sourced Italian calfskin."}</p>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-neutral-500 pt-1">
                      <li>Origin: Handcrafted in Florence, Italy</li>
                      <li>Material: 100% Certified Italian Calfskin</li>
                      <li>Hardware: Palladium-finish reinforced architectural alloy</li>
                      <li>Lining: Breathable natural suede interior</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Delivery & Returns */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleAccordion("delivery")}
                  className="w-full py-3.5 flex items-center justify-between text-left cursor-pointer group"
                >
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-900 group-hover:text-neutral-600 transition-colors">
                    Shipping & Worldwide Customs
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${
                      openAccordion === "delivery" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openAccordion === "delivery" && (
                  <div className="pb-4 text-xs text-neutral-600 leading-relaxed font-light space-y-2">
                    <p>
                      All DNORA creations are dispatched under white-glove, insured courier transit directly to your doorstep. Complimentary express delivery is included across India.
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      Standard delivery: 3 – 5 business days. Signature required upon receipt.
                    </p>
                  </div>
                )}
              </div>

              {/* Leather Care */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleAccordion("care")}
                  className="w-full py-3.5 flex items-center justify-between text-left cursor-pointer group"
                >
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-900 group-hover:text-neutral-600 transition-colors">
                    Florentine Leather Care
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${
                      openAccordion === "care" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openAccordion === "care" && (
                  <div className="pb-4 text-xs text-neutral-600 leading-relaxed font-light space-y-2">
                    <p>
                      Vegetable-tanned leather develops an exquisite natural patina over time. To maintain its supple texture, avoid prolonged exposure to direct sunlight and high humidity. Clean with a soft, dry cotton cloth.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* You May Also Covet / Related Silhouettes Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-neutral-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl sm:text-2xl font-serif text-neutral-950 font-normal">
                  You May Also Covet
                </h3>
                <p className="text-xs text-neutral-500 font-light mt-0.5">
                  Complementary artisanal silhouettes sculpted for modern elegance.
                </p>
              </div>
              <Link
                href="/shop"
                className="text-xs font-semibold tracking-wider uppercase text-neutral-900 hover:text-neutral-600 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.slice(0, 4).map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
