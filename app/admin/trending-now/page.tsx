"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  ShoppingBag,
  ImageIcon,
} from "lucide-react";
import { TrendingNowItem } from "@/types";

interface ProductOption {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string;
}

export default function AdminTrendingNowPage() {
  const [items, setItems] = useState<TrendingNowItem[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Item State
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [targetLink, setTargetLink] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status Alerts
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/trending-now");
      if (res.ok) {
        const json = await res.json();
        setItems(json.data || []);
      }
    } catch {
      setErrorMsg("Failed to load trending items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.products || data.data || [];
        setProducts(
          list.map((p: any) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            thumbnail: p.images?.[0] || p.thumbnail || "",
          }))
        );
      })
      .catch(() => {});
  }, []);

  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId || "");
    if (!prodId) {
      setTargetLink("");
      return;
    }
    const found = products.find((p) => p.id === prodId);
    if (found) {
      setTargetLink(found.slug ? `/product/${found.slug}` : "");
      if (!title) {
        setTitle(found.title || "");
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "dnora/trending-now");

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload image");
      }

      setImageUrl(data.secure_url || data.url || "");
      setSuccessMsg("Image uploaded successfully! Fill title and click Add Image.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setErrorMsg(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanImageUrl = (imageUrl || "").trim();
    if (!cleanImageUrl) {
      setErrorMsg("Please upload an image or provide an Image URL.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const selectedProd = products.find((p) => p.id === selectedProductId);
    const finalTargetLink = (targetLink || "").trim() || (selectedProd?.slug ? `/product/${selectedProd.slug}` : "");

    try {
      const res = await fetch("/api/admin/trending-now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: (title || "").trim(),
          image_url: cleanImageUrl,
          sort_order: items.length + 1,
          is_active: true,
          target_link: finalTargetLink,
          product_id: selectedProd?.id || null,
          product_slug: selectedProd?.slug || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add item");

      setTitle("");
      setImageUrl("");
      setSelectedProductId("");
      setTargetLink("");
      setSuccessMsg("New lookbook image published successfully!");
      fetchItems();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error adding item";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (item: TrendingNowItem) => {
    try {
      const res = await fetch("/api/admin/trending-now", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          is_active: !item.is_active,
        }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, is_active: !i.is_active } : i))
        );
      }
    } catch {
      setErrorMsg("Failed to update status");
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to remove this lookbook image?")) return;

    try {
      const res = await fetch(`/api/admin/trending-now?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        setSuccessMsg("Image deleted successfully");
      }
    } catch {
      setErrorMsg("Failed to delete image");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-neutral-900 pb-20">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
      />

      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 rounded-lg text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-medium tracking-wider uppercase">
              <span>Storefront</span>
              <span>/</span>
              <span className="text-neutral-700 font-semibold">Trending Now</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Trending Now (Lookbook Imagery)</span>
            </h1>
          </div>
        </div>

        <Link
          href="/trending-now"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg transition-colors"
        >
          <span>View Live Lookbook</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="w-full pt-6 space-y-6">
        {/* Status Alerts */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div className="text-xs sm:text-sm font-medium">{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
            <div className="text-xs sm:text-sm font-semibold">{successMsg}</div>
          </div>
        )}

        {/* SECTION 1: UPLOAD NEW IMAGE */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-7 shadow-xs">
          <div className="border-b border-neutral-100 pb-3 mb-5">
            <h2 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <Upload className="w-4 h-4 text-neutral-700" />
              Upload New Lookbook Image
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              These images appear in the &ldquo;TRENDING NOW&rdquo; section on the homepage and on <code>/trending-now</code>. You can optionally link each image to a specific product.
            </p>
          </div>

          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              {/* Image Preview & Upload Button */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Image (Upload or URL) <span className="text-rose-600">*</span>
                </label>
                <div className="relative aspect-3/4 rounded-xl overflow-hidden bg-neutral-50 border-2 border-dashed border-neutral-300 hover:border-black transition-colors flex items-center justify-center">
                  {imageUrl ? (
                    <>
                      <Image
                        src={imageUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-2 inset-x-2 py-1.5 bg-black/80 hover:bg-black text-white text-[11px] font-semibold rounded-md backdrop-blur-sm transition-colors text-center"
                      >
                        Change Photo
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full h-full flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-neutral-100/60 transition-colors"
                    >
                      {uploading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center mb-2 shadow-xs">
                            <Upload className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-neutral-800">Upload Photo</span>
                          <span className="text-[10px] text-neutral-400 mt-0.5">Direct device upload</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Product details */}
              <div className="sm:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Look Title / Caption (Optional)
                  </label>
                  <input
                    type="text"
                    value={title || ""}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Architectural Silhouette in Noir"
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-black"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Revealed gently on hover overlay. The image itself stays pure and clean.
                  </p>
                </div>

                {/* Associate with Product */}
                <div className="bg-neutral-50/80 rounded-xl p-3.5 border border-neutral-200/80 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-neutral-700" />
                        <span>Associate with Product (Optional)</span>
                      </label>
                      {selectedProductId && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProductId("");
                            setTargetLink("");
                          }}
                          className="text-[10px] text-rose-600 hover:underline font-semibold cursor-pointer"
                        >
                          Clear Selection
                        </button>
                      )}
                    </div>
                    <select
                      value={selectedProductId || ""}
                      onChange={(e) => handleProductSelect(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-neutral-300 bg-white focus:outline-none focus:border-black cursor-pointer"
                    >
                      <option value="">-- No Product (Opens /trending-now page) --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} (/product/{p.slug})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      When clicked, users go directly to this product&apos;s details page. If unlinked, it opens the Trending Now page.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Destination Link / Target URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={targetLink || ""}
                      onChange={(e) => setTargetLink(e.target.value)}
                      placeholder="/product/... or /shop or custom URL"
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-neutral-300 bg-white focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Or Paste Direct Image URL
                  </label>
                  <input
                    type="url"
                    value={imageUrl || ""}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full text-sm px-3.5 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-black font-mono text-xs"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting || !imageUrl}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-widest rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Publish to Trending Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* SECTION 2: EXISTING TRENDING NOW IMAGES */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                Current Lookbook Images ({items.length})
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Toggle visibility or delete images from the collection.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 text-xs">
              No images in Trending Now. Upload above to add your first photo.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`group relative rounded-xl overflow-hidden border transition-all ${
                    item.is_active ? "border-neutral-200 bg-white" : "border-neutral-200 bg-neutral-100 opacity-60"
                  }`}
                >
                  <div className="relative aspect-3/4 w-full">
                    <Image
                      src={item.image_url}
                      alt={item.title || "Look"}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="p-3">
                    <p className="text-xs font-semibold text-neutral-900 truncate">
                      {item.title || "Untitled Look"}
                    </p>

                    {/* Associated Product or Target */}
                    {item.product_slug ? (
                      <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-emerald-700 truncate">
                        <ShoppingBag className="w-3 h-3 shrink-0" />
                        <span className="truncate">Product: {item.product_slug}</span>
                      </div>
                    ) : item.target_link ? (
                      <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-neutral-600 truncate">
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{item.target_link}</span>
                      </div>
                    ) : (
                      <p className="mt-1 text-[10px] text-neutral-400 italic">
                        Unlinked (opens /trending-now)
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item)}
                        className={`text-[11px] font-medium flex items-center gap-1 cursor-pointer ${
                          item.is_active ? "text-emerald-700" : "text-neutral-400"
                        }`}
                        title={item.is_active ? "Visible on Store" : "Hidden from Store"}
                      >
                        {item.is_active ? (
                          <>
                            <Eye className="w-3.5 h-3.5" /> Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" /> Hidden
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 rounded-md text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
