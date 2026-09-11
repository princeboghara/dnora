"use client";

import React, { useState } from "react";
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

  // Gallery state
  const images =
    product.images?.length > 0
      ? product.images
      : [
          {
            id: "1",
            product_id: product.id,
            url: product.primary_image,
            alt_text: product.name,
            display_order: 1,
            is_primary: true,
          },
        ];

  const [activeImage, setActiveImage] = useState(images[0].url);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  // Variant & Quantity
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants?.[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // Pincode Estimator State
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [deliveryDate, setDeliveryDate] = useState("");

  // Accordion open tabs
  const [openSection, setOpenSection] = useState<string>("details");

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>(
    INITIAL_REVIEWS.filter((r: Review) => r.product_id === product.id)
  );
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
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

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      openCart();
    }, 800);
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

  return (
    <div className="bg-[#FAF9F6] pb-24 text-[#111111]">
      {/* Breadcrumbs Navigation */}
      <div className="bg-white border-b border-[#EAE5DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#8C7A6B]">
            <Link href="/" className="hover:text-[#111111] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-[#111111] transition-colors">
              Bags
            </Link>
            <span>/</span>
            <Link
              href={`/shop?category=${product.category_slug}`}
              className="hover:text-[#111111] transition-colors"
            >
              {product.category_slug.replace("-", " ")}
            </Link>
            <span>/</span>
            <span className="text-[#111111] font-semibold truncate max-w-[220px]">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Luxury Split Section (60% Gallery / 40% Sticky Purchase Box) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* LEFT: Multi-Image Showcase (Michael Kors & Charles & Keith Vertical Stack / Mosaic) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Desktop: High-Res Vertical Stacked Gallery */}
            <div className="space-y-4 hidden md:block">
              {images.map((img, index) => (
                <div
                  key={img.id || index}
                  className="relative aspect-[3/4] w-full bg-[#F5F2EC] overflow-hidden border border-[#EAE5DC] group cursor-zoom-in"
                  onClick={() => setFullscreenImage(img.url)}
                >
                  <Image
                    src={img.url}
                    alt={img.alt_text || product.name}
                    fill
                    priority={index === 0}
                    unoptimized
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Badges on First Image */}
                  {index === 0 && (
                    <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10 pointer-events-none">
                      {product.is_new && (
                        <span className="px-3 py-1 bg-[#111111] text-[#F5F2EB] text-[10px] uppercase tracking-[0.25em] font-medium shadow-xs">
                          New Arrival
                        </span>
                      )}
                      {product.is_bestseller && (
                        <span className="px-3 py-1 bg-[#C5A880] text-[#111111] text-[10px] uppercase tracking-[0.25em] font-semibold shadow-xs">
                          Bestseller
                        </span>
                      )}
                      {hasDiscount && (
                        <span className="px-3 py-1 bg-[#8B0000] text-white text-[10px] uppercase tracking-wider font-semibold shadow-xs">
                          {discountPercent}% OFF
                        </span>
                      )}
                    </div>
                  )}

                  {/* Expand Zoom Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFullscreenImage(img.url);
                    }}
                    className="absolute bottom-4 right-4 p-2.5 bg-white/85 hover:bg-white text-[#111111] transition-all rounded-full shadow-md opacity-0 group-hover:opacity-100"
                    aria-label="Expand image"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Mobile: Interactive Carousel with Thumbnail Bar */}
            <div className="md:hidden space-y-3">
              <div className="relative aspect-[3/4] w-full bg-[#F5F2EC] overflow-hidden border border-[#EAE5DC]">
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  priority
                  unoptimized
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFullscreenImage(activeImage)}
                  className="absolute bottom-3 right-3 p-2 bg-white/90 rounded-full shadow-md"
                >
                  <Maximize2 className="w-4 h-4 text-[#111111]" />
                </button>
              </div>

              {/* Mobile Thumbnails */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img.url)}
                    className={`relative w-16 h-20 shrink-0 border transition-all ${
                      activeImage === img.url
                        ? "border-[#111111] ring-1 ring-[#111111]"
                        : "border-[#EAE5DC] opacity-70"
                    }`}
                  >
                    <Image src={img.url} alt={img.alt_text} fill unoptimized className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Sticky Purchase & Specifications Column */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6 self-start bg-white p-6 sm:p-8 border border-[#EAE5DC] shadow-xs">
            {/* Header / Brand & Rating */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C7A6B] font-semibold">
                  D&apos;NORA ATELIER • {product.category_slug.replace("-", " ")}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-[#111111]">
                  <div className="flex text-[#C5A880]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="font-semibold">{product.rating}</span>
                  <span className="text-[#8C7A6B]">({reviews.length + product.review_count})</span>
                </div>
              </div>

              {/* Product Title */}
              <h1 className="font-sans text-2xl sm:text-3xl lg:text-3xl font-medium text-[#111111] uppercase tracking-[0.08em] leading-tight">
                {product.name}
              </h1>

              {/* SKU / Style Code */}
              <div className="text-[11px] uppercase tracking-[0.15em] text-[#8C7A6B]">
                Style Code: <span className="font-mono text-[#111111]">{product.sku}</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="pt-4 border-t border-[#EAE5DC]">
              <div className="flex items-baseline gap-3">
                <span className="font-sans text-3xl font-semibold text-[#111111] tracking-tight">
                  {formatINR(currentPrice)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base text-[#9C9488] line-through font-light">
                      {formatINR(product.base_price)}
                    </span>
                    <span className="text-xs font-semibold text-[#8B0000] uppercase tracking-wider">
                      ({discountPercent}% OFF)
                    </span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-[#245744] mt-1 font-medium tracking-wide">
                MRP inclusive of all taxes • Complimentary pan-India shipping
              </p>
            </div>

            {/* Color Swatches */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-[#EAE5DC]">
                <div className="flex justify-between text-xs uppercase tracking-[0.15em] text-[#8C7A6B]">
                  <span>Colour:</span>
                  <span className="font-semibold text-[#111111]">
                    {selectedVariant?.color_name || "Classic Edition"}
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
                        className={`group relative p-0.5 rounded-full transition-all ${
                          isSelected ? "ring-2 ring-[#111111] ring-offset-2" : "hover:ring-1 hover:ring-[#8C7A6B]"
                        }`}
                        title={v.color_name}
                      >
                        <span
                          className="block w-6 h-6 rounded-full border border-black/20"
                          style={{ backgroundColor: v.color_hex || "#111111" }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div className="space-y-2 pt-4 border-t border-[#EAE5DC]">
              <div className="flex justify-between text-xs uppercase tracking-[0.15em] text-[#8C7A6B]">
                <span>Size:</span>
                <span className="font-semibold text-[#111111]">
                  {selectedVariant?.size || "One Size (Medium)"}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-5 py-2.5 bg-[#111111] text-white text-xs uppercase tracking-widest font-medium border border-[#111111]"
                >
                  {selectedVariant?.size || "Medium"}
                </button>
              </div>
            </div>

            {/* Quantity Controls */}
            <div className="pt-4 border-t border-[#EAE5DC] flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.15em] text-[#8C7A6B]">Quantity:</span>
              <div className="flex items-center border border-[#D5CDC0] bg-[#FAF9F6]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-[#111111] hover:bg-[#EAE5DC] transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-4 text-xs font-mono font-semibold text-[#111111]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-[#111111] hover:bg-[#EAE5DC] transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-[#EAE5DC]">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-4 bg-[#111111] hover:bg-[#C5A880] hover:text-[#111111] text-white text-xs uppercase tracking-[0.25em] font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
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
                  onClick={() => toggleWishlist(product)}
                  className={`p-4 border transition-colors ${
                    isLiked
                      ? "bg-[#FAF7F2] text-[#DC2626] border-[#DC2626]"
                      : "border-[#D5CDC0] text-[#736357] hover:text-[#111111] hover:border-[#111111]"
                  }`}
                  aria-label="Save to Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? "fill-current text-[#DC2626]" : ""}`} />
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 bg-transparent border border-[#111111] hover:bg-[#111111] hover:text-white text-[#111111] text-xs uppercase tracking-[0.2em] font-semibold transition-all"
              >
                Buy Now (1-Click Express Checkout)
              </button>
            </div>

            {/* Pincode Delivery Estimator */}
            <div className="pt-4 border-t border-[#EAE5DC] space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-[#111111] font-semibold">
                <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Delivery & Services</span>
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
                  placeholder="Enter 6-digit Pincode"
                  className="flex-1 px-3 py-2 text-xs border border-[#D5CDC0] focus:outline-none focus:border-[#111111] font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#111111] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#C5A880] hover:text-[#111111] transition-colors"
                >
                  Check
                </button>
              </form>

              {pincodeStatus === "valid" && (
                <div className="text-xs text-[#245744] bg-[#F0FDF4] p-2.5 border border-[#BBF7D0] flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>
                    Complimentary White-Glove Delivery by <strong>{deliveryDate}</strong>
                  </span>
                </div>
              )}
              {pincodeStatus === "invalid" && (
                <div className="text-xs text-[#DC2626] bg-[#FEF2F2] p-2 border border-[#FECACA]">
                  Please enter a valid 6-digit Indian delivery pincode.
                </div>
              )}
            </div>

            {/* Assurance Icons (Authenticity, Shipping, Returns) */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#EAE5DC] text-[10px] text-[#736357] text-center">
              <div className="flex flex-col items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
                <span className="leading-tight">100% Certified Authentic</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#C5A880]" />
                <span className="leading-tight">Complimentary Pan-India Transit</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-[#C5A880]" />
                <span className="leading-tight">7-Day Boutique Exchange</span>
              </div>
            </div>

            {/* Luxury Accordion Drawers (Charles & Keith Style) */}
            <div className="pt-6 border-t border-[#EAE5DC] divide-y divide-[#EAE5DC]">
              {/* 1. Description & Silhouette */}
              <div className="py-3">
                <button
                  onClick={() => setOpenSection(openSection === "details" ? "" : "details")}
                  className="w-full flex items-center justify-between text-left py-1 text-xs uppercase tracking-[0.15em] font-semibold text-[#111111]"
                >
                  <span>Description & Silhouette</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-300 ${
                      openSection === "details" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openSection === "details" && (
                  <div className="pt-3 pb-2 text-xs text-[#736357] leading-relaxed space-y-2">
                    <p>{product.full_description}</p>
                    {product.details && product.details.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 pt-2 text-[#111111]">
                        {product.details.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Dimensions & Specifications */}
              <div className="py-3">
                <button
                  onClick={() => setOpenSection(openSection === "specs" ? "" : "specs")}
                  className="w-full flex items-center justify-between text-left py-1 text-xs uppercase tracking-[0.15em] font-semibold text-[#111111]"
                >
                  <span>Dimensions & Details</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-300 ${
                      openSection === "specs" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openSection === "specs" && (
                  <div className="pt-3 pb-2 text-xs text-[#736357] space-y-1.5">
                    <div className="grid grid-cols-2 gap-2 bg-[#FAF9F6] p-3 border border-[#EAE5DC]">
                      <div>
                        <strong>Depth:</strong> 14 cm
                      </div>
                      <div>
                        <strong>Width:</strong> 24 cm
                      </div>
                      <div>
                        <strong>Height:</strong> 22 cm
                      </div>
                      <div>
                        <strong>Handle Drop:</strong> 12 cm
                      </div>
                      <div>
                        <strong>Strap Length:</strong> 110 cm
                      </div>
                      <div>
                        <strong>Closure:</strong> Magnetic Snap
                      </div>
                      <div className="col-span-2">
                        <strong>Material:</strong> Premium Textured Faux Nappa Leather
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Complimentary Shipping & Returns */}
              <div className="py-3">
                <button
                  onClick={() => setOpenSection(openSection === "shipping" ? "" : "shipping")}
                  className="w-full flex items-center justify-between text-left py-1 text-xs uppercase tracking-[0.15em] font-semibold text-[#111111]"
                >
                  <span>Complimentary Shipping & Returns</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-300 ${
                      openSection === "shipping" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openSection === "shipping" && (
                  <div className="pt-3 pb-2 text-xs text-[#736357] leading-relaxed space-y-2">
                    <p>
                      <strong>Pan-India Express:</strong> Complimentary tracked express delivery within 2–4
                      business days.
                    </p>
                    <p>
                      <strong>7-Day Returns:</strong> Hassle-free exchanges and returns available within 7
                      days of receipt in original packaging with dust bag.
                    </p>
                  </div>
                )}
              </div>

              {/* 4. Atelier Care Guide */}
              <div className="py-3">
                <button
                  onClick={() => setOpenSection(openSection === "care" ? "" : "care")}
                  className="w-full flex items-center justify-between text-left py-1 text-xs uppercase tracking-[0.15em] font-semibold text-[#111111]"
                >
                  <span>Care & Maintenance</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-300 ${
                      openSection === "care" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openSection === "care" && (
                  <div className="pt-3 pb-2 text-xs text-[#736357] leading-relaxed">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-[#EAE5DC]">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C7A6B] font-semibold">
              Client Acclaim
            </span>
            <h3 className="font-sans font-medium text-2xl sm:text-3xl text-[#111111] uppercase tracking-[0.1em]">
              Verified Client Impressions ({reviews.length})
            </h3>
          </div>

          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="px-5 py-2.5 bg-white border border-[#111111] text-xs uppercase tracking-widest font-semibold hover:bg-[#111111] hover:text-white transition-colors"
          >
            Leave Your Impression
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white border border-[#EAE5DC] p-6 space-y-2">
            <p className="font-sans font-medium text-base text-[#111111] uppercase tracking-wider">
              Be the debut patron to share an impression of this silhouette.
            </p>
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="text-xs uppercase tracking-widest text-[#C5A880] underline font-medium"
            >
              Write First Review &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white border border-[#EAE5DC] p-6 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex text-[#C5A880]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-current" : "text-[#D5CDC0]"}`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#8C7A6B]">{formatDate(rev.created_at)}</span>
                </div>

                <h4 className="font-sans text-sm sm:text-base text-[#111111] font-semibold">{rev.title}</h4>

                <p className="text-xs text-[#736357] leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>

                <div className="flex items-center gap-2 pt-2 border-t border-[#EAE5DC] text-[11px] text-[#8C7A6B]">
                  <span className="font-medium text-[#111111]">{rev.user_name}</span>
                  {rev.verified_purchase && (
                    <span className="text-[#245744] flex items-center gap-1 font-medium">
                      <Check className="w-3 h-3" /> Verified Atelier Patron
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* You May Also Love (Related Products) */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-[#EAE5DC]">
          <div className="mb-8 space-y-1">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C7A6B] font-semibold">
              Complete Your Look
            </span>
            <h3 className="font-sans font-medium text-2xl sm:text-3xl text-[#111111] uppercase tracking-[0.1em]">
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

      {/* Fullscreen Image Lightbox Modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-6 right-6 p-2 text-white/80 hover:text-white bg-white/10 rounded-full"
            aria-label="Close fullscreen view"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative w-full max-w-4xl h-[85vh]">
            <Image
              src={fullscreenImage}
              alt="High resolution detailed view"
              fill
              unoptimized
              className="object-contain"
            />
          </div>
        </div>
      )}

      {/* Review Submission Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/70 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#EAE5DC] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-4 right-4 text-[#8C7A6B] hover:text-[#111111]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C7A6B] font-semibold">
                Client Impression
              </span>
              <h3 className="font-sans font-medium text-xl sm:text-2xl text-[#111111] uppercase tracking-[0.1em] mt-1">
                Share Your Experience
              </h3>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase tracking-wider text-[#8C7A6B] mb-1">Your Rating</label>
                <div className="flex gap-2 text-lg text-[#C5A880]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${star <= reviewForm.rating ? "fill-current" : "text-[#D5CDC0]"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[#8C7A6B] mb-1">Review Title</label>
                <input
                  type="text"
                  required
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  placeholder="e.g. Exceptional craftsmanship and silhouette"
                  className="w-full p-2.5 bg-[#FAF9F6] border border-[#D5CDC0] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[#8C7A6B] mb-1">Your Review</label>
                <textarea
                  rows={4}
                  required
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Describe the leather quality, fit, and everyday styling..."
                  className="w-full p-2.5 bg-[#FAF9F6] border border-[#D5CDC0] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase tracking-wider text-[#8C7A6B] mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF9F6] border border-[#D5CDC0] focus:outline-none focus:border-[#111111]"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-[#8C7A6B] mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={reviewForm.email}
                    onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF9F6] border border-[#D5CDC0] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#111111] text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#C5A880] hover:text-[#111111] transition-all"
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
