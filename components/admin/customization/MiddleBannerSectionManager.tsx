"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Video,
  Image as ImageIcon,
  Sliders,
  Clock,
  ExternalLink,
  Sparkles,
  Layers,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { uploadFileWithProgress } from "@/lib/upload-utils";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { PageLinkSelect } from "@/components/admin/PageLinkSelect";

interface MiddleBannerData {
  enabled: boolean;
  eyebrow?: string;
  title: string;
  description: string;
  button_text: string;
  button_link: string;
  image_url?: string;
  media_type?: "image" | "video";
  media_url?: string;
  height?: string;
  duration_seconds?: number;
  auto_swipe?: boolean;
}

interface MiddleBannerSectionManagerProps {
  data: MiddleBannerData;
  onChange: (updated: Partial<MiddleBannerData>) => void;
}

export function MiddleBannerSectionManager({ data, onChange }: MiddleBannerSectionManagerProps) {
  const { success, error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const rawHeight = data.height || "450px";
  let currentHeightNum = 450;
  if (rawHeight.includes("vh")) {
    const vh = parseInt(rawHeight.replace("vh", ""), 10) || 55;
    currentHeightNum = Math.round((vh / 100) * 800);
  } else if (rawHeight.includes("px")) {
    currentHeightNum = parseInt(rawHeight.replace("px", ""), 10) || 450;
  }

  const HEIGHT_PRESETS = [
    { label: "Compact", value: 340, text: "340px" },
    { label: "Standard", value: 450, text: "450px" },
    { label: "Prominent", value: 550, text: "550px" },
    { label: "Heroic", value: 680, text: "680px" },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVid = file.type.startsWith("video/");
    setUploading(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "dnora/middle-banner");
      formData.append("resource_type", isVid ? "video" : "image");

      const res = await uploadFileWithProgress<{ success: boolean; media: { secure_url: string }; error?: string }>(
        "/api/media/upload",
        formData,
        (percent) => setUploadProgress(percent)
      );

      if (!res.success || !res.media) throw new Error(res.error || "Upload failed");

      onChange({
        media_type: isVid ? "video" : "image",
        media_url: res.media.secure_url,
        image_url: res.media.secure_url,
      });

      setUploadProgress(100);
      success("Middle banner media uploaded successfully.");
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const currentMediaUrl = data.media_url || data.image_url || "";
  const isVideo = data.media_type === "video" || currentMediaUrl.endsWith(".mp4");

  return (
    <div className="space-y-6">
      {/* Banner Sizing & Media Type Row */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>Middle Banner Height & Sizing</span>
              </h3>
              <p className="text-xs text-slate-500">
                Smoothly scale the vertical display height with the slider or choose a preset.
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-lg shadow-2xs">
              {currentHeightNum}px
            </span>
          </div>

          {/* Range Slider for Middle Banner Height */}
          <input
            type="range"
            min="260"
            max="750"
            step="10"
            value={currentHeightNum}
            onChange={(e) => onChange({ height: `${e.target.value}px` })}
            className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />

          {/* Presets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {HEIGHT_PRESETS.map((preset) => (
              <button
                key={preset.text}
                type="button"
                onClick={() => onChange({ height: preset.text })}
                className={`py-2 px-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  currentHeightNum === preset.value || Math.abs(currentHeightNum - preset.value) < 15
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-indigo-500/20"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:text-slate-900 hover:bg-white shadow-2xs active:scale-95"
                }`}
              >
                <span className="text-xs font-bold">{preset.label}</span>
                <span
                  className={`text-[10px] font-mono ${
                    currentHeightNum === preset.value || Math.abs(currentHeightNum - preset.value) < 15
                      ? "text-slate-300"
                      : "text-slate-400"
                  }`}
                >
                  {preset.text}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Media Selector & Upload */}
        <div className="pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Background Media (Video or High-Res Image)
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Media Type Selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 shrink-0">
              <button
                type="button"
                onClick={() => onChange({ media_type: "image" })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !isVideo ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Image</span>
              </button>
              <button
                type="button"
                onClick={() => onChange({ media_type: "video" })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isVideo ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video</span>
              </button>
            </div>

            {/* Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              accept={isVideo ? "video/*" : "image/*"}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-60 shrink-0"
            >
              {uploading ? (
                <>
                  <CircularProgress progress={uploadProgress} size={16} strokeWidth={2} />
                  <span>Uploading ({uploadProgress}%)...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Upload {isVideo ? "Video" : "Image"}</span>
                </>
              )}
            </button>

            {/* Media URL text input */}
            <input
              type="text"
              value={currentMediaUrl}
              onChange={(e) =>
                onChange({
                  media_url: e.target.value,
                  image_url: e.target.value,
                })
              }
              placeholder="Or paste media URL (mp4, webm, jpg, png)..."
              className="flex-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Editorial Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4 text-left">
        <h3 className="text-sm font-bold text-slate-900">
          Middle Banner Editorial Typography & CTA
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Eyebrow Drop Tag
            </label>
            <input
              type="text"
              value={data.eyebrow || ""}
              onChange={(e) => onChange({ eyebrow: e.target.value })}
              placeholder="Atelier Edition • Florence"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Campaign Title *
            </label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="ARCHITECTURAL LEATHER"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Editorial Story Description
          </label>
          <textarea
            rows={2}
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              CTA Button Text
            </label>
            <input
              type="text"
              value={data.button_text}
              onChange={(e) => onChange({ button_text: e.target.value })}
              placeholder="DISCOVER THE ATELIER"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              CTA Button Link
            </label>
            <PageLinkSelect
              value={data.button_link}
              onChange={(val) => onChange({ button_link: val })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
