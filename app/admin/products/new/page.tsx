"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  Star,
  CheckCircle,
  AlertCircle,
  Loader2,
  ShoppingBag,
  RefreshCw,
  Palette,
  Eye,
  Tag,
} from "lucide-react";
import { ProductCategory, ProductColorVariant, ProductImage } from "@/types";

const LUXURY_COLOR_PRESETS = [
  { name: "Noir Black", hex: "#111111" },
  { name: "Caramel Tan", hex: "#9E6740" },
  { name: "Ivory Cream", hex: "#EAE6DF" },
  { name: "Cognac Amber", hex: "#8A4117" },
  { name: "Espresso", hex: "#2E1C14" },
  { name: "Forest Olive", hex: "#2B3A2C" },
  { name: "Burgundy Wine", hex: "#4A1521" },
  { name: "Classic Navy", hex: "#162032" },
];

export default function AdminNewProductPage() {
  const router = useRouter();

  // Categories
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [stock, setStock] = useState("20");
  const [shortDesc, setShortDesc] = useState("");
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState<"active" | "draft">("active");

  // Mark As Flags
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);

  // Images: Slot 0 = Main, Slot 1 = Hover, Slot 2+ = Gallery
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [manualUrlInput, setManualUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetSlotToUpload, setTargetSlotToUpload] = useState<number | null>(null);

  // Color-wise Variants
  const [colorVariants, setColorVariants] = useState<ProductColorVariant[]>([]);
  const [variantUploadingIndex, setVariantUploadingIndex] = useState<number | null>(null);
  const variantFileInputRef = useRef<HTMLInputElement>(null);
  const [variantUploadTarget, setVariantUploadTarget] = useState<{
    variantIndex: number;
    type: "main" | "hover" | "extra";
    extraIndex?: number;
  } | null>(null);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto-calculated discount percentage
  const numPrice = parseFloat(price);
  const numCompare = parseFloat(compareAtPrice);
  const calculatedDiscount =
    !isNaN(numPrice) && !isNaN(numCompare) && numCompare > numPrice && numPrice > 0
      ? Math.round(((numCompare - numPrice) / numCompare) * 100)
      : null;

  // Load categories
  useEffect(() => {
    async function fetchCats() {
      try {
        setLoadingCategories(true);
        const res = await fetch("/api/categories");
        if (res.ok) {
          const json = await res.json();
          const list = json.data || [];
          setCategories(list);
          if (list.length > 0) {
            setCategoryId(list[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCats();
  }, []);

  // Auto-generate SKU
  const handleGenerateSku = () => {
    const prefix = name.trim() ? name.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "DNR") : "DNR";
    const rand = Math.floor(100 + Math.random() * 900);
    setSku(`DNR-${prefix}-${rand}`);
  };

  // Upload an image file for product main/hover slots (Top imagery)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const slot = targetSlotToUpload !== null ? targetSlotToUpload : (images.length < 2 ? images.length : 0);
    setUploadingSlot(slot);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "dnora/products");

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload image");
      }

      const newImg: ProductImage = {
        secure_url: data.secure_url || data.url,
        cloudinary_public_id: data.media?.public_id || `img_${Date.now()}`,
        alt_text: name || "DNORA Luxury Product",
        sort_order: slot + 1,
      };

      setImages((prev) => {
        const next = [...prev];
        if (slot < next.length) {
          next[slot] = newImg;
        } else {
          next.push(newImg);
        }
        return next.slice(0, 2); // strictly max 2 images at top!
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error uploading file";
      setErrorMsg(msg);
    } finally {
      setUploadingSlot(null);
      setTargetSlotToUpload(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Trigger file picker for top slot (0 = Main, 1 = Hover)
  const triggerUploadForSlot = (slotIndex: number) => {
    setTargetSlotToUpload(slotIndex);
    fileInputRef.current?.click();
  };

  // Add image via URL
  const handleAddManualUrl = () => {
    if (!manualUrlInput.trim()) return;
    try {
      new URL(manualUrlInput.trim());
      const newImg: ProductImage = {
        secure_url: manualUrlInput.trim(),
        cloudinary_public_id: `manual_${Date.now()}`,
        alt_text: name || "DNORA Silhouette",
        sort_order: images.length + 1,
      };
      setImages((prev) => [...prev, newImg].slice(0, 2));
      setManualUrlInput("");
    } catch {
      setErrorMsg("Please enter a valid HTTP/HTTPS URL");
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Color Variants Management
  const handleAddColorVariant = () => {
    const newVariant: ProductColorVariant = {
      id: `var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: `Color ${colorVariants.length + 1}`,
      color_hex: LUXURY_COLOR_PRESETS[colorVariants.length % LUXURY_COLOR_PRESETS.length].hex,
      images: [],
    };
    setColorVariants((prev) => [...prev, newVariant]);
  };

  const handleUpdateVariant = (index: number, updates: Partial<ProductColorVariant>) => {
    setColorVariants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  const handleRemoveVariant = (indexToRemove: number) => {
    setColorVariants((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Trigger Variant Image Upload (main, hover, extra)
  const triggerVariantImageUpload = (
    variantIndex: number,
    type: "main" | "hover" | "extra",
    extraIndex?: number
  ) => {
    setVariantUploadTarget({ variantIndex, type, extraIndex });
    variantFileInputRef.current?.click();
  };

  const handleVariantFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !variantUploadTarget) return;

    const { variantIndex, type, extraIndex } = variantUploadTarget;
    setVariantUploadingIndex(variantIndex);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "dnora/products/variants");

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload variant image");
      }

      const newImg: ProductImage = {
        secure_url: data.secure_url || data.url,
        cloudinary_public_id: data.media?.public_id || `var_img_${Date.now()}`,
        alt_text: `${name} ${colorVariants[variantIndex]?.name || ""} ${type}`,
        sort_order: type === "main" ? 1 : type === "hover" ? 2 : 3,
      };

      setColorVariants((prev) => {
        const next = [...prev];
        const v = { ...next[variantIndex] };
        const currentImgs = [...(v.images || [])];

        if (type === "main") {
          currentImgs[0] = newImg;
        } else if (type === "hover") {
          if (!currentImgs[0]) currentImgs[0] = images[0] || newImg;
          currentImgs[1] = newImg;
        } else if (type === "extra") {
          if (extraIndex !== undefined && extraIndex + 2 < currentImgs.length) {
            currentImgs[extraIndex + 2] = newImg;
          } else {
            currentImgs.push(newImg);
          }
        }

        v.images = currentImgs;
        next[variantIndex] = v;
        return next;
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error uploading variant image";
      setErrorMsg(msg);
    } finally {
      setVariantUploadingIndex(null);
      setVariantUploadTarget(null);
      if (variantFileInputRef.current) variantFileInputRef.current.value = "";
    }
  };

  const handleRemoveVariantImage = (variantIndex: number, imageIndex: number) => {
    setColorVariants((prev) => {
      const next = [...prev];
      const v = { ...next[variantIndex] };
      v.images = (v.images || []).filter((_, idx) => idx !== imageIndex);
      next[variantIndex] = v;
      return next;
    });
  };

  // Submit Product Creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg("Please enter a product name.");
      window.scrollTo({ top: 300, behavior: "smooth" });
      return;
    }
    if (isNaN(numPrice) || numPrice <= 0) {
      setErrorMsg("Please enter a valid price greater than 0.");
      return;
    }
    if (images.length === 0) {
      setErrorMsg("Please upload at least one image (Main Image).");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        category_id: categoryId || (categories[0]?.id ?? ""),
        sku: sku.trim() || `DNR-${Date.now().toString(36).toUpperCase()}`,
        price: numPrice,
        compare_at_price: !isNaN(numCompare) && numCompare > numPrice ? numCompare : null,
        stock: parseInt(stock, 10) || 0,
        short_description: shortDesc.trim() || `${name} in Italian calfskin`,
        description: desc.trim() || `${name} handcrafted by master artisans in Florence, Italy.`,
        is_best_seller: isBestSeller,
        is_new_arrival: isNewArrival,
        status: status,
        images: images.slice(0, 2).map((img, idx) => ({
          ...img,
          sort_order: idx + 1,
        })),
        color_variants: colorVariants.map((v) => ({
          id: v.id,
          name: v.name.trim(),
          color_hex: v.color_hex,
          images: v.images && v.images.length > 0 ? v.images : [images[0]],
        })),
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create product");
      }

      setSuccessMsg("Product created successfully! Redirecting to All Items...");
      setTimeout(() => {
        router.push("/admin/items");
        router.refresh();
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating product";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-neutral-900 pb-20">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
      />
      <input
        type="file"
        ref={variantFileInputRef}
        onChange={handleVariantFileSelect}
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
      />

      {/* Top Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/items"
            className="p-2 rounded-lg text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors"
            title="Back to All Products"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-medium tracking-wider uppercase">
              <Link href="/admin/items" className="hover:text-black transition-colors">
                Products
              </Link>
              <span>/</span>
              <span className="text-neutral-700 font-semibold">New Silhouette</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900">
              Add New Product
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/items"
            className="px-3.5 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-widest rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Save Product</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        {/* Status Alerts */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div className="text-xs sm:text-sm font-medium">{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 shadow-xs">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
            <div className="text-xs sm:text-sm font-semibold">{successMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: PRODUCT IMAGERY (TOP OF PAGE) - ONLY TWO IMAGES: MAIN AND HOVER */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-4 mb-5">
              <div>
                <h2 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                  <Upload className="w-4 h-4 text-neutral-700" />
                  Product Imagery (Main & Hover)
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Slot 1 is your <strong className="text-neutral-800">Main Cover Image</strong>. Slot 2 is the <strong className="text-neutral-800">Hover Image</strong> shown when mouse hovers over the card on the storefront.
                </p>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 self-start sm:self-auto">
                {images.length}/2 Images Added
              </span>
            </div>

            {/* ONLY TWO IMAGES AT TOP: MAIN & HOVER */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mb-5">
              {/* SLOT 1: MAIN IMAGE */}
              <div className="flex flex-col">
                <div className="relative aspect-3/4 rounded-xl overflow-hidden bg-neutral-50 border-2 border-dashed border-neutral-300 hover:border-black transition-colors group flex items-center justify-center">
                  {images[0] ? (
                    <>
                      <Image
                        src={images[0].secure_url}
                        alt="Main Cover"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => triggerUploadForSlot(0)}
                          className="p-1.5 rounded-md bg-white text-black hover:bg-neutral-100 text-xs shadow-md"
                          title="Change Main Image"
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(0)}
                          className="p-1.5 rounded-md bg-rose-600 text-white hover:bg-rose-700 text-xs shadow-md"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => triggerUploadForSlot(0)}
                      disabled={uploadingSlot === 0}
                      className="w-full h-full flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:bg-neutral-100/70 transition-colors"
                    >
                      {uploadingSlot === 0 ? (
                        <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
                      ) : (
                        <>
                          <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center mb-2 shadow-xs">
                            <Upload className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-neutral-800">1. Upload Main Image</span>
                          <span className="text-[10px] text-neutral-400 mt-0.5">Primary storefront card view</span>
                        </>
                      )}
                    </button>
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[9px] font-bold uppercase tracking-wider">
                    1. Main Cover
                  </span>
                </div>
              </div>

              {/* SLOT 2: HOVER IMAGE */}
              <div className="flex flex-col">
                <div className="relative aspect-3/4 rounded-xl overflow-hidden bg-neutral-50 border-2 border-dashed border-neutral-300 hover:border-black transition-colors group flex items-center justify-center">
                  {images[1] ? (
                    <>
                      <Image
                        src={images[1].secure_url}
                        alt="Hover Alternate"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => triggerUploadForSlot(1)}
                          className="p-1.5 rounded-md bg-white text-black hover:bg-neutral-100 text-xs shadow-md"
                          title="Change Hover Image"
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(1)}
                          className="p-1.5 rounded-md bg-rose-600 text-white hover:bg-rose-700 text-xs shadow-md"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => triggerUploadForSlot(1)}
                      disabled={uploadingSlot === 1}
                      className="w-full h-full flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:bg-neutral-100/70 transition-colors"
                    >
                      {uploadingSlot === 1 ? (
                        <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
                      ) : (
                        <>
                          <div className="w-9 h-9 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center mb-2">
                            <Eye className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-neutral-800">2. Upload Hover Image</span>
                          <span className="text-[10px] text-neutral-400 mt-0.5">Revealed when mouse hovers</span>
                        </>
                      )}
                    </button>
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-indigo-600/90 text-white text-[9px] font-bold uppercase tracking-wider">
                    2. Mouse Hover
                  </span>
                </div>
              </div>
            </div>

            {/* Optional URL input fallback */}
            <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 max-w-xl">
              <input
                type="url"
                value={manualUrlInput}
                onChange={(e) => setManualUrlInput(e.target.value)}
                placeholder="Or paste an image URL directly (e.g. https://...)"
                className="flex-1 text-xs px-3.5 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-black"
              />
              <button
                type="button"
                onClick={handleAddManualUrl}
                className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Add URL
              </button>
            </div>
          </div>

          {/* SECTION 2: COLOR-WISE VARIANTS (MAIN, HOVER & EXTRA IMAGES PER COLOR) */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4 mb-5">
              <div>
                <h2 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                  <Palette className="w-4 h-4 text-neutral-700" />
                  Color-Wise Variants & Photos
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  For each color, add its <strong className="text-neutral-800">Main Image</strong>, <strong className="text-neutral-800">Hover Image</strong>, and <strong className="text-neutral-800">Extra Images</strong>. Customers can click the color swatches on the card to see the matching imagery!
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddColorVariant}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Color Variant</span>
              </button>
            </div>

            {colorVariants.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50">
                <Palette className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-neutral-600">No color variants added yet.</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Click &ldquo;Add Color Variant&rdquo; above to add options like Noir Black, Caramel Tan, etc., with their own Main, Hover, and Extra photos.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {colorVariants.map((variant, vIdx) => {
                  const mainImg = variant.images?.[0];
                  const hoverImg = variant.images?.[1];
                  const extraImgs = variant.images?.slice(2) || [];

                  return (
                    <div
                      key={variant.id || vIdx}
                      className="p-4 sm:p-5 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-4 transition-all"
                    >
                      {/* Top Bar: Color Name & Swatch Picker */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200/80 pb-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={variant.color_hex}
                              onChange={(e) => handleUpdateVariant(vIdx, { color_hex: e.target.value })}
                              className="w-8 h-8 rounded-lg border border-neutral-300 cursor-pointer p-0.5 bg-white"
                            />
                            <input
                              type="text"
                              value={variant.name}
                              onChange={(e) => handleUpdateVariant(vIdx, { name: e.target.value })}
                              placeholder="e.g. Noir Black"
                              className="text-xs font-bold px-3 py-1.5 rounded-lg border border-neutral-300 bg-white focus:outline-none focus:border-black min-w-[140px]"
                            />
                            <input
                              type="text"
                              value={variant.color_hex}
                              onChange={(e) => handleUpdateVariant(vIdx, { color_hex: e.target.value })}
                              className="w-20 text-[11px] px-2 py-1.5 rounded-lg border border-neutral-300 bg-white font-mono uppercase text-center"
                            />
                          </div>

                          {/* Quick Color Presets */}
                          <div className="flex items-center gap-1">
                            {LUXURY_COLOR_PRESETS.slice(0, 6).map((preset) => (
                              <button
                                key={preset.name}
                                type="button"
                                title={preset.name}
                                onClick={() =>
                                  handleUpdateVariant(vIdx, { name: preset.name, color_hex: preset.hex })
                                }
                                className="w-5 h-5 rounded-full border border-neutral-300 transition-transform hover:scale-125 cursor-pointer"
                                style={{ backgroundColor: preset.hex }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Remove Variant Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(vIdx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove Color</span>
                        </button>
                      </div>

                      {/* Photo Slots for this Color Variant: Main, Hover, and Extras */}
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-2">
                          Photos for {variant.name || `Color #${vIdx + 1}`}:
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                          {/* 1. Variant Main Image */}
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                              1. Main Image
                            </span>
                            <div className="relative aspect-3/4 rounded-lg overflow-hidden bg-neutral-200 border border-neutral-300 flex items-center justify-center group">
                              {mainImg ? (
                                <>
                                  <Image
                                    src={mainImg.secure_url}
                                    alt={`${variant.name} Main`}
                                    fill
                                    className="object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => triggerVariantImageUpload(vIdx, "main")}
                                      className="px-2 py-1 rounded bg-white text-black text-[10px] font-semibold"
                                    >
                                      Replace
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveVariantImage(vIdx, 0)}
                                      className="p-1 rounded bg-rose-600 text-white text-[10px]"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => triggerVariantImageUpload(vIdx, "main")}
                                  disabled={variantUploadingIndex === vIdx}
                                  className="w-full h-full flex flex-col items-center justify-center p-2 text-center hover:bg-neutral-300/60 transition-colors cursor-pointer"
                                >
                                  {variantUploadingIndex === vIdx ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
                                  ) : (
                                    <>
                                      <Upload className="w-4 h-4 text-neutral-700 mb-1" />
                                      <span className="text-[10px] font-bold text-neutral-800 leading-tight">
                                        Add Main
                                      </span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* 2. Variant Hover Image */}
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                              2. Hover Image
                            </span>
                            <div className="relative aspect-3/4 rounded-lg overflow-hidden bg-neutral-200 border border-neutral-300 flex items-center justify-center group">
                              {hoverImg ? (
                                <>
                                  <Image
                                    src={hoverImg.secure_url}
                                    alt={`${variant.name} Hover`}
                                    fill
                                    className="object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => triggerVariantImageUpload(vIdx, "hover")}
                                      className="px-2 py-1 rounded bg-white text-black text-[10px] font-semibold"
                                    >
                                      Replace
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveVariantImage(vIdx, 1)}
                                      className="p-1 rounded bg-rose-600 text-white text-[10px]"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => triggerVariantImageUpload(vIdx, "hover")}
                                  disabled={variantUploadingIndex === vIdx}
                                  className="w-full h-full flex flex-col items-center justify-center p-2 text-center hover:bg-neutral-300/60 transition-colors cursor-pointer"
                                >
                                  {variantUploadingIndex === vIdx ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
                                  ) : (
                                    <>
                                      <Eye className="w-4 h-4 text-neutral-700 mb-1" />
                                      <span className="text-[10px] font-bold text-neutral-800 leading-tight">
                                        Add Hover
                                      </span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* 3+. Variant Extra Images */}
                          {extraImgs.map((extraImg, eIdx) => (
                            <div key={extraImg.secure_url || eIdx} className="flex flex-col">
                              <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-1 truncate">
                                Extra #{eIdx + 1}
                              </span>
                              <div className="relative aspect-3/4 rounded-lg overflow-hidden bg-neutral-200 border border-neutral-300 flex items-center justify-center group">
                                <Image
                                  src={extraImg.secure_url}
                                  alt={`${variant.name} Extra ${eIdx + 1}`}
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveVariantImage(vIdx, eIdx + 2)}
                                    className="p-1.5 rounded bg-rose-600 text-white text-xs shadow"
                                    title="Delete extra image"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* "+ Add Extra Image" Button */}
                          <div className="flex flex-col">
                            <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-1">
                              + Extra Image
                            </span>
                            <button
                              type="button"
                              onClick={() => triggerVariantImageUpload(vIdx, "extra")}
                              disabled={variantUploadingIndex === vIdx}
                              className="relative aspect-3/4 rounded-lg border-2 border-dashed border-neutral-300 hover:border-black bg-white flex flex-col items-center justify-center p-2 text-center transition-colors cursor-pointer"
                            >
                              <Plus className="w-5 h-5 text-neutral-400 mb-1" />
                              <span className="text-[10px] font-semibold text-neutral-700 leading-tight">
                                Add Extra
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 3: PRODUCT INFORMATION */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-7 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-neutral-900 tracking-tight border-b border-neutral-100 pb-3">
              Product Details
            </h2>

            {/* Name & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Product Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. The Marais Structured Handbag"
                  required
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Category <span className="text-rose-600">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={loadingCategories}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-black transition-colors cursor-pointer"
                >
                  {loadingCategories ? (
                    <option>Loading categories...</option>
                  ) : (
                    categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* SKU & Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    SKU Code <span className="text-rose-600">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSku}
                    className="text-[11px] font-semibold text-neutral-500 hover:text-black flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Auto-Generate
                  </button>
                </div>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. DNR-MAR-101"
                  required
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-neutral-300 font-mono focus:outline-none focus:border-black uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Stock Units
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-black font-mono"
                />
              </div>
            </div>

            {/* SECTION 4: PRICING & AUTO-CALCULATING DISCOUNT */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                Pricing & Discount (% Calculates Automatically)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                {/* Regular / Compare Price */}
                <div>
                  <span className="block text-[11px] text-neutral-500 font-medium mb-1">
                    Regular / MRP Price (₹)
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    placeholder="e.g. 7500"
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-neutral-300 font-mono focus:outline-none focus:border-black"
                  />
                </div>

                {/* Selling / Discounted Price */}
                <div>
                  <span className="block text-[11px] text-neutral-500 font-medium mb-1">
                    Selling Price (₹) <span className="text-rose-600">*</span>
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 6000"
                    required
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-neutral-300 font-mono font-bold focus:outline-none focus:border-black"
                  />
                </div>

                {/* Auto Calculated % Badge */}
                <div>
                  <span className="block text-[11px] text-neutral-500 font-medium mb-1">
                    Live Discount Percentage
                  </span>
                  {calculatedDiscount && calculatedDiscount > 0 ? (
                    <div className="px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-700">
                        -{calculatedDiscount}% OFF
                      </span>
                      <span className="text-[11px] text-rose-600 font-medium">
                        Saves ₹{(numCompare - numPrice).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ) : (
                    <div className="px-3.5 py-2.5 rounded-xl bg-neutral-100 text-neutral-400 text-xs font-medium">
                      No discount active
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Descriptions */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Short Description (Catchy subtitle)
              </label>
              <input
                type="text"
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Architectural top-handle handbag in pebbled Noir calfskin."
                className="w-full text-sm px-3.5 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Editorial Description
              </label>
              <textarea
                rows={4}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Handcrafted in Florence, Italy, The Marais is DNORA's quintessential architectural silhouette. Cut from full-grain vegetable-tanned Italian calfskin with hand-painted beveled edges..."
                className="w-full text-sm p-3.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-black leading-relaxed"
              />
            </div>
          </div>

          {/* SECTION 5: "MARK AS" FLAGS & STATUS */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-7 shadow-xs">
            <h2 className="text-base font-bold text-neutral-900 tracking-tight border-b border-neutral-100 pb-3 mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4 text-neutral-700" />
              Mark As & Storefront Flags
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Mark as Best Seller */}
              <label
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isBestSeller
                    ? "bg-amber-50/70 border-amber-300 ring-1 ring-amber-300"
                    : "bg-neutral-50/60 border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    <Star className={`w-3.5 h-3.5 ${isBestSeller ? "text-amber-500 fill-amber-500" : "text-neutral-400"}`} />
                    Best Seller
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Feature on Home page under Best Sellers collection.
                  </p>
                </div>
              </label>

              {/* Mark as New Arrival */}
              <label
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isNewArrival
                    ? "bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-300"
                    : "bg-neutral-50/60 border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    <Sparkles className={`w-3.5 h-3.5 ${isNewArrival ? "text-indigo-600 fill-indigo-600" : "text-neutral-400"}`} />
                    New In (Arrival)
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Feature on Home page under New In collection.
                  </p>
                </div>
              </label>

              {/* Product Status */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 flex flex-col justify-between">
                <div>
                  <span className="block text-xs font-bold text-neutral-900 uppercase tracking-wider mb-1">
                    Publishing Status
                  </span>
                  <p className="text-[11px] text-neutral-500">
                    Active silhouettes appear immediately in the shop.
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={status === "active"}
                      onChange={() => setStatus("active")}
                      className="text-black"
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer text-neutral-600">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={status === "draft"}
                      onChange={() => setStatus("draft")}
                      className="text-black"
                    />
                    Draft
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Save Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
            <Link
              href="/admin/items"
              className="px-5 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-7 py-3 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Publishing Product...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Save & Publish Product</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
