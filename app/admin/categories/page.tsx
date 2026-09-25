"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  ExternalLink,
  Tag,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  Upload,
  Crop,
  Sparkles,
  Film,
  Image as ImageIcon,
} from "lucide-react";
import { ProductCategory } from "@/types";
import { CircularImageCropperModal } from "@/components/admin/CircularImageCropperModal";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ProductCategory | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");

  // Category Hero Banner Fields
  const [formBannerImageUrl, setFormBannerImageUrl] = useState("");
  const [formBannerHeading, setFormBannerHeading] = useState("");
  const [formBannerSubtitle, setFormBannerSubtitle] = useState("");
  const [formBannerMediaType, setFormBannerMediaType] = useState<"image" | "video">("image");
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Circular Cropper state (Instagram PFP Style)
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperSourceUrl, setCropperSourceUrl] = useState("");

  const handleFileForCropper = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setCropperSourceUrl(event.target.result);
        setCropperOpen(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleOpenCropperForExisting = () => {
    if (formImageUrl) {
      setCropperSourceUrl(formImageUrl);
      setCropperOpen(true);
    }
  };

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/categories");
      if (res.ok) {
        const json = await res.json();
        setCategories(json.data || []);
      } else {
        showStatus("error", "Failed to fetch categories");
      }
    } catch {
      showStatus("error", "Error connecting to categories API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setFormImageUrl("");
    setFormBannerImageUrl("");
    setFormBannerHeading("");
    setFormBannerSubtitle("");
    setFormBannerMediaType("image");
    setModalOpen(true);
  };

  const openEditModal = (cat: ProductCategory) => {
    setEditingCategory(cat);
    setFormName(cat.name || "");
    setFormSlug(cat.slug || "");
    setFormDescription(cat.description || "");
    setFormImageUrl(cat.image_url || "");
    setFormBannerImageUrl(cat.banner_image_url || "");
    setFormBannerHeading(cat.banner_heading || "");
    setFormBannerSubtitle(cat.banner_subtitle || "");
    setFormBannerMediaType(cat.banner_media_type || "image");
    setModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormName(val);
    if (!editingCategory) {
      setFormSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "dnora/categories");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setFormImageUrl(data.secure_url || data.url);
      showStatus("success", "Category image uploaded");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Image upload failed";
      showStatus("error", message);
    } finally {
      setUploading(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "dnora/categories/banners");

      const isVideo = file.type.startsWith("video");
      if (isVideo) {
        setFormBannerMediaType("video");
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setFormBannerImageUrl(data.secure_url || data.url);
      showStatus("success", "Category hero banner uploaded successfully!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Banner upload failed";
      showStatus("error", message);
    } finally {
      setUploadingBanner(false);
      e.target.value = "";
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showStatus("error", "Category name is required");
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        // Update
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName.trim(),
            slug: formSlug.trim() || undefined,
            description: formDescription.trim() || undefined,
            image_url: formImageUrl.trim() || undefined,
            banner_image_url: formBannerImageUrl.trim() || undefined,
            banner_heading: formBannerHeading.trim(),
            banner_subtitle: formBannerSubtitle.trim(),
            banner_media_type: formBannerMediaType,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          setCategories((prev) =>
            prev.map((c) => (c.id === editingCategory.id ? json.data : c))
          );
          showStatus("success", "Category updated successfully");
          setModalOpen(false);
        } else {
          const json = await res.json();
          showStatus("error", json.error || "Failed to update category");
        }
      } else {
        // Create
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName.trim(),
            slug: formSlug.trim() || undefined,
            description: formDescription.trim() || undefined,
            image_url: formImageUrl.trim() || undefined,
            banner_image_url: formBannerImageUrl.trim() || undefined,
            banner_heading: formBannerHeading.trim(),
            banner_subtitle: formBannerSubtitle.trim(),
            banner_media_type: formBannerMediaType,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          setCategories((prev) => [...prev, json.data]);
          showStatus("success", `Category "${json.data.name}" created! Live page is ready at /category/${json.data.slug}`);
          setModalOpen(false);
        } else {
          const json = await res.json();
          showStatus("error", json.error || "Failed to create category");
        }
      }
    } catch {
      showStatus("error", "Server communication error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: ProductCategory) => {
    try {
      setDeleting(true);
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== cat.id));
        showStatus("success", `Deleted category "${cat.name}"`);
        setDeleteConfirm(null);
      } else {
        const json = await res.json().catch(() => ({}));
        showStatus("error", json.error || "Failed to delete category");
      }
    } catch {
      showStatus("error", "Error communicating with server");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 w-full pb-16 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-purple-500/10 text-purple-700 border border-purple-200">
              Taxonomy & Silhouettes
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Category & Page Manager
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Every category you create automatically generates its own live storefront page at <code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-800 font-mono text-xs">/category/[slug]</code> with product grid and sorting.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={fetchCategories}
            disabled={loading}
            className="p-2.5 text-neutral-600 hover:text-black bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 shadow-xs transition cursor-pointer"
            title="Refresh Categories"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-black hover:bg-neutral-800 rounded-xl shadow-md transition cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Toast */}
      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 ${statusMsg.type === "success"
            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
            : "bg-red-50 text-red-800 border border-red-200"
            }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button
            onClick={() => setStatusMsg(null)}
            className="text-neutral-400 hover:text-neutral-700 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-400" />
          <p className="text-xs uppercase tracking-widest text-neutral-400">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50 space-y-4">
          <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center mx-auto text-neutral-500">
            <Tag className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">No Categories Found</h3>
            <p className="text-xs text-neutral-500">
              Create your first handbag category silhouette. It will immediately generate a live page.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-black hover:bg-neutral-800 rounded-lg shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Category</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs hover:border-black/30 transition-all flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-neutral-900">{cat.name}</h3>
                    <p className="text-xs font-mono text-neutral-400">/category/{cat.slug}</p>
                  </div>
                  {cat.image_url && (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                      <Image
                        src={cat.image_url}
                        alt={cat.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  )}
                </div>

                {cat.description && (
                  <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed font-light">
                    {cat.description}
                  </p>
                )}

                {cat.banner_image_url && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200/80 rounded-md w-fit">
                    {cat.banner_media_type === "video" ? (
                      <Film className="w-3 h-3 text-amber-700" />
                    ) : (
                      <ImageIcon className="w-3 h-3 text-amber-700" />
                    )}
                    <span className="text-[10px] font-semibold text-amber-900 uppercase tracking-wider">
                      Hero Banner Set ({cat.banner_media_type || "image"})
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                <Link
                  href={`/category/${cat.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 hover:text-black bg-neutral-50 hover:bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200/80 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Live Page</span>
                  <ExternalLink className="w-3 h-3 text-neutral-400" />
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(cat)}
                    className="p-2 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-lg transition cursor-pointer"
                    title="Edit Category"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(cat)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-100 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <h3 className="text-base font-bold text-neutral-900 uppercase">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Creating this category will automatically create its dynamic page at /category/[slug].
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-5 my-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={handleNameChange}
                  placeholder="e.g. Architectural Totes, Evening Minis, Wallets"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  URL Identifier (Slug) *
                </label>
                <div className="flex items-center rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-1.5 focus-within:border-black focus-within:bg-white">
                  <span className="text-xs font-mono text-neutral-400 shrink-0">/category/</span>
                  <input
                    type="text"
                    required
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                    placeholder="tote-bags"
                    className="w-full bg-transparent text-xs font-mono text-neutral-900 focus:outline-none ml-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Editorial Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Concise luxury narrative describing this silhouette collection..."
                  className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              {/* Storefront Round Silhouette / Avatar */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Storefront Round Silhouette Image
                </label>

                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md bg-neutral-200 shrink-0 flex items-center justify-center">
                    {formImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formImageUrl}
                        alt="Category Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[9px] text-neutral-400 text-center font-bold tracking-tight px-1 uppercase">
                        No Image
                      </span>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="url"
                      value={formImageUrl || ""}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... or upload below"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-black hover:bg-neutral-800 text-white rounded-lg cursor-pointer transition shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Round Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileForCropper}
                          className="hidden"
                        />
                      </label>

                      {formImageUrl && (
                        <button
                          type="button"
                          onClick={handleOpenCropperForExisting}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 rounded-lg cursor-pointer transition"
                        >
                          <Crop className="w-3.5 h-3.5 text-neutral-700" />
                          <span>Adjust Circle</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Shown in the round &quot;Our Collections&quot; row on the storefront.
                </p>
              </div>

              {/* NEW: Category Hero Banner Section */}
              <div className="pt-4 border-t border-neutral-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900">
                      Top Category Hero Banner (Page Header)
                    </label>
                    <p className="text-[11px] text-neutral-500">
                      Displayed across the top of <span className="font-mono text-neutral-700">/category/{formSlug || "[slug]"}</span> with cinematic background & typography.
                    </p>
                  </div>
                  {/* Media Type Toggle */}
                  <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
                    <button
                      type="button"
                      onClick={() => setFormBannerMediaType("image")}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                        formBannerMediaType === "image"
                          ? "bg-white text-black shadow-xs font-bold"
                          : "text-neutral-500 hover:text-neutral-800"
                      }`}
                    >
                      <ImageIcon className="w-3 h-3" />
                      Image
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormBannerMediaType("video")}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                        formBannerMediaType === "video"
                          ? "bg-white text-black shadow-xs font-bold"
                          : "text-neutral-500 hover:text-neutral-800"
                      }`}
                    >
                      <Film className="w-3 h-3" />
                      Video
                    </button>
                  </div>
                </div>

                <div className="space-y-3 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                  {/* Banner Heading & Subtitle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                        Banner Headline (Optional)
                      </label>
                      <input
                        type="text"
                        value={formBannerHeading}
                        onChange={(e) => setFormBannerHeading(e.target.value)}
                        placeholder="e.g. THE TOTE COLLECTION"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-black uppercase tracking-wider font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                        Banner Subtitle / Tagline (Optional)
                      </label>
                      <input
                        type="text"
                        value={formBannerSubtitle}
                        onChange={(e) => setFormBannerSubtitle(e.target.value)}
                        placeholder="e.g. Pure geometric precision & Italian leather"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                      />
                    </div>
                    <p className="text-[10px] text-neutral-400 col-span-1 sm:col-span-2">
                      Optional: Leave both empty if you want a clean banner image without any text overlay.
                    </p>
                  </div>

                  {/* Banner Media URL & Upload */}
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                      Banner {formBannerMediaType === "video" ? "Video" : "Image"} URL or File Upload
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formBannerImageUrl}
                        onChange={(e) => setFormBannerImageUrl(e.target.value)}
                        placeholder={`https://... (${formBannerMediaType === "video" ? "MP4 video URL" : "High-res Image URL"})`}
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                      />
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-neutral-900 hover:bg-black text-white rounded-lg cursor-pointer transition shrink-0">
                        {uploadingBanner ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : formBannerMediaType === "video" ? (
                          <Film className="w-3.5 h-3.5" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{uploadingBanner ? "Uploading..." : "Upload File"}</span>
                        <input
                          type="file"
                          accept={formBannerMediaType === "video" ? "video/mp4,video/webm" : "image/*"}
                          onChange={handleBannerUpload}
                          disabled={uploadingBanner}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Banner Preview Card */}
                  {formBannerImageUrl && (
                    <div className="relative w-full h-36 rounded-lg overflow-hidden border border-neutral-300 shadow-inner bg-black flex items-center justify-center">
                      {formBannerMediaType === "video" ? (
                        <video
                          src={formBannerImageUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover opacity-60"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={formBannerImageUrl}
                          alt="Banner Preview"
                          className="w-full h-full object-cover opacity-60"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4 text-white">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#B39359] mb-0.5">
                          {formBannerSubtitle || "Luxury Silhouettes"}
                        </span>
                        <h4 className="text-sm font-light tracking-widest uppercase">
                          {formBannerHeading || formName || "Category Banner"}
                        </h4>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-5 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-black rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-black hover:bg-neutral-800 rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Saving..." : editingCategory ? "Update Category" : "Create Category & Live Page"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-100 animate-in fade-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-neutral-900">
                Delete Category &quot;{deleteConfirm.name}&quot;?
              </h3>
              <p className="text-xs text-neutral-500">
                Are you sure? Removing this category will unlink any products attached to it.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-black bg-neutral-100 hover:bg-neutral-200 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirm)}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition cursor-pointer"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Circular Cropper Modal (Instagram PFP style) */}
      <CircularImageCropperModal
        isOpen={cropperOpen}
        initialImageUrl={cropperSourceUrl}
        onClose={() => setCropperOpen(false)}
        onCropComplete={(croppedUrl) => {
          setFormImageUrl(croppedUrl);
          setCropperOpen(false);
          showStatus("success", "Category circular image adjusted & ready!");
        }}
        title={`Adjust "${formName || "Category"}" Round Image`}
      />
    </div>
  );
}
