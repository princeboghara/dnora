"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Video,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { HeroBanner } from "@/types";
import { HeroPreviewModal } from "@/components/admin/HeroPreviewModal";
import { HeroBannerForm } from "@/components/admin/HeroBannerForm";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

export default function HeroManagerPage() {
  const { success, error } = useToast();
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [previewBanner, setPreviewBanner] = useState<HeroBanner | null>(null);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function loadBanners() {
      try {
        const res = await fetch("/api/heroes?includeDrafts=true");
        const data = await res.json();
        if (!ignore && data.banners) {
          setBanners(data.banners);
        }
      } catch {
        if (!ignore) {
          error("Failed to load hero banners");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
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
          ? `"${banner.title}" is now LIVE on the homepage.`
          : `"${banner.title}" reverted to DRAFT mode.`
      );
      refreshBanners();
    } catch {
      error("Error updating banner publishing state.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this hero banner?")) {
      return;
    }

    try {
      const res = await fetch(`/api/heroes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");

      success("Hero banner deleted successfully.");
      refreshBanners();
    } catch {
      error("Error deleting hero banner.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E5DE]">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#C5A880] font-semibold block mb-1">
            Storefront Experience
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0E0E0E] tracking-tight">
            Hero Banner Manager
          </h1>
          <p className="text-xs text-[#73706A] mt-1">
            Manage high-impact cinematic video and editorial image slides. Only Published slides appear publicly.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0E0E0E] hover:bg-[#2C2B29] text-xs font-bold uppercase tracking-wider text-[#FAF9F6] rounded transition-all shadow-md shrink-0"
        >
          <Plus className="w-4 h-4 text-[#C5A880]" />
          <span>Create Hero Banner</span>
        </button>
      </div>

      {/* Hero Table */}
      <div className="bg-white border border-[#E8E5DE] rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-16 text-[#73706A]">
            <Loader2 className="w-6 h-6 animate-spin mr-3" />
            <span className="text-sm">Loading hero configurations...</span>
          </div>
        ) : banners.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-base font-heading text-[#0E0E0E] mb-2">No hero banners found</p>
            <p className="text-xs text-[#73706A] mb-4">
              Create your first luxury image or video banner to welcome store visitors.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 bg-[#0E0E0E] text-white text-xs font-semibold uppercase tracking-wider rounded"
            >
              Add First Banner
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E8E5DE] bg-[#FAF9F6] text-[10px] font-bold uppercase tracking-[0.18em] text-[#73706A]">
                  <th className="py-3.5 px-4 sm:px-6">Preview</th>
                  <th className="py-3.5 px-4">Headline &amp; Subtitle</th>
                  <th className="py-3.5 px-4">Media Type</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DE] text-xs">
                {banners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-[#FAF9F6]/60 transition-colors">
                    {/* Thumbnail Preview */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="relative w-24 h-14 bg-black rounded overflow-hidden border border-[#E8E5DE] shrink-0">
                        {banner.media_type === "video" ? (
                          <video
                            src={banner.media_url}
                            muted
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Image
                            src={banner.media_url}
                            alt={banner.title}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        )}
                        <div className="absolute top-1 left-1 bg-black/70 px-1 rounded text-[9px] text-white font-mono uppercase">
                          {banner.media_type}
                        </div>
                      </div>
                    </td>

                    {/* Headline */}
                    <td className="py-4 px-4 max-w-xs">
                      <span className="font-heading font-bold text-sm text-[#0E0E0E] block leading-snug">
                        {banner.title}
                      </span>
                      {banner.subtitle && (
                        <span className="text-[11px] text-[#73706A] line-clamp-1">
                          {banner.subtitle}
                        </span>
                      )}
                      <span className="text-[10px] text-[#C5A880] block mt-0.5">
                        CTA: {banner.button_text} &rarr; {banner.button_link}
                      </span>
                    </td>

                    {/* Media Type */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F5F3EF] text-[#3A3835]">
                        {banner.media_type === "video" ? (
                          <Video className="w-3 h-3 text-[#0E0E0E]" />
                        ) : (
                          <ImageIcon className="w-3 h-3 text-[#0E0E0E]" />
                        )}
                        <span>{banner.media_type}</span>
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="py-4 px-4 font-mono text-xs text-[#3A3835]">
                      {banner.media_type === "video" ? "Autoplay (End trigger)" : `${banner.duration_seconds}s`}
                    </td>

                    {/* Order */}
                    <td className="py-4 px-4 font-mono font-bold text-[#0E0E0E]">
                      #{banner.sort_order}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          banner.status === "published"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {banner.status === "published" ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3 h-3 text-amber-600" />
                        )}
                        <span>{banner.status}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Preview Button */}
                        <button
                          onClick={() => setPreviewBanner(banner)}
                          className="p-1.5 rounded hover:bg-[#F5F3EF] text-[#3A3835] hover:text-[#0E0E0E]"
                          title="Simulate Desktop & Mobile Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Publish / Unpublish Toggle */}
                        <button
                          onClick={() => handleTogglePublish(banner)}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                            banner.status === "published"
                              ? "bg-amber-100 hover:bg-amber-200 text-amber-900"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white"
                          }`}
                          title={
                            banner.status === "published"
                              ? "Switch to Draft (Hide from site)"
                              : "Publish to Live Site"
                          }
                        >
                          {banner.status === "published" ? "Unpublish" : "Publish"}
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => setEditingBanner(banner)}
                          className="p-1.5 rounded hover:bg-[#F5F3EF] text-[#3A3835] hover:text-[#0E0E0E]"
                          title="Edit Banner"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(banner.id)}
                          className="p-1.5 rounded hover:bg-rose-50 text-[#73706A] hover:text-rose-600"
                          title="Delete Banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Cinematic Hero Banner"
        maxWidth="2xl"
      >
        <HeroBannerForm
          onSuccess={() => {
            setIsCreateOpen(false);
            refreshBanners();
          }}
          onCancel={() => setIsCreateOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={Boolean(editingBanner)}
        onClose={() => setEditingBanner(null)}
        title="Edit Hero Banner Configuration"
        maxWidth="2xl"
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

      {/* Desktop / Mobile Live Simulation Preview */}
      <HeroPreviewModal
        isOpen={Boolean(previewBanner)}
        onClose={() => setPreviewBanner(null)}
        banner={previewBanner}
      />
    </div>
  );
}
