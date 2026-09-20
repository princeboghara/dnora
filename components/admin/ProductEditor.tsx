"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  Check,
  Loader2,
  Sparkles,
  Flame,
  Palette,
  RefreshCw,
  X,
  Image as ImageIcon,
  Crop as CropIcon,
} from "lucide-react";
import { Product, ProductCategory, ProductImage, ProductColorVariant, ProductStatus } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { slugify } from "@/lib/utils";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { uploadFileWithProgress } from "@/lib/upload-utils";
import { ImageCropperModal, AspectRatioType } from "./ImageCropperModal";

const LUXURY_PRESET_COLORS = [
  { name: "Noir Black", hex: "#141414" },
  { name: "Saddle Tan", hex: "#8A5229" },
  { name: "Ivory Cream", hex: "#F3EFE6" },
  { name: "Burgundy Wine", hex: "#561D25" },
  { name: "Emerald Forest", hex: "#1A382B" },
  { name: "Cognac Brown", hex: "#5C3418" },
  { name: "Blush Rose", hex: "#D6A2A8" },
  { name: "Midnight Navy", hex: "#192434" },
];

interface ProductEditorProps {
  initialProduct?: Product | null;
  mode?: "create" | "edit";
}

export function ProductEditor({ initialProduct = null, mode = "create" }: ProductEditorProps) {
  const router = useRouter();
  const { success, error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const variantFileInputRef = useRef<HTMLInputElement>(null);

  // Categories
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form Fields
  const [name, setName] = useState(initialProduct?.name || "");
  const [slug, setSlug] = useState(initialProduct?.slug || "");
  const [isCustomSlug, setIsCustomSlug] = useState(Boolean(initialProduct?.slug));
  const [shortDescription, setShortDescription] = useState(initialProduct?.short_description || "");
  const [description, setDescription] = useState(initialProduct?.description || "");
  const [price, setPrice] = useState<number | string>(initialProduct?.price || 490);
  const [comparePrice, setComparePrice] = useState<number | string>(initialProduct?.compare_at_price || "");
  const [sku, setSku] = useState(() => {
    if (initialProduct?.sku) return initialProduct.sku;
    if (mode === "create") {
      return `DNR-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    }
    return "";
  });
  const [stock, setStock] = useState<number>(initialProduct?.stock ?? 15);
  const [categoryId, setCategoryId] = useState(initialProduct?.categories?.[0]?.id || "");
  const [isBestSeller, setIsBestSeller] = useState(initialProduct?.is_best_seller || false);
  const [isNewArrival, setIsNewArrival] = useState(initialProduct?.is_new_arrival || false);
  const [status, setStatus] = useState<"active" | "draft" | "archived">(
    initialProduct?.status || "active"
  );

  // General Images
  const [images, setImages] = useState<ProductImage[]>(initialProduct?.images || []);
  const [uploadingGeneral, setUploadingGeneral] = useState(false);
  const [generalUploadProgress, setGeneralUploadProgress] = useState(0);

  // Professional Color Variants
  const [colorVariants, setColorVariants] = useState<ProductColorVariant[]>(
    initialProduct?.color_variants || []
  );
  const [activeVariantId, setActiveVariantId] = useState<string | null>(
    initialProduct?.color_variants?.[0]?.id || null
  );
  const [uploadingVariantImage, setUploadingVariantImage] = useState(false);
  const [variantUploadProgress, setVariantUploadProgress] = useState(0);

  // Instagram-Style Cropper State
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperRawSrc, setCropperRawSrc] = useState<string | null>(null);
  const [cropperTarget, setCropperTarget] = useState<"general" | "variant">("general");

  const [submitting, setSubmitting] = useState(false);

  const generateSku = () => {
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    setSku(`DNR-${randomCode}`);
  };

  // Fetch Categories
  useEffect(() => {
    fetch("/api/categories?t=" + Date.now())
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data);
          if (!categoryId && json.data.length > 0) {
            setCategoryId(json.data[0].id);
          }
        }
      })
      .catch((err) => console.error("Error fetching categories:", err))
      .finally(() => setLoadingCategories(false));
  }, [categoryId]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isCustomSlug) {
      setSlug(slugify(val));
    }
  };

  // When general file selected -> open Instagram-style cropper
  const handleGeneralFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      error("Please choose a valid image file (JPG, PNG, WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCropperRawSrc(reader.result as string);
      setCropperTarget("general");
      setCropperOpen(true);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  // When variant file selected -> open Instagram-style cropper
  const handleVariantFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeVariantId) {
      error("Please select a color variant first.");
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      error("Please choose a valid image file (JPG, PNG, WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCropperRawSrc(reader.result as string);
      setCropperTarget("variant");
      setCropperOpen(true);
      if (variantFileInputRef.current) variantFileInputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  // Handle Cropped Image Upload to Cloudinary
  const handleCropComplete = async (croppedBlob: Blob) => {
    if (cropperTarget === "general") {
      setUploadingGeneral(true);
      setGeneralUploadProgress(15);
      try {
        const formData = new FormData();
        formData.append("file", croppedBlob, `${slugify(name || "handbag")}-${Date.now()}.jpg`);
        formData.append("folder", "dnora/products");
        formData.append("resource_type", "image");

        const data = await uploadFileWithProgress<{
          success: boolean;
          media?: { secure_url: string; public_id: string };
          error?: string;
        }>("/api/media/upload", formData, (pct) => {
          setGeneralUploadProgress(Math.max(15, pct));
        });

        if (data.success && data.media) {
          const newImg: ProductImage = {
            cloudinary_public_id: data.media.public_id,
            secure_url: data.media.secure_url,
            alt_text: name || "DNORA Luxury Handbag",
            sort_order: images.length,
          };
          setImages((prev) => [...prev, newImg]);
          success("Handbag photo cropped and added to catalog.");
        } else {
          throw new Error(data.error || "Upload failed");
        }
      } catch (err: unknown) {
        error(err instanceof Error ? err.message : "Failed to upload image");
      } finally {
        setUploadingGeneral(false);
        setGeneralUploadProgress(0);
      }
    } else {
      // Variant target
      if (!activeVariantId) return;
      setUploadingVariantImage(true);
      setVariantUploadProgress(15);
      try {
        const formData = new FormData();
        formData.append("file", croppedBlob, `${slugify(name || "variant")}-${Date.now()}.jpg`);
        formData.append("folder", "dnora/products/variants");
        formData.append("resource_type", "image");

        const data = await uploadFileWithProgress<{
          success: boolean;
          media?: { secure_url: string; public_id: string };
          error?: string;
        }>("/api/media/upload", formData, (pct) => {
          setVariantUploadProgress(Math.max(15, pct));
        });

        if (data.success && data.media) {
          const newImg: ProductImage = {
            cloudinary_public_id: data.media.public_id,
            secure_url: data.media.secure_url,
            alt_text: `${name || "DNORA"} Variant Photo`,
            sort_order: 0,
          };

          setColorVariants((prev) =>
            prev.map((v) =>
              v.id === activeVariantId
                ? { ...v, images: [...v.images, newImg] }
                : v
            )
          );
          success("Variant photo cropped and added.");
        } else {
          throw new Error(data.error || "Upload failed");
        }
      } catch (err: unknown) {
        error(err instanceof Error ? err.message : "Failed to upload variant image");
      } finally {
        setUploadingVariantImage(false);
        setVariantUploadProgress(0);
      }
    }
  };

  const removeGeneralImage = (idxToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  // Color Variants Management
  const addColorVariant = (preset?: { name: string; hex: string }) => {
    const newVariant: ProductColorVariant = {
      id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: preset ? preset.name : `Variant ${colorVariants.length + 1}`,
      color_hex: preset ? preset.hex : "#1A1A1A",
      images: [],
    };
    setColorVariants((prev) => [...prev, newVariant]);
    setActiveVariantId(newVariant.id);
  };

  const updateColorVariant = (id: string, updates: Partial<ProductColorVariant>) => {
    setColorVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
  };

  const removeColorVariant = (id: string) => {
    setColorVariants((prev) => prev.filter((v) => v.id !== id));
    if (activeVariantId === id) {
      const remaining = colorVariants.filter((v) => v.id !== id);
      setActiveVariantId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const removeVariantImage = (variantId: string, imageIdx: number) => {
    setColorVariants((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? { ...v, images: v.images.filter((_, i) => i !== imageIdx) }
          : v
      )
    );
  };

  // Form Submit
  const handleSubmit = async (publishStatus?: "active" | "draft") => {
    if (!name.trim()) {
      error("Product name is required");
      return;
    }
    if (!categoryId) {
      error("Please select a category");
      return;
    }

    setSubmitting(true);
    try {
      const consolidatedImages = [...images];
      colorVariants.forEach((v) => {
        v.images.forEach((vImg) => {
          if (!consolidatedImages.some((ci) => ci.secure_url === vImg.secure_url)) {
            consolidatedImages.push(vImg);
          }
        });
      });

      const payload = {
        name: name.trim(),
        slug: slug.trim() ? slugify(slug) : slugify(name),
        short_description: shortDescription.trim() || `${name} - Handcrafted luxury piece.`,
        description: description.trim() || "Handcrafted in Italy using traditional leather craftsmanship.",
        price: Number(price) || 0,
        compare_at_price: comparePrice ? Number(comparePrice) : null,
        sku: sku.trim() || `DNR-${Date.now().toString().slice(-4)}`,
        stock: Number(stock) || 0,
        category_id: categoryId,
        is_best_seller: isBestSeller,
        is_new_arrival: isNewArrival,
        status: publishStatus || status,
        images: consolidatedImages,
        color_variants: colorVariants,
      };

      const url = initialProduct?.id ? `/api/products/${initialProduct.id}` : "/api/products";
      const method = initialProduct?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const detailMsg = Array.isArray(data.details)
          ? data.details.map((d: { message: string }) => d.message).join(", ")
          : null;
        throw new Error(detailMsg || data.error || "Failed to save product");
      }

      success(
        mode === "create"
          ? `"${name}" added to luxury catalog.`
          : `"${name}" updated successfully.`
      );

      router.push("/admin/products");
      router.refresh();
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const activeVariant = colorVariants.find((v) => v.id === activeVariantId);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-900 transition-colors"
            title="Back to Products"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-heading font-extrabold text-slate-900 tracking-tight">
              {mode === "create" ? "Add New Handbag" : `Edit "${name}"`}
            </h1>
            <p className="text-xs text-slate-500">
              Configure atelier specifications, colorways, and Instagram-style imagery.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit("draft")}
            className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-900 text-xs font-semibold uppercase tracking-wider text-slate-900 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit("active")}
            className="inline-flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-bold uppercase tracking-wider text-white rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span>{mode === "create" ? "Publish Product" : "Save Changes"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Main Product Info & Color Variants */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Basic Product Information */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-900">
                Basic Information
              </h2>
              <span className="text-[10px] text-slate-500 uppercase font-mono">
                SKU: {sku || "Pending"}
              </span>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-900 mb-1.5">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. The Marais Top-Handle Structured Bag"
                className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs text-slate-900 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-slate-900 mb-1.5">
                  Category / Silhouette *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={loadingCategories}
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all capitalize font-medium"
                >
                  {categories.length === 0 ? (
                    <option value="">No categories available</option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-slate-900 mb-1.5">
                  SKU Identifier
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={generateSku}
                    className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Generate New SKU"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-slate-900">
                  URL Slug
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomSlug(!isCustomSlug)}
                  className="text-[10px] text-slate-700 hover:underline uppercase font-bold cursor-pointer"
                >
                  {isCustomSlug ? "Auto-Generate" : "Edit Custom Slug"}
                </button>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs text-slate-400 font-mono select-none">
                  /product/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  disabled={!isCustomSlug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  className="w-full pl-20 pr-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-slate-900 disabled:opacity-75"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Professional Color Variants System */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-slate-900" />
                  <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-900">
                    Color Variants &amp; Swatches
                  </h2>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Associate specific cropped luxury photos with each color option.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => addColorVariant()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-900 text-slate-900 hover:text-white border border-slate-200 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Variant</span>
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-2">
                Luxury Color Presets
              </span>
              <div className="flex flex-wrap gap-2">
                {LUXURY_PRESET_COLORS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => addColorVariant(preset)}
                    className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 transition-all hover:border-slate-900 cursor-pointer"
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Variants Tabs */}
            {colorVariants.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/50">
                <Palette className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  No Color Variants Added Yet
                </p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                  Click a preset above or &quot;Add Variant&quot; to configure colors and link specific images.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Variant Selector Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
                  {colorVariants.map((v) => {
                    const isSelected = v.id === activeVariantId;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setActiveVariantId(v.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                          isSelected
                            ? "border-slate-900 bg-slate-900 text-white shadow-2xs"
                            : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-white"
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-white/40 shrink-0"
                          style={{ backgroundColor: v.color_hex }}
                        />
                        <span>{v.name}</span>
                        <span className="text-[10px] opacity-70">
                          ({v.images.length})
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Variant Configuration Card */}
                {activeVariant && (
                  <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Name & Hex Code */}
                      <div className="flex items-center gap-3 flex-1">
                        <div className="relative flex items-center">
                          <input
                            type="color"
                            value={activeVariant.color_hex}
                            onChange={(e) =>
                              updateColorVariant(activeVariant.id, { color_hex: e.target.value })
                            }
                            className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                            title="Choose color hex"
                          />
                        </div>

                        <div className="flex-1 max-w-xs">
                          <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">
                            Variant Color Name
                          </label>
                          <input
                            type="text"
                            value={activeVariant.name}
                            onChange={(e) =>
                              updateColorVariant(activeVariant.id, { name: e.target.value })
                            }
                            placeholder="e.g. Noir Black"
                            className="w-full bg-white border border-slate-200 px-3 py-1.5 text-xs text-slate-900 rounded-xl focus:outline-none focus:border-slate-900 font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">
                            Hex Code
                          </label>
                          <input
                            type="text"
                            value={activeVariant.color_hex}
                            onChange={(e) =>
                              updateColorVariant(activeVariant.id, { color_hex: e.target.value })
                            }
                            className="w-24 bg-white border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900 rounded-xl font-mono uppercase"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeColorVariant(activeVariant.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors shrink-0 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Variant</span>
                      </button>
                    </div>

                    {/* Variant Specific Imagery */}
                    <div className="pt-3 border-t border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-xs uppercase tracking-wider font-bold text-slate-900 block">
                            Photos for &quot;{activeVariant.name}&quot;
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Instagram-style flexible cropping for this color option.
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {uploadingVariantImage && (
                            <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                              <CircularProgress progress={variantUploadProgress} size={20} strokeWidth={2.5} />
                              <span className="text-[11px] font-semibold text-slate-900">
                                {variantUploadProgress}%
                              </span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => variantFileInputRef.current?.click()}
                            disabled={uploadingVariantImage}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
                          >
                            <CropIcon className="w-3.5 h-3.5" />
                            <span>Crop &amp; Upload</span>
                          </button>
                          <input
                            ref={variantFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleVariantFileSelect}
                            className="hidden"
                          />
                        </div>
                      </div>

                      {/* Variant Images Grid */}
                      {activeVariant.images.length === 0 ? (
                        <div
                          onClick={() => variantFileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center cursor-pointer hover:border-slate-900 transition-colors bg-white"
                        >
                          <ImageIcon className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                          <p className="text-xs font-semibold text-slate-900">
                            Upload photos specifically for {activeVariant.name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            PNG, JPG, WEBP • Flexible Instagram-style crop anywhere on image
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                          {activeVariant.images.map((img, idx) => (
                            <div
                              key={img.cloudinary_public_id || idx}
                              className="relative aspect-[4/5] rounded-xl overflow-hidden bg-white border border-slate-200 group shadow-2xs"
                            >
                              <Image
                                src={img.secure_url}
                                alt={`${activeVariant.name} ${idx + 1}`}
                                fill
                                sizes="120px"
                                className="object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeVariantImage(activeVariant.id, idx)}
                                className="absolute top-1 right-1 p-1 rounded-lg bg-black/75 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 cursor-pointer"
                                title="Remove photo"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 3: Main Catalog Imagery & Gallery */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-900">
                  Main Catalog Imagery
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Default handbag photos. Crop freely from anywhere in the whole image.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {uploadingGeneral && (
                  <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                    <CircularProgress progress={generalUploadProgress} size={20} strokeWidth={2.5} />
                    <span className="text-[11px] font-semibold text-slate-900">
                      {generalUploadProgress}%
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingGeneral}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                  <CropIcon className="w-3.5 h-3.5" />
                  <span>Crop &amp; Upload</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleGeneralFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            {images.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center cursor-pointer hover:border-slate-900 transition-colors bg-slate-50/50"
              >
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Select Handbag Photos to Crop
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Instagram-style cropper: zoom, pan freely, and choose 4:5, 1:1, or Free crop.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {images.map((img, idx) => (
                  <div
                    key={img.cloudinary_public_id || idx}
                    className="relative aspect-[4/5] rounded-xl overflow-hidden bg-slate-50 border border-slate-200 group shadow-2xs"
                  >
                    <Image
                      src={img.secure_url}
                      alt={img.alt_text || `Image ${idx + 1}`}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/80 text-white rounded text-[9px] font-bold uppercase tracking-wider">
                        Primary
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeGeneralImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-lg bg-black/75 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 4: Editorial Descriptions */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-900 border-b border-slate-100 pb-3">
              Editorial Descriptions
            </h2>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-900 mb-1.5">
                Short Editorial Tagline
              </label>
              <input
                type="text"
                required
                maxLength={200}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="e.g. Architectural top-handle handbag crafted in full-grain Italian calfskin."
                className="w-full bg-slate-50 border border-slate-200 px-4 py-2 text-xs text-slate-900 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-900 mb-1.5">
                Detailed Artisan Craftsmanship
              </label>
              <textarea
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter leather origin, hardware specifications, interior compartment structure, strap dimensions, and care instructions..."
                className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs text-slate-900 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white leading-relaxed transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Pricing, Badges, Inventory & Status */}
        <div className="lg:col-span-4 space-y-6">
          {/* Pricing & Stock Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-900 border-b border-slate-100 pb-3">
              Pricing &amp; Inventory
            </h2>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-900 mb-1.5">
                Price (₹ INR) *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  required
                  min={1}
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="24999"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-900 mb-1.5">
                Discount / Compare at Price (Optional)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min={1}
                  step="any"
                  value={comparePrice}
                  onChange={(e) => setComparePrice(e.target.value)}
                  placeholder="29999"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 text-sm text-slate-900 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs uppercase tracking-wider font-semibold text-slate-900">
                  Stock Quantity
                </label>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    stock > 5
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : stock > 0
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {stock > 5 ? "In Stock" : stock > 0 ? "Low Stock" : "Out of Stock"}
                </span>
              </div>
              <input
                type="number"
                required
                min={0}
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-sm text-slate-900 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white font-mono"
              />
            </div>
          </div>

          {/* Badges & Collections Toggles */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-900 border-b border-slate-100 pb-3">
              Collections &amp; Badges
            </h2>

            {/* Best Seller Toggle */}
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:border-slate-900 transition-all">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-slate-900 text-white">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                </span>
                <div>
                  <span className="text-xs font-bold text-slate-900 block uppercase tracking-wider">
                    Best Seller
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Feature on Home Best Sellers section
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="w-4 h-4 accent-slate-900 cursor-pointer rounded"
              />
            </label>

            {/* New Arrival Toggle */}
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:border-slate-900 transition-all">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-900">
                  <Sparkles className="w-3.5 h-3.5 text-slate-900" />
                </span>
                <div>
                  <span className="text-xs font-bold text-slate-900 block uppercase tracking-wider">
                    New Arrival
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Feature on Home New Arrivals section
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="w-4 h-4 accent-slate-900 cursor-pointer rounded"
              />
            </label>
          </div>

          {/* Visibility Status Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-900 border-b border-slate-100 pb-3">
              Publishing Status
            </h2>

            <div className="space-y-2">
              {[
                { val: "active", label: "Active (Visible on Storefront)" },
                { val: "draft", label: "Draft (Hidden from Catalog)" },
                { val: "archived", label: "Archived" },
              ].map((opt) => (
                <label
                  key={opt.val}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${
                    status === opt.val
                      ? "border-slate-900 bg-slate-50 text-slate-900"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="product_status"
                    value={opt.val}
                    checked={status === opt.val}
                    onChange={() => setStatus(opt.val as ProductStatus)}
                    className="accent-slate-900"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Instagram-Style Image Cropper Modal */}
      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={cropperRawSrc}
        onClose={() => setCropperOpen(false)}
        onCropComplete={handleCropComplete}
        initialAspectRatio="4:5"
        title="Crop Product Photo (Instagram Style)"
      />
    </div>
  );
}
