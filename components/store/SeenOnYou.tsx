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
  Heart,
  MessageCircle,
  Share2,
  Send,
  Check,
} from "lucide-react";
import { StyleReel, ReelComment } from "@/types";
import { formatINR } from "@/lib/utils";
import { useCart } from "@/lib/context/cart-context";
import {
  getAllAdminReels,
  addCommentToReel,
  toggleLikeReel,
} from "@/lib/services/reels-service";

import { INITIAL_STYLE_REELS } from "@/lib/seed/reels-data";

interface SeenOnYouProps {
  initialReels?: StyleReel[];
}

export function SeenOnYou({ initialReels }: SeenOnYouProps) {
  const { addToCart, openCart } = useCart();
  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Local state synced with reels service (initialized immediately so ref is always mounted)
  const [reels, setReels] = useState<StyleReel[]>(
    initialReels && initialReels.length > 0 ? initialReels : INITIAL_STYLE_REELS
  );
  const [isInView, setIsInView] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Sequential Playback Index: Only ONE video plays at a time
  const [activeSequentialIdx, setActiveSequentialIdx] = useState<number>(0);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const isAdvancingRef = useRef<boolean>(false);

  // Fullscreen Reel Modal State
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);
  const [modalIsPlaying, setModalIsPlaying] = useState(true);
  const [modalIsMuted, setModalIsMuted] = useState(false);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);
  const [addedNotice, setAddedNotice] = useState(false);

  // Modal Interactive Actions: Likes & Comments
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({});
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");
  const [copyToast, setCopyToast] = useState(false);

  // 1. Sync reels on mount and listen to admin updates
  useEffect(() => {
    const loadReels = () => {
      const all = getAllAdminReels();
      const active = all
        .filter((r) => r.is_active !== false)
        .sort((a, b) => (a.display_order ?? 1) - (b.display_order ?? 1));
      setReels(active);
    };

    loadReels();

    window.addEventListener("dnora_reels_updated", loadReels);
    window.addEventListener("storage", loadReels);
    return () => {
      window.removeEventListener("dnora_reels_updated", loadReels);
      window.removeEventListener("storage", loadReels);
    };
  }, []);

  // Direct playback trigger that starts buffering and playback immediately
  const playSafely = (vid: HTMLVideoElement) => {
    if (!vid) return;
    vid.muted = isMuted;
    vid.defaultMuted = true;
    vid.playsInline = true;

    const promise = vid.play();
    if (promise !== undefined) {
      promise.catch(() => {
        // Fallback: force muted attribute directly and retry
        vid.muted = true;
        vid.defaultMuted = true;
        vid.play().catch(() => {});
      });
    }
  };

  // 2. High-Sensitivity Visibility Detection (Observer + Active Scroll Check)
  useEffect(() => {
    const target = sectionRef.current;
    if (!target) return;

    const checkVisibility = () => {
      const rect = target.getBoundingClientRect();
      // Section is active if top is within 400px of entering viewport and bottom is still on screen
      const visible = rect.top < window.innerHeight + 400 && rect.bottom > 40;
      setIsInView(visible);
      if (visible) {
        const vid = videoRefs.current[activeSequentialIdx];
        if (vid && vid.paused) {
          playSafely(vid);
        }
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            const vid = videoRefs.current[activeSequentialIdx];
            if (vid && vid.paused) {
              playSafely(vid);
            }
          } else {
            // Only deactivate when truly scrolled far away
            const rect = target.getBoundingClientRect();
            if (rect.bottom <= 0 || rect.top >= window.innerHeight + 400) {
              setIsInView(false);
              videoRefs.current.forEach((vid) => {
                if (vid) vid.pause();
              });
            }
          }
        });
      },
      { threshold: [0, 0.05, 0.1, 0.25], rootMargin: "400px 0px" }
    );

    observer.observe(target);
    window.addEventListener("scroll", checkVisibility, { passive: true });
    checkVisibility();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", checkVisibility);
    };
  }, [activeSequentialIdx, isMuted]);

  // User gesture / scroll unlocker (ensures mobile / Chrome autoplay policy is fulfilled)
  useEffect(() => {
    const handleUserInteraction = () => {
      if (isInView && videoRefs.current[activeSequentialIdx]) {
        const vid = videoRefs.current[activeSequentialIdx];
        if (vid && vid.paused) {
          playSafely(vid);
        }
      }
    };

    window.addEventListener("scroll", handleUserInteraction, { passive: true });
    window.addEventListener("touchstart", handleUserInteraction, { passive: true, once: true });
    window.addEventListener("pointerdown", handleUserInteraction, { passive: true, once: true });

    return () => {
      window.removeEventListener("scroll", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
      window.removeEventListener("pointerdown", handleUserInteraction);
    };
  }, [isInView, activeSequentialIdx, isMuted]);

  // 3. Sequential Playback Manager:
  // Plays Video 0 as soon as section is in view.
  // When it finishes, immediately advances to Video 1, then Video 2, etc.!
  useEffect(() => {
    if (!isInView || reels.length === 0) {
      videoRefs.current.forEach((vid) => vid?.pause());
      return;
    }

    setVideoProgress(0);

    videoRefs.current.forEach((vid, idx) => {
      if (!vid) return;

      if (idx === activeSequentialIdx) {
        if (vid.paused) {
          playSafely(vid);
        }

        // Auto-center active playing video in horizontal carousel
        const cardEl = vid.parentElement;
        if (cardEl && scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          const cardLeft = cardEl.offsetLeft - container.offsetLeft;
          const targetScroll = cardLeft - (container.clientWidth / 2 - cardEl.clientWidth / 2);
          container.scrollTo({
            left: Math.max(0, targetScroll),
            behavior: "smooth",
          });
        }
      } else {
        vid.pause();
        vid.currentTime = 0;
      }
    });
  }, [isInView, activeSequentialIdx, reels.length, isMuted]);

  // When a video finishes playing on the homepage, advance to next video in sequence!
  const handleVideoEnded = (endedIdx: number) => {
    if (isAdvancingRef.current) return;
    isAdvancingRef.current = true;

    if (reels.length > 1) {
      const nextIdx = (endedIdx + 1) % reels.length;
      setActiveSequentialIdx(nextIdx);
    } else {
      const vid = videoRefs.current[endedIdx];
      if (vid) {
        vid.currentTime = 0;
        vid.play().catch(() => {});
      }
    }

    setTimeout(() => {
      isAdvancingRef.current = false;
    }, 450);
  };

  // Toggle Sound for carousel
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
    const distance = 300;
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
    setShowComments(false);

    // Pause background carousel videos
    videoRefs.current.forEach((v) => v?.pause());
  };

  const closeReelModal = () => {
    setActiveModalIndex(null);
    setShowComments(false);

    // Resume sequential video
    if (isInView && videoRefs.current[activeSequentialIdx]) {
      const vid = videoRefs.current[activeSequentialIdx];
      if (vid) {
        playSafely(vid);
      }
    }
  };

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

  // Handle Reel Like
  const handleLikeClick = (reelId: string) => {
    const isLiked = likedReels[reelId] ?? false;
    const updatedLiked = { ...likedReels, [reelId]: !isLiked };
    setLikedReels(updatedLiked);
    const updatedReels = toggleLikeReel(reelId, isLiked);
    setReels(updatedReels.filter((r) => r.is_active !== false));
  };

  // Handle Comment Submission
  const handleCommentSubmit = (e: React.FormEvent, reelId: string) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const author = commentAuthor.trim() || "Patron";
    const updated = addCommentToReel(reelId, {
      user_name: author,
      comment: newCommentText.trim(),
    });

    setReels(updated.filter((r) => r.is_active !== false));
    setNewCommentText("");
  };

  // Handle Share Reel Link
  const handleShareReel = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2500);
    }
  };

  const activeReel = activeModalIndex !== null ? reels[activeModalIndex] : null;

  // Empty state when all videos are deleted: Show refined English announcement
  if (reels.length === 0) {
    return (
      <section
        ref={sectionRef}
        className="py-12 sm:py-16 bg-[#FAF7F2] border-t border-b border-[#EAE5DC] overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header - Centered Middle on Page */}
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-1.5">
            <div className="inline-flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B] font-semibold font-mono">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Community &amp; Atelier Styling</span>
            </div>
            <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl text-[#111111] font-light uppercase tracking-[0.14em]">
              Seen on you
            </h2>
            <p className="text-xs sm:text-sm text-[#736357] font-light tracking-wide">
              Styled by real people.
            </p>
            <div className="w-10 h-[1.5px] bg-[#C5A880] mx-auto mt-2" />
          </div>

          {/* Luxury Empty State Box */}
          <div className="max-w-xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl border border-[#EAE5DC] p-8 sm:p-10 text-center shadow-xs space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF7F2] border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-[0.25em] font-mono text-[#8C7A6B] font-semibold block">
                New Lookbooks In Preparation
              </span>
              <h3 className="font-sans text-lg sm:text-xl text-[#111111] uppercase tracking-[0.12em] font-light">
                Fresh Styling Reels Arriving Soon
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#736357] leading-relaxed font-light max-w-md mx-auto">
              Our patrons and atelier stylists are currently curating new community styling videos and daily carry inspirations. New reels will be uploaded shortly.
            </p>
            <div className="pt-2 flex justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#111111] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider hover:bg-[#C5A880] hover:text-[#111111] transition-all"
              >
                <span>Explore Current Collection</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="py-8 sm:py-12 bg-[#FAF7F2] border-t border-b border-[#EAE5DC] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Centered Middle on Page */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 space-y-1.5">
          <div className="inline-flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B] font-semibold font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Community &amp; Atelier Styling</span>
          </div>
          <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl text-[#111111] font-light uppercase tracking-[0.14em]">
            Seen on you
          </h2>
          <p className="text-xs sm:text-sm text-[#736357] font-light tracking-wide">
            Styled by real people.
          </p>
          <div className="w-10 h-[1.5px] bg-[#C5A880] mx-auto mt-2" />
        </div>

        {/* Carousel Top Navigation Bar: Audio Toggle & Scroll Controls */}
        <div className="flex items-center justify-between mb-4 px-1">
          <button
            type="button"
            onClick={toggleSound}
            className="px-3.5 py-1.5 rounded-full border border-[#CBD5E1] bg-white text-xs text-[#0F172A] hover:bg-[#0F172A] hover:text-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            title={isMuted ? "Turn Sound On" : "Mute Sound"}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-[#64748B]" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-[#C5A880]" />
            )}
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
              {isMuted ? "Sound Off" : "Sound On"}
            </span>
          </button>

          {/* Left / Right Scroll Buttons */}
          <div className="flex items-center gap-2">
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

        {/* Video Reels Horizontal Carousel */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
        >
          {reels.map((reel, index) => {
            const isPlayingThis = isInView && activeSequentialIdx === index;

            return (
              <div
                key={reel.id}
                onClick={() => openReelModal(index)}
                className={`relative shrink-0 w-[230px] sm:w-[260px] aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-md border group cursor-pointer snap-start select-none transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isPlayingThis
                    ? "border-[#C5A880] ring-2 ring-[#C5A880]/40 shadow-lg"
                    : "border-slate-200/80"
                }`}
              >
                {/* Visual Progress Bar for active sequential video */}
                {isPlayingThis && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 z-20 overflow-hidden">
                    <div
                      className="h-full bg-[#C5A880] transition-all duration-100 ease-linear shadow-xs"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>
                )}

                {/* Background Video: Sequential Auto-Play (plays one by one) */}
                <video
                  ref={(el) => {
                    videoRefs.current[index] = el;
                    if (el) {
                      el.muted = isMuted;
                      el.defaultMuted = true;
                      el.playsInline = true;
                      if (isPlayingThis && el.paused) {
                        playSafely(el);
                      }
                    }
                  }}
                  src={reel.video_url}
                  poster={reel.poster_url}
                  autoPlay={isPlayingThis}
                  muted
                  playsInline
                  onEnded={() => handleVideoEnded(index)}
                  onTimeUpdate={(e) => {
                    if (isPlayingThis) {
                      const vid = e.currentTarget;
                      if (vid.duration && vid.duration > 1) {
                        const pct = (vid.currentTime / vid.duration) * 100;
                        setVideoProgress(pct);
                        if (vid.currentTime >= vid.duration - 0.25) {
                          handleVideoEnded(index);
                        }
                      }
                    }
                  }}
                  preload="auto"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />

                {/* Subtle bottom gradient overlay for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20 pointer-events-none" />

                {/* Playing Indicator Pill (Top Right) */}
                <div className="absolute top-3 right-3 z-10">
                  {isPlayingThis ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#C5A880]/50 text-[#FAF8F5] text-[9px] font-mono tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-ping" />
                      <span>Playing</span>
                    </span>
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 border border-white/20">
                      <Play className="w-3 h-3 ml-0.5" />
                    </span>
                  )}
                </div>

                {/* Center Hover Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="w-12 h-12 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center text-white border border-white/40 shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Bottom Overlay: Caption & Shoppable Product Box */}
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
                      <div className="relative w-8 h-10 rounded-md overflow-hidden bg-[#F1EFEA] shrink-0 border border-[#E2E8F0]">
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

      {/* =========================================================================
          FULLSCREEN INSTAGRAM REEL VIEWER MODAL WITH LIKES & COMMENTS
          ========================================================================= */}
      {activeReel && (
        <div
          className="fixed inset-0 z-50 bg-[#0F172A]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none"
          onClick={closeReelModal}
        >
          {/* Toast Notification */}
          {copyToast && (
            <div className="fixed top-6 z-50 px-5 py-2.5 rounded-full bg-white text-[#0F172A] text-xs font-mono font-semibold shadow-2xl flex items-center gap-2 border border-slate-200 animate-bounce">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Reel link copied to clipboard!</span>
            </div>
          )}

          {/* Close Modal Button */}
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

          {/* Reel Frame Container */}
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

            {/* Dark Gradient Backdrop */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90 pointer-events-none" />

            {/* Top Bar: Creator Info & Volume / Play Controls */}
            <div className="relative z-10 p-4 flex items-center justify-between text-white">
              <div>
                <span className="block text-xs font-semibold">{activeReel.creator_name}</span>
                <span className="block text-[10px] text-white/70">{activeReel.creator_handle}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalIsMuted(!modalIsMuted)}
                  className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 hover:bg-black/60 transition-colors cursor-pointer"
                  aria-label={modalIsMuted ? "Unmute audio" : "Mute audio"}
                >
                  {modalIsMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-[#C5A880]" />
                  )}
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

            {/* Instagram Style Floating Action Sidebar (Like, Comment, Share) */}
            <div className="absolute right-3.5 bottom-28 z-20 flex flex-col items-center gap-4 text-white">
              {/* Like Button */}
              <button
                type="button"
                onClick={() => handleLikeClick(activeReel.id)}
                className="flex flex-col items-center gap-1 group cursor-pointer"
                title="Like Reel"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${
                    likedReels[activeReel.id]
                      ? "bg-red-500/90 text-white border-red-400 scale-110"
                      : "bg-black/40 text-white border-white/20 hover:bg-black/60"
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      likedReels[activeReel.id] ? "fill-current text-white" : ""
                    }`}
                  />
                </div>
                <span className="text-[10px] font-mono font-medium drop-shadow-sm">
                  {activeReel.likes_count || "2.4K"}
                </span>
              </button>

              {/* Comment Button (Toggles Drawer) */}
              <button
                type="button"
                onClick={() => setShowComments(!showComments)}
                className="flex flex-col items-center gap-1 group cursor-pointer"
                title="View & Add Comments"
              >
                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-black/60 transition-colors">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-mono font-medium drop-shadow-sm">
                  {activeReel.comments?.length ?? 0}
                </span>
              </button>

              {/* Share Button */}
              <button
                type="button"
                onClick={handleShareReel}
                className="flex flex-col items-center gap-1 group cursor-pointer"
                title="Share Reel"
              >
                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-black/60 transition-colors">
                  <Share2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-[9px] font-mono uppercase tracking-wider text-white/80">
                  Share
                </span>
              </button>
            </div>

            {/* Bottom Content: Caption & Shoppable Product Card Drawer */}
            <div className="relative z-10 p-4 space-y-3 pr-16">
              <p className="text-xs text-white/95 leading-relaxed font-light drop-shadow-sm">
                {activeReel.caption}
              </p>

              {/* Shoppable Product Card Box */}
              <div className="p-3 rounded-2xl bg-white/95 backdrop-blur-lg text-[#0F172A] border border-white/40 shadow-xl space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-13 rounded-lg overflow-hidden bg-[#F1EFEA] border border-[#E2E8F0] shrink-0">
                    <Image
                      src={activeReel.product_image}
                      alt={activeReel.product_name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] uppercase tracking-wider text-[#C5A880] font-semibold">
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
                      const dummyProduct: any = {
                        id: activeReel.product_id,
                        slug: activeReel.product_slug,
                        name: activeReel.product_name,
                        base_price: activeReel.product_price,
                        primary_image: activeReel.product_image,
                        category_slug: "handbags",
                        images: [
                          {
                            id: "1",
                            product_id: activeReel.product_id,
                            url: activeReel.product_image,
                            alt_text: activeReel.product_name,
                            display_order: 1,
                            is_primary: true,
                          },
                        ],
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

            {/* =========================================================================
                SLIDE-UP COMMENTS DRAWER (Like Instagram Reel Comments)
                ========================================================================= */}
            {showComments && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute inset-x-0 bottom-0 top-1/4 z-30 bg-white rounded-t-3xl p-4 shadow-2xl flex flex-col justify-between border-t border-slate-200 animate-in slide-in-from-bottom duration-300"
              >
                {/* Comments Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#C5A880]" />
                    <span className="font-sans font-bold text-xs uppercase tracking-wider text-[#0F172A]">
                      Comments ({activeReel.comments?.length ?? 0})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowComments(false)}
                    className="p-1 rounded-full hover:bg-slate-100 text-[#64748B] hover:text-[#0F172A]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1">
                  {(!activeReel.comments || activeReel.comments.length === 0) ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                      <MessageCircle className="w-8 h-8 mb-2 stroke-1" />
                      <p className="text-xs font-mono font-medium text-slate-600">No comments yet</p>
                      <p className="text-[11px] text-slate-400">Be the first patron to comment on this silhouette!</p>
                    </div>
                  ) : (
                    activeReel.comments.map((c: ReelComment) => (
                      <div key={c.id} className="flex items-start gap-2.5 text-xs">
                        <div className="w-7 h-7 rounded-full bg-[#FAF7F2] border border-[#C5A880]/40 flex items-center justify-center font-bold text-[10px] text-[#C5A880] shrink-0">
                          {c.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-1">
                            <span className="font-semibold text-[#0F172A] text-[11px]">
                              {c.user_name}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400">
                              {c.created_at}
                            </span>
                          </div>
                          <p className="text-slate-700 text-xs mt-0.5 leading-relaxed font-light">
                            {c.comment}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment Input Form */}
                <form
                  onSubmit={(e) => handleCommentSubmit(e, activeReel.id)}
                  className="pt-3 border-t border-slate-100 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Your name (optional)..."
                      value={commentAuthor}
                      onChange={(e) => setCommentAuthor(e.target.value)}
                      className="w-1/3 px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-[11px] text-[#0F172A] focus:outline-none focus:border-[#C5A880]"
                    />
                    <div className="relative flex-1">
                      <input
                        type="text"
                        required
                        placeholder="Add a comment..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        className="w-full px-3 py-1.5 pr-8 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-[#C5A880]"
                      />
                      <button
                        type="submit"
                        disabled={!newCommentText.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#C5A880] disabled:text-slate-300 hover:text-[#9E7D4E] cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
