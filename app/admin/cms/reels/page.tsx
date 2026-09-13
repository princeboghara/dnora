"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Film,
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
  GripVertical,
  ChevronUp,
  ChevronDown,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ShoppingBag,
  MessageCircle,
  Sparkles,
  Link2,
} from "lucide-react";
import { StyleReel, Product, ReelComment } from "@/types";
import {
  getAllAdminReels,
  saveAdminReels,
} from "@/lib/services/reels-service";
import { getProducts } from "@/lib/services/catalog-service";
import { uploadImageToStorage } from "@/lib/supabase/storage";
import { formatINR } from "@/lib/utils";

export default function AdminReelsPage() {
  const [reels, setReels] = useState<StyleReel[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  // Drag-and-drop state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<StyleReel | null>(null);
  const [viewingCommentsReel, setViewingCommentsReel] = useState<StyleReel | null>(null);

  // File Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Live Simulator state
  const [simulatorPlayingIdx, setSimulatorPlayingIdx] = useState(0);
  const [isSimulatorMuted, setIsSimulatorMuted] = useState(true);
  const simulatorVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    creator_name: "",
    creator_handle: "",
    caption: "",
    video_url: "",
    poster_url: "",
    product_id: "",
    display_order: 1,
    is_active: true,
  });

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const loadData = async () => {
    setIsLoading(true);
    const [loadedReels, prods] = await Promise.all([
      getAllAdminReels(),
      getProducts(),
    ]);
    setReels(loadedReels);
    setProducts(prods || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save to persistence
  const persistReels = (updated: StyleReel[]) => {
    setReels(updated);
    saveAdminReels(updated);
  };

  // Drag and drop reordering
  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (dropIdx: number) => {
    if (draggedIdx === null || draggedIdx === dropIdx) return;
    const reordered = [...reels];
    const [moved] = reordered.splice(draggedIdx, 1);
    reordered.splice(dropIdx, 0, moved);

    const finalOrdered = reordered.map((r, i) => ({
      ...r,
      display_order: i + 1,
    }));

    setDraggedIdx(null);
    persistReels(finalOrdered);
    showNotification("Reels reordered successfully.");
  };

  // Move Up / Down
  const handleMove = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= reels.length) return;

    const reordered = [...reels];
    const temp = reordered[idx];
    reordered[idx] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    const finalOrdered = reordered.map((r, i) => ({
      ...r,
      display_order: i + 1,
    }));

    persistReels(finalOrdered);
    showNotification("Reel sequence updated.");
  };

  // Open Edit Modal
  const handleOpenEdit = (reel: StyleReel) => {
    setEditingReel(reel);
    setFormData({
      creator_name: reel.creator_name,
      creator_handle: reel.creator_handle,
      caption: reel.caption,
      video_url: reel.video_url,
      poster_url: reel.poster_url,
      product_id: reel.product_id,
      display_order: reel.display_order ?? 1,
      is_active: reel.is_active !== false,
    });
    setUploadError(null);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    const defaultProduct = products[0];
    setFormData({
      creator_name: "",
      creator_handle: "@",
      caption: "",
      video_url: "",
      poster_url: "",
      product_id: defaultProduct ? defaultProduct.id : "",
      display_order: reels.length + 1,
      is_active: true,
    });
    setUploadError(null);
    setIsCreateModalOpen(true);
  };

  // Save Create
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.video_url.trim() || !formData.caption.trim()) {
      alert("Please provide at least a video URL and caption.");
      return;
    }

    const linkedProduct = products.find((p) => p.id === formData.product_id) || products[0];

    const newReel: StyleReel = {
      id: `reel_${Date.now()}`,
      creator_name: formData.creator_name.trim() || "Atelier Stylist",
      creator_handle: formData.creator_handle.trim() || "@dnora.atelier",
      caption: formData.caption.trim(),
      video_url: formData.video_url.trim(),
      poster_url: formData.poster_url.trim() || (linkedProduct?.primary_image || ""),
      likes_count: "1.2K",
      numeric_likes: 1200,
      display_order: Number(formData.display_order) || reels.length + 1,
      is_active: formData.is_active,
      product_id: linkedProduct ? linkedProduct.id : "prod_noane_bucket",
      product_slug: linkedProduct ? linkedProduct.slug : "noane-side-pocket-bucket-bag",
      product_name: linkedProduct ? linkedProduct.name : "Noane Two-Way Bucket Bag",
      product_price: linkedProduct ? linkedProduct.base_price : 12999,
      product_image: linkedProduct ? linkedProduct.primary_image : "",
      comments: [],
    };

    const updated = [...reels, newReel].sort(
      (a, b) => (a.display_order ?? 1) - (b.display_order ?? 1)
    );

    persistReels(updated);
    setIsCreateModalOpen(false);
    showNotification("New styling reel published successfully.");
  };

  // Save Edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReel) return;

    const linkedProduct = products.find((p) => p.id === formData.product_id) || products[0];

    const updated = reels.map((r) => {
      if (r.id === editingReel.id) {
        return {
          ...r,
          creator_name: formData.creator_name.trim() || r.creator_name,
          creator_handle: formData.creator_handle.trim() || r.creator_handle,
          caption: formData.caption.trim(),
          video_url: formData.video_url.trim(),
          poster_url: formData.poster_url.trim() || r.poster_url,
          display_order: Number(formData.display_order) || 1,
          is_active: formData.is_active,
          product_id: linkedProduct ? linkedProduct.id : r.product_id,
          product_slug: linkedProduct ? linkedProduct.slug : r.product_slug,
          product_name: linkedProduct ? linkedProduct.name : r.product_name,
          product_price: linkedProduct ? linkedProduct.base_price : r.product_price,
          product_image: linkedProduct ? linkedProduct.primary_image : r.product_image,
        };
      }
      return r;
    });

    persistReels(updated);
    setEditingReel(null);
    showNotification("Styling reel updated successfully.");
  };

  // Delete Reel
  const handleDeleteReel = (id: string, caption: string) => {
    if (!confirm(`Are you sure you want to delete this reel?`)) return;
    const updated = reels.filter((r) => r.id !== id);
    persistReels(updated);
    showNotification("Reel deleted successfully.");
  };

  // Toggle Live/Draft
  const handleToggleActive = (id: string) => {
    const updated = reels.map((r) =>
      r.id === id ? { ...r, is_active: !r.is_active } : r
    );
    persistReels(updated);
    const item = updated.find((r) => r.id === id);
    showNotification(`Reel is now ${item?.is_active ? "Live" : "Draft"}.`);
  };

  // Upload Video or Poster file to Supabase Storage
  const handleFileUpload = async (file: File, field: "video_url" | "poster_url") => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const bucket = field === "video_url" ? "videos" : "categories";
      const res = await uploadImageToStorage(bucket, file);
      if (res.url) {
        setFormData((prev) => ({ ...prev, [field]: res.url! }));
        showNotification(`${field === "video_url" ? "Video" : "Poster"} uploaded successfully.`);
      } else if (res.error) {
        setUploadError(res.error);
      }
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // Delete comment from reel
  const handleDeleteComment = (reelId: string, commentId: string) => {
    const updated = reels.map((r) => {
      if (r.id === reelId) {
        const remaining = (r.comments || []).filter((c) => c.id !== commentId);
        return { ...r, comments: remaining };
      }
      return r;
    });
    persistReels(updated);
    const target = updated.find((r) => r.id === reelId);
    setViewingCommentsReel(target || null);
    showNotification("Comment removed.");
  };

  const filtered = reels.filter(
    (r) =>
      r.caption.toLowerCase().includes(search.toLowerCase()) ||
      r.creator_name.toLowerCase().includes(search.toLowerCase()) ||
      r.product_name.toLowerCase().includes(search.toLowerCase())
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
              User Generated Content &amp; Media CMS
            </span>
            <span className="text-[9px] uppercase tracking-wider text-[#9E7D4E] bg-[#C5A880]/15 px-2 py-0.5 rounded-full border border-[#C5A880]/30 font-mono font-medium">
              Seen on you Rails
            </span>
          </div>
          <h1 className="font-sans text-2xl sm:text-3xl text-[#0F172A] uppercase tracking-[0.14em] font-bold mt-1">
            Seen on You (Reels)
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Upload vertical styling videos, link shoppable handbags, moderate patron comments, and reorder video sequences.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/#seen-on-you"
            target="_blank"
            className="px-4 py-2.5 rounded-xl neu-btn text-xs font-semibold text-[#0F172A] hover:text-[#9E7D4E] transition-all flex items-center gap-2 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#9E7D4E]" />
            <span>Storefront View</span>
          </Link>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl neu-btn-gold text-xs uppercase tracking-widest font-bold text-white transition-all flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>New Video Reel</span>
          </button>
        </div>
      </div>

      {/* Interactive Live Simulator (Previewing Storefront Reel Sequence) */}
      <div className="p-5 rounded-3xl bg-white neu-card border border-slate-200 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#9E7D4E]" />
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-[#0F172A]">
              Live Storefront Simulator (Sequential Playback Preview)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsSimulatorMuted(!isSimulatorMuted)}
            className="px-3 py-1 rounded-full neu-btn text-[10px] font-mono flex items-center gap-1.5 text-[#0F172A]"
          >
            {isSimulatorMuted ? <VolumeX className="w-3 h-3 text-[#64748B]" /> : <Volume2 className="w-3 h-3 text-[#C5A880]" />}
            <span>{isSimulatorMuted ? "Sound Off" : "Sound On"}</span>
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
          {reels.map((reel, idx) => {
            const isPlaying = idx === simulatorPlayingIdx;
            return (
              <div
                key={reel.id}
                onClick={() => setSimulatorPlayingIdx(idx)}
                className={`relative shrink-0 w-36 sm:w-44 aspect-[9/16] rounded-2xl overflow-hidden bg-black cursor-pointer border transition-all ${
                  isPlaying
                    ? "ring-2 ring-[#C5A880] border-[#C5A880] shadow-md"
                    : "opacity-75 border-slate-200 hover:opacity-100"
                }`}
              >
                <video
                  ref={(el) => {
                    simulatorVideoRefs.current[idx] = el;
                  }}
                  src={reel.video_url}
                  poster={reel.poster_url}
                  muted={isSimulatorMuted}
                  playsInline
                  autoPlay={isPlaying}
                  onEnded={() => setSimulatorPlayingIdx((idx + 1) % reels.length)}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5 text-white">
                  <span className="text-[10px] font-semibold truncate block">{reel.product_name}</span>
                  <span className="text-[9px] font-mono text-[#C5A880]">{formatINR(reel.product_price)}</span>
                </div>
              </div>
            );
          })}
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
            placeholder="Search reels by caption, creator or product..."
            className="w-full pl-10 pr-4 py-3 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50 transition-all font-mono"
          />
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-[#64748B]">
          <span className="px-3 py-1.5 rounded-xl neu-inset-sm bg-[#F1F5F9]">
            Total: <strong className="text-[#0F172A]">{reels.length}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl neu-inset-sm bg-[#F1F5F9]">
            Live:{" "}
            <strong className="text-[#10B981]">
              {reels.filter((r) => r.is_active !== false).length}
            </strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl neu-inset-sm bg-[#F1F5F9] hidden sm:inline-block">
            Drag to Reorder Enabled
          </span>
        </div>
      </div>

      {/* Reels List with Drag and Drop */}
      {isLoading ? (
        <div className="p-16 text-center text-[#64748B] neu-card bg-white rounded-3xl">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-[#9E7D4E] mb-3" />
          <p className="text-xs uppercase tracking-wider font-mono">
            Loading styling reels...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center text-[#64748B] border border-dashed border-slate-200 bg-white rounded-3xl space-y-3">
          <Film className="w-10 h-10 mx-auto text-[#9E7D4E]/50 mb-2" />
          <p className="text-sm font-semibold uppercase tracking-wider text-[#0F172A]">
            No Styling Reels Found
          </p>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            Click &quot;New Video Reel&quot; to publish customer and stylist videos.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map((reel, idx) => (
            <div
              key={reel.id}
              draggable={true}
              onDragStart={() => handleDragStart(idx)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(idx)}
              className={`p-4 rounded-2xl bg-white neu-card border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none transition-all ${
                draggedIdx === idx
                  ? "opacity-50 ring-2 ring-[#C5A880] border-[#C5A880]"
                  : "border-slate-200 hover:border-[#C5A880]/50 hover:shadow-md"
              }`}
            >
              {/* Left Column: Drag Grip, Sequence Order, and Reel Thumbnail */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg hover:bg-slate-100 text-[#64748B] hover:text-[#0F172A] transition-colors"
                  title="Drag to reorder reel"
                >
                  <GripVertical className="w-4 h-4" />
                </div>

                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleMove(idx, "up")}
                    disabled={idx === 0}
                    className="p-1 text-[#64748B] hover:text-[#0F172A] disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono font-bold text-[#0F172A]">
                    #{reel.display_order ?? idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleMove(idx, "down")}
                    disabled={idx === filtered.length - 1}
                    className="p-1 text-[#64748B] hover:text-[#0F172A] disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Vertical Video Thumbnail */}
                <div className="relative w-16 h-24 rounded-xl overflow-hidden bg-black shrink-0 border border-slate-200">
                  {reel.poster_url ? (
                    <Image
                      src={reel.poster_url}
                      alt={reel.creator_name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Film className="w-6 h-6" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white">
                    <Play className="w-4 h-4 fill-current" />
                  </div>
                </div>

                {/* Creator & Caption info */}
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#0F172A]">
                      {reel.creator_name}
                    </span>
                    <span className="text-xs font-mono text-[#9E7D4E]">
                      {reel.creator_handle}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] line-clamp-1 max-w-lg font-light">
                    {reel.caption}
                  </p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E0D8CC] text-[10px] font-medium text-[#0F172A]">
                      <ShoppingBag className="w-3 h-3 text-[#C5A880]" />
                      <span>{reel.product_name}</span>
                      <strong className="text-[#9E7D4E] font-mono">({formatINR(reel.product_price)})</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => setViewingCommentsReel(reel)}
                      className="inline-flex items-center gap-1 text-[10px] font-mono text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                    >
                      <MessageCircle className="w-3 h-3 text-[#C5A880]" />
                      <span>{reel.comments?.length ?? 0} Comments</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Visibility & Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => handleToggleActive(reel.id)}
                  title={reel.is_active !== false ? "Click to Hide" : "Click to Publish"}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all ${
                    reel.is_active !== false
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {reel.is_active !== false ? (
                    <Eye className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <EyeOff className="w-3 h-3 text-slate-500" />
                  )}
                  <span>{reel.is_active !== false ? "Live" : "Draft"}</span>
                </button>

                <button
                  onClick={() => handleOpenEdit(reel)}
                  className="p-2 rounded-xl neu-btn text-[#0F172A] hover:text-[#9E7D4E] transition-all cursor-pointer"
                  title="Edit Reel"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDeleteReel(reel.id, reel.caption)}
                  className="p-2 rounded-xl neu-btn text-[#64748B] hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                  title="Delete Reel"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          MODAL: CREATE / EDIT REEL
          ========================================================================= */}
      {(isCreateModalOpen || editingReel) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="rounded-3xl neu-card bg-white p-6 sm:p-8 max-w-xl w-full max-h-[92vh] overflow-y-auto text-xs space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#9E7D4E] font-mono font-semibold">
                  {editingReel ? "Reel Editor" : "New Reel Creation"}
                </span>
                <h3 className="font-sans font-bold text-lg text-[#0F172A] uppercase tracking-wider mt-0.5">
                  {editingReel ? "Edit Styling Reel" : "Add Seen on You Video Reel"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingReel(null);
                }}
                className="p-2 rounded-xl neu-btn text-[#64748B] hover:text-[#0F172A] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={editingReel ? handleEditSubmit : handleCreateSubmit}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono font-semibold">
                    Creator Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.creator_name}
                    onChange={(e) =>
                      setFormData({ ...formData, creator_name: e.target.value })
                    }
                    placeholder="e.g. Ananya Singhania"
                    className="w-full p-3 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono font-semibold">
                    Creator Handle / Username
                  </label>
                  <input
                    type="text"
                    value={formData.creator_handle}
                    onChange={(e) =>
                      setFormData({ ...formData, creator_handle: e.target.value })
                    }
                    placeholder="@ananya_styling"
                    className="w-full p-3 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50 font-mono"
                  />
                </div>
              </div>

              {/* Caption */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono font-semibold">
                  Styling Caption / Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.caption}
                  onChange={(e) =>
                    setFormData({ ...formData, caption: e.target.value })
                  }
                  placeholder="e.g. Styling the Noane Two-Way Bucket Bag with cream linen set. Sublime texture! ✨"
                  className="w-full p-3 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50 leading-relaxed"
                />
              </div>

              {/* Video URL & Upload */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono font-semibold">
                  Vertical Video File (MP4 / WebM) *
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    required
                    value={formData.video_url}
                    onChange={(e) =>
                      setFormData({ ...formData, video_url: e.target.value })
                    }
                    placeholder="/videos/reel.mp4 or https://..."
                    className="flex-1 p-2.5 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50 font-mono"
                  />
                  <label className="px-4 py-2.5 rounded-xl neu-btn text-[11px] text-[#0F172A] font-medium cursor-pointer flex items-center gap-1.5 hover:text-[#9E7D4E] shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? "Uploading..." : "Upload Video"}</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFileUpload(e.target.files[0], "video_url");
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Poster Image URL & Upload */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono font-semibold">
                  Video Poster / Cover Image
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={formData.poster_url}
                    onChange={(e) =>
                      setFormData({ ...formData, poster_url: e.target.value })
                    }
                    placeholder="https://... cover image"
                    className="flex-1 p-2.5 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50 font-mono"
                  />
                  <label className="px-4 py-2.5 rounded-xl neu-btn text-[11px] text-[#0F172A] font-medium cursor-pointer flex items-center gap-1.5 hover:text-[#9E7D4E] shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Poster</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFileUpload(e.target.files[0], "poster_url");
                        }
                      }}
                    />
                  </label>
                </div>
                {uploadError && (
                  <p className="text-[10px] text-red-500 font-mono">{uploadError}</p>
                )}
              </div>

              {/* Tagged Product Selector Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono font-semibold flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Featured / Shoppable Product *</span>
                </label>
                <select
                  required
                  value={formData.product_id}
                  onChange={(e) =>
                    setFormData({ ...formData, product_id: e.target.value })
                  }
                  className="w-full p-3 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatINR(p.base_price)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Display Order & Visibility */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono font-semibold">
                    Sequence Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        display_order: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full p-3 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono font-semibold">
                    Storefront Visibility
                  </label>
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active_checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_active: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-[#C5A880] focus:ring-[#C5A880] cursor-pointer"
                    />
                    <label
                      htmlFor="is_active_checkbox"
                      className="text-xs text-[#0F172A] font-medium cursor-pointer"
                    >
                      Active on Storefront
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingReel(null);
                  }}
                  className="px-5 py-2.5 rounded-xl neu-btn text-xs font-semibold text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl neu-btn-gold text-xs font-bold uppercase tracking-wider text-white cursor-pointer shadow-md hover:shadow-lg"
                >
                  {editingReel ? "Save Reel Changes" : "Publish Reel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: MODERATE COMMENTS
          ========================================================================= */}
      {viewingCommentsReel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="rounded-3xl neu-card bg-white p-6 sm:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto text-xs space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#9E7D4E] font-mono font-semibold">
                  Comments Moderation
                </span>
                <h3 className="font-sans font-bold text-base text-[#0F172A] uppercase tracking-wider mt-0.5">
                  Reel: {viewingCommentsReel.creator_name}
                </h3>
              </div>
              <button
                onClick={() => setViewingCommentsReel(null)}
                className="p-2 rounded-xl neu-btn text-[#64748B] hover:text-[#0F172A] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(!viewingCommentsReel.comments || viewingCommentsReel.comments.length === 0) ? (
              <p className="p-8 text-center text-slate-400 font-mono">
                No patron comments submitted on this reel yet.
              </p>
            ) : (
              <div className="space-y-3">
                {viewingCommentsReel.comments.map((c: ReelComment) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-[#0F172A] text-xs">{c.user_name}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">{c.created_at}</span>
                      </div>
                      <p className="text-slate-700 text-xs mt-1 leading-relaxed">
                        {c.comment}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteComment(viewingCommentsReel.id, c.id)}
                      className="p-1.5 rounded-lg neu-btn text-red-500 hover:bg-red-50 cursor-pointer"
                      title="Delete this comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
