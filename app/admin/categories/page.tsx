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
  Smartphone,
  Monitor,
  X,
} from "lucide-react";
import { ProductCategory } from "@/types";
import { CircularImageCropperModal } from "@/components/admin/CircularImageCropperModal";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingRoundImage, setUploadingRoundImage] = useState(false);
  const [uploadingBannerDesktop, setUploadingBannerDesktop] = useState(false);
  const [uploadingBannerMobile, setUploadingBannerMobile] = useState(false);
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

  // Category Hero Banner Fields (Desktop + Mobile, No Fixed Size)
  const [formBannerImageUrl, setFormBannerImageUrl] = useState("");
  const [formBannerMobileImageUrl, setFormBannerMobileImageUrl] = useState("");
  const [formBannerHeading, setFormBannerHeading] = useState("");
  const [formBannerSubtitle, setFormBannerSubtitle] = useState("");
  const [formBannerMediaType, setFormBannerMediaType] = useState<"image" | "video">("image");

  // Circular Cropper state (Optional fine-tune tool)
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
    setFormBannerMobileImageUrl("");
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
    setFormBannerMobileImageUrl(cat.banner_mobile_image_url || "");
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

  // Direct Round Image Upload (Cloudinary, Any size up to 15MB, NO forced cropper)
  const handleRoundImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowed.includes(file.type)) {
      showStatus("error", "Please upload a valid image (JPG, PNG, WEBP, or AVIF).");
      return;
    }

    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      showStatus("error", "Image file exceeds 15MB limit.");
      return;
    }

    setUploadingRoundImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "dnora/categories");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Upload failed");
      }
      const data = await res.json();
      const newUrl = data.secure_url || data.url || data.media?.secure_url;
      if (!newUrl) throw new Error("No image URL returned from upload server");

      setFormImageUrl(newUrl);
      showStatus("success", "Category round image uploaded and set!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Image upload failed";
      showStatus("error", message);
    } finally {
      setUploadingRoundImage(false);
      e.target.value = "";
    }
  };

  // Category Hero Banner Upload (Desktop or Mobile, Images or Videos, No Fixed Size restriction)
  const handleBannerUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "desktop" | "mobile"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (!allowed.includes(file.type)) {
      showStatus("error", "Invalid file format. Please upload JPG, PNG, WEBP, AVIF, or MP4/WebM video.");
      return;
    }

    const isVideo = file.type.startsWith("video");
    const maxSize = isVideo ? 50 * 1024 * 1024 : 15 * 1024 * 1024;
    if (file.size > maxSize) {
      showStatus("error", `File size exceeds the limit of ${maxSize / (1024 * 1024)}MB.`);
      return;
    }

    if (target === "desktop") setUploadingBannerDesktop(true);
    else setUploadingBannerMobile(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "dnora/categories/banners");
      formData.append("resource_type", isVideo ? "video" : "image");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Banner upload failed");
      }

      const data = await res.json();
      const url = data.secure_url || data.url || data.media?.secure_url;
      if (!url) throw new Error("No URL returned from upload server");

      if (isVideo) {
        setFormBannerMediaType("video");
      }

      if (target === "desktop") {
        setFormBannerImageUrl(url);
        showStatus("success", "Desktop/Laptop banner uploaded successfully!");
      } else {
        setFormBannerMobileImageUrl(url);
        showStatus("success", "Mobile banner uploaded successfully!");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Banner upload failed";
      showStatus("error", message);
    } finally {
      if (target === "desktop") setUploadingBannerDesktop(false);
      else setUploadingBannerMobile(false);
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
      const payload = {
        name: formName.trim(),
        slug: formSlug.trim() || undefined,
        description: formDescription.trim(),
        image_url: formImageUrl.trim(),
        banner_image_url: formBannerImageUrl.trim(),
        banner_mobile_image_url: formBannerMobileImageUrl.trim(),
        banner_heading: formBannerHeading.trim(),
        banner_subtitle: formBannerSubtitle.trim(),
        banner_media_type: formBannerMediaType,
      };

      if (editingCategory) {
        // Update
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const json = await res.json();
          setCategories((prev) =>
            prev.map((c) => (c.id === editingCategory.id ? json.data : c))
          );
          showStatus("success", "Category updated successfully!");
          setModalOpen(false);
        } else {
          const json = await res.json().catch(() => ({}));
          showStatus("error", json.error || "Failed to update category");
        }
      } else {
        // Create
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const json = await res.json();
          setCategories((prev) => [...prev, json.data]);
          showStatus("success", `Category "${json.data.name}" created! Live page is ready at /category/${json.data.slug}`);
          setModalOpen(false);
        } else {
          const json = await res.json().catch(() => ({}));
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

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cat.image_url && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200/80 rounded-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider">
                        Round Image
                      </span>
                    </div>
                  )}
                  {cat.banner_image_url && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200/80 rounded-md">
                      <Monitor className="w-2.5 h-2.5 text-amber-700" />
                      <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider">
                        Desktop Banner
                      </span>
                    </div>
                  )}
                  {cat.banner_mobile_image_url && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-sky-50 border border-sky-200/80 rounded-md">
                      <Smartphone className="w-2.5 h-2.5 text-sky-700" />
                      <span className="text-[10px] font-semibold text-sky-800 uppercase tracking-wider">
                        Mobile Banner
                      </span>
                    </div>
                  )}
                </div>
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
                      placeholder="https://... image URL or click Upload below"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-black font-mono"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-black hover:bg-neutral-800 text-white rounded-lg cursor-pointer transition shadow-xs">
                        {uploadingRoundImage ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{uploadingRoundImage ? "Uploading..." : "Upload Round Image"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleRoundImageUpload}
                          disabled={uploadingRoundImage}
                          className="hidden"
                        />
                      </label>

                      {formImageUrl && (
                        <>
                          <button
                            type="button"
                            onClick={handleOpenCropperForExisting}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 rounded-lg cursor-pointer transition"
                            title="Fine-tune circular framing"
                          >
                            <Crop className="w-3.5 h-3.5 text-neutral-700" />
                            <span>Crop / Center</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setFormImageUrl("")}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 border border-transparent rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Shown in the round &quot;Our Collections&quot; row on the storefront. No strict dimension limits (auto-centered).
                </p>
              </div>

              {/* Category Hero Banner Section (Desktop & Mobile, No Fixed Size Restrictions) */}
              <div className="pt-4 border-t border-neutral-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900">
                      Category Hero Banner (Storefront Header)
                    </label>
                    <p className="text-[11px] text-neutral-500">
                      Cinematic header on <span className="font-mono text-neutral-700">/category/{formSlug || "[slug]"}</span> with separate desktop and mobile banners.
                    </p>
                  </div>

                  {/* Media Type Toggle */}
                  <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200 self-start sm:self-auto">
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

                <div className="space-y-4 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                  {/* Banner Heading & Subtitle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
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
                      <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
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
                      Leave empty if you prefer a clean background banner without text overlay.
                    </p>
                  </div>

                  {/* 1. Desktop / Laptop Banner */}
                  <div className="p-3 bg-white rounded-lg border border-neutral-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800">
                        <Monitor className="w-3.5 h-3.5 text-neutral-600" />
                        <span>Desktop / Laptop Banner ({formBannerMediaType === "video" ? "Video" : "Image"})</span>
                      </div>
                      <span className="text-[10px] text-neutral-400">Wide screens (no fixed size limits)</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formBannerImageUrl}
                        onChange={(e) => setFormBannerImageUrl(e.target.value)}
                        placeholder={`https://... (${formBannerMediaType === "video" ? "MP4 video URL" : "Desktop Banner Image URL"})`}
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-black font-mono"
                      />
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-neutral-900 hover:bg-black text-white rounded-lg cursor-pointer transition shrink-0">
                        {uploadingBannerDesktop ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : formBannerMediaType === "video" ? (
                          <Film className="w-3.5 h-3.5" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{uploadingBannerDesktop ? "Uploading..." : "Upload Desktop"}</span>
                        <input
                          type="file"
                          accept={formBannerMediaType === "video" ? "video/mp4,video/webm" : "image/*"}
                          onChange={(e) => handleBannerUpload(e, "desktop")}
                          disabled={uploadingBannerDesktop}
                          className="hidden"
                        />
                      </label>
                      {formBannerImageUrl && (
                        <button
                          type="button"
                          onClick={() => setFormBannerImageUrl("")}
                          className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg transition"
                          title="Clear Desktop Banner"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Desktop Preview */}
                    {formBannerImageUrl && (
                      <div className="relative w-full h-28 rounded-lg overflow-hidden border border-neutral-300 shadow-inner bg-black flex items-center justify-center mt-2">
                        {formBannerMediaType === "video" ? (
                          <video
                            src={formBannerImageUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover opacity-75"
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={formBannerImageUrl}
                            alt="Desktop Banner Preview"
                            className="w-full h-full object-cover opacity-75"
                          />
                        )}
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs rounded text-[9px] uppercase font-bold text-white tracking-wider flex items-center gap-1">
                          <Monitor className="w-2.5 h-2.5" /> Desktop Preview
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Mobile Banner */}
                  <div className="p-3 bg-white rounded-lg border border-neutral-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800">
                        <Smartphone className="w-3.5 h-3.5 text-neutral-600" />
                        <span>Mobile Banner ({formBannerMediaType === "video" ? "Video" : "Image"})</span>
                      </div>
                      <span className="text-[10px] text-neutral-400">Smartphones (no fixed size limits)</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formBannerMobileImageUrl}
                        onChange={(e) => setFormBannerMobileImageUrl(e.target.value)}
                        placeholder={`https://... (${formBannerMediaType === "video" ? "MP4 video URL" : "Mobile Banner Image URL"})`}
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-black font-mono"
                      />
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-neutral-900 hover:bg-black text-white rounded-lg cursor-pointer transition shrink-0">
                        {uploadingBannerMobile ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : formBannerMediaType === "video" ? (
                          <Film className="w-3.5 h-3.5" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{uploadingBannerMobile ? "Uploading..." : "Upload Mobile"}</span>
                        <input
                          type="file"
                          accept={formBannerMediaType === "video" ? "video/mp4,video/webm" : "image/*"}
                          onChange={(e) => handleBannerUpload(e, "mobile")}
                          disabled={uploadingBannerMobile}
                          className="hidden"
                        />
                      </label>
                      {formBannerMobileImageUrl && (
                        <button
                          type="button"
                          onClick={() => setFormBannerMobileImageUrl("")}
                          className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg transition"
                          title="Clear Mobile Banner"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Mobile Preview */}
                    {formBannerMobileImageUrl && (
                      <div className="relative w-full max-w-[200px] h-32 rounded-lg overflow-hidden border border-neutral-300 shadow-inner bg-black flex items-center justify-center mt-2">
                        {formBannerMediaType === "video" ? (
                          <video
                            src={formBannerMobileImageUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover opacity-75"
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={formBannerMobileImageUrl}
                            alt="Mobile Banner Preview"
                            className="w-full h-full object-cover opacity-75"
                          />
                        )}
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs rounded text-[9px] uppercase font-bold text-white tracking-wider flex items-center gap-1">
                          <Smartphone className="w-2.5 h-2.5" /> Mobile Preview
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-neutral-400">
                    💡 Tip: If you only upload a desktop banner, it will automatically adapt responsively for mobile screens as well.
                  </p>
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
                  disabled={saving || uploadingRoundImage || uploadingBannerDesktop || uploadingBannerMobile}
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
