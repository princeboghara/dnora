"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Check, Sparkles, Flame, Crop as CropIcon } from "lucide-react";
import { Product, ProductCategory, ProductImage } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { slugify } from "@/lib/utils";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { uploadFileWithProgress } from "@/lib/upload-utils";
import { ImageCropperModal } from "./ImageCropperModal";

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Instagram-style cropper
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperRawSrc, setCropperRawSrc] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data);
          if (!categoryId && json.data.length > 0) {
            setCategoryId(json.data[0].id);
          }
        }
      })
      .catch((err) => console.error("Failed to load categories in ProductForm:", err));
  }, [categoryId]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!initialData) {
      setSlug(slugify(val));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      error("Please choose a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCropperRawSrc(reader.result as string);
      setCropperOpen(true);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setUploading(true);
    setUploadProgress(20);
    try {
      const formData = new FormData();
      formData.append("file", croppedBlob, `${slugify(name || "product")}-${Date.now()}.jpg`);
      formData.append("folder", "dnora/products");
      formData.append("resource_type", "image");

      const data = await uploadFileWithProgress<{
        success: boolean;
        media: { public_id: string; secure_url: string };
        error?: string;
      }>("/api/media/upload", formData, (pct) => {
        setUploadProgress(Math.max(20, pct));
      });

      if (!data.success || !data.media) throw new Error(data.error || "Upload failed");

      const newImg: ProductImage = {
        id: `img-${Date.now()}`,
        product_id: initialData?.id || "temp",
        cloudinary_public_id: data.media.public_id,
        secure_url: data.media.secure_url,
        alt_text: `${name || "DNORA Handbag"} angle ${images.length + 1}`,
        sort_order: images.length + 1,
      };

      setImages((prev) => [...prev, newImg]);
      success("Product image cropped and added.");
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Failed to upload product image");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeImage = (identifier: string | number) => {
    setImages((prev) =>
      prev.filter((img, idx) => (img.id ? img.id !== identifier : idx !== identifier))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return error("Product name is required");
    if (!categoryId) return error("Category is required");

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
        category_id: categoryId,
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
      if (!res.ok) throw new Error(data.error || "Failed to save product");

      success(initialData?.id ? "Product updated successfully" : "Product created successfully");
      onSuccess();
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title & Slug */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-slate-900 mb-1">
            Product Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={handleNameChange}
            placeholder="e.g. The Marais Top-Handle Structured Bag"
            className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs text-slate-900 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-slate-900 mb-1">
            URL Slug
          </label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="the-marais-structured-handbag"
            className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs font-mono text-slate-900 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white"
          />
        </div>
      </div>

      {/* Category, SKU, Pricing */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-slate-900 mb-1">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 rounded-xl focus:outline-none focus:border-slate-900"
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
          <label className="block text-xs uppercase tracking-wider font-semibold text-slate-900 mb-1">
            SKU Code
          </label>
          <input
            type="text"
            required
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="DNR-MAR-01-BLK"
            className="w-full bg-slate-50 border border-slate-200 px-4 py-2 text-xs font-mono text-slate-900 rounded-xl focus:outline-none focus:border-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-slate-900 mb-1">
            Price (₹ INR)
          </label>
          <input
            type="number"
            required
            min={1}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 px-4 py-2 text-xs text-slate-900 rounded-xl focus:outline-none focus:border-slate-900 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-slate-900 mb-1">
            Compare Price (₹)
          </label>
          <input
            type="number"
            min={1}
            value={comparePrice}
            onChange={(e) => setComparePrice(e.target.value)}
            placeholder="Optional"
            className="w-full bg-slate-50 border border-slate-200 px-4 py-2 text-xs text-slate-900 rounded-xl focus:outline-none focus:border-slate-900 font-mono"
          />
        </div>
      </div>

      {/* Stock & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-slate-900 mb-1">
            Inventory Stock (Units)
          </label>
          <input
            type="number"
            min={0}
            required
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 px-4 py-2 text-xs text-slate-900 rounded-xl focus:outline-none focus:border-slate-900 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-slate-900 mb-1">
            Product Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "active" | "draft" | "archived")}
            className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 rounded-xl focus:outline-none focus:border-slate-900"
          >
            <option value="active">Active (Visible in Store)</option>
            <option value="draft">Draft (Hidden)</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Flag Toggles */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap gap-8">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isBestSeller}
            onChange={(e) => setIsBestSeller(e.target.checked)}
            className="w-4 h-4 accent-slate-900 rounded"
          />
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Mark as Best Seller</span>
          </div>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isNewArrival}
            onChange={(e) => setIsNewArrival(e.target.checked)}
            className="w-4 h-4 accent-slate-900 rounded"
          />
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <Sparkles className="w-3.5 h-3.5 text-slate-900" />
            <span>Mark as New Arrival</span>
          </div>
        </label>
      </div>

      {/* Descriptions */}
      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-900 mb-1">
          Short Editorial Summary
        </label>
        <input
          type="text"
          required
          maxLength={200}
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          placeholder="e.g. Architectural top-handle handbag in pebbled Noir calfskin."
          className="w-full bg-slate-50 border border-slate-200 px-4 py-2 text-xs text-slate-900 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-900 mb-1">
          Detailed Artisan Description
        </label>
        <textarea
          rows={4}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Details on leather origin, craftsmanship, dimensions..."
          className="w-full bg-slate-50 border border-slate-200 px-4 py-2 text-xs text-slate-900 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white"
        />
      </div>

      {/* Product Images (Instagram Cropper) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs uppercase tracking-wider font-semibold text-slate-900">
            Product Imagery (Instagram-Style Crop)
          </label>
          <div className="flex items-center gap-3">
            {uploading && (
              <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                <CircularProgress progress={uploadProgress} size={24} strokeWidth={2.5} />
                <span className="text-[11px] font-semibold text-slate-900">
                  {uploadProgress}%
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <CropIcon className="w-3.5 h-3.5" />
              <span>Crop &amp; Upload</span>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {images.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center cursor-pointer hover:border-slate-900 transition-colors bg-slate-50/50"
          >
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-slate-900">Upload Handbag Photo</p>
            <p className="text-[10px] text-slate-500">Instagram-style crop freely from whole image</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {images.map((img, idx) => (
              <div
                key={img.id || idx}
                className="relative aspect-[4/5] bg-slate-50 rounded-xl overflow-hidden border border-slate-200 group shadow-2xs"
              >
                <Image
                  src={img.secure_url}
                  alt={img.alt_text || "Image"}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(img.id || idx)}
                  className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-600 transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-4 py-2 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          <span>{initialData?.id ? "Update Product" : "Create Product"}</span>
        </button>
      </div>

      {/* Instagram-Style Image Cropper Modal */}
      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={cropperRawSrc}
        onClose={() => setCropperOpen(false)}
        onCropComplete={handleCropComplete}
        initialAspectRatio="4:5"
        title="Crop Product Photo"
      />
    </form>
  );
}
