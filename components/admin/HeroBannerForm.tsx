"use client";

import React, { useState, useRef } from "react";
import { Upload, Video, Image as ImageIcon, Check, Loader2 } from "lucide-react";
import { HeroBanner } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { uploadFileWithProgress } from "@/lib/upload-utils";

interface HeroBannerFormProps {
  initialData?: HeroBanner | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function HeroBannerForm({ initialData, onSuccess, onCancel }: HeroBannerFormProps) {
  const { success, error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialData?.title || "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || "");
  const [mediaType, setMediaType] = useState<"image" | "video">(initialData?.media_type || "image");
  const [mediaUrl, setMediaUrl] = useState(initialData?.media_url || "");
  const [mobileMediaUrl, setMobileMediaUrl] = useState(initialData?.mobile_media_url || "");
  const [buttonText, setButtonText] = useState(initialData?.button_text || "Explore Collection");
  const [buttonLink, setButtonLink] = useState(initialData?.button_link || "/shop");
  const [durationSeconds, setDurationSeconds] = useState(initialData?.duration_seconds || 5);
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order || 0);
  const [textAlignment, setTextAlignment] = useState<"left" | "center" | "right">(
    initialData?.text_alignment || "left"
  );
  const [isActive, setIsActive] = useState(initialData ? initialData.is_active : true);
  const [status, setStatus] = useState<"draft" | "published" | "archived">(
    initialData?.status || "published"
  );

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // File upload to Cloudinary via server API with live CircularProgress
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(10);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "dnora/heroes");
      formData.append("resource_type", mediaType);

      const data = await uploadFileWithProgress<{ success: boolean; media: { secure_url: string }; error?: string }>(
        "/api/media/upload",
        formData,
        (percent) => {
          setUploadProgress(percent);
        }
      );

      if (!data.success || !data.media) {
        throw new Error(data.error || "Upload failed");
      }

      setMediaUrl(data.media.secure_url);
      setUploadProgress(100);
      success("Media uploaded successfully.");
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Failed to upload media");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !mediaUrl) {
      error("Please provide both a title and media URL.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        subtitle: subtitle || undefined,
        media_type: mediaType,
        media_url: mediaUrl,
        mobile_media_url: mobileMediaUrl || undefined,
        button_text: buttonText,
        button_link: buttonLink,
        duration_seconds: Number(durationSeconds),
        sort_order: Number(sortOrder),
        status,
        is_active: status === "published",
        text_alignment: textAlignment,
      };

