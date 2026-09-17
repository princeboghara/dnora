"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Clock,
  Save,
  RotateCcw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
} from "lucide-react";
import { AnnouncementItem, AnnouncementConfig } from "@/types";
import { DEFAULT_ANNOUNCEMENT_CONFIG } from "@/lib/data/default-announcements";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";

export default function AdminAnnouncementsPage() {
  const { showToast } = useToast();
  const [config, setConfig] = useState<AnnouncementConfig>(DEFAULT_ANNOUNCEMENT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit / Add Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AnnouncementItem | null>(null);
  const [formText, setFormText] = useState("");
  const [formLink, setFormLink] = useState("");
  const [formBadge, setFormBadge] = useState("");
  const [formActive, setFormActive] = useState(true);

  // Live Preview Swiper
  const [previewIndex, setPreviewIndex] = useState(0);
  const previewTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch announcements on load
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await fetch("/api/announcements");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setConfig(data);
        }
      } catch (err) {
        console.error("Failed to load announcements:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle live preview auto-swiping
  const activeItems = config.items.filter((i) => i.is_active);
  useEffect(() => {
    if (previewTimerRef.current) clearInterval(previewTimerRef.current);
    if (!config.is_active || activeItems.length <= 1) return;

    previewTimerRef.current = setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % activeItems.length);
    }, Math.max(1, config.interval_seconds) * 1000);

    return () => {
      if (previewTimerRef.current) clearInterval(previewTimerRef.current);
    };
  }, [config.interval_seconds, config.is_active, activeItems.length]);

  // Save Configuration to Server
  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save configuration.");
      }

      showToast("Announcement bar updated successfully! Live store reflects changes.", "success");
      setConfig(data.config);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error saving configuration";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  // Reset to Factory Defaults
  const handleResetDefaults = async () => {
    if (!confirm("Are you sure you want to reset the Announcement Bar to factory defaults?")) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/announcements?reset=true", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reset.");
      }

      showToast("Announcement bar reset to default settings.", "success");
      setConfig(data.config);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Reset failed";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  // Open modal for Create
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormText("");
    setFormLink("/shop");
    setFormBadge("");
    setFormActive(true);
    setModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (item: AnnouncementItem) => {
    setEditingItem(item);
    setFormText(item.text);
    setFormLink(item.link || "");
    setFormBadge(item.badge || "");
    setFormActive(item.is_active);
    setModalOpen(true);
  };

  // Save Item from Modal
  const handleSaveModalItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formText.trim()) {
      showToast("Please enter announcement text.", "error");
      return;
    }

    if (editingItem) {
      // Update existing item
      setConfig((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                text: formText.trim(),
                link: formLink.trim() || undefined,
                badge: formBadge.trim() || undefined,
                is_active: formActive,
              }
            : item
        ),
      }));
      showToast("Announcement modified. Click 'Save Changes' to publish.", "info");
    } else {
      // Create new item
      const newItem: AnnouncementItem = {
        id: `ann-${Date.now()}`,
        text: formText.trim(),
        link: formLink.trim() || undefined,
        badge: formBadge.trim() || undefined,
        is_active: formActive,
        sort_order: config.items.length + 1,
      };
      setConfig((prev) => ({
        ...prev,
        items: [...prev.items, newItem],
      }));
      showToast("New announcement added. Click 'Save Changes' to publish.", "info");
    }

    setModalOpen(false);
  };

  // Delete Item
  const handleDeleteItem = (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    setConfig((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }));
    showToast("Announcement removed. Click 'Save Changes' to commit.", "info");
  };

  // Toggle Active State
  const handleToggleItemActive = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, is_active: !item.is_active } : item
      ),
    }));
  };

  // Move Item Up / Down
  const handleMoveItem = (index: number, direction: "up" | "down") => {
    const newItems = [...config.items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    setConfig((prev) => ({
      ...prev,
      items: newItems,
    }));
  };

  const safePreviewIndex = activeItems.length > 0 ? previewIndex % activeItems.length : 0;
  const currentPreviewItem = activeItems[safePreviewIndex];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DE] pb-6">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] font-semibold block mb-1">
            Storefront Header Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0E0E0E] tracking-tight">
            Announcement Bar System
          </h1>
          <p className="text-xs text-[#73706A] mt-1">
            Manage auto-swiping promotional announcements, links, badges, and rotation speed across the top banner.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={saving}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#73706A] hover:text-[#0E0E0E] hover:bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm transition-all"
            title="Reset to factory announcements"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSaveConfig}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0E0E0E] text-[#FAF9F6] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C5A880] hover:text-[#0E0E0E] transition-all shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* LIVE STOREFRONT PREVIEW SECTION */}
      <div className="bg-white border border-[#E8E5DE] rounded-sm p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#C5A880]" />
            <h2 className="text-xs uppercase tracking-widest font-bold text-[#0E0E0E]">
              Live Storefront Preview
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              {config.is_active ? `Active (${config.interval_seconds}s interval)` : "Disabled"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                setPreviewIndex((prev) => (prev - 1 + activeItems.length) % activeItems.length)
              }
              disabled={activeItems.length <= 1}
              className="p-1 text-[#73706A] hover:text-[#0E0E0E] disabled:opacity-30 transition-colors"
              aria-label="Previous preview item"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-[#73706A] px-1">
              {activeItems.length > 0 ? `${safePreviewIndex + 1} / ${activeItems.length}` : "0 / 0"}
            </span>
            <button
              type="button"
              onClick={() => setPreviewIndex((prev) => (prev + 1) % activeItems.length)}
              disabled={activeItems.length <= 1}
              className="p-1 text-[#73706A] hover:text-[#0E0E0E] disabled:opacity-30 transition-colors"
              aria-label="Next preview item"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The rendered bar preview */}
        <div className="rounded border border-[#242321] overflow-hidden">
          {config.is_active && currentPreviewItem ? (
            <div className="bg-[#0E0E0E] text-[#FAF9F6] py-2.5 px-4 flex items-center justify-between text-xs transition-all duration-300">
              <button
                type="button"
                onClick={() =>
                  setPreviewIndex((prev) => (prev - 1 + activeItems.length) % activeItems.length)
                }
                className="text-[#FAF9F6]/60 hover:text-[#FAF9F6] transition-colors p-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center justify-center gap-2 text-center truncate px-2">
                {currentPreviewItem.badge && (
                  <span className="text-[9px] uppercase tracking-wider font-bold bg-[#C5A880]/20 text-[#C5A880] px-2 py-0.5 rounded shrink-0">
                    {currentPreviewItem.badge}
                  </span>
                )}
                <span className="font-medium tracking-wider uppercase text-[11px] truncate">
                  {currentPreviewItem.text}
                </span>
                {currentPreviewItem.link && (
                  <ExternalLink className="w-3 h-3 text-[#C5A880] shrink-0" />
                )}
              </div>

              <button
                type="button"
                onClick={() => setPreviewIndex((prev) => (prev + 1) % activeItems.length)}
                className="text-[#FAF9F6]/60 hover:text-[#FAF9F6] transition-colors p-1"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="bg-[#F5F3EF] text-[#73706A] py-3 px-4 text-center text-xs italic">
              Announcement Bar is currently disabled or has no active items.
            </div>
          )}
        </div>
      </div>

      {/* CONFIGURATION CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Swiping Interval Controller */}
        <div className="bg-white border border-[#E8E5DE] rounded-sm p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C5A880]" />
            <h2 className="text-xs uppercase tracking-widest font-bold text-[#0E0E0E]">
              Auto-Swipe Interval Timer
            </h2>
          </div>
          <p className="text-xs text-[#73706A]">
            Set how many seconds each announcement stays visible before automatically switching to the next slide.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#0E0E0E]">
                Switch Interval: <span className="text-[#C5A880] text-sm font-bold">{config.interval_seconds} seconds</span>
              </span>
              <span className="text-[11px] text-[#73706A] font-mono">(Range: 2s – 15s)</span>
            </div>

            <input
              type="range"
              min="2"
              max="15"
              step="1"
              value={config.interval_seconds}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  interval_seconds: Number(e.target.value),
                }))
              }
              className="w-full accent-[#0E0E0E] cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-[#73706A] font-mono">
              <span>2s (Fast)</span>
              <span>4s (Recommended)</span>
              <span>8s</span>
              <span>15s (Relaxed)</span>
            </div>
          </div>
        </div>

        {/* Master Active Status */}
        <div className="bg-white border border-[#E8E5DE] rounded-sm p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#C5A880]" />
            <h2 className="text-xs uppercase tracking-widest font-bold text-[#0E0E0E]">
              Announcement Bar Visibility
            </h2>
          </div>
          <p className="text-xs text-[#73706A]">
            Instantly display or hide the entire announcement bar across all storefront pages without deleting items.
          </p>

          <div className="pt-3">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={config.is_active}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    is_active: e.target.checked,
                  }))
                }
                className="w-5 h-5 rounded accent-[#0E0E0E] cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-[#0E0E0E] block">
                  {config.is_active ? "Enabled & Visible to Clients" : "Disabled (Hidden from Storefront)"}
                </span>
                <span className="text-[11px] text-[#73706A]">
                  {config.is_active
                    ? "Storefront will render the swiping bar at the top."
                    : "The bar is hidden completely from visitors."}
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* ANNOUNCEMENT ITEMS TABLE / LIST */}
      <div className="bg-white border border-[#E8E5DE] rounded-sm p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xs uppercase tracking-widest font-bold text-[#0E0E0E] flex items-center gap-2">
              <span>Announcement Messages</span>
              <span className="text-[11px] text-[#73706A] font-mono">({config.items.length} items)</span>
            </h2>
            <p className="text-xs text-[#73706A] mt-0.5">
              Add, edit, reorder, or toggle individual announcements in the rotation.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0E0E0E] text-[#FAF9F6] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C5A880] hover:text-[#0E0E0E] transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Announcement</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-[#73706A] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#C5A880]" />
            <span>Loading announcements from atelier database...</span>
          </div>
        ) : config.items.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-[#E8E5DE] rounded-sm p-8 space-y-3">
            <Megaphone className="w-8 h-8 text-[#C5A880] mx-auto opacity-70" />
            <h3 className="text-sm font-bold text-[#0E0E0E]">No Announcements Configured</h3>
            <p className="text-xs text-[#73706A] max-w-sm mx-auto">
              Create your first promotional headline to notify clients of limited drops, complimentary shipping, or atelier perks.
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0E0E0E] text-[#FAF9F6] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C5A880] hover:text-[#0E0E0E] transition-all mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Announcement</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {config.items.map((item, index) => (
              <div
                key={item.id}
                className={`p-4 rounded-sm border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  item.is_active
                    ? "bg-[#FAF9F6] border-[#E8E5DE] hover:border-[#D5D2CA]"
                    : "bg-[#F5F5F5] border-dashed border-[#D5D2CA] opacity-60"
                }`}
              >
                {/* Left: Reorder Controls + Info */}
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  {/* Up / Down Controls */}
                  <div className="flex flex-col gap-1 shrink-0 pt-0.5 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => handleMoveItem(index, "up")}
                      disabled={index === 0}
                      className="p-1 rounded text-[#73706A] hover:text-[#0E0E0E] hover:bg-black/5 disabled:opacity-20 transition-all"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveItem(index, "down")}
                      disabled={index === config.items.length - 1}
                      className="p-1 rounded text-[#73706A] hover:text-[#0E0E0E] hover:bg-black/5 disabled:opacity-20 transition-all"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Index badge */}
                  <span className="w-6 h-6 rounded bg-[#E8E5DE] text-[#0E0E0E] text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>

                  {/* Text & Link Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-[#0E0E0E] break-words">
                        {item.text}
                      </span>
                      {item.badge && (
                        <span className="text-[9px] uppercase tracking-wider font-bold bg-[#C5A880]/20 text-[#C5A880] px-2 py-0.5 rounded shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-[11px] text-[#73706A]">
                      {item.link ? (
                        <span className="flex items-center gap-1 text-[#C5A880] truncate">
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{item.link}</span>
                        </span>
                      ) : (
                        <span className="italic text-[#A8A49C]">No link</span>
                      )}

                      <span>&bull;</span>
                      <span className={item.is_active ? "text-emerald-600 font-semibold" : "text-[#A8A49C]"}>
                        {item.is_active ? "Live in rotation" : "Paused"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleToggleItemActive(item.id)}
                    className={`px-2.5 py-1.5 rounded text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                      item.is_active
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300"
                    }`}
                  >
                    {item.is_active ? "Active" : "Paused"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 text-[#73706A] hover:text-[#0E0E0E] hover:bg-white border border-[#E8E5DE] rounded transition-all"
                    title="Edit announcement"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 text-[#C53030] hover:text-[#9B1C1C] hover:bg-red-50 border border-red-200 rounded transition-all"
                    title="Delete announcement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT ANNOUNCEMENT MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? "Edit Announcement" : "Create New Announcement"}
      >
        <form onSubmit={handleSaveModalItem} className="space-y-4 pt-2">
          {/* Announcement Text */}
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-semibold text-[#0E0E0E] mb-1.5">
              Announcement Text *
            </label>
            <textarea
              required
              rows={2}
              value={formText}
              onChange={(e) => setFormText(e.target.value)}
              placeholder="e.g. Complimentary Worldwide Express Delivery on Orders Over $250"
              className="w-full px-3 py-2 bg-white border border-[#D5D2CA] rounded-sm text-xs text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E] focus:ring-1 focus:ring-[#0E0E0E] transition-all"
            />
          </div>

          {/* Target Link */}
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-semibold text-[#0E0E0E] mb-1.5">
              Destination Link (Optional)
            </label>
            <input
              type="text"
              value={formLink}
              onChange={(e) => setFormLink(e.target.value)}
              placeholder="e.g. /shop or /#new-arrivals"
              className="w-full px-3 py-2 bg-white border border-[#D5D2CA] rounded-sm text-xs text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E] focus:ring-1 focus:ring-[#0E0E0E] transition-all"
            />
            <span className="text-[10px] text-[#73706A] mt-1 block">
              Clients clicking the announcement will be navigated to this route.
            </span>
          </div>

          {/* Badge Tag */}
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-semibold text-[#0E0E0E] mb-1.5">
              Badge Tag (Optional)
            </label>
            <input
              type="text"
              value={formBadge}
              onChange={(e) => setFormBadge(e.target.value)}
              placeholder="e.g. New Release, Limited, Special Offer"
              className="w-full px-3 py-2 bg-white border border-[#D5D2CA] rounded-sm text-xs text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E] focus:ring-1 focus:ring-[#0E0E0E] transition-all"
            />
          </div>

          {/* Active Status */}
          <div className="pt-2 border-t border-[#E8E5DE]">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formActive}
                onChange={(e) => setFormActive(e.target.checked)}
                className="w-4 h-4 rounded accent-[#0E0E0E] cursor-pointer"
              />
              <span className="text-xs font-semibold text-[#0E0E0E]">
                Set announcement as active in rotation
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E5DE]">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#73706A] hover:text-[#0E0E0E] hover:bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0E0E0E] text-[#FAF9F6] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C5A880] hover:text-[#0E0E0E] transition-all"
            >
              {editingItem ? "Update Item" : "Add to Bar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
