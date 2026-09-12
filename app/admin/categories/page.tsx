"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Check,
  Upload,
  Loader2,
  RefreshCw,
  X,
  Eye,
  EyeOff,
  ExternalLink,
  Search,
} from "lucide-react";
import { Category } from "@/types";
import {
  getAllAdminCategories,
  saveAdminCategoriesOverride,
} from "@/lib/services/catalog-service";
import { uploadImageToStorage } from "@/lib/supabase/storage";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // New Category Form state
  const [createForm, setCreateForm] = useState({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    image_url:
      "https://www.charleskeith.in/dw/image/v2/BCWJ_PRD/on/demandware.static/-/Sites-in-products/default/dw0c35245a/images/hi-res/2026-L6-CK2-10160273-A-29-1.jpg?sw=600&q=80",
    display_order: 1,
    is_active: true,
  });

  // Edit Category Form state
  const [editForm, setEditForm] = useState({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    image_url: "",
    display_order: 1,
    is_active: true,
  });

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const loadCategories = async () => {
    setIsLoading(true);
    const data = await getAllAdminCategories();
    setCategories(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Save to persistence
  const persistCategories = async (updated: Category[]) => {
    setCategories(updated);
    saveAdminCategoriesOverride(updated);

    // Sync to Supabase if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("categories").upsert(
          updated.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            tagline: c.tagline || "",
            description: c.description || "",
            image_url: c.image_url,
            display_order: c.display_order,
            is_active: c.is_active,
          }))
        );
      } catch (err) {
        console.warn("Supabase category sync note:", err);
      }
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setEditForm({
      name: cat.name,
      slug: cat.slug,
      tagline: cat.tagline || "",
      description: cat.description || "",
      image_url: cat.image_url,
      display_order: cat.display_order,
      is_active: cat.is_active !== false,
    });
    setUploadError(null);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    const updated = categories.map((cat) => {
      if (cat.id === editingCategory.id) {
        return {
          ...cat,
          name: editForm.name.trim(),
          slug: editForm.slug.trim().toLowerCase().replace(/\s+/g, "-"),
          tagline: editForm.tagline.trim(),
          description: editForm.description.trim(),
          image_url: editForm.image_url.trim(),
          hero_image_url: cat.hero_image_url || editForm.image_url.trim(),
          display_order: Number(editForm.display_order) || 1,
          is_active: editForm.is_active,
        };
      }
      return cat;
    });

    await persistCategories(updated);
    setEditingCategory(null);
    showNotification(`Category "${editForm.name}" updated successfully.`);
  };

  // Create Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;

    const slug =
      createForm.slug.trim().toLowerCase().replace(/\s+/g, "-") ||
      createForm.name.trim().toLowerCase().replace(/\s+/g, "-");

    const newCat: Category = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `cat_${Date.now()}`,
      name: createForm.name.trim(),
      slug,
      tagline: createForm.tagline.trim(),
      description: createForm.description.trim(),
      image_url: createForm.image_url.trim(),
      hero_image_url: createForm.image_url.trim(),
      display_order: Number(createForm.display_order) || categories.length + 1,
      is_active: createForm.is_active,
    };

    const updated = [...categories, newCat].sort(
      (a, b) => a.display_order - b.display_order
    );

    await persistCategories(updated);
    setIsCreateModalOpen(false);
    setCreateForm({
      name: "",
      slug: "",
      tagline: "",
      description: "",
      image_url:
        "https://www.charleskeith.in/dw/image/v2/BCWJ_PRD/on/demandware.static/-/Sites-in-products/default/dw0c35245a/images/hi-res/2026-L6-CK2-10160273-A-29-1.jpg?sw=600&q=80",
      display_order: updated.length + 1,
      is_active: true,
    });
    showNotification(`New category "${newCat.name}" created successfully.`);
  };

  // Delete Category
  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the category "${name}"?`)) {
      return;
    }

    const updated = categories.filter((c) => c.id !== id);
    await persistCategories(updated);

    // If Supabase configured, remove from table
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("categories").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase category deletion note:", err);
      }
    }

    showNotification(`Category "${name}" deleted successfully.`);
  };

  // Toggle Category Active Status
  const handleToggleActive = async (id: string) => {
    const updated = categories.map((c) =>
      c.id === id ? { ...c, is_active: !c.is_active } : c
    );
    await persistCategories(updated);
    const cat = updated.find((c) => c.id === id);
    showNotification(
      `Category "${cat?.name}" is now ${cat?.is_active ? "Live" : "Hidden"}.`
    );
  };


  // Image Upload handler
  const handleImageUpload = async (
    file: File,
    target: "create" | "edit"
  ) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const res = await uploadImageToStorage("categories", file);
      if (res.url) {
        if (target === "create") {
          setCreateForm((prev) => ({ ...prev, image_url: res.url! }));
        } else {
          setEditForm((prev) => ({ ...prev, image_url: res.url! }));
        }
        showNotification("Category image uploaded successfully.");
      } else if (res.error) {
        setUploadError(res.error);
      }
    } catch (err: any) {
      setUploadError(err.message || "Image upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      (c.description &&
        c.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-white border border-emerald-300 text-emerald-800 text-xs font-medium shadow-2xl flex items-center gap-2.5 animate-bounce">
          <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#9E7D4E] font-semibold font-mono">
              Taxonomy &amp; Architecture
            </span>
            <span className="text-[9px] uppercase tracking-wider text-[#9E7D4E] bg-[#C5A880]/15 px-2 py-0.5 rounded-full border border-[#C5A880]/30 font-mono font-medium">
              Storefront Rails
            </span>
          </div>
          <h1 className="font-sans text-2xl sm:text-3xl text-[#0F172A] uppercase tracking-[0.14em] font-bold mt-1">
            Category Realms
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Curate category showcases, edit titles, upload realm imagery, adjust display order, and remove categories.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => {
              setCreateForm((prev) => ({
                ...prev,
                display_order: categories.length + 1,
              }));
              setIsCreateModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl neu-btn-gold text-xs uppercase tracking-widest font-bold text-white transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Category</span>
          </button>
        </div>
      </div>

      {/* Search & Quick Stats Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-96 relative">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name, slug or description..."
            className="w-full pl-10 pr-4 py-3 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50 transition-all font-mono"
          />
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-[#64748B]">
          <span className="px-3 py-1.5 rounded-xl neu-inset-sm bg-[#F1F5F9]">
            Total: <strong className="text-[#0F172A]">{categories.length}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl neu-inset-sm bg-[#F1F5F9]">
            Active:{" "}
            <strong className="text-[#10B981]">
              {categories.filter((c) => c.is_active !== false).length}
            </strong>
          </span>
        </div>
      </div>

      {/* Category Grid */}
      {isLoading ? (
        <div className="p-16 text-center text-[#64748B] neu-card bg-white rounded-3xl">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-[#9E7D4E] mb-3" />
          <p className="text-xs uppercase tracking-wider font-mono">
            Loading category taxonomy...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center text-[#64748B] border border-dashed border-slate-200 bg-white rounded-3xl space-y-3">
          <FolderTree className="w-10 h-10 mx-auto text-[#9E7D4E]/50 mb-2" />
          <p className="text-sm font-semibold uppercase tracking-wider text-[#0F172A]">
            No Category Realms Found
          </p>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            No category realms found. Click &quot;New Category&quot; to create and curate category collections.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-3xl neu-card p-5 space-y-4 border border-slate-200/80 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Category Image Preview & Order Badge */}
                <div className="relative aspect-[16/10] w-full bg-[#F1F5F9] overflow-hidden rounded-2xl border border-slate-200/70">
                  <Image
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    className="object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-white/90 backdrop-blur-xs text-[#0F172A] text-[10px] font-mono font-bold rounded-lg shadow-sm">
                    Rank #{cat.display_order}
                  </span>

                  <button
                    onClick={() => handleToggleActive(cat.id)}
                    title={cat.is_active !== false ? "Click to Hide" : "Click to Publish"}
                    className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 backdrop-blur-xs cursor-pointer shadow-sm ${
                      cat.is_active !== false
                        ? "bg-emerald-500/90 text-white"
                        : "bg-slate-700/80 text-white"
                    }`}
                  >
                    {cat.is_active !== false ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3" />
                    )}
                    <span>{cat.is_active !== false ? "Live" : "Draft"}</span>
                  </button>
                </div>

                {/* Text Information */}
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-sans font-bold text-base text-[#0F172A] uppercase tracking-wider">
                      {cat.name}
                    </h3>
                  </div>

                  {cat.tagline && (
                    <p className="text-xs font-mono text-[#9E7D4E] font-medium">
                      {cat.tagline}
                    </p>
                  )}

                  <p className="text-[#64748B] text-xs line-clamp-2 leading-relaxed">
                    {cat.description || "No description provided."}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-[#64748B]">
                    <span className="bg-[#F1F5F9] px-2 py-0.5 rounded text-[#0F172A]">
                      /shop/{cat.slug}
                    </span>
                    <a
                      href={`/shop/${cat.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#9E7D4E] flex items-center gap-1"
                    >
                      <span>Storefront</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons: EDIT and DELETE */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="flex-1 py-2.5 px-3 rounded-xl neu-btn text-xs font-semibold text-[#0F172A] hover:text-[#9E7D4E] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#9E7D4E]" />
                  <span>Edit Category</span>
                </button>

                <button
                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                  title="Delete Category"
                  className="p-2.5 rounded-xl neu-btn text-[#64748B] hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          MODAL 1: EDIT CATEGORY
          ========================================================================= */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="rounded-3xl neu-card bg-white p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto text-xs space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#9E7D4E] font-mono font-semibold">
                  Taxonomy Editor
                </span>
                <h3 className="font-sans font-bold text-lg text-[#0F172A] uppercase tracking-wider mt-0.5">
                  Edit Category: {editingCategory.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingCategory(null)}
                className="p-2 rounded-xl neu-btn text-[#64748B] hover:text-[#0F172A] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono font-semibold">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full p-3 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono font-semibold">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.slug}
                    onChange={(e) =>
                      setEditForm({ ...editForm, slug: e.target.value })
                    }
                    className="w-full p-3 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono font-semibold">
                  Tagline / Catchphrase
                </label>
                <input
                  type="text"
                  value={editForm.tagline}
                  onChange={(e) =>
                    setEditForm({ ...editForm, tagline: e.target.value })
                  }
                  placeholder="e.g. Sculptural Two-Way Silhouettes"
                  className="w-full p-3 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono font-semibold">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="w-full p-3 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50 leading-relaxed"
                />
              </div>

              {/* Category Image URL & Upload */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono font-semibold">
                  Category Showcase Image *
                </label>

                <div className="flex gap-4 items-center">
                  <div className="relative w-20 h-16 rounded-xl neu-inset bg-[#F1F5F9] overflow-hidden flex-shrink-0 border border-slate-200">
                    {editForm.image_url ? (
                      <Image
                        src={editForm.image_url}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#94A3B8] text-[10px]">
                        No img
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="url"
                      required
                      value={editForm.image_url}
                      onChange={(e) =>
                        setEditForm({ ...editForm, image_url: e.target.value })
                      }
                      placeholder="https://..."
                      className="w-full p-2.5 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50 font-mono"
                    />

                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-xl neu-btn text-[11px] text-[#0F172A] font-medium cursor-pointer flex items-center gap-1.5 hover:text-[#9E7D4E]">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploading ? "Uploading..." : "Upload New File"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleImageUpload(e.target.files[0], "edit");
                            }
                          }}
                        />
                      </label>
                      {uploadError && (
                        <span className="text-[10px] text-red-500 font-mono">
                          {uploadError}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono font-semibold">
                    Display Order / Sequence
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editForm.display_order}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        display_order: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full p-3 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono font-semibold">
                    Storefront Visibility
                  </label>
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="edit_is_active"
                      checked={editForm.is_active}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          is_active: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-[#C5A880] focus:ring-[#C5A880] cursor-pointer"
                    />
                    <label
                      htmlFor="edit_is_active"
                      className="text-xs text-[#0F172A] font-medium cursor-pointer"
                    >
                      Active on Storefront
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-5 py-2.5 rounded-xl neu-btn text-xs font-semibold text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl neu-btn-gold text-xs font-bold uppercase tracking-wider text-white cursor-pointer"
                >
                  Save Category Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ADD NEW CATEGORY
          ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="rounded-3xl neu-card bg-white p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto text-xs space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#9E7D4E] font-mono font-semibold">
                  New Realm
                </span>
                <h3 className="font-sans font-bold text-lg text-[#0F172A] uppercase tracking-wider mt-0.5">
                  Create Category Realm
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl neu-btn text-[#64748B] hover:text-[#0F172A] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono font-semibold">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/\s+/g, "-");
                      setCreateForm({ ...createForm, name, slug });
                    }}
                    placeholder="e.g. Crossbody Bags"
                    className="w-full p-3 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono font-semibold">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.slug}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, slug: e.target.value })
                    }
                    placeholder="e.g. crossbody-bags"
                    className="w-full p-3 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono font-semibold">
                  Tagline / Catchphrase
                </label>
                <input
                  type="text"
                  value={createForm.tagline}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, tagline: e.target.value })
                  }
                  placeholder="e.g. Hands-Free Urban Chic"
                  className="w-full p-3 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono font-semibold">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Artisanal description of this collection..."
                  className="w-full p-3 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50 leading-relaxed"
                />
              </div>

              {/* Image URL & Upload */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono font-semibold">
                  Category Showcase Image *
                </label>

                <div className="flex gap-4 items-center">
                  <div className="relative w-20 h-16 rounded-xl neu-inset bg-[#F1F5F9] overflow-hidden flex-shrink-0 border border-slate-200">
                    {createForm.image_url ? (
                      <Image
                        src={createForm.image_url}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#94A3B8] text-[10px]">
                        No img
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="url"
                      required
                      value={createForm.image_url}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          image_url: e.target.value,
                        })
                      }
                      placeholder="https://..."
                      className="w-full p-2.5 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50 font-mono"
                    />

                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-xl neu-btn text-[11px] text-[#0F172A] font-medium cursor-pointer flex items-center gap-1.5 hover:text-[#9E7D4E]">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploading ? "Uploading..." : "Upload New File"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleImageUpload(e.target.files[0], "create");
                            }
                          }}
                        />
                      </label>
                      {uploadError && (
                        <span className="text-[10px] text-red-500 font-mono">
                          {uploadError}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono font-semibold">
                    Display Order / Sequence
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={createForm.display_order}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        display_order: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full p-3 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono font-semibold">
                    Storefront Visibility
                  </label>
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="create_is_active"
                      checked={createForm.is_active}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          is_active: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-[#C5A880] focus:ring-[#C5A880] cursor-pointer"
                    />
                    <label
                      htmlFor="create_is_active"
                      className="text-xs text-[#0F172A] font-medium cursor-pointer"
                    >
                      Active on Storefront
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl neu-btn text-xs font-semibold text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl neu-btn-gold text-xs font-bold uppercase tracking-wider text-white cursor-pointer"
                >
                  Create Category Realm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