      const url = initialData?.id ? `/api/heroes/${initialData.id}` : "/api/heroes";
      const method = initialData?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save hero banner");
      }

      success(
        initialData?.id
          ? "Hero banner updated successfully."
          : "Hero banner created successfully."
      );
      onSuccess();
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Media Type Selector */}
      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E] mb-2">
          Media Type
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setMediaType("image")}
            className={`flex items-center justify-center gap-2 p-3 rounded-md border text-xs font-bold uppercase tracking-wider transition-all ${
              mediaType === "image"
                ? "bg-[#0E0E0E] text-[#FAF9F6] border-[#0E0E0E]"
                : "bg-white text-[#73706A] border-[#E8E5DE] hover:border-[#0E0E0E]"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>High-Res Image</span>
          </button>
          <button
            type="button"
            onClick={() => setMediaType("video")}
            className={`flex items-center justify-center gap-2 p-3 rounded-md border text-xs font-bold uppercase tracking-wider transition-all ${
              mediaType === "video"
                ? "bg-[#0E0E0E] text-[#FAF9F6] border-[#0E0E0E]"
                : "bg-white text-[#73706A] border-[#E8E5DE] hover:border-[#0E0E0E]"
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Cinematic Video</span>
          </button>
        </div>
      </div>

      {/* Cloudinary Upload or URL Input */}
      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E] mb-2">
          Hero Media (Cloudinary Asset)
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            required
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder={`Enter ${mediaType} URL or upload below`}
            className="flex-1 bg-white border border-[#E8E5DE] px-4 py-2.5 text-xs text-[#0E0E0E] rounded focus:outline-none focus:border-[#0E0E0E]"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FAF9F6] border border-[#E8E5DE] hover:border-[#0E0E0E] text-xs font-semibold text-[#0E0E0E] rounded transition-all shrink-0 disabled:opacity-80"
          >
            {uploading ? (
              <>
                <CircularProgress progress={uploadProgress} size={16} strokeWidth={2.5} />
                <span>Uploading {uploadProgress}%</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 text-[#C5A880]" />
                <span>Upload {mediaType === "video" ? "Video" : "Image"}</span>
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={mediaType === "video" ? "video/*" : "image/*"}
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
        <p className="text-[11px] text-[#73706A] mt-1">
          Uploads directly to Cloudinary folder <code className="font-mono">dnora/heroes/</code>.
        </p>
      </div>

      {/* Optional Mobile Media URL */}
      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E] mb-1">
          Mobile Media URL (Optional Art-Direction)
        </label>
        <input
          type="url"
          value={mobileMediaUrl}
          onChange={(e) => setMobileMediaUrl(e.target.value)}
          placeholder="Optional vertical crop URL for small screens"
          className="w-full bg-white border border-[#E8E5DE] px-4 py-2 text-xs text-[#0E0E0E] rounded focus:outline-none focus:border-[#0E0E0E]"
        />
      </div>

      {/* Title & Subtitle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E] mb-1">
            Editorial Headline
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. THE MARAIS COLLECTION"
            className="w-full bg-white border border-[#E8E5DE] px-4 py-2 text-xs text-[#0E0E0E] rounded focus:outline-none focus:border-[#0E0E0E]"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E] mb-1">
            Subtitle / Tagline
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="e.g. Spring / Summer 2026 Collection"
            className="w-full bg-white border border-[#E8E5DE] px-4 py-2 text-xs text-[#0E0E0E] rounded focus:outline-none focus:border-[#0E0E0E]"
          />
        </div>
      </div>

      {/* CTA Button Text & Link */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E] mb-1">
            Button Label
          </label>
          <input
            type="text"
            required
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
            placeholder="Explore Collection"
            className="w-full bg-white border border-[#E8E5DE] px-4 py-2 text-xs text-[#0E0E0E] rounded focus:outline-none focus:border-[#0E0E0E]"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E] mb-1">
            Button Destination Link
          </label>
          <input
            type="text"
            required
            value={buttonLink}
            onChange={(e) => setButtonLink(e.target.value)}
            placeholder="/shop"
            className="w-full bg-white border border-[#E8E5DE] px-4 py-2 text-xs text-[#0E0E0E] rounded focus:outline-none focus:border-[#0E0E0E]"
          />
        </div>
      </div>

      {/* Timing, Alignment, Order */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E] mb-1">
            Image Duration (Seconds)
          </label>
          <input
            type="number"
            min={2}
            max={30}
            value={durationSeconds}
            onChange={(e) => setDurationSeconds(Number(e.target.value))}
            className="w-full bg-white border border-[#E8E5DE] px-4 py-2 text-xs text-[#0E0E0E] rounded focus:outline-none focus:border-[#0E0E0E]"
          />
          <span className="text-[10px] text-[#73706A]">For image slides. Videos advance on end.</span>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E] mb-1">
            Text Alignment
          </label>
          <select
            value={textAlignment}
            onChange={(e) => setTextAlignment(e.target.value as "left" | "center" | "right")}
            className="w-full bg-white border border-[#E8E5DE] px-4 py-2 text-xs text-[#0E0E0E] rounded focus:outline-none focus:border-[#0E0E0E]"
          >
            <option value="left">Left Aligned</option>
            <option value="center">Centered</option>
            <option value="right">Right Aligned</option>
          </select>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E] mb-1">
            Display Order
          </label>
          <input
            type="number"
            min={1}
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="w-full bg-white border border-[#E8E5DE] px-4 py-2 text-xs text-[#0E0E0E] rounded focus:outline-none focus:border-[#0E0E0E]"
          />
        </div>
      </div>

      {/* Status Mode */}
      <div className="bg-[#FAF9F6] p-4 rounded-md border border-[#E8E5DE]">
        <label className="block text-xs uppercase tracking-wider font-semibold text-[#0E0E0E] mb-2">
          Publishing Workflow
        </label>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <input
              type="radio"
              name="status"
              value="draft"
              checked={status === "draft"}
              onChange={() => setStatus("draft")}
              className="accent-[#0E0E0E]"
            />
            <span>Save as Draft (Hidden from Public)</span>
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <input
              type="radio"
              name="status"
              value="published"
              checked={status === "published"}
              onChange={() => setStatus("published")}
              className="accent-[#0E0E0E]"
            />
            <span>Publish Immediately (Live on Website)</span>
          </label>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E5DE]">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-xs uppercase tracking-wider font-semibold text-[#73706A] hover:text-[#0E0E0E] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0E0E0E] hover:bg-[#2C2B29] text-[#FAF9F6] text-xs font-bold uppercase tracking-wider rounded transition-all shadow-md disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-[#C5A880]" />}
          <span>{initialData?.id ? "Update Banner" : "Save Hero Banner"}</span>
        </button>
      </div>
    </form>
  );
}
