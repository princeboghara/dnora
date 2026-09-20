"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Volume2, VolumeX, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SeenOnYouVideo } from "@/types";
import { getResolvedFontFamily } from "@/lib/font-constants";

interface SeenOnYouSectionProps {
  videos: SeenOnYouVideo[];
  title?: string;
  headingColor?: string;
  headingFontSize?: string;
  headingFontFamily?: string;
  headingFontWeight?: string;
  cardGap?: number;
}

export function SeenOnYouSection({
  videos,
  title = "SEEN ON YOU",
  headingColor,
  headingFontSize,
  headingFontFamily,
  headingFontWeight,
  cardGap,
}: SeenOnYouSectionProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  if (!videos || videos.length === 0) return null;

  const resolvedFont = getResolvedFontFamily(headingFontFamily);

  return (
    <section id="seen-on-you" className="py-10 sm:py-14 bg-[#FAF9F6] border-t border-[#E8E5DE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Section Heading */}
        <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0E0E0E] tracking-tight uppercase font-arial-rounded"
            style={{
              fontFamily: resolvedFont,
              color: headingColor || undefined,
              fontSize: headingFontSize
                ? headingFontSize.includes("px")
                  ? headingFontSize
                  : `${headingFontSize}px`
                : undefined,
              fontWeight: headingFontWeight || undefined,
            }}
          >
            {title}
          </h2>
        </div>

        {/* Carousel Container with Subtle Chevrons */}
        <div className="relative max-w-6xl mx-auto px-1 sm:px-4">
          <button
            type="button"
            onClick={() => handleScroll("left")}
            aria-label="Previous looks"
            className="hidden sm:flex absolute -left-4 lg:-left-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-[#E8E5DE] shadow-sm items-center justify-center text-[#0E0E0E] hover:bg-[#F5F3EF] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => handleScroll("right")}
            aria-label="Next looks"
            className="hidden sm:flex absolute -right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-[#E8E5DE] shadow-sm items-center justify-center text-[#0E0E0E] hover:bg-[#F5F3EF] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Horizontal Scrolling Video & Editorial Card Carousel */}
          <div
            ref={scrollRef}
            className={cn(
              "flex items-center overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 pt-1 px-2",
              cardGap === undefined && "gap-2 sm:gap-3"
            )}
            style={{
              scrollBehavior: "smooth",
              gap: cardGap !== undefined ? `${cardGap}px` : undefined,
            }}
          >
            {videos.map((item, idx) => (
              <AutoplayVideoCard key={item.id} item={item} index={idx + 1} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface AutoplayVideoCardProps {
  item: SeenOnYouVideo;
  index: number;
}

function AutoplayVideoCard({ item, index }: AutoplayVideoCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Viewport Autoplay: IntersectionObserver automatically starts playback when visible
  useEffect(() => {
    const cardEl = cardRef.current;
    const videoEl = videoRef.current;
    if (!cardEl || !videoEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // Video is at least 50% visible in viewport -> start playback automatically
            videoEl.play().then(() => {
              setIsPlaying(true);
            }).catch(() => {
              // Autoplay error handling fallback
            });
          } else {
            // Video left viewport -> pause playback
            videoEl.pause();
            setIsPlaying(false);
          }
        });
      },
      {
        threshold: [0, 0.5, 1],
      }
    );

    observer.observe(cardEl);

    return () => {
      observer.disconnect();
    };
  }, []);

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  return (
    <div
      ref={cardRef}
      className="group relative w-60 sm:w-68 md:w-72 aspect-[9/16] shrink-0 snap-start rounded-xs overflow-hidden bg-[#0E0E0E] border border-[#E8E5DE] shadow-sm transition-all duration-300 select-none"
    >
      {/* Fallback Poster Image */}
      {item.thumbnail_url && (
        <Image
          src={item.thumbnail_url}
          alt={item.caption || "DNORA Style"}
          fill
          sizes="(max-width: 640px) 240px, 288px"
          className={`object-cover transition-opacity duration-700 ${
            isPlaying ? "opacity-0 pointer-events-none" : "opacity-95"
          }`}
        />
      )}

      {/* Viewport Autoplay Video */}
      {item.video_url && (
        <video
          ref={videoRef}
          src={item.video_url}
          muted={isMuted}
          playsInline
          loop
          preload="metadata"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            isPlaying ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* Luxury Gradient Scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/15 pointer-events-none" />

      {/* Top Editorial Story Badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="text-[9px] uppercase tracking-[0.24em] font-bold text-white/90 bg-black/55 backdrop-blur-md px-2 py-0.5 rounded-xs border border-white/10">
          Look 0{index}
        </span>
      </div>

      {/* Audio Mute/Unmute Toggle */}
      {item.video_url && (
        <button
          type="button"
          onClick={toggleAudio}
          className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      )}

      {/* Bottom Editorial Content & "Shop the Look" */}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex flex-col justify-end text-white z-10 pointer-events-none">
        <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white/85 block mb-1">
          {item.customer_name}
        </span>

        <p className="text-xs text-[#FAF9F6] line-clamp-2 leading-relaxed mb-3 font-normal opacity-90">
          &ldquo;{item.caption}&rdquo;
        </p>

        {/* "Shop the Look" CTA */}
        {item.product_name && (
          <div className="pointer-events-auto">
            <Link
              href={item.product_slug ? `/product/${item.product_slug}` : "/shop"}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#0E0E0E] hover:bg-[#FAF9F6] text-[10px] font-bold uppercase tracking-[0.16em] rounded-xs shadow-sm transition-all active:scale-95"
            >
              <span>Shop Look</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
