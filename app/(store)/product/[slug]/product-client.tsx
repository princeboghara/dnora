"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingBag,
  Check,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Plus,
  Minus,
  Maximize2,
  X,
  MapPin,
  Clock,
  Share2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
} from "lucide-react";
import { Product, ProductVariant, Review } from "@/types";
import { useCart } from "@/lib/context/cart-context";
import { useWishlist } from "@/lib/context/wishlist-context";
import { ProductCard } from "@/components/product/ProductCard";
import { INITIAL_REVIEWS } from "@/lib/seed/catalog-data";
import { formatINR, formatDate } from "@/lib/utils";

interface ProductViewClientProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductViewClient({ product, relatedProducts }: ProductViewClientProps) {
  const router = useRouter();
  const { addToCart, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Normalize image list with fallback guarantees
  const rawImages =
    product.images && product.images.length > 0
      ? product.images
      : [
          {
            id: "primary",
            product_id: product.id,
            url: product.primary_image,
            alt_text: product.name,
            display_order: 1,
            is_primary: true,
          },
          ...(product.secondary_image
            ? [
                {
                  id: "secondary",
                  product_id: product.id,
                  url: product.secondary_image,
                  alt_text: `${product.name} alternate angle`,
                  display_order: 2,
                  is_primary: false,
                },
              ]
            : []),
        ];

  // Active image & fallback state
  const [activeImage, setActiveImage] = useState<string>(
    rawImages[0]?.url || product.primary_image
  );
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [fullscreenIndex, setFullscreenIndex] = useState<number>(0);

  // Amazon-Style Hover Zoom State
  const [isZooming, setIsZooming] = useState<boolean>(false);
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const zoomContainerRef = useRef<HTMLDivElement | null>(null);

  // Variant & Quantity
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants?.[0]
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Pincode Estimator State
  const [pincode, setPincode] = useState<string>("");
  const [pincodeStatus, setPincodeStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [deliveryDate, setDeliveryDate] = useState<string>("");

  // Accordion open tabs
  const [openSection, setOpenSection] = useState<string>("details");

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>(
    INITIAL_REVIEWS.filter((r: Review) => r.product_id === product.id)
  );
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    email: "",
    rating: 5,
    title: "",
    comment: "",
  });

  const isLiked = isInWishlist(product.id);
  const basePrice = product.sale_price ?? product.base_price;
  const currentPrice = basePrice + (selectedVariant?.price_adjustment ?? 0);
  const hasDiscount = Boolean(product.sale_price && product.sale_price < product.base_price);
  const discountPercent = hasDiscount
    ? Math.round(((product.base_price - (product.sale_price || 0)) / product.base_price) * 100)
    : 0;

