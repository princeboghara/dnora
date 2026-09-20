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
  ZoomIn,
  ZoomOut,
  Move,
  RotateCcw,
  Crop,
  Check,
} from "lucide-react";
import { ProductCategory } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { slugify } from "@/lib/utils";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { uploadFileWithProgress } from "@/lib/upload-utils";

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

  // Dedicated Cropper Modal State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(50); // 0% to 100%
  const [panY, setPanY] = useState(50); // 0% to 100%
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, initialPanX: 50, initialPanY: 50 });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Delete State
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
    setZoom(1);
    setPanX(50);
    setPanY(50);
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
    setZoom(1);
    setPanX(50);
    setPanY(50);
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

  // Image Selection -> Opens Cropper Modal
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file (JPG, PNG, WEBP)", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setRawImageSrc(event.target.result);
        setZoom(1);
        setPanX(50);
        setPanY(50);
        setCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    // Clear input so same file can be selected again
    e.target.value = "";
  };

  // Global Pointer Events for Smooth, Unstoppable Dragging
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!rawImageSrc) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPanX: panX,
      initialPanY: panY,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    // Map mouse pixels to percentage adjustment
    const sensitivity = 0.22 / zoom;
    const nextX = Math.max(0, Math.min(100, dragStartRef.current.initialPanX - deltaX * sensitivity));
    const nextY = Math.max(0, Math.min(100, dragStartRef.current.initialPanY - deltaY * sensitivity));
    setPanX(nextX);
    setPanY(nextY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Create Cropped Canvas Blob
  const createCroppedBlob = async (src: string, zoomLevel: number, px: number, py: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1200;
        canvas.height = 700;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context unavailable"));

        ctx.fillStyle = "#0E0E0E";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const imgAspect = img.naturalWidth / img.naturalHeight;
        let renderW = canvas.width * zoomLevel;
        let renderH = (canvas.width / imgAspect) * zoomLevel;

        if (renderH < canvas.height * zoomLevel) {
          renderH = canvas.height * zoomLevel;
          renderW = canvas.height * imgAspect * zoomLevel;
        }

        const maxOffsetX = renderW - canvas.width;
        const maxOffsetY = renderH - canvas.height;

        const drawX = -(maxOffsetX * (px / 100));
        const drawY = -(maxOffsetY * (py / 100));

        ctx.drawImage(img, drawX, drawY, renderW, renderH);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to create blob"));
          },
          "image/jpeg",
          0.88
        );
      };
      img.onerror = () => reject(new Error("Failed to load image for cropping"));
      img.src = src;
    });
  };

  // Apply Crop & Upload Immediately with Circular Progress
  const handleApplyCropAndUpload = async () => {
    if (!rawImageSrc) return;

    try {
      setUploadingImage(true);
      setUploadProgress(15);

      const croppedBlob = await createCroppedBlob(rawImageSrc, zoom, panX, panY);

      const formData = new FormData();
      formData.append("file", croppedBlob, `${slugify(name || "category")}-${Date.now()}.jpg`);
      formData.append("folder", "dnora/categories");
      formData.append("resource_type", "image");

      const res = await uploadFileWithProgress<{ success: boolean; media?: { secure_url: string }; error?: string }>(
        "/api/media/upload",
        formData,
        (percent) => {
          setUploadProgress(Math.max(15, percent));
        }
      );

      if (res.success && res.media?.secure_url) {
        setImageUrl(res.media.secure_url);
        setUploadProgress(100);
        showToast("Category photo cropped and uploaded successfully!", "success");
        setCropModalOpen(false);
      } else {
        throw new Error(res.error || "Upload failed");
      }
    } catch (err: unknown) {
      console.error("Upload error:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to upload image. Please try again.";
      showToast(errMsg, "error");
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
    }
  };

  // Quick Submit Form
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

    // Instant optimistic removal from UI
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
        // Rollback if failed
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

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#FAF9F6] border border-[#E5E0D8] text-[#0E0E0E]">
              <Folder className="w-5 h-5 text-[#0E0E0E]" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#0E0E0E] uppercase">
                Categories Management
              </h1>
              <p className="text-xs text-[#73706A] mt-0.5">
                Create, update, and manage storefront product categories &amp; hero banners.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0E0E0E] text-[#FAF9F6] text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#2C2B29] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E5E0D8] shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#73706A]" />
          <input
            type="text"
            placeholder="Search categories by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-[#E5E0D8] bg-[#FAF9F6] focus:outline-none focus:border-[#0E0E0E] transition-colors"
          />
        </div>
        <div className="text-xs text-[#73706A]">
          Total Categories: <strong className="text-[#0E0E0E]">{filteredCategories.length}</strong>
        </div>
      </div>

      {/* Category List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-[#E5E0D8]">
          <Loader2 className="w-8 h-8 animate-spin text-[#0E0E0E] mb-2" />
          <p className="text-xs text-[#73706A]">Loading categories...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-[#E5E0D8] text-center px-4">
          <Folder className="w-12 h-12 text-[#E5E0D8] mb-3" />
          <h3 className="text-sm font-semibold text-[#0E0E0E] uppercase tracking-wider mb-1">
            No Categories Found
          </h3>
          <p className="text-xs text-[#73706A] max-w-sm mb-4">
            {search
              ? "No categories matched your search criteria."
              : "Get started by creating your first product category for the storefront."}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0E0E0E] text-[#FAF9F6] text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#2C2B29] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Category</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="group bg-white rounded-xl border border-[#E5E0D8] hover:border-[#0E0E0E] shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
            >
              {/* Image / Hero Banner Preview */}
              <div className="relative w-full h-40 bg-[#FAF9F6] border-b border-[#E5E0D8] overflow-hidden">
                {cat.image_url ? (
                  <Image
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#73706A]">
                    <ImageIcon className="w-8 h-8 mb-1 stroke-1 text-[#0E0E0E]" />
                    <span className="text-[10px] tracking-wider uppercase">No Banner Image</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Link
                    href={`/category/${cat.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur text-[#0E0E0E] hover:text-[#73706A] text-[10px] font-semibold tracking-wider uppercase rounded-full shadow-sm border border-[#E5E0D8] transition-colors"
                  >
                    <span>View Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-sm font-bold text-[#0E0E0E] uppercase tracking-wide truncate">
                      {cat.name}
                    </h3>
                  </div>
                  <p className="text-[11px] font-mono text-[#0E0E0E] mb-2 truncate">
                    /category/{cat.slug}
                  </p>
                  <p className="text-xs text-[#73706A] line-clamp-2 leading-relaxed">
                    {cat.description || "No description provided for this category."}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#E5E0D8]">
                  <Link
                    href={`/category/${cat.slug}`}
                    target="_blank"
                    className="text-[11px] text-[#73706A] hover:text-[#0E0E0E] font-medium flex items-center gap-1 transition-colors"
                  >
                    <span>Storefront Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(cat)}
                      title="Edit Category"
                      className="p-1.5 text-[#73706A] hover:text-[#0E0E0E] hover:bg-[#FAF9F6] rounded-md transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingCategory(cat);
                        setDeleteModalOpen(true);
                      }}
                      title="Delete Category"
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => !submitting && setModalOpen(false)}
        title={editingCategory ? "Edit Category" : "Add New Category"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Category Name */}
          <div>
            <label className="block text-xs font-semibold text-[#0E0E0E] uppercase tracking-wider mb-1.5">
              Category Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Tote Bags, Luxury Clutches"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#E5E0D8] bg-[#FAF9F6] focus:outline-none focus:border-[#0E0E0E]"
            />
          </div>

          {/* URL Slug */}
          <div>
            <label className="block text-xs font-semibold text-[#0E0E0E] uppercase tracking-wider mb-1.5">
              URL Slug *
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs text-[#73706A] font-mono select-none">
                /category/
              </span>
              <input
                type="text"
                required
                placeholder="tote-bags"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="w-full pl-24 pr-3.5 py-2 text-xs font-mono rounded-lg border border-[#E5E0D8] bg-[#FAF9F6] focus:outline-none focus:border-[#0E0E0E]"
              />
            </div>
            <p className="text-[10px] text-[#73706A] mt-1">
              Storefront URL: <code>/category/{slug || "slug-name"}</code>
            </p>
          </div>

          {/* Category Image Upload & Preview Area */}
          <div>
            <label className="block text-xs font-semibold text-[#0E0E0E] uppercase tracking-wider mb-1.5">
              Category Hero Banner Photo
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />

            {!imageUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group border-2 border-dashed border-[#E5E0D8] hover:border-[#0E0E0E] bg-[#FAF9F6] hover:bg-[#F5F3EF] rounded-xl p-6 text-center cursor-pointer transition-all"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-white flex items-center justify-center border border-[#E5E0D8] group-hover:scale-105 transition-transform mb-3 shadow-sm">
                  <Upload className="w-5 h-5 text-[#0E0E0E]" />
                </div>
                <p className="text-xs font-semibold text-[#0E0E0E] uppercase tracking-wider mb-1">
                  Upload Category Photo
                </p>
                <p className="text-[11px] text-[#73706A]">
                  Click to select photo • Instagram-style crop &amp; adjust will open automatically
                </p>
              </div>
            ) : (
              <div className="space-y-3 bg-[#FAF9F6] p-3 rounded-xl border border-[#E5E0D8]">
                <div className="relative w-full h-44 rounded-lg overflow-hidden border border-[#E5E0D8] bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Category Hero Banner"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-emerald-600/90 text-white rounded text-[10px] font-bold tracking-wider uppercase shadow-sm flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Ready
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setRawImageSrc(imageUrl);
                      setCropModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0E0E0E] bg-white border border-[#E5E0D8] hover:bg-[#FAF9F6] rounded-md transition-colors shadow-xs"
                  >
                    <Crop className="w-3.5 h-3.5 text-[#0E0E0E]" />
                    <span>Crop &amp; Adjust Image</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-semibold text-[#0E0E0E] bg-white border border-[#E5E0D8] hover:bg-[#FAF9F6] rounded-md transition-colors"
                    >
                      Change Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl("");
                        setRawImageSrc(null);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#0E0E0E] uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Exquisite craftsmanship for every silhouette..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#E5E0D8] bg-[#FAF9F6] focus:outline-none focus:border-[#0E0E0E] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E5E0D8]">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#73706A] hover:text-[#0E0E0E] uppercase tracking-wider rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#0E0E0E] text-[#FAF9F6] text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#2C2B29] transition-colors disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingCategory ? "Save Changes" : "Create Category"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* DEDICATED INSTAGRAM-STYLE IMAGE CROP MODAL */}
      <Modal
        isOpen={cropModalOpen}
        onClose={() => !uploadingImage && setCropModalOpen(false)}
        title="Crop & Adjust Category Image"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-[#73706A]">
            Drag the image to adjust position. Use the slider or buttons to zoom in/out to frame your category banner.
          </p>

          {/* Interactive Drag & Drop Viewport */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`relative w-full h-56 sm:h-64 bg-black rounded-lg overflow-hidden select-none touch-none ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            {rawImageSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={rawImageSrc}
                alt="Crop Viewport"
                draggable={false}
                className="w-full h-full object-cover transition-transform duration-75 pointer-events-none"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: `${panX}% ${panY}%`,
                }}
              />
            )}

            {/* Instagram 3x3 Rule-of-Thirds Grid */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-35">
              <div className="border-r border-b border-white/60" />
              <div className="border-r border-b border-white/60" />
              <div className="border-b border-white/60" />
              <div className="border-r border-b border-white/60" />
              <div className="border-r border-b border-white/60" />
              <div className="border-b border-white/60" />
              <div className="border-r border-b border-white/60" />
              <div className="border-r border-b border-white/60" />
              <div />
            </div>

            {/* Drag Hint Badge */}
            <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-md text-[10px] font-semibold uppercase tracking-wider text-white flex items-center gap-1.5 pointer-events-none">
              <Move className="w-3 h-3 text-[#0E0E0E]" />
              <span>Drag to Pan</span>
            </div>

            {/* Circular Progress Overlay when uploading */}
            {uploadingImage && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-30">
                <CircularProgress progress={uploadProgress} size={64} strokeWidth={5} />
                <span className="text-xs font-bold uppercase tracking-wider text-[#FAF9F6] mt-3">
                  Uploading Image... {uploadProgress}%
                </span>
              </div>
            )}
          </div>

          {/* Controls: Zoom & Position */}
          <div className="space-y-3 bg-[#FAF9F6] p-3 rounded-lg border border-[#E5E0D8]">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0E0E0E] w-14 shrink-0 flex items-center gap-1">
                <ZoomIn className="w-3.5 h-3.5 text-[#0E0E0E]" />
                Zoom
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))}
                className="p-1 rounded bg-white border border-[#E5E0D8] text-[#0E0E0E] hover:bg-[#FAF9F6]"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <input
                type="range"
                min={1}
                max={2.5}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-[#0E0E0E] h-1.5 bg-[#E5E0D8] rounded-lg appearance-none cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.1).toFixed(2)))}
                className="p-1 rounded bg-white border border-[#E5E0D8] text-[#0E0E0E] hover:bg-[#FAF9F6]"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-mono font-semibold text-[#0E0E0E] w-10 text-right">
                {zoom.toFixed(1)}x
              </span>
            </div>

            {/* Position Reset */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E5E0D8]">
              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setPanX(50);
                  setPanY(50);
                }}
                className="inline-flex items-center gap-1 text-xs text-[#73706A] hover:text-[#0E0E0E] transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Center</span>
              </button>

              <span className="text-[10px] text-[#73706A] font-mono">
                X: {Math.round(panX)}% • Y: {Math.round(panY)}%
              </span>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E5E0D8]">
            <button
              type="button"
              disabled={uploadingImage}
              onClick={() => setCropModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#73706A] hover:text-[#0E0E0E] uppercase tracking-wider rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={uploadingImage}
              onClick={handleApplyCropAndUpload}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0E0E0E] text-[#FAF9F6] text-xs font-bold uppercase tracking-wider rounded hover:bg-[#2C2B29] transition-colors disabled:opacity-50 shadow-sm"
            >
              {uploadingImage ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Crop className="w-3.5 h-3.5 text-[#0E0E0E]" />
              )}
              <span>Apply Crop &amp; Upload</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => !isDeleting && setDeleteModalOpen(false)}
        title="Delete Category"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-[#73706A] leading-relaxed">
            Are you sure you want to delete category{" "}
            <strong className="text-[#0E0E0E] font-semibold">{deletingCategory?.name}</strong>?
            This will remove the category from navigation and category filters. Products in this
            category will not be deleted.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E5E0D8]">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#73706A] hover:text-[#0E0E0E] uppercase tracking-wider rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Delete Category</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
