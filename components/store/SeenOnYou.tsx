"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  X,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Check,
} from "lucide-react";
import { StyleReel } from "@/types";
import { INITIAL_STYLE_REELS } from "@/lib/seed/reels-data";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { formatINR } from "@/lib/utils";
import { useCart } from "@/lib/context/cart-context";

interface SeenOnYouProps {
  reels?: StyleReel[];
}

export function SeenOnYou({ reels = INITIAL_STYLE_REELS }: SeenOnYouProps) {
  const { addToCart, openCart } = useCart();
  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Section in-view state
  const [isInView, setIsInView] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [playingIndices, setPlayingIndices] = useState<Record<number, boolean>>({});

  // Fullscreen Reel Modal State
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);
  const [modalIsPlaying, setModalIsPlaying] = useState(true);
  const [modalIsMuted, setModalIsMuted] = useState(false);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);
  const [addedNotice, setAddedNotice] = useState(false);

  // Auto-play videos when user reaches this section in viewport
  useEffect(() => {
    const target = sectionRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            videoRefs.current.forEach((vid, idx) => {
              if (vid) {
                vid.play().then(() => {
                  setPlayingIndices((prev) => ({ ...prev, [idx]: true }));
                }).catch(() => {
                  // Browser autoplay restriction handled gracefully
                });
              }
            });
          } else {
            setIsInView(false);
            videoRefs.current.forEach((vid, idx) => {
              if (vid) {
                vid.pause();
                setPlayingIndices((prev) => ({ ...prev, [idx]: false }));
              }
            });
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [reels]);

  // Handle manual play/pause for a card
  const togglePlay = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const vid = videoRefs.current[index];
    if (!vid) return;

    if (vid.paused) {
      vid.play();
      setPlayingIndices((prev) => ({ ...prev, [index]: true }));
    } else {
      vid.pause();
      setPlayingIndices((prev) => ({ ...prev, [index]: false }));
    }
  };

  // Toggle audio across videos
  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    videoRefs.current.forEach((vid) => {
      if (vid) vid.muted = newMuted;
    });
  };

  // Horizontal scroll navigation
  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const distance = 320;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  // Open modal for a reel
  const openReelModal = (index: number) => {
    setActiveModalIndex(index);
    setModalIsPlaying(true);
    setAddedNotice(false);
  };

  const closeReelModal = () => {
    setActiveModalIndex(null);
  };

  // Modal Next/Previous navigation
  const nextReel = () => {
    if (activeModalIndex === null) return;
    setActiveModalIndex((activeModalIndex + 1) % reels.length);
    setAddedNotice(false);
  };

  const prevReel = () => {
    if (activeModalIndex === null) return;
    setActiveModalIndex((activeModalIndex - 1 + reels.length) % reels.length);
    setAddedNotice(false);
  };

  // Modal keyboard navigation
  useEffect(() => {
    if (activeModalIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeReelModal();
      if (e.key === "ArrowRight") nextReel();
      if (e.key === "ArrowLeft") prevReel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModalIndex]);

  // Sync modal video playback
  useEffect(() => {
    if (modalVideoRef.current && activeModalIndex !== null) {
      modalVideoRef.current.currentTime = 0;
      modalVideoRef.current.play().catch(() => {});
      setModalIsPlaying(true);
    }
  }, [activeModalIndex]);

  const activeReel = activeModalIndex !== null ? reels[activeModalIndex] : null;

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-24 bg-[#FAF7F2] border-t border-b border-[#EAE5DC] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Title & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4 pb-4 border-b border-[#EAE5DC]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.25em] text-[#C5A880] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Community & Atelier Styling</span>
            </div>
            <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl text-[#0F172A] font-medium tracking-[0.06em]">
              Seen on you
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] font-normal tracking-wide">
              Styled by real people.
            </p>
          </div>

          {/* Right Controls: Audio Toggle, Instagram Tag & Arrow Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSound}
              className="px-3 py-1.5 rounded-full border border-[#CBD5E1] bg-white text-xs text-[#0F172A] hover:bg-[#0F172A] hover:text-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              title={isMuted ? "Unmute all videos" : "Mute all videos"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#64748B]" /> : <Volume2 className="w-3.5 h-3.5 text-[#C5A880]" />}
              <span className="text-[11px] font-medium uppercase tracking-wider">{isMuted ? "Sound Off" : "Sound On"}</span>
            </button>

            <a
              href="https://www.instagram.com/dnora_lifestyle/?utm_source=ig_web_button_share_sheet"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0F172A] text-white text-[11px] uppercase tracking-wider font-semibold hover:bg-[#C5A880] hover:text-[#0F172A] transition-all"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
              <span>Tag #DNORALifestyle</span>
            </a>

            {/* Desktop Left / Right Scroll Buttons */}
            <div className="flex items-center gap-1.5 ml-1">
              <button
                type="button"
                onClick={() => scroll("left")}
                className="w-8 h-8 rounded-full border border-[#CBD5E1] bg-white flex items-center justify-center text-[#0F172A] hover:bg-[#0F172A] hover:text-white transition-all shadow-xs cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                className="w-8 h-8 rounded-full border border-[#CBD5E1] bg-white flex items-center justify-center text-[#0F172A] hover:bg-[#0F172A] hover:text-white transition-all shadow-xs cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Video Reels Horizontal Carousel */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory"
        >
          {reels.map((reel, index) => {
            const isPlaying = playingIndices[index] ?? false;

            return (
              <div
                key={reel.id}
                onClick={() => openReelModal(index)}
                className="relative shrink-0 w-[240px] sm:w-[280px] aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-md border border-[#E2E8F0] group cursor-pointer snap-start select-none transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Background Video (Autoplays on scroll into view) */}
                <video
                  ref={(el) => {
                    videoRefs.current[index] = el;
                  }}
                  src={reel.video_url}
                  poster={reel.poster_url}
                  muted={isMuted}
                  playsInline
                  loop
                  preload="metadata"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />

                {/* Dark Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85 pointer-events-none" />

                {/* Top Overlay: Creator Credit & Play Status */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white z-10 pointer-events-none">
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                    <InstagramIcon className="w-3 h-3 text-[#C5A880]" />
                    <span className="text-[10px] font-semibold tracking-wider truncate max-w-[120px]">
                      {reel.creator_handle}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => togglePlay(index, e)}
                    className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 pointer-events-auto hover:bg-black/70 transition-colors cursor-pointer"
                    aria-label={isPlaying ? "Pause video" : "Play video"}
                  >
                    {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
                  </button>
                </div>

                {/* Center Hover Indicator */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/40 shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Bottom Overlay: Caption & Shoppable Product Pill */}
                <div className="absolute bottom-3 left-3 right-3 space-y-2 z-10">
                  <p className="text-[11px] text-white/90 line-clamp-2 leading-snug drop-shadow-sm font-light">
                    {reel.caption}
                  </p>

                  {/* Shoppable Product Card Box */}
                  <Link
                    href={`/product/${reel.product_slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/95 backdrop-blur-md text-[#0F172A] border border-white/40 shadow-md hover:bg-white transition-all group/prod"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative w-9 h-11 rounded-md overflow-hidden bg-[#F1EFEA] shrink-0 border border-[#E2E8F0]">
                        <Image
                          src={reel.product_image}
                          alt={reel.product_name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 text-left">
                        <span className="block text-[11px] font-semibold truncate text-[#0F172A]">
                          {reel.product_name}
                        </span>
                        <span className="block text-[10px] font-mono font-medium text-[#C5A880]">
                          {formatINR(reel.product_price)}
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-1 rounded-md bg-[#0F172A] text-[#F8FAFC] text-[9px] uppercase tracking-wider font-semibold group-hover/prod:bg-[#C5A880] group-hover/prod:text-[#0F172A] transition-colors shrink-0 ml-1">
                      Shop
                    </span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Vertical Reel Player Modal */}
      {activeReel && (
        <div
          className="fixed inset-0 z-50 bg-[#0F172A]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none"
          onClick={closeReelModal}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={closeReelModal}
            className="absolute top-5 right-5 z-30 p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer"
            aria-label="Close reel modal"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous Reel Arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevReel();
            }}
            className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer"
            aria-label="Previous reel"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Reel Arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextReel();
            }}
            className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer"
            aria-label="Next reel"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Modal Content Container (Phone Frame) */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm sm:max-w-md h-[88vh] max-h-[760px] rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/20 flex flex-col justify-between"
          >
            {/* Modal Video Element */}
            <video
              ref={modalVideoRef}
              src={activeReel.video_url}
              poster={activeReel.poster_url}
              playsInline
              loop
              muted={modalIsMuted}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Subtle Gradient Backdrop */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90 pointer-events-none" />

            {/* Top Bar inside Modal */}
            <div className="relative z-10 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] flex items-center justify-center shadow-md">
                  <InstagramIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="block text-xs font-semibold">{activeReel.creator_name}</span>
                  <span className="block text-[10px] text-white/70">{activeReel.creator_handle}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalIsMuted(!modalIsMuted)}
                  className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 hover:bg-black/60 transition-colors cursor-pointer"
                  aria-label={modalIsMuted ? "Unmute audio" : "Mute audio"}
                >
                  {modalIsMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#C5A880]" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (modalVideoRef.current) {
                      if (modalIsPlaying) modalVideoRef.current.pause();
                      else modalVideoRef.current.play();
                      setModalIsPlaying(!modalIsPlaying);
                    }
                  }}
                  className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 hover:bg-black/60 transition-colors cursor-pointer"
                  aria-label={modalIsPlaying ? "Pause video" : "Play video"}
                >
                  {modalIsPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Bottom Section inside Modal: Caption & Shoppable Product Card */}
            <div className="relative z-10 p-4 space-y-3">
              <p className="text-xs text-white/95 leading-relaxed font-light">
                {activeReel.caption}
              </p>

              {/* Shoppable Product Card Drawer */}
              <div className="p-3 rounded-2xl bg-white/95 backdrop-blur-lg text-[#0F172A] border border-white/40 shadow-xl space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-[#F1EFEA] border border-[#E2E8F0] shrink-0">
                    <Image
                      src={activeReel.product_image}
                      alt={activeReel.product_name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-[#C5A880] font-semibold">
                      Featured Silhouette
                    </span>
                    <h4 className="text-xs font-semibold text-[#0F172A] truncate">
                      {activeReel.product_name}
                    </h4>
                    <span className="text-xs font-mono font-bold text-[#0F172A]">
                      {formatINR(activeReel.product_price)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/product/${activeReel.product_slug}`}
                    onClick={closeReelModal}
                    className="flex-1 py-2 text-center rounded-lg bg-[#0F172A] hover:bg-[#C5A880] hover:text-[#0F172A] text-white text-[11px] uppercase tracking-wider font-semibold transition-all"
                  >
                    View Product
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      // Add linked product to cart
                      const dummyProduct: any = {
                        id: activeReel.product_id,
                        slug: activeReel.product_slug,
                        name: activeReel.product_name,
                        base_price: activeReel.product_price,
                        primary_image: activeReel.product_image,
                        category_slug: "handbags",
                        images: [{ id: "1", product_id: activeReel.product_id, url: activeReel.product_image, alt_text: activeReel.product_name, display_order: 1, is_primary: true }],
                        variants: [],
                      };
                      addToCart(dummyProduct, undefined, 1);
                      setAddedNotice(true);
                      setTimeout(() => {
                        setAddedNotice(false);
                        closeReelModal();
                        openCart();
                      }, 700);
                    }}
                    className="px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#CBD5E1] hover:border-[#0F172A] text-[#0F172A] text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {addedNotice ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <ShoppingBag className="w-3.5 h-3.5" />
                    )}
                    <span>{addedNotice ? "Added" : "Bag"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