  // Handle Amazon-style mouse coordinate tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomContainerRef.current) return;
    const { left, top, width, height } = zoomContainerRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(((e.clientX - left) / width) * 100, 0), 100);
    const y = Math.min(Math.max(((e.clientY - top) / height) * 100, 0), 100);
    setZoomPos({ x, y });
  };

  const handleMouseEnter = () => setIsZooming(true);
  const handleMouseLeave = () => setIsZooming(false);

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      openCart();
    }, 700);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedVariant, quantity);
    router.push("/checkout");
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6 && /^\d+$/.test(pincode)) {
      const date = new Date(Date.now() + 3 * 86400000);
      const options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };
      setDeliveryDate(date.toLocaleDateString("en-IN", options));
      setPincodeStatus("valid");
    } else {
      setPincodeStatus("invalid");
    }
  };

  const handleShare = async () => {
    if (typeof window !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `DNORA - ${product.name}`,
          text: product.short_description,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback below
      }
    }
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.comment) return;

    const newRev: Review = {
      id: `rev_${Date.now()}`,
      product_id: product.id,
      user_name: reviewForm.name,
      user_email: reviewForm.email,
      rating: reviewForm.rating,
      title: reviewForm.title || "Atelier Impression",
      comment: reviewForm.comment,
      verified_purchase: true,
      status: "approved",
      created_at: new Date().toISOString(),
    };

    setReviews([newRev, ...reviews]);
    setIsReviewModalOpen(false);
    setReviewForm({ name: "", email: "", rating: 5, title: "", comment: "" });
  };

  // Lightbox keyboard navigation
  useEffect(() => {
    if (!fullscreenImage) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreenImage(null);
      if (e.key === "ArrowRight") {
        const next = (fullscreenIndex + 1) % rawImages.length;
        setFullscreenIndex(next);
        setFullscreenImage(rawImages[next].url);
      }
      if (e.key === "ArrowLeft") {
        const prev = (fullscreenIndex - 1 + rawImages.length) % rawImages.length;
        setFullscreenIndex(prev);
        setFullscreenImage(rawImages[prev].url);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fullscreenImage, fullscreenIndex, rawImages]);

  const openFullscreen = (index: number) => {
    setFullscreenIndex(index);
    setFullscreenImage(rawImages[index]?.url || activeImage);
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-[#0F172A] font-sans antialiased pb-24">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-[#E8E2D9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.2em] text-[#64748B] font-medium">
            <Link href="/" className="hover:text-[#0F172A] transition-colors">
              Home
            </Link>
            <span className="text-[#CBD5E1]">/</span>
            <Link href="/shop" className="hover:text-[#0F172A] transition-colors">
              Shop
            </Link>
            <span className="text-[#CBD5E1]">/</span>
            <Link
              href={`/shop?category=${product.category_slug}`}
              className="hover:text-[#0F172A] transition-colors"
            >
              {product.category_slug.replace(/-/g, " ")}
            </Link>
            <span className="text-[#CBD5E1]">/</span>
            <span className="text-[#0F172A] font-semibold truncate max-w-[240px]">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Luxury 2-Column Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT: Gallery with Amazon-Style Magnifying Zoom (7 Columns) */}
          <div className="lg:col-span-7">
            <div className="flex flex-col-reverse md:flex-row gap-4 items-start">
              {/* Thumbnail Strip (Left Column on Desktop, Bottom on Mobile) */}
              <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto max-h-[580px] w-full md:w-20 shrink-0 pb-2 md:pb-0 scrollbar-none">
                {rawImages.map((img, idx) => {
                  const isSelected = activeImage === img.url;
                  const hasError = imageErrors[img.url];
                  const imgSrc = hasError ? product.primary_image : img.url;

                  return (
                    <button
                      key={img.id || idx}
                      type="button"
                      onClick={() => setActiveImage(img.url)}
                      onMouseEnter={() => setActiveImage(img.url)}
                      className={`relative w-16 h-20 md:w-20 md:h-24 shrink-0 rounded-sm overflow-hidden border transition-all duration-200 cursor-pointer bg-[#F1EFEA] ${
                        isSelected
                          ? "border-[#0F172A] ring-2 ring-[#C5A880] ring-offset-2 opacity-100 shadow-xs"
                          : "border-[#E2E8F0] opacity-70 hover:opacity-100"
                      }`}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <Image
                        src={imgSrc}
                        alt={img.alt_text || `${product.name} view ${idx + 1}`}
                        fill
                        unoptimized
                        sizes="80px"
                        className="object-cover object-center"
                        onError={() =>
                          setImageErrors((prev) => ({ ...prev, [img.url]: true }))
                        }
                      />
                    </button>
                  );
                })}
              </div>

              {/* Main Showcase with Amazon-Style Interactive Zoom */}
              <div className="relative flex-1 w-full">
                <div
                  ref={zoomContainerRef}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onMouseMove={handleMouseMove}
                  onClick={() => openFullscreen(rawImages.findIndex((i) => i.url === activeImage))}
                  className="relative aspect-[3/4] sm:aspect-[4/5] w-full bg-[#F4F1EA] overflow-hidden border border-[#E2E8F0] rounded-xs cursor-crosshair group shadow-sm select-none"
                >
                  {/* Zoomable Image Container */}
                  <div
                    className="w-full h-full relative"
                    style={{
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      transform: isZooming ? "scale(2.4)" : "scale(1)",
                      transition: isZooming
                        ? "transform 0.06s ease-out"
                        : "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    <Image
                      src={
                        imageErrors[activeImage] ? product.primary_image : activeImage
                      }
                      alt={product.name}
                      fill
                      priority
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 55vw"
                      className="object-cover object-center pointer-events-none select-none"
                      onError={() =>
                        setImageErrors((prev) => ({ ...prev, [activeImage]: true }))
                      }
                    />
                  </div>

                  {/* Badges Top Left */}
                  <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-10 pointer-events-none">
                    {product.is_new && (
                      <span className="px-2.5 py-0.5 bg-[#0F172A] text-[#F8FAFC] text-[9.5px] uppercase tracking-[0.22em] font-medium shadow-xs">
                        New Arrival
                      </span>
                    )}
                    {product.is_bestseller && (
                      <span className="px-2.5 py-0.5 bg-[#C5A880] text-[#0F172A] text-[9.5px] uppercase tracking-[0.22em] font-semibold shadow-xs">
                        Bestseller
                      </span>
                    )}
                    {hasDiscount && (
                      <span className="px-2.5 py-0.5 bg-[#991B1B] text-white text-[9.5px] uppercase tracking-wider font-semibold shadow-xs">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  {/* Amazon-Style Magnifier Zoom Indicator */}
                  <div className="absolute bottom-3 left-3 z-10 pointer-events-none transition-all duration-200">
                    {isZooming ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0F172A]/85 backdrop-blur-md text-[#F8FAFC] text-[10px] uppercase tracking-[0.16em] font-medium rounded-full shadow-md">
                        <Sparkles className="w-3 h-3 text-[#C5A880]" />
                        2.4x Ultra-HD Zoom
                      </span>
                    ) : (
                      <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-md text-[#0F172A] text-[10px] uppercase tracking-[0.16em] font-medium rounded-full border border-[#E2E8F0] shadow-sm">
                        <ZoomIn className="w-3 h-3 text-[#C5A880]" />
                        Hover to Zoom
                      </span>
                    )}
                  </div>

                  {/* Fullscreen Expansion Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openFullscreen(rawImages.findIndex((i) => i.url === activeImage));
                    }}
                    className="absolute bottom-3 right-3 z-10 p-2.5 bg-white/90 hover:bg-white text-[#0F172A] rounded-full shadow-md border border-[#E2E8F0] transition-all duration-200 hover:scale-105 cursor-pointer"
                    aria-label="View Fullscreen High-Resolution Image"
                    title="Click to expand"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="hidden sm:block text-[11px] text-[#64748B] mt-2 text-center tracking-wide">
                  Click on the image to open full-screen high-resolution showroom view.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Sticky Purchase & Atelier Specifications (5 Columns) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6 self-start bg-white p-6 sm:p-8 border border-[#E2E8F0] rounded-xs shadow-xs">
            {/* Brand, Category & Rating Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-semibold">
                  D&apos;NORA ATELIER • {product.category_slug.replace(/-/g, " ")}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-[#0F172A]">
                  <div className="flex text-[#C5A880]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="font-semibold">{product.rating}</span>
                  <span className="text-[#64748B]">({reviews.length + product.review_count})</span>
                </div>
              </div>

              {/* Product Title */}
              <h1 className="font-sans text-2xl sm:text-3xl font-medium text-[#0F172A] uppercase tracking-[0.06em] leading-tight">
                {product.name}
              </h1>

              {/* SKU & Stock Tagline */}
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-[#64748B] pt-0.5">
                <span>
                  Style Code: <strong className="font-mono text-[#0F172A]">{product.sku}</strong>
                </span>
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  In Stock
                </span>
              </div>
            </div>

            {/* Pricing Details */}
            <div className="pt-4 border-t border-[#E2E8F0]">
              <div className="flex items-baseline gap-3">
                <span className="font-sans text-3xl font-semibold text-[#0F172A] tracking-tight">
                  {formatINR(currentPrice)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base text-[#94A3B8] line-through font-light">
                      {formatINR(product.base_price)}
                    </span>
                    <span className="text-xs font-semibold text-[#991B1B] uppercase tracking-wider">
                      ({discountPercent}% OFF)
                    </span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-[#059669] mt-1 font-medium tracking-wide">
                MRP inclusive of all taxes • Complimentary White-Glove Pan-India Transit
              </p>
            </div>

            {/* Color Swatch Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2.5 pt-4 border-t border-[#E2E8F0]">
                <div className="flex justify-between text-xs uppercase tracking-[0.14em] text-[#64748B]">
                  <span>Atelier Colour:</span>
                  <span className="font-semibold text-[#0F172A]">
                    {selectedVariant?.color_name || "Signature Edition"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`group relative p-0.5 rounded-full transition-all cursor-pointer ${
                          isSelected
                            ? "ring-2 ring-[#0F172A] ring-offset-2"
                            : "hover:ring-1 hover:ring-[#94A3B8]"
                        }`}
                        title={v.color_name}
                      >
                        <span
                          className="block w-6 h-6 rounded-full border border-black/20 shadow-xs"
                          style={{ backgroundColor: v.color_hex || "#0F172A" }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dimensions / Size Badge */}
            <div className="space-y-2 pt-4 border-t border-[#E2E8F0]">
              <div className="flex justify-between text-xs uppercase tracking-[0.14em] text-[#64748B]">
                <span>Size:</span>
                <span className="font-semibold text-[#0F172A]">
                  {selectedVariant?.size || "One Size (Medium)"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="px-4 py-2 bg-[#0F172A] text-white text-xs uppercase tracking-widest font-medium border border-[#0F172A]">
                  {selectedVariant?.size || "Medium"}
                </span>
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.14em] text-[#64748B]">Quantity:</span>
              <div className="flex items-center border border-[#CBD5E1] bg-[#F8FAFC]">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-[#0F172A] hover:bg-[#E2E8F0] transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-mono font-semibold text-[#0F172A]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-[#0F172A] hover:bg-[#E2E8F0] transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-[#E2E8F0]">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 bg-[#0F172A] hover:bg-[#C5A880] hover:text-[#0F172A] text-white text-xs uppercase tracking-[0.22em] font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Added To Shopping Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add To Shopping Bag</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`p-3.5 border transition-colors cursor-pointer ${
                    isLiked
                      ? "bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]"
                      : "border-[#CBD5E1] text-[#475569] hover:text-[#0F172A] hover:border-[#0F172A]"
                  }`}
                  aria-label="Save to Wishlist"
                  title="Save to Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? "fill-current text-[#DC2626]" : ""}`} />
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="p-3.5 border border-[#CBD5E1] text-[#475569] hover:text-[#0F172A] hover:border-[#0F172A] transition-colors cursor-pointer"
                  aria-label="Share product"
                  title={copiedLink ? "Link Copied!" : "Share Product"}
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-3.5 bg-transparent border border-[#0F172A] hover:bg-[#0F172A] hover:text-white text-[#0F172A] text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-200 cursor-pointer"
              >
                Buy Now (1-Click Express Checkout)
              </button>
            </div>

            {/* Pincode Estimator */}
            <div className="pt-4 border-t border-[#E2E8F0] space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-[#0F172A] font-semibold">
                <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Pan-India Delivery Estimator</span>
              </div>

              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value);
                    setPincodeStatus("idle");
                  }}
                  placeholder="Enter 6-digit Delivery Pincode"
                  className="flex-1 px-3 py-2 text-xs border border-[#CBD5E1] focus:outline-none focus:border-[#0F172A] font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F172A] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#C5A880] hover:text-[#0F172A] transition-colors cursor-pointer"
                >
                  Check
                </button>
              </form>

              {pincodeStatus === "valid" && (
                <div className="text-xs text-[#065F46] bg-[#ECFDF5] p-2.5 border border-[#A7F3D0] flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0 text-[#059669]" />
                  <span>
                    Complimentary White-Glove Dispatch by <strong>{deliveryDate}</strong>
                  </span>
                </div>
              )}
              {pincodeStatus === "invalid" && (
                <div className="text-xs text-[#991B1B] bg-[#FEF2F2] p-2 border border-[#FECACA]">
                  Please enter a valid 6-digit Indian delivery pincode.
                </div>
              )}
            </div>

            {/* Brand Assurance Badges */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#E2E8F0] text-[10px] text-[#64748B] text-center">
              <div className="flex flex-col items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
                <span className="leading-tight">100% Certified Authentic</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#C5A880]" />
                <span className="leading-tight">Complimentary Pan-India Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-[#C5A880]" />
                <span className="leading-tight">7-Day Boutique Exchange</span>
              </div>
            </div>

            {/* Luxury Accordions */}
            <div className="pt-6 border-t border-[#E2E8F0] divide-y divide-[#E2E8F0]">
              {/* Description & Silhouette */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => setOpenSection(openSection === "details" ? "" : "details")}
                  className="w-full flex items-center justify-between text-left py-1 text-xs uppercase tracking-[0.14em] font-semibold text-[#0F172A] cursor-pointer"
                >
                  <span>Description & Silhouette</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      openSection === "details" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openSection === "details" && (
                  <div className="pt-3 pb-2 text-xs text-[#475569] leading-relaxed space-y-2">
                    <p>{product.full_description}</p>
                    {product.details && product.details.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 pt-2 text-[#0F172A]">
                        {product.details.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Dimensions & Specifications */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => setOpenSection(openSection === "specs" ? "" : "specs")}
                  className="w-full flex items-center justify-between text-left py-1 text-xs uppercase tracking-[0.14em] font-semibold text-[#0F172A] cursor-pointer"
                >
                  <span>Dimensions & Details</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      openSection === "specs" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openSection === "specs" && (
                  <div className="pt-3 pb-2 text-xs text-[#475569] space-y-1.5">
                    <div className="grid grid-cols-2 gap-2 bg-[#F8FAFC] p-3 border border-[#E2E8F0]">
                      <div>
                        <strong className="text-[#0F172A]">Depth:</strong> 14 cm
                      </div>
                      <div>
                        <strong className="text-[#0F172A]">Width:</strong> 24 cm
                      </div>
                      <div>
                        <strong className="text-[#0F172A]">Height:</strong> 22 cm
                      </div>
                      <div>
                        <strong className="text-[#0F172A]">Handle Drop:</strong> 12 cm
                      </div>
                      <div>
                        <strong className="text-[#0F172A]">Strap Length:</strong> 110 cm
                      </div>
                      <div>
                        <strong className="text-[#0F172A]">Closure:</strong> Magnetic Snap
                      </div>
                      <div className="col-span-2">
                        <strong className="text-[#0F172A]">Material:</strong> Premium Textured Faux Nappa Leather
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Complimentary Shipping & Returns */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => setOpenSection(openSection === "shipping" ? "" : "shipping")}
                  className="w-full flex items-center justify-between text-left py-1 text-xs uppercase tracking-[0.14em] font-semibold text-[#0F172A] cursor-pointer"
                >
                  <span>Complimentary Shipping & Returns</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      openSection === "shipping" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openSection === "shipping" && (
                  <div className="pt-3 pb-2 text-xs text-[#475569] leading-relaxed space-y-2">
                    <p>
                      <strong className="text-[#0F172A]">Pan-India Express:</strong> Complimentary tracked express delivery within 2–4 business days.
                    </p>
                    <p>
                      <strong className="text-[#0F172A]">7-Day Returns:</strong> Hassle-free exchanges and returns available within 7 days of receipt in original packaging with dust bag.
                    </p>
                  </div>
                )}
              </div>

              {/* Atelier Care Guide */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => setOpenSection(openSection === "care" ? "" : "care")}
                  className="w-full flex items-center justify-between text-left py-1 text-xs uppercase tracking-[0.14em] font-semibold text-[#0F172A] cursor-pointer"
                >
                  <span>Care & Maintenance</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      openSection === "care" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openSection === "care" && (
                  <div className="pt-3 pb-2 text-xs text-[#475569] leading-relaxed">
                    <p>
                      {product.care_instructions ||
                        "Wipe clean with a soft, damp cloth. Keep away from direct heat and direct sunlight. Store in the complimentary D'NORA dust bag when not in use."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-[#E8E2D9]">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-semibold">
              Client Acclaim
            </span>
            <h3 className="font-sans font-medium text-2xl sm:text-3xl text-[#0F172A] uppercase tracking-[0.08em]">
              Verified Client Impressions ({reviews.length})
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setIsReviewModalOpen(true)}
            className="px-5 py-2.5 bg-white border border-[#0F172A] text-xs uppercase tracking-widest font-semibold hover:bg-[#0F172A] hover:text-white transition-colors cursor-pointer"
          >
            Leave Your Impression
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white border border-[#E2E8F0] p-6 space-y-2">
            <p className="font-medium text-base text-[#0F172A] uppercase tracking-wider">
              Be the debut patron to share an impression of this silhouette.
            </p>
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="text-xs uppercase tracking-widest text-[#C5A880] underline font-medium cursor-pointer"
            >
              Write First Review &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white border border-[#E2E8F0] p-6 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex text-[#C5A880]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-current" : "text-[#CBD5E1]"}`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#64748B]">{formatDate(rev.created_at)}</span>
                </div>

                <h4 className="font-sans text-sm sm:text-base text-[#0F172A] font-semibold">{rev.title}</h4>

                <p className="text-xs text-[#475569] leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>

                <div className="flex items-center gap-2 pt-2 border-t border-[#E2E8F0] text-[11px] text-[#64748B]">
                  <span className="font-medium text-[#0F172A]">{rev.user_name}</span>
                  {rev.verified_purchase && (
                    <span className="text-[#059669] flex items-center gap-1 font-medium">
                      <Check className="w-3 h-3" /> Verified Atelier Patron
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Complete Your Look (Related Products) */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-[#E8E2D9]">
          <div className="mb-8 space-y-1">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-semibold">
              Curated Recommendations
            </span>
            <h3 className="font-sans font-medium text-2xl sm:text-3xl text-[#0F172A] uppercase tracking-[0.08em]">
              You May Also Love
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen High-Resolution Lightbox Modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 bg-[#0F172A]/95 backdrop-blur-md flex items-center justify-center p-4 select-none"
          onClick={() => setFullscreenImage(null)}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setFullscreenImage(null)}
            className="absolute top-6 right-6 p-2.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-20 cursor-pointer"
            aria-label="Close fullscreen view"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous Arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const prev = (fullscreenIndex - 1 + rawImages.length) % rawImages.length;
              setFullscreenIndex(prev);
              setFullscreenImage(rawImages[prev].url);
            }}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all z-20 cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const next = (fullscreenIndex + 1) % rawImages.length;
              setFullscreenIndex(next);
              setFullscreenImage(rawImages[next].url);
            }}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all z-20 cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Main High-Res Image Display */}
          <div
            className="relative w-full max-w-4xl h-[80vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={fullscreenImage}
              alt="High resolution detailed view"
              fill
              unoptimized
              className="object-contain"
            />
          </div>

          {/* Lightbox Thumbnails Strip */}
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl z-20"
            onClick={(e) => e.stopPropagation()}
          >
            {rawImages.map((img, i) => (
              <button
                key={img.id || i}
                type="button"
                onClick={() => {
                  setFullscreenIndex(i);
                  setFullscreenImage(img.url);
                }}
                className={`relative w-12 h-14 rounded-sm overflow-hidden border transition-all cursor-pointer ${
                  fullscreenIndex === i ? "border-[#C5A880] ring-1 ring-[#C5A880]" : "border-white/30 opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={img.url} alt="thumbnail" fill unoptimized className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Review Submission Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/70 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#E2E8F0] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative rounded-xs">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-4 right-4 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-semibold">
                Client Impression
              </span>
              <h3 className="font-sans font-medium text-xl sm:text-2xl text-[#0F172A] uppercase tracking-[0.08em] mt-1">
                Share Your Experience
              </h3>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase tracking-wider text-[#64748B] mb-1">Your Rating</label>
                <div className="flex gap-2 text-lg text-[#C5A880]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${star <= reviewForm.rating ? "fill-current" : "text-[#CBD5E1]"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[#64748B] mb-1">Review Title</label>
                <input
                  type="text"
                  required
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  placeholder="e.g. Exceptional craftsmanship and silhouette"
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] focus:outline-none focus:border-[#0F172A]"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[#64748B] mb-1">Your Review</label>
                <textarea
                  rows={4}
                  required
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Describe the leather quality, fit, and everyday styling..."
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] focus:outline-none focus:border-[#0F172A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase tracking-wider text-[#64748B] mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] focus:outline-none focus:border-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-[#64748B] mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={reviewForm.email}
                    onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })}
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] focus:outline-none focus:border-[#0F172A]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#0F172A] text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#C5A880] hover:text-[#0F172A] transition-all cursor-pointer"
              >
                Submit Verified Impression
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
