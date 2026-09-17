"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Volume2, VolumeX, ArrowUpRight } from "lucide-react";
import { SeenOnYouVideo } from "@/types";

interface SeenOnYouSectionProps {
  videos: SeenOnYouVideo[];
}

export function SeenOnYouSection({ videos }: SeenOnYouSectionProps) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  if (!videos || videos.length === 0) return null;

  return (
    <section id="seen-on-you" className="py-20 sm:py-28 bg-white border-t border-[#E8E5DE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-semibold block mb-2">
            Styled in the Wild
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-[#0E0E0E] tracking-tight mb-4">
            Seen On You
          </h2>
          <p className="text-sm text-[#73706A] leading-relaxed">
            Real moments from our community across Milan, Paris, London, and New York. Tag <span className="text-[#0E0E0E] font-medium">@DNORA</span> to be featured.
          </p>
        </div>

        {/* 9:16 Vertical Video Reel Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {videos.map((item) => (
            <VideoCard
              key={item.id}
              item={item}
              isActive={activeVideoId === item.id}
              onPlay={() => setActiveVideoId(item.id)}
              onPause={() => setActiveVideoId(null)}
              isMuted={isMuted}
              toggleMute={() => setIsMuted(!isMuted)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface VideoCardProps {
  item: SeenOnYouVideo;
  isActive: boolean;
  onPlay: () => void;
  onPause: () => void;
  isMuted: boolean;
  toggleMute: () => void;
}

function VideoCard({ item, isActive, onPlay, onPause, isMuted, toggleMute }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleMouseEnter = () => {
    onPlay();
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    onPause();
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div
      className="group relative aspect-[9/16] rounded-sm overflow-hidden bg-[#0E0E0E] border border-[#E8E5DE] shadow-md transition-all duration-500 hover:shadow-xl"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Fallback Poster Image */}
      {item.thumbnail_url && (
        <Image
          src={item.thumbnail_url}
          alt={item.caption}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={`object-cover transition-opacity duration-500 ${
            isActive ? "opacity-0" : "opacity-90"
          }`}
        />
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        src={item.video_url}
        muted={isMuted}
        loop
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          isActive ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Gradient Scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

      {/* Play Icon Indicator when Idle */}
      {!isActive && (
        <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 group-hover:scale-110 transition-transform">
          <Play className="w-4 h-4 fill-white translate-x-0.5" />
        </div>
      )}

      {/* Mute toggle when active */}
      {isActive && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMute();
          }}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-colors"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      )}

      {/* Bottom Information Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end text-white z-10 pointer-events-none">
        <span className="text-xs font-heading font-semibold text-[#C5A880] tracking-wide block mb-1">
          {item.customer_name}
        </span>
        <p className="text-xs text-[#FAF9F6] line-clamp-2 leading-relaxed mb-3 font-normal opacity-90">
          &ldquo;{item.caption}&rdquo;
        </p>

        {/* Linked Purse Tag */}
        {item.product_name && (
          <div className="pointer-events-auto">
            <Link
              href={item.product_slug ? `/product/${item.product_slug}` : "/shop"}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white text-white hover:text-[#0E0E0E] backdrop-blur-md text-[10px] font-semibold uppercase tracking-wider rounded-sm transition-all"
            >
              <span>{item.product_name}</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
