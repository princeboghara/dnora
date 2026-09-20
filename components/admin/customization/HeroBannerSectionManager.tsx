"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Loader2,
  Sliders,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { HeroBanner } from "@/types";
import { HeroBannerForm } from "@/components/admin/HeroBannerForm";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface HeroBannerSectionManagerProps {
  currentHeight?: string;
  onHeightChange?: (height: string) => void;
  onBannersChange?: (banners: HeroBanner[]) => void;
}

export function HeroBannerSectionManager({
  currentHeight = "82vh",
  onHeightChange,
  onBannersChange,
}: HeroBannerSectionManagerProps) {
  const { success, error } = useToast();
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Height preset state
  const [selectedHeight, setSelectedHeight] = useState(currentHeight);

  const HEIGHT_PRESETS = [
    { label: "Compact (60vh)", value: "60vh" },
    { label: "Standard (75vh)", value: "75vh" },
    { label: "Luxury (82vh)", value: "82vh" },
    { label: "Full Screen (100vh)", value: "100vh" },
  ];

  const handleHeightSelect = (val: string) => {
    setSelectedHeight(val);
    if (onHeightChange) onHeightChange(val);
  };

  useEffect(() => {
    let ignore = false;
    async function loadBanners() {
      try {
        const res = await fetch("/api/heroes?includeDrafts=true");
        const data = await res.json();
        if (!ignore && data.banners) {
          setBanners(data.banners);
          if (onBannersChange) onBannersChange(data.banners);
        }
      } catch {
        if (!ignore) error("Failed to load hero slides");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadBanners();
    return () => {
      ignore = true;
    };
  }, [error, refreshTrigger]);

  const refreshBanners = () => setRefreshTrigger((prev) => prev + 1);

  const handleTogglePublish = async (banner: HeroBanner) => {
    const newStatus = banner.status === "published" ? "draft" : "published";
    try {
      const res = await fetch(`/api/heroes/${banner.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      success(
        newStatus === "published"
          ? `"${banner.title}" is now LIVE on storefront.`
          : `"${banner.title}" reverted to DRAFT mode.`
      );
      refreshBanners();
    } catch {
      error("Error updating banner publishing state.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this hero slide?")) {
      return;
    }

    try {
      const res = await fetch(`/api/heroes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      success("Hero slide deleted successfully.");
      refreshBanners();
    } catch {
      error("Error deleting hero banner.");
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= banners.length) return;

    const currentBanner = banners[index];
    const targetBanner = banners[targetIdx];

    try {
      // Swap sort_order
      await Promise.all([
        fetch(`/api/heroes/${currentBanner.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: targetBanner.sort_order || targetIdx + 1 }),
        }),
        fetch(`/api/heroes/${targetBanner.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: currentBanner.sort_order || index + 1 }),
        }),
      ]);
      refreshBanners();
    } catch {
      error("Failed to reorder hero slides");
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Sizing & Height Presets */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Hero Banner Height & Viewport Sizing</span>
            </h3>
            <p className="text-xs text-slate-500">
              Adjust how tall the hero showcase appears across laptops and wide screens.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {HEIGHT_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => handleHeightSelect(preset.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedHeight === preset.value
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Slides Management Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Hero Slides Showcase ({banners.length})
            </h3>
            <p className="text-xs text-slate-500">
              Upload video or images, arrange display order, and configure individual slide timers.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-b from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-[0_2px_8px_rgba(79,70,229,0.3)] active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Hero Slide</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Loading hero slides...</span>
          </div>
        ) : banners.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No hero slides found. Click &quot;Add Hero Slide&quot; to upload an image or video slide.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className="p-4.5 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, "up")}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === banners.length - 1}
                      onClick={() => handleMove(index, "down")}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail / Media Preview */}
                  <div className="relative w-20 h-14 sm:w-28 sm:h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs">
                    {banner.media_type === "video" ? (
                      <video
                        src={banner.media_url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={banner.media_url}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <span className="absolute bottom-1 right-1 p-1 bg-black/60 rounded text-white text-[9px]">
                      {banner.media_type === "video" ? (
                        <Video className="w-3 h-3" />
                      ) : (
                        <ImageIcon className="w-3 h-3" />
                      )}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {banner.title}
                      </p>
                      {banner.subtitle && (
                        <span className="text-[10px] text-slate-500 truncate hidden sm:inline">
                          • {banner.subtitle}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {banner.media_type === "video"
                          ? "Auto-swipe on video end"
                          : `${banner.duration_seconds || 5}s slide timer`}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-slate-600 truncate max-w-[150px]">
                        CTA: {banner.button_text || "SHOP"} ({banner.button_link || "/shop"})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(banner)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      banner.status === "published"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {banner.status === "published" ? "Live" : "Draft"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingBanner(banner)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Edit Slide"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(banner.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Slide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Slide Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Hero Slide"
      >
        <HeroBannerForm
          onSuccess={() => {
            setIsCreateOpen(false);
            refreshBanners();
          }}
          onCancel={() => setIsCreateOpen(false)}
        />
      </Modal>

      {/* Edit Slide Modal */}
      <Modal
        isOpen={!!editingBanner}
        onClose={() => setEditingBanner(null)}
        title={`Edit "${editingBanner?.title || "Hero Slide"}"`}
      >
        {editingBanner && (
          <HeroBannerForm
            initialData={editingBanner}
            onSuccess={() => {
              setEditingBanner(null);
              refreshBanners();
            }}
            onCancel={() => setEditingBanner(null)}
          />
        )}
      </Modal>
    </div>
  );
}
