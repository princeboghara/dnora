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
  Eye,
  RefreshCw,
  X,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { Product, ProductCategory, ProductImage, ProductColorVariant } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { slugify, formatPrice } from "@/lib/utils";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { uploadFileWithProgress } from "@/lib/upload-utils";

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
  const [sku, setSku] = useState(initialProduct?.sku || "");
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

  const [submitting, setSubmitting] = useState(false);

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

  // Generate SKU if empty
  useEffect(() => {
    if (!sku && mode === "create") {
      generateSku();
    }
  }, [sku, mode]);

  const generateSku = () => {
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    setSku(`DNR-${randomCode}`);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isCustomSlug) {
      setSlug(slugify(val));
    }
  };

  // Upload General Product Images
  const handleGeneralImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGeneral(true);
    setGeneralUploadProgress(10);
    try {
      const uploaded: ProductImage[] = [];
      const totalFiles = files.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "dnora/products");
        formData.append("resource_type", "image");

        const data = await uploadFileWithProgress<{
          success: boolean;
          media?: { secure_url: string; public_id: string };
          error?: string;
        }>("/api/media/upload", formData, (pct) => {
          const stepPercent = Math.round(((i + pct / 100) / totalFiles) * 100);
          setGeneralUploadProgress(stepPercent);
        });

        if (data.success && data.media) {
          uploaded.push({
            cloudinary_public_id: data.media.public_id,
            secure_url: data.media.secure_url,
            alt_text: name || "DNORA Luxury Handbag",
            sort_order: images.length + uploaded.length,
          });
        }
      }

      setImages((prev) => [...prev, ...uploaded]);
      success(`Uploaded ${uploaded.length} image(s).`);
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploadingGeneral(false);
      setGeneralUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
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

  // Upload Images Specifically for Active Color Variant
  const handleVariantImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeVariantId) {
      error("Please select a color variant first.");
      return;
    }
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingVariantImage(true);
    setVariantUploadProgress(10);
    try {
      const uploaded: ProductImage[] = [];
      const totalFiles = files.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "dnora/products");
        formData.append("resource_type", "image");

        const data = await uploadFileWithProgress<{
          success: boolean;
          media?: { secure_url: string; public_id: string };
          error?: string;
        }>("/api/media/upload", formData, (pct) => {
          const stepPercent = Math.round(((i + pct / 100) / totalFiles) * 100);
          setVariantUploadProgress(stepPercent);
        });

        if (data.success && data.media) {
          uploaded.push({
            cloudinary_public_id: data.media.public_id,
            secure_url: data.media.secure_url,
            alt_text: `${name} in color variant`,
            sort_order: uploaded.length,
          });
        }
      }

      // Append to active variant
      setColorVariants((prev) =>
        prev.map((v) =>
          v.id === activeVariantId
            ? { ...v, images: [...v.images, ...uploaded] }
            : v
        )
      );

      // Also ensure it is present in product images if empty
      if (images.length === 0 && uploaded.length > 0) {
        setImages((prev) => [...prev, ...uploaded]);
      }

      success(`Added ${uploaded.length} photo(s) to color variant.`);
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Variant image upload failed");
    } finally {
      setUploadingVariantImage(false);
      setVariantUploadProgress(0);
      if (variantFileInputRef.current) variantFileInputRef.current.value = "";
    }
  };

  const removeVariantImage = (variantId: string, imageIdx: number) => {
    setColorVariants((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? { ...v, images: v.images.filter((_, idx) => idx !== imageIdx) }
          : v
      )
    );
  };

  // Submit Product Form
  const handleSubmit = async (publishStatus?: "active" | "draft") => {
    if (!name.trim()) {
      error("Product name is required.");
      return;
    }
    if (!categoryId) {
      error("Please select a category for this product.");
      return;
    }
    if (images.length === 0 && colorVariants.every((v) => v.images.length === 0)) {
      error("Please upload at least one product image.");
      return;
    }

    setSubmitting(true);
    try {
      // Consolidate images: if general images is empty, pull variant images
      const consolidatedImages =
        images.length > 0
          ? images
          : colorVariants.flatMap((v) => v.images);

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
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E8E5DE] shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-md border border-[#E8E5DE] hover:bg-[#FAF9F6] text-[#0E0E0E] transition-colors"
            title="Back to Products"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-heading font-bold text-[#0E0E0E] tracking-tight">
              {mode === "create" ? "Add New Handbag / Product" : `Edit "${name}"`}
            </h1>
            <p className="text-xs text-[#73706A]">
              Configure atelier specifications, luxury color variants, and imagery.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit("draft")}
            className="px-4 py-2 bg-white border border-[#E8E5DE] hover:border-[#0E0E0E] text-xs font-semibold uppercase tracking-wider text-[#0E0E0E] rounded transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit("active")}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#0E0E0E] hover:bg-[#2C2B29] text-xs font-semibold uppercase tracking-wider text-[#FAF9F6] rounded transition-colors shadow-sm disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5 text-[#0E0E0E]" />
            )}
            <span>{mode === "create" ? "Publish Product" : "Save Changes"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Main Product Info & Color Variants */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Basic Product Information */}
          <div className="bg-white p-6 rounded-xl border border-[#E8E5DE] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E5DE] pb-3">
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-[#0E0E0E]">
                Basic Information
              </h2>
              <span className="text-[10px] text-[#73706A] uppercase font-mono">
                SKU: {sku || "Pending"}
              </span>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E] mb-1.5">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. The Marais Top-Handle Structured Bag"
                className="w-full bg-[#FAF9F6] border border-[#E8E5DE] px-4 py-2.5 text-xs text-[#0E0E0E] rounded-md focus:outline-none focus:border-[#0E0E0E] focus:bg-white transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E] mb-1.5">
                  Category / Silhouette *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={loadingCategories}
                  className="w-full bg-[#FAF9F6] border border-[#E8E5DE] px-3.5 py-2.5 text-xs text-[#0E0E0E] rounded-md focus:outline-none focus:border-[#0E0E0E] focus:bg-white transition-all capitalize"
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
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E] mb-1.5">
                  SKU Identifier
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="flex-1 bg-[#FAF9F6] border border-[#E8E5DE] px-3.5 py-2.5 text-xs text-[#0E0E0E] rounded-md focus:outline-none focus:border-[#0E0E0E] focus:bg-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={generateSku}
                    className="p-2.5 bg-white border border-[#E8E5DE] hover:bg-[#FAF9F6] rounded-md text-[#73706A] hover:text-[#0E0E0E] transition-colors"
                    title="Generate New SKU"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E]">
                  URL Slug
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomSlug(!isCustomSlug)}
                  className="text-[10px] text-[#0E0E0E] hover:underline uppercase font-bold"
                >
                  {isCustomSlug ? "Auto-Generate" : "Edit Custom Slug"}
                </button>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs text-[#73706A] font-mono select-none">
                  /product/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  disabled={!isCustomSlug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  className="w-full pl-20 pr-3.5 py-2.5 text-xs font-mono rounded-md border border-[#E8E5DE] bg-[#FAF9F6] focus:outline-none focus:border-[#0E0E0E] disabled:opacity-75"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Professional Color Variants System */}
          <div className="bg-white p-6 rounded-xl border border-[#E8E5DE] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E5DE] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#0E0E0E]" />
                  <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-[#0E0E0E]">
                    Professional Color Variants System
                  </h2>
                </div>
                <p className="text-[11px] text-[#73706A] mt-0.5">
                  Associate specific luxury photoshoot imagery with each color option.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => addColorVariant()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9F6] hover:bg-[#0E0E0E] text-[#0E0E0E] hover:text-white border border-[#E8E5DE] rounded text-xs font-semibold uppercase tracking-wider transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Variant</span>
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#73706A] font-semibold block mb-2">
                Luxury Color Presets
              </span>
              <div className="flex flex-wrap gap-2">
                {LUXURY_PRESET_COLORS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => addColorVariant(preset)}
                    className="flex items-center gap-2 px-2.5 py-1.5 bg-[#FAF9F6] hover:bg-white border border-[#E8E5DE] rounded text-xs font-medium text-[#0E0E0E] transition-all hover:border-[#0E0E0E]"
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
              <div className="p-8 border-2 border-dashed border-[#E8E5DE] rounded-lg text-center bg-[#FAF9F6]">
                <Palette className="w-8 h-8 text-[#0E0E0E] mx-auto mb-2 opacity-60" />
                <p className="text-xs font-semibold text-[#0E0E0E] uppercase tracking-wider">
                  No Color Variants Added Yet
                </p>
                <p className="text-[11px] text-[#73706A] mt-1 max-w-sm mx-auto">
                  Click a preset above or &quot;Add Variant&quot; to configure colors and link specific images for each colorway.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Variant Selector Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E8E5DE]">
                  {colorVariants.map((v) => {
                    const isSelected = v.id === activeVariantId;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setActiveVariantId(v.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs font-semibold uppercase tracking-wider transition-all shrink-0 ${
                          isSelected
                            ? "border-[#0E0E0E] bg-[#0E0E0E] text-white shadow-xs"
                            : "border-[#E8E5DE] bg-[#FAF9F6] text-[#0E0E0E] hover:bg-white"
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
                  <div className="p-4 sm:p-5 bg-[#FAF9F6] rounded-lg border border-[#E8E5DE] space-y-4 animate-in fade-in duration-200">
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
                            className="w-10 h-10 rounded-md border border-[#E8E5DE] cursor-pointer p-0.5 bg-white"
                            title="Choose color hex"
                          />
                        </div>

                        <div className="flex-1 max-w-xs">
                          <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#73706A] mb-1">
                            Variant Color Name
                          </label>
                          <input
                            type="text"
                            value={activeVariant.name}
                            onChange={(e) =>
                              updateColorVariant(activeVariant.id, { name: e.target.value })
                            }
                            placeholder="e.g. Noir Black"
                            className="w-full bg-white border border-[#E8E5DE] px-3 py-1.5 text-xs text-[#0E0E0E] rounded focus:outline-none focus:border-[#0E0E0E] font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#73706A] mb-1">
                            Hex Code
                          </label>
                          <input
                            type="text"
                            value={activeVariant.color_hex}
                            onChange={(e) =>
                              updateColorVariant(activeVariant.id, { color_hex: e.target.value })
                            }
                            className="w-24 bg-white border border-[#E8E5DE] px-2.5 py-1.5 text-xs text-[#0E0E0E] rounded font-mono uppercase"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeColorVariant(activeVariant.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded border border-rose-200 transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Variant</span>
                      </button>
                    </div>

                    {/* Variant Specific Imagery */}
                    <div className="pt-2 border-t border-[#E8E5DE]">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-xs uppercase tracking-wider font-semibold text-[#0E0E0E] block">
                            Photos for &quot;{activeVariant.name}&quot;
                          </span>
                          <span className="text-[11px] text-[#73706A]">
                            When customers choose this color, the storefront will showcase these photos.
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {uploadingVariantImage && (
                            <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded border border-[#E8E5DE]">
                              <CircularProgress progress={variantUploadProgress} size={20} strokeWidth={2.5} />
                              <span className="text-[11px] font-semibold">
                                {variantUploadProgress}%
                              </span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => variantFileInputRef.current?.click()}
                            disabled={uploadingVariantImage}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0E0E0E] text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#2C2B29] transition-all disabled:opacity-50"
                          >
                            <Upload className="w-3.5 h-3.5 text-[#0E0E0E]" />
                            <span>Upload Photos</span>
                          </button>
                          <input
                            ref={variantFileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleVariantImageUpload}
                            className="hidden"
                          />
                        </div>
                      </div>

                      {/* Variant Images Grid */}
                      {activeVariant.images.length === 0 ? (
                        <div
                          onClick={() => variantFileInputRef.current?.click()}
                          className="border-2 border-dashed border-[#E8E5DE] rounded-lg p-6 text-center cursor-pointer hover:border-[#0E0E0E] transition-colors bg-white"
                        >
                          <ImageIcon className="w-6 h-6 text-[#0E0E0E] mx-auto mb-1.5" />
                          <p className="text-xs font-semibold text-[#0E0E0E]">
                            Upload photos specifically for {activeVariant.name}
                          </p>
                          <p className="text-[10px] text-[#73706A]">
                            PNG, JPG, WEBP • Auto compressed to 1600px HD
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                          {activeVariant.images.map((img, idx) => (
                            <div
                              key={img.cloudinary_public_id || idx}
                              className="relative aspect-[4/5] rounded-md overflow-hidden bg-white border border-[#E8E5DE] group"
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
                                className="absolute top-1 right-1 p-1 rounded bg-black/75 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
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

          {/* Card 3: General Imagery & Gallery */}
          <div className="bg-white p-6 rounded-xl border border-[#E8E5DE] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E5DE] pb-3">
              <div>
                <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-[#0E0E0E]">
                  Main Catalog Imagery
                </h2>
                <p className="text-[11px] text-[#73706A] mt-0.5">
                  Default handbag photos displayed when no specific variant is selected.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {uploadingGeneral && (
                  <div className="flex items-center gap-2 bg-[#FAF9F6] px-2.5 py-1 rounded border border-[#E8E5DE]">
                    <CircularProgress progress={generalUploadProgress} size={20} strokeWidth={2.5} />
                    <span className="text-[11px] font-semibold">
                      {generalUploadProgress}%
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingGeneral}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9F6] hover:bg-[#0E0E0E] text-[#0E0E0E] hover:text-white border border-[#E8E5DE] rounded text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5 text-[#0E0E0E]" />
                  <span>Upload Images</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleGeneralImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {images.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#E8E5DE] rounded-lg p-8 text-center cursor-pointer hover:border-[#0E0E0E] transition-colors bg-[#FAF9F6]"
              >
                <Upload className="w-8 h-8 text-[#0E0E0E] mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#0E0E0E] uppercase tracking-wider">
                  Select Handbag Photos
                </p>
                <p className="text-[11px] text-[#73706A] mt-1">
                  Upload multiple angles. First image will act as primary storefront thumbnail.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {images.map((img, idx) => (
                  <div
                    key={img.cloudinary_public_id || idx}
                    className="relative aspect-[4/5] rounded-md overflow-hidden bg-[#FAF9F6] border border-[#E8E5DE] group"
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
                      className="absolute top-1 right-1 p-1 rounded bg-black/75 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
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
          <div className="bg-white p-6 rounded-xl border border-[#E8E5DE] shadow-xs space-y-4">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-[#0E0E0E] border-b border-[#E8E5DE] pb-3">
              Editorial Descriptions
            </h2>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E] mb-1.5">
                Short Editorial Tagline
              </label>
              <input
                type="text"
                required
                maxLength={200}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="e.g. Architectural top-handle handbag crafted in full-grain Italian calfskin."
                className="w-full bg-[#FAF9F6] border border-[#E8E5DE] px-4 py-2 text-xs text-[#0E0E0E] rounded-md focus:outline-none focus:border-[#0E0E0E]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E] mb-1.5">
                Detailed Artisan Craftsmanship
              </label>
              <textarea
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter leather origin, hardware specifications, interior compartment structure, strap dimensions, and care instructions..."
                className="w-full bg-[#FAF9F6] border border-[#E8E5DE] px-4 py-2.5 text-xs text-[#0E0E0E] rounded-md focus:outline-none focus:border-[#0E0E0E] leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Pricing, Badges, Inventory & Status */}
        <div className="lg:col-span-4 space-y-6">
          {/* Pricing & Stock Card */}
          <div className="bg-white p-6 rounded-xl border border-[#E8E5DE] shadow-xs space-y-4">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-[#0E0E0E] border-b border-[#E8E5DE] pb-3">
              Pricing &amp; Inventory
            </h2>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E] mb-1.5">
                Price (₹ INR) *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-bold text-[#73706A]">₹</span>
                <input
                  type="number"
                  required
                  min={1}
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="24999"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-[#FAF9F6] border border-[#E8E5DE] text-sm font-bold text-[#0E0E0E] rounded-md focus:outline-none focus:border-[#0E0E0E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E] mb-1.5">
                Discount / Compare at Price (Optional)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-bold text-[#73706A]">₹</span>
                <input
                  type="number"
                  min={1}
                  step="any"
                  value={comparePrice}
                  onChange={(e) => setComparePrice(e.target.value)}
                  placeholder="29999"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-[#FAF9F6] border border-[#E8E5DE] text-sm text-[#0E0E0E] rounded-md focus:outline-none focus:border-[#0E0E0E]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#0E0E0E]">
                  Stock Quantity
                </label>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    stock > 5
                      ? "bg-emerald-50 text-emerald-700"
                      : stock > 0
                      ? "bg-amber-50 text-amber-700"
                      : "bg-rose-50 text-rose-700"
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
                className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E8E5DE] text-sm text-[#0E0E0E] rounded-md focus:outline-none focus:border-[#0E0E0E]"
              />
            </div>
          </div>

          {/* Badges & Collections Toggles */}
          <div className="bg-white p-6 rounded-xl border border-[#E8E5DE] shadow-xs space-y-4">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-[#0E0E0E] border-b border-[#E8E5DE] pb-3">
              Collections &amp; Badges
            </h2>

            {/* Best Seller Toggle */}
            <label className="flex items-center justify-between p-3 rounded-lg border border-[#E8E5DE] bg-[#FAF9F6] cursor-pointer hover:border-[#0E0E0E] transition-all">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded bg-black text-white">
                  <Flame className="w-3.5 h-3.5 text-[#0E0E0E]" />
                </span>
                <div>
                  <span className="text-xs font-bold text-[#0E0E0E] block uppercase tracking-wider">
                    Best Seller
                  </span>
                  <span className="text-[10px] text-[#73706A]">
                    Feature on Home Best Sellers section
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="w-4 h-4 accent-[#0E0E0E] cursor-pointer"
              />
            </label>

            {/* New Arrival Toggle */}
            <label className="flex items-center justify-between p-3 rounded-lg border border-[#E8E5DE] bg-[#FAF9F6] cursor-pointer hover:border-[#0E0E0E] transition-all">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded bg-[#0E0E0E] text-[#0E0E0E]">
                  <Sparkles className="w-3.5 h-3.5 text-[#0E0E0E]" />
                </span>
                <div>
                  <span className="text-xs font-bold text-[#0E0E0E] block uppercase tracking-wider">
                    New Arrival
                  </span>
                  <span className="text-[10px] text-[#73706A]">
                    Feature on Home New Arrivals section
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="w-4 h-4 accent-[#0E0E0E] cursor-pointer"
              />
            </label>
          </div>

          {/* Visibility Status Card */}
          <div className="bg-white p-6 rounded-xl border border-[#E8E5DE] shadow-xs space-y-4">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-[#0E0E0E] border-b border-[#E8E5DE] pb-3">
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
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer text-xs font-semibold transition-all ${
                    status === opt.val
                      ? "border-[#0E0E0E] bg-[#FAF9F6] text-[#0E0E0E]"
                      : "border-[#E8E5DE] text-[#73706A] hover:bg-[#FAF9F6]"
                  }`}
                >
                  <input
                    type="radio"
                    name="product_status"
                    value={opt.val}
                    checked={status === opt.val}
                    onChange={() => setStatus(opt.val as any)}
                    className="accent-[#0E0E0E]"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
