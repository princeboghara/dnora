"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Check, Sparkles, Flame } from "lucide-react";
import { Product, ProductCategory, ProductImage } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { slugify } from "@/lib/utils";

interface ProductFormProps {
  initialData?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ initialData, onSuccess, onCancel }: ProductFormProps) {
  const { success, error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [shortDescription, setShortDescription] = useState(initialData?.short_description || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price || 490);
  const [comparePrice, setComparePrice] = useState<number | string>(initialData?.compare_at_price || "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [stock, setStock] = useState(initialData?.stock ?? 10);
  const [categoryId, setCategoryId] = useState(initialData?.categories?.[0]?.id || "");
  const [isBestSeller, setIsBestSeller] = useState(initialData?.is_best_seller || false);
  const [isNewArrival, setIsNewArrival] = useState(initialData?.is_new_arrival || false);
  const [status, setStatus] = useState<"active" | "draft" | "archived">(
    initialData?.status || "active"
  );
  const [images, setImages] = useState<ProductImage[]>(initialData?.images || []);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load categories
  useEffect(() => {
    fetch("/api/heroes") // categories can be fetched from categories endpoint or seed
      .then(() => {
        // Fallback categories list
        setCategories([
          { id: "cat-1", name: "Shoulder Bags", slug: "shoulder-bags" },
          { id: "cat-2", name: "Tote Bags", slug: "tote-bags" },
          { id: "cat-3", name: "Crossbody Bags", slug: "crossbody-bags" },
          { id: "cat-4", name: "Handbags", slug: "handbags" },
          { id: "cat-5", name: "Mini Bags", slug: "mini-bags" },
        ]);
      });
  }, []);

  // Auto-slug when name changes (if not editing existing slug)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!initialData) {
      setSlug(slugify(val));
    }
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "dnora/products");
        formData.append("resource_type", "image");

        const res = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");

        const newImg: ProductImage = {
          id: `img-${Date.now()}-${i}`,
          product_id: initialData?.id || "temp",
          cloudinary_public_id: data.media.public_id,
          secure_url: data.media.secure_url,
          alt_text: `${name || "DNORA Handbag"} angle ${images.length + 1}`,
          sort_order: images.length + 1,
        };

        setImages((prev) => [...prev, newImg]);
      }
      success("Product images uploaded successfully.");
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Failed to upload product image");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (identifier: string | number) => {
    setImages((prev) =>
      prev.filter((img, idx) => (img.id ? img.id !== identifier : idx !== identifier))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      error("Please upload at least one handbag product image.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        slug: slug || slugify(name),
        short_description: shortDescription,
        description,
        price: Number(price),
        compare_at_price: comparePrice ? Number(comparePrice) : null,
        sku: sku || `DNR-${Date.now().toString().slice(-4)}`,
        stock: Number(stock),
        category_id: categoryId || "cat-1",
        is_best_seller: isBestSeller,
        is_new_arrival: isNewArrival,
        status,
        images,
      };

      const url = initialData?.id ? `/api/products/${initialData.id}` : "/api/products";
      const method = initialData?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save handbag");

      success(
        initialData?.id
          ? `"${name}" updated successfully.`
          : `"${name}" added to catalog.`
      );
      onSuccess();
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E] mb-1">
            Handbag Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={handleNameChange}
            placeholder="e.g. The Marais Structured Handbag"
            className="w-full bg-white border border-[#E8E5DE] px-4 py-2 text-xs text-[#0E0E0E] rounded focus:outline-none focus:border-[#0E0E0E]"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E] mb-1">
            URL Slug
          </label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="the-marais-structured-handbag"
            className="w-full bg-white border border-[#E8E5DE] px-4 py-2 text-xs font-mono text-[#0E0E0E] rounded focus:outline-none focus:border-[#0E0E0E]"
          />
        </div>
      </div>

      {/* Category, SKU, Pricing */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E] mb-1">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-white border border-[#E8E5DE] px-3 py-2 text-xs text-[#0E0E0E] rounded focus:outline-none focus:border-[#0E0E0E]"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E] mb-1">
            SKU Code
          </label>
          <input
            type="text"
            required
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="DNR-MAR-01-BLK"
            className="w-full bg-white border border-[#E8E5DE] px-4 py-2 text-xs font-mono text-[#0E0E0E] rounded focus:outline-none focus:border-[#0E0E0E]"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E] mb-1">
            Price (USD)
          </label>
          <input
            type="number"
            required
            min={1}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full bg-white border border-[#E8E5DE] px-4 py-2 text-xs text-[#0E0E0E] rounded focus:outline-none focus:border-[#0E0E0E]"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E] mb-1">
            Compare Price ($)
          </label>
          <input
            type="number"
            min={1}
            value={comparePrice}
            onChange={(e) => setComparePrice(e.target.value)}
            placeholder="Optional"
            className="w-full bg-white border border-[#E8E5DE] px-4 py-2 text-xs text-[#0E0E0E] rounded focus:outline-none focus:border-[#0E0E0E]"
          />
        </div>
      </div>

      {/* Stock & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E] mb-1">
            Inventory Stock (Units)
          </label>
          <input
            type="number"
            min={0}
            required
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            className="w-full bg-white border border-[#E8E5DE] px-4 py-2 text-xs text-[#0E0E0E] rounded focus:outline-none focus:border-[#0E0E0E]"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E] mb-1">
            Product Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "active" | "draft" | "archived")}
            className="w-full bg-white border border-[#E8E5DE] px-3 py-2 text-xs text-[#0E0E0E] rounded focus:outline-none focus:border-[#0E0E0E]"
          >
            <option value="active">Active (Visible in Store)</option>
            <option value="draft">Draft (Hidden)</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Flag Toggles (Best Seller / New Arrival) */}
      <div className="bg-[#FAF9F6] p-4 rounded-md border border-[#E8E5DE] flex flex-wrap gap-8">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isBestSeller}
            onChange={(e) => setIsBestSeller(e.target.checked)}
            className="w-4 h-4 accent-[#0E0E0E] rounded"
          />
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0E0E0E]">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Mark as Best Seller</span>
          </div>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isNewArrival}
            onChange={(e) => setIsNewArrival(e.target.checked)}
            className="w-4 h-4 accent-[#0E0E0E] rounded"
          />
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0E0E0E]">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Mark as New Arrival</span>
          </div>
        </label>
      </div>

      {/* Descriptions */}
      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E] mb-1">
          Short Editorial Summary (Max 200 chars)
        </label>
        <input
          type="text"
          required
          maxLength={200}
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          placeholder="e.g. Architectural top-handle handbag in pebbled Noir calfskin."
          className="w-full bg-white border border-[#E8E5DE] px-4 py-2 text-xs text-[#0E0E0E] rounded focus:outline-none focus:border-[#0E0E0E]"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E] mb-1">
          Detailed Artisan Description
        </label>
        <textarea
          rows={4}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Details on Italian leather origin, hardware plating, dimensions, and interior compartment architecture..."
          className="w-full bg-white border border-[#E8E5DE] px-4 py-2 text-xs text-[#0E0E0E] rounded focus:outline-none focus:border-[#0E0E0E]"
        />
      </div>

      {/* Product Images (Cloudinary Multi-Upload) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E]">
            Product Imagery (Cloudinary Media)
          </label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 text-xs text-[#0E0E0E] hover:text-[#C5A880] font-semibold uppercase tracking-wider"
          >
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5 text-[#C5A880]" />
            )}
            <span>Upload Image</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Images Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#FAF9F6] border border-[#E8E5DE] rounded-md min-h-[120px]">
          {images.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center text-[#73706A] py-6">
              <Upload className="w-6 h-6 mb-2 text-[#A8A49C]" />
              <p className="text-xs">No images uploaded yet. Primary image will serve as card visual.</p>
            </div>
          ) : (
            images.map((img, idx) => (
              <div
                key={img.id || idx}
                className="group relative aspect-[4/5] bg-white rounded overflow-hidden border border-[#E8E5DE]"
              >
                <Image
                  src={img.secure_url}
                  alt={img.alt_text || "Product image"}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(img.id || idx)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                  aria-label="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 bg-[#0E0E0E] text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                    Primary
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E5DE]">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-xs uppercase tracking-wider font-semibold text-[#73706A] hover:text-[#0E0E0E] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0E0E0E] hover:bg-[#2C2B29] text-[#FAF9F6] text-xs font-bold uppercase tracking-wider rounded transition-all shadow-md disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4 text-[#C5A880]" />
          )}
          <span>{initialData?.id ? "Update Handbag" : "Create Handbag"}</span>
        </button>
      </div>
    </form>
  );
}
