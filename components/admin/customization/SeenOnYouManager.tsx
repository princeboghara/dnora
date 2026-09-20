"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Video,
  Upload,
  Loader2,
  Play,
  ExternalLink,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { SeenOnYouVideo } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { uploadFileWithProgress } from "@/lib/upload-utils";
import { CircularProgress } from "@/components/ui/CircularProgress";

interface SeenOnYouManagerProps {
  onVideosChange?: (videos: SeenOnYouVideo[]) => void;
}

export function SeenOnYouManager({ onVideosChange }: SeenOnYouManagerProps) {
  const { success, error } = useToast();
  const [videos, setVideos] = useState<SeenOnYouVideo[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<SeenOnYouVideo | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [productName, setProductName] = useState("");
  const [productSlug, setProductSlug] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [submitting, setSubmitting] = useState(false);

  // File upload state for video/thumbnail
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchVideos = async () => {
    try {
      const res = await fetch(`/api/admin/seen-on-you?t=${Date.now()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.videos)) {
        setVideos(json.videos);
        if (onVideosChange) onVideosChange(json.videos);
      }
    } catch {
      error("Failed to load customer videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleOpenAdd = () => {
    setEditingVideo(null);
    setCustomerName("");
    setVideoUrl("");
    setThumbnailUrl("");
    setCaption("");
    setProductName("");
    setProductSlug("");
    setStatus("active");
    setModalOpen(true);
  };

  const handleOpenEdit = (vid: SeenOnYouVideo) => {
    setEditingVideo(vid);
    setCustomerName(vid.customer_name);
    setVideoUrl(vid.video_url);
    setThumbnailUrl(vid.thumbnail_url || "");
    setCaption(vid.caption || "");
    setProductName(vid.product_name || "");
    setProductSlug(vid.product_slug || "");
    setStatus(vid.status as "active" | "inactive");
    setModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVid = file.type.startsWith("video/");
    setUploadingMedia(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "dnora/seen-on-you");
      formData.append("resource_type", isVid ? "video" : "image");

      const data = await uploadFileWithProgress<{ success: boolean; media: { secure_url: string }; error?: string }>(
        "/api/media/upload",
        formData,
        (percent) => setUploadProgress(percent)
      );

      if (!data.success || !data.media) {
        throw new Error(data.error || "Upload failed");
      }

      if (isVid) {
        setVideoUrl(data.media.secure_url);
      } else {
        setThumbnailUrl(data.media.secure_url);
      }
      setUploadProgress(100);
      success("Media uploaded successfully.");
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setUploadingMedia(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) {
      error("Video URL or media upload is required.");
      return;
    }

    setSubmitting(true);
    try {
      const url = editingVideo ? `/api/admin/seen-on-you/${editingVideo.id}` : "/api/admin/seen-on-you";
      const method = editingVideo ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName.trim() || "Patron of Florence",
          video_url: videoUrl.trim(),
          thumbnail_url: thumbnailUrl.trim() || undefined,
          caption: caption.trim() || undefined,
          product_name: productName.trim() || undefined,
          product_slug: productSlug.trim() || undefined,
          status,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Operation failed");
      }

      success(editingVideo ? "Post updated." : "Post added to Seen On You.");
      setModalOpen(false);
      fetchVideos();
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Failed to save post");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this customer video?")) return;

    try {
      const res = await fetch(`/api/admin/seen-on-you/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to delete");

      success("Video deleted.");
      fetchVideos();
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Failed to delete video");
    }
  };

  const handleToggleStatus = async (vid: SeenOnYouVideo) => {
    const newStatus = vid.status === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`/api/admin/seen-on-you/${vid.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      success(newStatus === "active" ? "Post is now visible on storefront." : "Post hidden.");
      fetchVideos();
    } catch {
      error("Error updating status");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs space-y-0">
      {/* Header */}
      <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Video className="w-4 h-4 text-indigo-600" />
            <span>Seen On You Reels & Video Content ({videos.length})</span>
          </h3>
          <p className="text-xs text-slate-500">
            Upload patron styling videos and reels to showcase authentic customer lifestyle content.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-b from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-[0_2px_8px_rgba(79,70,229,0.3)] active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Patron Video</span>
        </button>
      </div>

      {/* Grid of Reels */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          <span>Loading Seen On You content...</span>
        </div>
      ) : videos.length === 0 ? (
        <div className="p-10 text-center text-xs text-slate-400">
          No customer videos added yet. Click &quot;Add Patron Video&quot; to upload your first reel.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-5">
          {videos.map((vid) => (
            <div
              key={vid.id}
              className="group rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex flex-col shadow-2xs hover:shadow-md transition-all"
            >
              {/* 9:16 Video / Thumbnail Preview */}
              <div className="relative aspect-[9/16] bg-slate-900 overflow-hidden">
                {vid.video_url.endsWith(".mp4") || vid.video_url.includes("/video/upload/") ? (
                  <video
                    src={vid.video_url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                ) : vid.thumbnail_url ? (
                  <img src={vid.thumbnail_url} alt={vid.customer_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Video className="w-8 h-8 opacity-40" />
                  </div>
                )}

                {/* Status Badge */}
                <button
                  type="button"
                  onClick={() => handleToggleStatus(vid)}
                  className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md transition-all ${
                    vid.status === "active"
                      ? "bg-emerald-500/90 text-white"
                      : "bg-slate-900/80 text-slate-300"
                  }`}
                >
                  {vid.status === "active" ? "Live" : "Draft"}
                </button>

                {/* Play Icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity">
                  <span className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-xs flex items-center justify-center text-white">
                    <Play className="w-4 h-4 ml-0.5" />
                  </span>
                </div>
              </div>

              {/* Info & Actions */}
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2 bg-white">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {vid.customer_name}
                  </p>
                  {vid.product_name && (
                    <p className="text-[10px] text-indigo-600 font-semibold truncate">
                      {vid.product_name}
                    </p>
                  )}
                  {vid.caption && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-snug">
                      {vid.caption}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(vid)}
                    className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit Post"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(vid.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Post"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Edit */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingVideo ? "Edit Patron Video Post" : "Add New Patron Reel"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Patron / Handle Name *
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. @ananya.atelier or Ananya S."
              required
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Video upload / URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Video File or URL *
            </label>
            <div className="space-y-2">
              <input
                type="file"
                ref={videoInputRef}
                accept="video/*,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                disabled={uploadingMedia}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer disabled:opacity-60"
              >
                {uploadingMedia ? (
                  <>
                    <CircularProgress progress={uploadProgress} size={16} strokeWidth={2} />
                    <span>Uploading ({uploadProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Upload Video File (MP4, WebM)</span>
                  </>
                )}
              </button>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Or paste video link (Cloudinary, mp4)..."
                required
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] text-slate-700 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Linked Product Name (Optional)
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. The Marais Satchel"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              placeholder="e.g. Afternoon stroll through Mumbai wearing the Marais."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="vid-active"
              checked={status === "active"}
              onChange={(e) => setStatus(e.target.checked ? "active" : "inactive")}
              className="w-4 h-4 rounded text-indigo-600"
            />
            <label htmlFor="vid-active" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Publish immediately on storefront
            </label>
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
              disabled={submitting || uploadingMedia}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
            >
              {submitting ? "Saving..." : editingVideo ? "Save Changes" : "Publish Reel"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
