"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Check,
  Upload,
  Loader2,
  X,
  Eye,
  EyeOff,
  ExternalLink,
  Search,
  Lock,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ZoomIn,
  Move,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Category } from "@/types";
import {
  getAllAdminCategories,
  saveAdminCategoriesOverride,
} from "@/lib/services/catalog-service";
import { uploadImageToStorage } from "@/lib/supabase/storage";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

// =========================================================================
// SUB-COMPONENT: Instagram-Style Circular Profile Picture Adjuster
// =========================================================================
interface CircularPfpEditorProps {
  imageUrl: string;
  zoom: number;
  x: number;
  y: number;
  name?: string;
  onZoomChange: (z: number) => void;
  onXChange: (x: number) => void;
  onYChange: (y: number) => void;
  onReset: () => void;
}

function CircularPfpEditor({
  imageUrl,
  zoom,
  x,
  y,
  name,
  onZoomChange,
  onXChange,
  onYChange,
  onReset,
}: CircularPfpEditorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, startX: 0, startY: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageUrl) return;
    setIsDragging(true);
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: x,
      startY: y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = (e.clientX - dragStart.current.mouseX) * 0.35;
    const deltaY = (e.clientY - dragStart.current.mouseY) * 0.35;
    const nextX = Math.round(Math.max(-45, Math.min(45, dragStart.current.startX + deltaX)));
    const nextY = Math.round(Math.max(-45, Math.min(45, dragStart.current.startY + deltaY)));
    onXChange(nextX);
    onYChange(nextY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#C5A880]/20 flex items-center justify-center text-[#9E7D4E]">
            <Sparkles className="w-3 h-3" />
          </div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0F172A]">
            Circular Avatar Adjuster (Instagram PFP Style)
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#9E7D4E] bg-[#C5A880]/15 px-2 py-0.5 rounded-full border border-[#C5A880]/30 font-medium">
          Storefront Mirror
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Instagram Circular Viewport */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`relative w-40 h-40 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 border-[#C5A880] shadow-xl bg-slate-900 select-none ${
              imageUrl ? "cursor-grab active:cursor-grabbing" : "cursor-not-allowed"
            }`}
          >
            {imageUrl ? (
              <div
                className="w-full h-full relative"
                style={{
                  transform: `scale(${zoom}) translate(${x}%, ${y}%)`,
                  transformOrigin: "center center",
                  transition: isDragging ? "none" : "transform 0.15s ease-out",
                }}
              >
                <Image
                  src={imageUrl}
                  alt={name || "Category frame"}
                  fill
                  unoptimized
                  className="object-cover pointer-events-none"
                />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                <Upload className="w-6 h-6 mb-1 text-slate-500" />
                <span className="text-[10px] font-mono">Upload image to adjust circular avatar</span>
              </div>
            )}

            {/* Subtle Instagram Centering Crosshairs */}
            {imageUrl && (
              <div className="absolute inset-0 pointer-events-none border border-white/20 rounded-full flex items-center justify-center">
                <div className="w-full h-[1px] bg-white/20" />
                <div className="h-full w-[1px] bg-white/20 absolute" />
              </div>
            )}
          </div>

          <p className="text-[10px] text-[#64748B] font-mono text-center">
            {imageUrl ? "👆 Click & drag inside circle to pan position" : "Provide image URL or upload file"}
          </p>
        </div>

        {/* Controls: Zoom, Pan X/Y, Reset */}
        <div className="space-y-3">
          {/* Zoom Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#64748B] flex items-center gap-1">
                <ZoomIn className="w-3.5 h-3.5 text-[#9E7D4E]" />
                Zoom (Scale)
              </span>
              <span className="text-[#0F172A] font-bold">{(zoom * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onZoomChange(Math.max(1, +(zoom - 0.05).toFixed(2)))}
                className="w-7 h-7 rounded-lg neu-btn flex items-center justify-center text-xs font-bold text-[#64748B] hover:text-[#0F172A]"
              >
                -
              </button>
              <input
                type="range"
                min={1}
                max={2.5}
                step={0.02}
                value={zoom}
                onChange={(e) => onZoomChange(parseFloat(e.target.value))}
                className="flex-1 accent-[#C5A880] cursor-pointer"
              />
              <button
                type="button"
                onClick={() => onZoomChange(Math.min(2.5, +(zoom + 0.05).toFixed(2)))}
                className="w-7 h-7 rounded-lg neu-btn flex items-center justify-center text-xs font-bold text-[#64748B] hover:text-[#0F172A]"
              >
                +
              </button>
            </div>
          </div>

          {/* Horizontal Pan X */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#64748B] flex items-center gap-1">
                <Move className="w-3.5 h-3.5 text-[#9E7D4E]" />
                Horizontal Pan (X)
              </span>
              <span className="text-[#0F172A] font-bold">{x > 0 ? `+${x}%` : `${x}%`}</span>
            </div>
            <input
              type="range"
              min={-40}
              max={40}
              step={1}
              value={x}
              onChange={(e) => onXChange(parseInt(e.target.value))}
              className="w-full accent-[#C5A880] cursor-pointer"
            />
          </div>

          {/* Vertical Pan Y */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#64748B] flex items-center gap-1">
                <Move className="w-3.5 h-3.5 text-[#9E7D4E] rotate-90" />
                Vertical Pan (Y)
              </span>
              <span className="text-[#0F172A] font-bold">{y > 0 ? `+${y}%` : `${y}%`}</span>
            </div>
            <input
              type="range"
              min={-40}
              max={40}
              step={1}
              value={y}
              onChange={(e) => onYChange(parseInt(e.target.value))}
              className="w-full accent-[#C5A880] cursor-pointer"
            />
          </div>

          {/* Reset button */}
          <div className="pt-1 flex items-center justify-between">
            <button
              type="button"
              onClick={onReset}
              className="px-3 py-1.5 rounded-xl neu-btn text-[11px] font-mono font-medium text-[#64748B] hover:text-[#0F172A] flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3 text-[#9E7D4E]" />
              <span>Center &amp; Reset (1.0x)</span>
            </button>
            <span className="text-[10px] font-mono text-[#94A3B8]">
              Synced to Homepage Rail
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// MAIN COMPONENT: Admin Categories Page
// =========================================================================
export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  // Drag-and-drop state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // New Category Form state (empty image_url, no dummy URLs)
  const [createForm, setCreateForm] = useState({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    image_url: "",
    display_order: 1,
    is_active: true,
    image_zoom: 1,
    image_x: 0,
    image_y: 0,
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
    image_zoom: 1,
    image_x: 0,
    image_y: 0,
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
            image_zoom: c.image_zoom || 1,
            image_x: c.image_x || 0,
            image_y: c.image_y || 0,
          }))
        );
      } catch (err) {
        console.warn("Supabase category sync note:", err);
      }
    }
  };

  // Drag and drop reordering
  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (dropIdx: number) => {
    if (draggedIdx === null || draggedIdx === dropIdx) return;
    const reordered = [...categories];
    const [moved] = reordered.splice(draggedIdx, 1);
    reordered.splice(dropIdx, 0, moved);

    const finalOrdered = reordered.map((c, i) => ({
      ...c,
      display_order: i + 1,
    }));

    setDraggedIdx(null);
    await persistCategories(finalOrdered);
    showNotification("Category realms reordered successfully.");
  };

  // Quick Move Up / Down
  const handleMove = async (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= categories.length) return;

    const reordered = [...categories];
    const temp = reordered[idx];
    reordered[idx] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    const finalOrdered = reordered.map((c, i) => ({
      ...c,
      display_order: i + 1,
    }));

    await persistCategories(finalOrdered);
    showNotification("Category order updated.");
  };

  // Open Edit Modal (Category Realm Slug locked)
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
      image_zoom: cat.image_zoom || 1,
      image_x: cat.image_x || 0,
      image_y: cat.image_y || 0,
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
          // Slug remains locked to editingCategory.slug to preserve links
          slug: editingCategory.slug,
          tagline: editForm.tagline.trim(),
          description: editForm.description.trim(),
          image_url: editForm.image_url.trim(),
          hero_image_url: cat.hero_image_url || editForm.image_url.trim(),
          display_order: Number(editForm.display_order) || 1,
          is_active: editForm.is_active,
          image_zoom: editForm.image_zoom || 1,
          image_x: editForm.image_x || 0,
          image_y: editForm.image_y || 0,
        };
      }
      return cat;
    });

    await persistCategories(updated);
    setEditingCategory(null);
    showNotification(`Category "${editForm.name}" updated successfully.`);
  };

  // Create Category (Slug auto-generated and locked)
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;

    const slug =
      createForm.slug.trim().toLowerCase().replace(/\s+/g, "-") ||
      createForm.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");

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
      image_zoom: createForm.image_zoom || 1,
      image_x: createForm.image_x || 0,
      image_y: createForm.image_y || 0,
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
      image_url: "",
      display_order: updated.length + 1,
      is_active: true,
      image_zoom: 1,
      image_x: 0,
      image_y: 0,
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
            Reorder category sequences via drag-and-drop, adjust circular Instagram avatars, and lock realm identifiers.
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
            className="px-5 py-2.5 rounded-xl neu-btn-gold text-xs uppercase tracking-widest font-bold text-white transition-all flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
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
          <span className="px-3 py-1.5 rounded-xl neu-inset-sm bg-[#F1F5F9] hidden sm:inline-block">
            Drag to Reorder Enabled
          </span>
        </div>
      </div>

      {/* Category Grid / Drag-and-Drop List */}
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
          {filtered.map((cat, idx) => (
            <div
              key={cat.id}
              draggable={true}
              onDragStart={() => handleDragStart(idx)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(idx)}
              className={`bg-white rounded-3xl neu-card p-5 space-y-4 border transition-all flex flex-col justify-between select-none ${
                draggedIdx === idx
                  ? "opacity-50 ring-2 ring-[#C5A880] border-[#C5A880]"
                  : "border-slate-200/80 hover:shadow-lg hover:border-[#C5A880]/50"
              }`}
            >
              <div className="space-y-3">
                {/* Top Action & Reorder Bar */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    {/* Drag Grip Handle */}
                    <div
                      className="cursor-grab active:cursor-grabbing p-1 rounded-lg hover:bg-slate-100 text-[#64748B] hover:text-[#0F172A] transition-colors"
                      title="Drag to reorder category"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <span className="px-2.5 py-0.5 bg-[#FAF8F5] border border-[#E0D8CC] text-[#0F172A] text-[10px] font-mono font-bold rounded-lg shadow-xs">
                      #{cat.display_order}
                    </span>
                    {/* Quick Move Up/Down buttons */}
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleMove(idx, "up")}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1 rounded-md hover:bg-slate-100 text-[#64748B] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(idx, "down")}
                        disabled={idx === filtered.length - 1}
                        title="Move Down"
                        className="p-1 rounded-md hover:bg-slate-100 text-[#64748B] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Visibility toggle badge */}
                  <button
                    onClick={() => handleToggleActive(cat.id)}
                    title={cat.is_active !== false ? "Click to Hide" : "Click to Publish"}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs ${
                      cat.is_active !== false
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {cat.is_active !== false ? (
                      <Eye className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-slate-500" />
                    )}
                    <span>{cat.is_active !== false ? "Live" : "Draft"}</span>
                  </button>
                </div>

                {/* Circular Instagram Avatar Preview & Info */}
                <div className="flex items-center gap-4 py-2">
                  <div className="relative w-20 h-20 shrink-0 rounded-full border-2 border-[#C5A880] p-0.5 bg-white shadow-xs overflow-hidden">
                    <div className="w-full h-full rounded-full overflow-hidden relative bg-[#FAF7F2]">
                      {cat.image_url ? (
                        <Image
                          src={cat.image_url}
                          alt={cat.name}
                          fill
                          unoptimized
                          style={{
                            transform: `scale(${cat.image_zoom || 1}) translate(${cat.image_x || 0}%, ${cat.image_y || 0}%)`,
                            transformOrigin: "center center",
                          }}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-[9px] font-mono">
                          No img
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-sans font-bold text-sm text-[#0F172A] uppercase tracking-wider truncate">
                        {cat.name}
                      </h3>
                    </div>
                    {cat.tagline && (
                      <p className="text-[11px] font-mono text-[#9E7D4E] font-medium truncate">
                        {cat.tagline}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-[10px] font-mono text-[#64748B]">
                      <span className="bg-[#F1F5F9] px-2 py-0.5 rounded text-[#0F172A] truncate">
                        /shop/{cat.slug}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description & Storefront Link */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <p className="text-[#64748B] text-xs line-clamp-2 leading-relaxed">
                    {cat.description || "No description provided."}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B]">
                    <div className="flex items-center gap-1 text-[#9E7D4E]">
                      <Lock className="w-3 h-3" />
                      <span className="text-[10px]">Realm Locked</span>
                    </div>
                    <a
                      href={`/shop/${cat.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#9E7D4E] flex items-center gap-1 transition-colors"
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
          MODAL 1: EDIT CATEGORY (Realm Locked + Instagram PFP Adjuster)
          ========================================================================= */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="rounded-3xl neu-card bg-white p-6 sm:p-8 max-w-2xl w-full max-h-[92vh] overflow-y-auto text-xs space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#9E7D4E] font-mono font-semibold">
                  Taxonomy &amp; Realm Editor
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

            <form onSubmit={handleSaveEdit} className="space-y-5">
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

                {/* LOCKED Category Realm Slug Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono font-semibold flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-[#C5A880]" />
                      <span>Category Realm</span>
                    </label>
                    <span className="text-[9px] uppercase tracking-wider font-mono text-[#9E7D4E] bg-[#C5A880]/15 px-2 py-0.5 rounded-md border border-[#C5A880]/30 font-semibold">
                      Realm Locked
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      disabled
                      readOnly
                      value={editForm.slug}
                      className="w-full p-3 pl-9 rounded-xl neu-inset bg-slate-100 text-xs text-[#64748B] font-mono cursor-not-allowed border border-slate-200"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[10px] text-[#94A3B8] font-mono">
                    Category realm key (/shop/{editForm.slug}) is locked to preserve catalog &amp; URL structure.
                  </p>
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
                  rows={2}
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="w-full p-3 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50 leading-relaxed"
                />
              </div>

              {/* Image URL & File Upload */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono font-semibold">
                  Category Showcase Image *
                </label>

                <div className="flex gap-3 items-center">
                  <input
                    type="url"
                    required
                    value={editForm.image_url}
                    onChange={(e) =>
                      setEditForm({ ...editForm, image_url: e.target.value })
                    }
                    placeholder="https://..."
                    className="flex-1 p-2.5 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50 font-mono"
                  />

                  <label className="px-4 py-2.5 rounded-xl neu-btn text-[11px] text-[#0F172A] font-medium cursor-pointer flex items-center gap-1.5 hover:text-[#9E7D4E] shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? "Uploading..." : "Upload Image"}</span>
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
                </div>
                {uploadError && (
                  <p className="text-[10px] text-red-500 font-mono">{uploadError}</p>
                )}
              </div>

              {/* Instagram-Style Circular PFP Adjuster */}
              <CircularPfpEditor
                imageUrl={editForm.image_url}
                zoom={editForm.image_zoom}
                x={editForm.image_x}
                y={editForm.image_y}
                name={editForm.name}
                onZoomChange={(zoom) => setEditForm((prev) => ({ ...prev, image_zoom: zoom }))}
                onXChange={(x) => setEditForm((prev) => ({ ...prev, image_x: x }))}
                onYChange={(y) => setEditForm((prev) => ({ ...prev, image_y: y }))}
                onReset={() =>
                  setEditForm((prev) => ({
                    ...prev,
                    image_zoom: 1,
                    image_x: 0,
                    image_y: 0,
                  }))
                }
              />

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
                  className="px-6 py-2.5 rounded-xl neu-btn-gold text-xs font-bold uppercase tracking-wider text-white cursor-pointer shadow-md hover:shadow-lg"
                >
                  Save Category Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ADD NEW CATEGORY (Auto-Locked Realm + Instagram PFP Adjuster)
          ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="rounded-3xl neu-card bg-white p-6 sm:p-8 max-w-2xl w-full max-h-[92vh] overflow-y-auto text-xs space-y-6 shadow-2xl border border-slate-200">
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

            <form onSubmit={handleCreateCategory} className="space-y-5">
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
                      const slug = name
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9]+/g, "-");
                      setCreateForm({ ...createForm, name, slug });
                    }}
                    placeholder="e.g. Crossbody Bags"
                    className="w-full p-3 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50"
                  />
                </div>

                {/* Auto-Locked Realm Slug Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono font-semibold flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-[#C5A880]" />
                      <span>Category Realm (Locked)</span>
                    </label>
                    <span className="text-[9px] uppercase tracking-wider font-mono text-[#9E7D4E] bg-[#C5A880]/15 px-2 py-0.5 rounded-md border border-[#C5A880]/30 font-semibold">
                      Auto-Derived
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={createForm.slug}
                      placeholder="Auto-generated from name"
                      className="w-full p-3 pl-9 rounded-xl neu-inset bg-slate-100 text-xs text-[#475569] font-mono border border-slate-200 cursor-not-allowed"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[10px] text-[#94A3B8] font-mono">
                    Automatically designated as /shop/{createForm.slug || "[slug]"} to prevent route conflicts.
                  </p>
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
                  rows={2}
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

              {/* Image URL & File Upload */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono font-semibold">
                  Category Showcase Image *
                </label>

                <div className="flex gap-3 items-center">
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
                    placeholder="https://... or upload below"
                    className="flex-1 p-2.5 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50 font-mono"
                  />

                  <label className="px-4 py-2.5 rounded-xl neu-btn text-[11px] text-[#0F172A] font-medium cursor-pointer flex items-center gap-1.5 hover:text-[#9E7D4E] shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? "Uploading..." : "Upload Image"}</span>
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
                </div>
                {uploadError && (
                  <p className="text-[10px] text-red-500 font-mono">{uploadError}</p>
                )}
              </div>

              {/* Instagram-Style Circular PFP Adjuster */}
              <CircularPfpEditor
                imageUrl={createForm.image_url}
                zoom={createForm.image_zoom}
                x={createForm.image_x}
                y={createForm.image_y}
                name={createForm.name}
                onZoomChange={(zoom) => setCreateForm((prev) => ({ ...prev, image_zoom: zoom }))}
                onXChange={(x) => setCreateForm((prev) => ({ ...prev, image_x: x }))}
                onYChange={(y) => setCreateForm((prev) => ({ ...prev, image_y: y }))}
                onReset={() =>
                  setCreateForm((prev) => ({
                    ...prev,
                    image_zoom: 1,
                    image_x: 0,
                    image_y: 0,
                  }))
                }
              />

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
                  className="px-6 py-2.5 rounded-xl neu-btn-gold text-xs font-bold uppercase tracking-wider text-white cursor-pointer shadow-md hover:shadow-lg"
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
