"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Folder,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Loader2,
  Search,
  ImageIcon,
  Upload,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { ProductCategory } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { slugify } from "@/lib/utils";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { uploadFileWithProgress } from "@/lib/upload-utils";
import { ImageCropperModal } from "@/components/admin/ImageCropperModal";

export default function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isAutoSlug, setIsAutoSlug] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Instagram-Style Cropper State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<ProductCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`/api/categories?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const json = await res.json();
      if (json.success) {
        setCategories(json.data || []);
      } else {
        showToast(json.error || "Failed to load categories", "error");
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
      showToast("Network error while loading categories", "error");
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        const res = await fetch(`/api/categories?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        const json = await res.json();
        if (!ignore) {
          if (json.success) {
            setCategories(json.data || []);
          } else {
            showToast(json.error || "Failed to load categories", "error");
          }
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
        if (!ignore) showToast("Network error while loading categories", "error");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadData();
    return () => {
      ignore = true;
    };
  }, [showToast]);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setImageUrl("");
    setRawImageSrc(null);
    setIsAutoSlug(true);
    setModalOpen(true);
  };

  const handleOpenEditModal = (cat: ProductCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setImageUrl(cat.image_url || "");
    setRawImageSrc(cat.image_url || null);
    setIsAutoSlug(false);
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (isAutoSlug) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlug(val);
    setIsAutoSlug(false);
  };

  // Image Selection -> Opens Instagram-Style Cropper Modal
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file (JPG, PNG, WEBP)", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result as string);
      setCropModalOpen(true);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  // Upload the cropped blob directly to Cloudinary
  const handleCropComplete = async (croppedBlob: Blob) => {
    try {
      setUploadingImage(true);
      setUploadProgress(20);

      const formData = new FormData();
      formData.append("file", croppedBlob, `${slugify(name || "category")}-${Date.now()}.jpg`);
      formData.append("folder", "dnora/categories");
      formData.append("resource_type", "image");

      const res = await uploadFileWithProgress<{
        success: boolean;
        media?: { secure_url: string };
        error?: string;
      }>("/api/media/upload", formData, (percent) => {
        setUploadProgress(Math.max(20, percent));
      });

      if (res.success && res.media?.secure_url) {
        setImageUrl(res.media.secure_url);
        setUploadProgress(100);
        showToast("Category photo cropped and uploaded successfully!", "success");
      } else {
        throw new Error(res.error || "Upload failed");
      }
    } catch (err: unknown) {
      console.error("Upload error:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to upload image.";
      showToast(errMsg, "error");
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Category name is required", "error");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        slug: slug.trim() ? slugify(slug) : slugify(name),
        description: description.trim() || undefined,
        image_url: imageUrl || "",
      };

      let res;
      if (editingCategory) {
        res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (json.success) {
        showToast(
          editingCategory ? "Category updated successfully" : "Category created successfully",
          "success"
        );
        setModalOpen(false);
        fetchCategories();
      } else {
        showToast(json.error || "Failed to save category", "error");
      }
    } catch (err) {
      console.error("Failed to save category:", err);
      showToast("An unexpected error occurred", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    const targetId = deletingCategory.id;
    const targetName = deletingCategory.name;

    setCategories((prev) => prev.filter((c) => c.id !== targetId));
    setDeleteModalOpen(false);
    setDeletingCategory(null);
    showToast(`"${targetName}" deleted successfully`, "success");

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/categories/${targetId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) {
        fetchCategories();
        showToast(json.error || "Failed to delete category", "error");
      }
    } catch (err) {
      console.error("Failed to delete category:", err);
      fetchCategories();
      showToast("An unexpected error occurred", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-900">
              <Folder className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight text-slate-900 uppercase">
                Category Master
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage circular categories, photos, and storefront navigation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total Categories: <strong className="text-slate-900">{filteredCategories.length}</strong>
        </div>
      </div>

      {/* Categories Grid (Round Cards) */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-slate-900 mb-2" />
          <p className="text-xs text-slate-500">Loading categories...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 text-center px-4">
          <Folder className="w-12 h-12 text-slate-300 mb-3" />
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-1">
            No Categories Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mb-4">
            {search
              ? "No categories matched your search criteria."
              : "Get started by creating your first product category."}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Category</span>
          </button>
        </div>
      ) : (
        /* ROUND SHAPED CATEGORY CARDS GRID */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-400 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center justify-between"
            >
              {/* Centered Round Circular Category Card Image */}
              <div className="flex flex-col items-center w-full">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-50 shadow-xs mb-3 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center shrink-0">
                  {cat.image_url ? (
                    <Image
                      src={cat.image_url}
                      alt={cat.name}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <ImageIcon className="w-8 h-8 stroke-1 text-slate-400" />
                    </div>
                  )}
                </div>

                {/* Category Name & Slug */}
                <h3 className="text-xs sm:text-sm font-heading font-bold text-slate-900 uppercase tracking-tight line-clamp-1 w-full">
                  {cat.name}
                </h3>
                <span className="inline-block mt-1 px-2.5 py-0.5 bg-slate-100 rounded-full font-mono text-[9px] sm:text-[10px] text-slate-600 border border-slate-200 truncate max-w-full">
                  /{cat.slug}
                </span>

                {cat.description && (
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                    {cat.description}
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="w-full pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-1">
                <Link
                  href={`/category/${cat.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                  title="View Storefront Page"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span className="hidden min-[420px]:inline">Store</span>
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(cat)}
                    title="Edit Category"
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeletingCategory(cat);
                      setDeleteModalOpen(true);
                    }}
                    title="Delete Category"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-heading font-bold text-slate-900">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                type="button"
                onClick={() => !submitting && setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tote Bags, Luxury Clutches"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors"
                />
              </div>

              {/* URL Slug */}
              <div>
                <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1.5">
                  URL Slug *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs text-slate-400 font-mono select-none">
                    /category/
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="tote-bags"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="w-full pl-24 pr-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors"
                  />
                </div>
              </div>

              {/* Category Image Upload (With Instagram-style Cropper) */}
              <div>
                <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1.5">
                  Category Photo (Circular Silhouette)
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                    {imageUrl ? (
                      <Image src={imageUrl} alt="Category preview" fill className="object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    )}
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <CircularProgress progress={uploadProgress} size={32} strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{imageUrl ? "Crop & Change Photo" : "Upload & Crop Photo"}</span>
                    </button>
                    <p className="text-[10px] text-slate-500">
                      Instagram-style zoom, pan &amp; crop anywhere on the image.
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short overview of this category..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-2xs transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{editingCategory ? "Update Category" : "Save Category"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white max-w-sm w-full p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-heading font-bold text-slate-900">
                Delete &quot;{deletingCategory.name}&quot;?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                This category will be permanently removed from the storefront navigation.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instagram-Style Image Cropper Modal */}
      <ImageCropperModal
        isOpen={cropModalOpen}
        imageSrc={rawImageSrc}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={handleCropComplete}
        initialAspectRatio="1:1"
        title="Crop Category Photo"
      />
    </div>
  );
}
