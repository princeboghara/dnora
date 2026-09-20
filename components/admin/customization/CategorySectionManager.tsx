"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  ImageIcon,
  Upload,
  Loader2,
  Folder,
  ExternalLink,
  Check,
} from "lucide-react";
import { ProductCategory } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { slugify } from "@/lib/utils";
import { uploadFileWithProgress } from "@/lib/upload-utils";
import { CircularProgress } from "@/components/ui/CircularProgress";

interface CategorySectionManagerProps {
  onCategoriesChange?: (categories: ProductCategory[]) => void;
}

export function CategorySectionManager({ onCategoriesChange }: CategorySectionManagerProps) {
  const { success, error } = useToast();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isAutoSlug, setIsAutoSlug] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`/api/categories?t=${Date.now()}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCategories(json.data);
        if (onCategoriesChange) onCategoriesChange(json.data);
      }
    } catch {
      error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setImageUrl("");
    setIsAutoSlug(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: ProductCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setImageUrl(cat.image_url || "");
    setIsAutoSlug(false);
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (isAutoSlug) {
      setSlug(slugify(val));
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadProgress(10);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "dnora/categories");

      const data = await uploadFileWithProgress<{ success: boolean; media: { secure_url: string }; error?: string }>(
        "/api/media/upload",
        formData,
        (percent) => setUploadProgress(percent)
      );

      if (!data.success || !data.media) {
        throw new Error(data.error || "Upload failed");
      }

      setImageUrl(data.media.secure_url);
      setUploadProgress(100);
      success("Category image uploaded successfully.");
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
    }
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error("Category name is required.");
      return;
    }

    setSubmitting(true);
    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || slugify(name),
          description: description.trim() || undefined,
          image_url: imageUrl.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Operation failed");
      }

      success(editingCategory ? "Category updated." : "Category created.");
      setModalOpen(false);
      fetchCategories();
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${catName}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to delete");
      }
      success("Category deleted.");
      fetchCategories();
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs space-y-0">
      {/* Header bar */}
      <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Folder className="w-4 h-4 text-indigo-600" />
            <span>Category Master ({categories.length})</span>
          </h3>
          <p className="text-xs text-slate-500">
            Create and edit boutique categories. Changes sync immediately to the storefront circular carousel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 w-44 sm:w-56 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Add Category Button */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-b from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-[0_2px_8px_rgba(79,70,229,0.3)] active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          <span>Loading categories...</span>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-10 text-center text-xs text-slate-400">
          No categories found. Click &quot;Add Category&quot; to create a new category.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-5">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="group p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-xs transition-all flex items-center gap-3"
            >
              <div className="relative w-14 h-14 rounded-full overflow-hidden bg-slate-200 border border-slate-200/90 shrink-0">
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-xs font-bold text-slate-900 truncate">{cat.name}</p>
                <p className="text-[11px] font-mono text-slate-400 truncate">/{cat.slug}</p>
                {cat.product_count !== undefined && (
                  <span className="text-[10px] text-indigo-600 font-semibold">
                    {cat.product_count} products
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(cat)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Edit Category"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete Category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? `Edit "${editingCategory.name}"` : "Create New Category"}
      >
        <form onSubmit={handleSubmitCategory} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Category Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Shoulder Bags"
              required
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Slug Identifier *
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setIsAutoSlug(false);
              }}
              placeholder="e.g. shoulder-bags"
              required
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief summary of this luxury collection category"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </div>

          {/* Category Image Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Category Silhouette Image
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                {imageUrl ? (
                  <img src={imageUrl} alt="Category preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                >
                  {uploadingImage ? (
                    <>
                      <CircularProgress progress={uploadProgress} size={16} strokeWidth={2} />
                      <span>Uploading ({uploadProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Upload Image</span>
                    </>
                  )}
                </button>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Or enter direct image URL..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingImage}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
            >
              {submitting ? "Saving..." : editingCategory ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
