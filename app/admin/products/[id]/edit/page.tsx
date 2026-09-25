"use client";

import React, { useState, useEffect, useRef, use } from "react";
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
  Save,
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

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminEditProductPage({ params }: EditPageProps) {
  const router = useRouter();
  const { id } = use(params);

  // Categories
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loadingProduct, setLoadingProduct] = useState(true);

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
  const [isNewArrival, setIsNewArrival] = useState(false);

  // Images: Slot 0 = Main, Slot 1 = Hover
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

  // Load product and categories on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingProduct(true);
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categories"),
          fetch(`/api/products/${id}`),
        ]);

        if (catRes.ok) {
          const catJson = await catRes.json();
          setCategories(catJson.data || []);
        }

        if (prodRes.ok) {
          const prodJson = await prodRes.json();
          const p = prodJson.product;
          if (p) {
            setName(p.name || "");
            setCategoryId(p.categories?.[0]?.id || "");
            setSku(p.sku || "");
            setPrice(p.price !== undefined ? String(p.price) : "");
            setCompareAtPrice(p.compare_at_price ? String(p.compare_at_price) : "");
            setStock(p.stock !== undefined ? String(p.stock) : "20");
            setShortDesc(p.short_description || "");
            setDesc(p.description || "");
            setStatus(p.status || "active");
            setIsBestSeller(Boolean(p.is_best_seller));
            setIsNewArrival(Boolean(p.is_new_arrival));
            setImages(p.images || []);
            setColorVariants(p.color_variants || []);
          }
        } else {
          setErrorMsg("Could not find product to edit.");
        }
      } catch (err) {
        console.error("Failed to load product data:", err);
        setErrorMsg("Network error loading product.");
      } finally {
        setLoadingProduct(false);
      }
    }

    loadData();
  }, [id]);

  // Upload an image file for product main/hover slots
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
        return next.slice(0, 2);
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

  const triggerUploadForSlot = (slotIndex: number) => {
    setTargetSlotToUpload(slotIndex);
    fileInputRef.current?.click();
  };

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

      const uploadedUrl = data.secure_url || data.url;
      const publicId = data.media?.public_id || `var_${Date.now()}`;

      setColorVariants((prev) => {
        const next = [...prev];
        const currentVariant = next[variantIndex];
        if (!currentVariant) return prev;

        const currentImages = [...(currentVariant.images || [])];
        const newImg: ProductImage = {
          secure_url: uploadedUrl,
          cloudinary_public_id: publicId,
          alt_text: `${name || "DNORA"} - ${currentVariant.name}`,
          sort_order: type === "main" ? 1 : type === "hover" ? 2 : currentImages.length + 1,
        };

        if (type === "main") {
          currentImages[0] = newImg;
        } else if (type === "hover") {
          if (currentImages.length === 0) {
            currentImages[0] = { ...newImg, sort_order: 1 };
          }
          currentImages[1] = newImg;
        } else if (type === "extra") {
          if (extraIndex !== undefined && extraIndex < currentImages.length) {
            currentImages[extraIndex] = newImg;
          } else {
            currentImages.push(newImg);
          }
        }

        next[variantIndex] = { ...currentVariant, images: currentImages };
        return next;
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error uploading variant image");
    } finally {
      setVariantUploadingIndex(null);
      setVariantUploadTarget(null);
      if (variantFileInputRef.current) variantFileInputRef.current.value = "";
    }
  };

  const handleRemoveVariantImage = (variantIndex: number, imageIndex: number) => {
    setColorVariants((prev) => {
      const next = [...prev];
      const targetVar = next[variantIndex];
      if (!targetVar) return prev;
      const filtered = targetVar.images.filter((_, idx) => idx !== imageIndex);
      next[variantIndex] = { ...targetVar, images: filtered };
      return next;
    });
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg("Product Name is required");
      return;
    }

    if (images.length === 0) {
      setErrorMsg("Please upload at least 1 Main Image for this silhouette.");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg("Please enter a valid selling price greater than 0");
      return;
    }

    const payload = {
      name: name.trim(),
      category_id: categoryId || undefined,
      sku: sku.trim() || undefined,
      price: priceNum,
      compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
      stock: parseInt(stock, 10) || 0,
      short_description: shortDesc.trim() || undefined,
      description: desc.trim() || undefined,
      status,
      is_best_seller: isBestSeller,
      is_new_arrival: isNewArrival,
      images,
      color_variants: colorVariants,
    };

    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update product");
      }

      setSuccessMsg("Product updated successfully! Redirecting to catalog...");
      setTimeout(() => {
        router.push("/admin/items");
      }, 1200);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-[#FAF9F6]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
          <p className="text-xs uppercase tracking-widest text-neutral-500 font-medium">
            Loading Product Details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-neutral-900 pb-24">
      {/* Top Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 sm:px-8 py-4">
        <div className="w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/items"
              className="p-2 text-neutral-500 hover:text-black rounded-lg hover:bg-neutral-100 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#B89025]">
                  Edit Product
                </span>
                <span className="text-[10px] font-mono text-neutral-400">ID: {id}</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-neutral-900 font-serif">
                {name || "Edit Silhouette"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/items"
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full pt-8 space-y-8">
        {/* Error / Success Alerts */}
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-3">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* SECTION 1: TOP 2 IMAGERY (MAIN & HOVER) */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#B89025]">Step 1</span>
              <h2 className="text-base font-bold text-neutral-950 font-serif">Primary Product Imagery</h2>
            </div>
            <p className="text-xs text-neutral-500 font-light mt-1">
              Slot 1 is the <strong>Main Image</strong> shown by default. Slot 2 is the <strong>Hover Image</strong> revealed when a shopper hovers their mouse.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Slot 0: Main Image */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-neutral-900" />
                  1. Main Product Image <span className="text-rose-500">*</span>
                </span>
                {images[0] && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(0)}
                    className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div
                onClick={() => triggerUploadForSlot(0)}
                className={`relative aspect-[3/4] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition text-center cursor-pointer overflow-hidden ${
                  images[0]
                    ? "border-neutral-300 bg-neutral-50"
                    : "border-neutral-300 hover:border-neutral-900 bg-neutral-50/50 hover:bg-neutral-100/50"
                }`}
              >
                {uploadingSlot === 0 ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-neutral-900" />
                    <span className="text-xs font-medium text-neutral-600">Uploading to Cloudinary...</span>
                  </div>
                ) : images[0] ? (
                  <>
                    <Image
                      src={images[0].secure_url}
                      alt="Main Product Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
                      Click to Replace
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-neutral-400">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-neutral-700">Click to Upload Main Photo</span>
                    <span className="text-[10px] text-neutral-400">PNG, JPG, WebP up to 10MB</span>
                  </div>
                )}
              </div>
            </div>

            {/* Slot 1: Hover Image */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#B89025]" />
                  2. Mouse Hover Image
                </span>
                {images[1] && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(1)}
                    className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div
                onClick={() => triggerUploadForSlot(1)}
                className={`relative aspect-[3/4] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition text-center cursor-pointer overflow-hidden ${
                  images[1]
                    ? "border-neutral-300 bg-neutral-50"
                    : "border-neutral-300 hover:border-neutral-900 bg-neutral-50/50 hover:bg-neutral-100/50"
                }`}
              >
                {uploadingSlot === 1 ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-neutral-900" />
                    <span className="text-xs font-medium text-neutral-600">Uploading to Cloudinary...</span>
                  </div>
                ) : images[1] ? (
                  <>
                    <Image
                      src={images[1].secure_url}
                      alt="Hover Product Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
                      Click to Replace
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-neutral-400">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                      <Sparkles className="w-5 h-5 text-[#B89025]" />
                    </div>
                    <span className="text-xs font-bold text-neutral-700">Click to Upload Hover Photo</span>
                    <span className="text-[10px] text-neutral-400">Alternate angle / lifestyle shot</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick URL Input */}
          <div className="pt-2 border-t border-neutral-100 flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              placeholder="Or paste an image URL directly..."
              value={manualUrlInput}
              onChange={(e) => setManualUrlInput(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:bg-white focus:outline-hidden focus:border-neutral-900"
            />
            <button
              type="button"
              onClick={handleAddManualUrl}
              className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer shrink-0"
            >
              Add URL
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {/* SECTION 2: PRODUCT METADATA */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-neutral-100 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B89025]">Step 2</span>
            <h2 className="text-base font-bold text-neutral-950 font-serif">Product Specifications</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Silhouette Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aurelia Florentine Calfskin Tote"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black/10 focus:border-neutral-900 transition-all font-medium"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Collection / Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black/10 focus:border-neutral-900 transition-all cursor-pointer"
              >
                <option value="">Select a Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* SKU */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Stock Keeping Unit (SKU)
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. DNR-AUR-842"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black/10 focus:border-neutral-900 transition-all font-mono"
              />
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Selling Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 18500"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black/10 focus:border-neutral-900 transition-all font-mono font-bold"
              />
            </div>

            {/* Compare Price */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Original / MRP Price (₹)
                </label>
                {calculatedDiscount !== null && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {calculatedDiscount}% OFF
                  </span>
                )}
              </div>
              <input
                type="number"
                min="0"
                step="1"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="e.g. 24000 (auto calculates discount %)"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black/10 focus:border-neutral-900 transition-all font-mono"
              />
            </div>

            {/* Stock */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Available Inventory Stock
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="e.g. 25"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black/10 focus:border-neutral-900 transition-all font-mono"
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Publishing Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "active" | "draft")}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black/10 focus:border-neutral-900 transition-all cursor-pointer font-medium"
              >
                <option value="active">Active (Visible in Catalog)</option>
                <option value="draft">Draft (Hidden)</option>
              </select>
            </div>
          </div>

          {/* Mark As Badges */}
          <div className="pt-2 border-t border-neutral-100">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 block mb-3">
              Mark As / Storefront Placement:
            </span>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition select-none">
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                  className="rounded text-neutral-900 focus:ring-black"
                />
                <Star className={`w-4 h-4 ${isBestSeller ? "text-[#D4AF37] fill-[#D4AF37]" : "text-neutral-400"}`} />
                <span className="text-xs font-bold text-neutral-800">Best Seller</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition select-none">
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  className="rounded text-neutral-900 focus:ring-black"
                />
                <Sparkles className={`w-4 h-4 ${isNewArrival ? "text-amber-500 fill-amber-500" : "text-neutral-400"}`} />
                <span className="text-xs font-bold text-neutral-800">New In / New Arrival</span>
              </label>
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-4 pt-2 border-t border-neutral-100">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Short Highlight
              </label>
              <input
                type="text"
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="e.g. Handcrafted Florentine Calfskin • Brushed Brass Finish"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black/10 focus:border-neutral-900 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Detailed Atelier Narrative & Features
              </label>
              <textarea
                rows={4}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Full craftsmanship details, leather grade, interior lining, dimensions, and care instructions..."
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black/10 focus:border-neutral-900 transition-all leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: COLOR-WISE VARIANTS */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#B89025]">Step 3</span>
              <h2 className="text-base font-bold text-neutral-950 font-serif">Color Variants & Imagery</h2>
              <p className="text-xs text-neutral-500 font-light mt-0.5">
                Add colors with dedicated Main, Hover, and Extra gallery photos. Customers can switch swatches on the product card!
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddColorVariant}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition cursor-pointer self-start"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Color Variant</span>
            </button>
          </div>

          <input
            type="file"
            ref={variantFileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleVariantFileSelect}
          />

          {colorVariants.length === 0 ? (
            <div className="py-8 text-center text-neutral-400 border border-dashed border-neutral-200 rounded-xl space-y-2">
              <Palette className="w-8 h-8 mx-auto text-neutral-300" />
              <p className="text-xs font-medium">No color variants added yet.</p>
              <p className="text-[11px] text-neutral-400">Click &ldquo;Add Color Variant&rdquo; above to create color swatches.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {colorVariants.map((variant, vIdx) => {
                const varImages = variant.images || [];
                const mainImg = varImages[0];
                const hoverImg = varImages[1];
                const extraImages = varImages.slice(2);

                return (
                  <div
                    key={variant.id || vIdx}
                    className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50/50 space-y-4"
                  >
                    <div className="flex items-center justify-between gap-4 border-b border-neutral-200/80 pb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-5 h-5 rounded-full border border-black/10 shadow-xs shrink-0"
                          style={{ backgroundColor: variant.color_hex }}
                        />
                        <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                          Variant #{vIdx + 1}: {variant.name}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(vIdx)}
                        className="text-neutral-400 hover:text-rose-600 transition p-1 cursor-pointer"
                        title="Remove Variant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Color Name & Hex */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                          Color Name
                        </label>
                        <input
                          type="text"
                          value={variant.name}
                          onChange={(e) => handleUpdateVariant(vIdx, { name: e.target.value })}
                          placeholder="e.g. Cognac Amber"
                          className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg text-neutral-900 focus:outline-hidden focus:border-neutral-900 font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                          Color Hex Code
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={variant.color_hex}
                            onChange={(e) => handleUpdateVariant(vIdx, { color_hex: e.target.value })}
                            className="w-9 h-9 rounded-lg border border-neutral-200 cursor-pointer p-0.5 bg-white shrink-0"
                          />
                          <input
                            type="text"
                            value={variant.color_hex}
                            onChange={(e) => handleUpdateVariant(vIdx, { color_hex: e.target.value })}
                            placeholder="#111111"
                            className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg text-neutral-900 focus:outline-hidden focus:border-neutral-900 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Variant Images: Main, Hover, Extra */}
                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 block">
                        Variant Photos (Main, Hover & Extra):
                      </span>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {/* Variant Main Photo */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-neutral-500">
                            <span>Main</span>
                            {mainImg && (
                              <button
                                type="button"
                                onClick={() => handleRemoveVariantImage(vIdx, 0)}
                                className="text-rose-600 cursor-pointer"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                          <div
                            onClick={() => triggerVariantImageUpload(vIdx, "main")}
                            className="relative aspect-[3/4] rounded-lg border border-dashed border-neutral-300 hover:border-black bg-white flex flex-col items-center justify-center p-2 text-center cursor-pointer overflow-hidden transition"
                          >
                            {variantUploadingIndex === vIdx && variantUploadTarget?.type === "main" ? (
                              <Loader2 className="w-4 h-4 animate-spin text-neutral-800" />
                            ) : mainImg ? (
                              <Image src={mainImg.secure_url} alt="Main" fill className="object-cover" unoptimized />
                            ) : (
                              <div className="text-neutral-400 flex flex-col items-center gap-1">
                                <Upload className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-semibold">Upload Main</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Variant Hover Photo */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-neutral-500">
                            <span>Hover</span>
                            {hoverImg && (
                              <button
                                type="button"
                                onClick={() => handleRemoveVariantImage(vIdx, 1)}
                                className="text-rose-600 cursor-pointer"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                          <div
                            onClick={() => triggerVariantImageUpload(vIdx, "hover")}
                            className="relative aspect-[3/4] rounded-lg border border-dashed border-neutral-300 hover:border-black bg-white flex flex-col items-center justify-center p-2 text-center cursor-pointer overflow-hidden transition"
                          >
                            {variantUploadingIndex === vIdx && variantUploadTarget?.type === "hover" ? (
                              <Loader2 className="w-4 h-4 animate-spin text-neutral-800" />
                            ) : hoverImg ? (
                              <Image src={hoverImg.secure_url} alt="Hover" fill className="object-cover" unoptimized />
                            ) : (
                              <div className="text-neutral-400 flex flex-col items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-[#B89025]" />
                                <span className="text-[10px] font-semibold">Upload Hover</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Extra Photos */}
                        {extraImages.map((extraImg, eIdx) => (
                          <div key={extraImg.id || eIdx} className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold text-neutral-500">
                              <span>Extra #{eIdx + 1}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveVariantImage(vIdx, eIdx + 2)}
                                className="text-rose-600 cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="relative aspect-[3/4] rounded-lg border border-neutral-200 bg-white overflow-hidden">
                              <Image src={extraImg.secure_url} alt="Extra" fill className="object-cover" unoptimized />
                            </div>
                          </div>
                        ))}

                        {/* Add More Extra Photos */}
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-neutral-400">Add Extra</div>
                          <div
                            onClick={() => triggerVariantImageUpload(vIdx, "extra")}
                            className="relative aspect-[3/4] rounded-lg border border-dashed border-neutral-300 hover:border-black bg-white flex flex-col items-center justify-center p-2 text-center cursor-pointer overflow-hidden transition text-neutral-400 hover:text-black"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-[10px] font-semibold mt-1">+ Photo</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/admin/items"
            className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-xl transition cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-8 py-3 bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition cursor-pointer disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save & Publish Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
