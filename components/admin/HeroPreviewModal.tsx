"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Monitor, Smartphone, X, ArrowRight } from "lucide-react";
import { HeroBanner } from "@/types";

interface HeroPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner: HeroBanner | null;
}

export function HeroPreviewModal({ isOpen, onClose, banner }: HeroPreviewModalProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  if (!isOpen || !banner) return null;

  const mediaUrl =
    device === "mobile" && banner.mobile_media_url ? banner.mobile_media_url : banner.media_url;

  const alignmentClasses = {
    left: "items-start text-left",
    center: "items-center text-center",
    right: "items-end text-right",
  };

  const align = banner.text_alignment || "left";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-6xl bg-[#161514] border border-[#2A2926] rounded-xl shadow-2xl z-10 overflow-hidden flex flex-col">
        {/* Preview Control Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2926] bg-[#0E0E0E]">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest font-bold text-white">
              Hero Live Simulation
            </span>
            <span
              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                banner.status === "published"
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                  : "bg-amber-950 text-amber-400 border border-amber-800"
              }`}
            >
              {banner.status}
            </span>
          </div>

          {/* Device Switcher */}
          <div className="flex items-center bg-[#1C1B1A] p-1 rounded-lg border border-[#2A2926]">
            <button
              onClick={() => setDevice("desktop")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                device === "desktop"
                  ? "bg-[#FAF9F6] text-[#0E0E0E] shadow"
                  : "text-[#73706A] hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                device === "mobile"
                  ? "bg-[#FAF9F6] text-[#0E0E0E] shadow"
                  : "text-[#73706A] hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#73706A] hover:text-white rounded-md"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Simulation Area */}
        <div className="p-4 sm:p-8 flex items-center justify-center bg-[#0E0E0E] min-h-[500px]">
          <div
            className={`transition-all duration-300 relative rounded-lg overflow-hidden border border-[#2A2926] shadow-2xl bg-black ${
              device === "desktop"
                ? "w-full aspect-[16/8] max-h-[560px]"
                : "w-[360px] aspect-[9/16] max-h-[640px]"
            }`}
          >
            {/* Media Layer */}
            {banner.media_type === "video" ? (
              <video
                key={mediaUrl}
                src={mediaUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={mediaUrl}
                alt={banner.title}
                fill
                sizes={device === "desktop" ? "1200px" : "360px"}
                className="object-cover"
              />
            )}

            {/* Gradient Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30 pointer-events-none" />

            {/* Content Simulation */}
            <div
              className={`absolute inset-0 p-6 sm:p-10 flex flex-col justify-end ${
                device === "mobile" ? "pb-8" : "pb-12"
              }`}
            >
              <div className={`flex flex-col ${alignmentClasses[align]}`}>
                {banner.subtitle && (
                  <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#C5A880] font-semibold mb-2">
                    {banner.subtitle}
                  </span>
                )}
                <h2
                  className={`font-heading font-extrabold text-white tracking-tight leading-tight mb-4 ${
                    device === "desktop" ? "text-3xl sm:text-4xl" : "text-xl"
                  }`}
                >
                  {banner.title}
                </h2>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#0E0E0E] text-[10px] uppercase font-bold tracking-[0.2em] rounded">
                  <span>{banner.button_text}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Simulated Badge */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-[10px] text-white/80 uppercase font-mono">
              {device.toUpperCase()} PREVIEW • {banner.media_type.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
