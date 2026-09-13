"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";

interface AnimatedLogoProps {
  className?: string;
  showSubtitle?: boolean;
}

const LOGO_WIDTH = 728;
const LOGO_HEIGHT = 170;

// Letter X Bounds
const OX_D = 0;
const OW_D = 142;
const OX_N = 142;
const OW_N = 132;
const OX_O = 274;
const OW_O = 161;
const OX_R = 435;
const OW_R = 133;
const OX_A = 568;
const OW_A = 160;

// Bezier interpolation helper
function getBezierPoint(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  t: number
): [number, number] {
  const x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0];
  const y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1];
  return [x, y];
}

export function AnimatedLogo({
  className = "",
  showSubtitle = true,
}: AnimatedLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const logoImageRef = useRef<HTMLImageElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Preload authentic DNORA logo
  useEffect(() => {
    const img = new Image();
    img.src = "/images/logo/dnora-logo-dark.png";
    img.onload = () => {
      logoImageRef.current = img;
      setIsImageLoaded(true);
    };
  }, []);

  // Continuous stroke-by-stroke handwriting loop
  useEffect(() => {
    if (!isImageLoaded || !canvasRef.current || !logoImageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create / configure offscreen mask canvas
    if (!maskCanvasRef.current) {
      maskCanvasRef.current = document.createElement("canvas");
    }
    const maskCanvas = maskCanvasRef.current;
    maskCanvas.width = LOGO_WIDTH;
    maskCanvas.height = LOGO_HEIGHT;
    const maskCtx = maskCanvas.getContext("2d");
    if (!maskCtx) return;

    // Retina display scaling
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    canvas.width = LOGO_WIDTH * dpr;
    canvas.height = LOGO_HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    setIsComplete(false);
    const durationMs = 1300; // Normal fast smooth stroke duration (1.3s)
    let startTime: number | null = null;

    const render = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const p = Math.min(elapsed / durationMs, 1.0);

      // If animation reached 100%, render full authentic logo directly
      if (p >= 1.0) {
        ctx.clearRect(0, 0, LOGO_WIDTH, LOGO_HEIGHT);
        ctx.drawImage(logoImageRef.current!, 0, 0, LOGO_WIDTH, LOGO_HEIGHT);
        setIsComplete(true);
        return;
      }

      // 1. Draw all cumulative strokes onto the offscreen mask with source-over (additive)
      maskCtx.clearRect(0, 0, LOGO_WIDTH, LOGO_HEIGHT);
      maskCtx.fillStyle = "#FFFFFF";
      maskCtx.strokeStyle = "#FFFFFF";
      maskCtx.lineCap = "round";
      maskCtx.lineJoin = "round";

      // -------------------------------------------------------------
      // LETTER 1: D (Timeline: 0.00 -> 0.20)
      // -------------------------------------------------------------
      if (p >= 0.2) {
        // D is fully completed
        maskCtx.fillRect(OX_D, 0, OW_D, LOGO_HEIGHT);
      } else if (p > 0.0) {
        maskCtx.save();
        maskCtx.beginPath();
        maskCtx.rect(OX_D, 0, OW_D, LOGO_HEIGHT);
        maskCtx.clip();

        // Stroke 1: Front vertical straight line (Agalno lito: 0.00 -> 0.08)
        const lp1 = Math.min(1.0, p / 0.08);
        maskCtx.beginPath();
        maskCtx.moveTo(OX_D + 32, 5);
        maskCtx.lineTo(OX_D + 32, 5 + (165 - 5) * lp1);
        maskCtx.lineWidth = 65;
        maskCtx.stroke();

        // Stroke 2: Half-round curve (Half round D no: 0.08 -> 0.20)
        if (p > 0.08) {
          const lp2 = Math.min(1.0, (p - 0.08) / 0.12);
          maskCtx.beginPath();
          maskCtx.moveTo(OX_D + 32, 15);
          const steps = Math.max(2, Math.floor(lp2 * 40));
          for (let i = 1; i <= steps; i++) {
            const t = (i / 40) * lp2;
            let pt: [number, number];
            if (t <= 0.5) {
              const u = t * 2;
              pt = getBezierPoint([OX_D + 32, 15], [OX_D + 130, 20], [OX_D + 138, 85], u);
            } else {
              const u = (t - 0.5) * 2;
              pt = getBezierPoint([OX_D + 138, 85], [OX_D + 130, 150], [OX_D + 32, 155], u);
            }
            maskCtx.lineTo(pt[0], pt[1]);
          }
          maskCtx.lineWidth = 80;
          maskCtx.stroke();
        }
        maskCtx.restore();
      }

      // -------------------------------------------------------------
      // LETTER 2: N (Timeline: 0.20 -> 0.42, Zero Gap after D!)
      // -------------------------------------------------------------
      if (p >= 0.42) {
        // N is fully completed
        maskCtx.fillRect(OX_N, 0, OW_N, LOGO_HEIGHT);
      } else if (p > 0.2) {
        maskCtx.save();
        maskCtx.beginPath();
        maskCtx.rect(OX_N, 0, OW_N, LOGO_HEIGHT);
        maskCtx.clip();

        // N Stroke 1: Left vertical line (0.20 -> 0.27)
        const lp1 = Math.min(1.0, (p - 0.2) / 0.07);
        maskCtx.beginPath();
        maskCtx.moveTo(OX_N + 18, 165);
        maskCtx.lineTo(OX_N + 18, 165 - (165 - 5) * lp1);
        maskCtx.lineWidth = 56;
        maskCtx.stroke();

        // N Stroke 2: Diagonal line (0.27 -> 0.35)
        if (p > 0.27) {
          const lp2 = Math.min(1.0, (p - 0.27) / 0.08);
          maskCtx.beginPath();
          maskCtx.moveTo(OX_N + 15, 10);
          maskCtx.lineTo(OX_N + 15 + (118 - 15) * lp2, 10 + (162 - 10) * lp2);
          maskCtx.lineWidth = 56;
          maskCtx.stroke();
        }

        // N Stroke 3: Right vertical line (0.35 -> 0.42)
        if (p > 0.35) {
          const lp3 = Math.min(1.0, (p - 0.35) / 0.07);
          maskCtx.beginPath();
          maskCtx.moveTo(OX_N + 115, 165);
          maskCtx.lineTo(OX_N + 115, 165 - (165 - 5) * lp3);
          maskCtx.lineWidth = 56;
          maskCtx.stroke();
        }
        maskCtx.restore();
      }

      // -------------------------------------------------------------
      // LETTER 3: O (Timeline: 0.42 -> 0.60, Zero Gap after N!)
      // -------------------------------------------------------------
      if (p >= 0.6) {
        // O is fully completed
        maskCtx.fillRect(OX_O, 0, OW_O, LOGO_HEIGHT);
      } else if (p > 0.42) {
        maskCtx.save();
        maskCtx.beginPath();
        maskCtx.rect(OX_O, 0, OW_O, LOGO_HEIGHT);
        maskCtx.clip();

        const lp_o = Math.min(1.0, (p - 0.42) / 0.18);
        const cx = OX_O + 80;
        const cy = 85;
        const rx = 74;
        const ry = 72;
        const maxAngle = lp_o * 2 * Math.PI;
        const steps = Math.max(3, Math.floor(lp_o * 60));

        maskCtx.beginPath();
        maskCtx.moveTo(cx, cy - ry);
        for (let i = 1; i <= steps; i++) {
          const angle = (i / steps) * maxAngle;
          const px = cx + rx * Math.sin(angle);
          const py = cy - ry * Math.cos(angle);
          maskCtx.lineTo(px, py);
        }
        maskCtx.lineWidth = 65;
        maskCtx.stroke();
        maskCtx.restore();
      }

      // -------------------------------------------------------------
      // LETTER 4: R (Timeline: 0.60 -> 0.83, Zero Gap after O!)
      // -------------------------------------------------------------
      if (p >= 0.83) {
        // R is fully completed
        maskCtx.fillRect(OX_R, 0, OW_R, LOGO_HEIGHT);
      } else if (p > 0.6) {
        maskCtx.save();
        maskCtx.beginPath();
        maskCtx.rect(OX_R, 0, OW_R, LOGO_HEIGHT);
        maskCtx.clip();

        // R Stroke 1: Vertical stem (0.60 -> 0.67)
        const lp1 = Math.min(1.0, (p - 0.6) / 0.07);
        maskCtx.beginPath();
        maskCtx.moveTo(OX_R + 20, 5);
        maskCtx.lineTo(OX_R + 20, 5 + (165 - 5) * lp1);
        maskCtx.lineWidth = 56;
        maskCtx.stroke();

        // R Stroke 2: Upper rounded bowl (0.67 -> 0.76)
        if (p > 0.67) {
          const lp2 = Math.min(1.0, (p - 0.67) / 0.09);
          maskCtx.beginPath();
          maskCtx.moveTo(OX_R + 20, 15);
          const steps = Math.max(2, Math.floor(lp2 * 30));
          for (let i = 1; i <= steps; i++) {
            const t = (i / 30) * lp2;
            let pt: [number, number];
            if (t <= 0.5) {
              const u = t * 2;
              pt = getBezierPoint([OX_R + 20, 15], [OX_R + 120, 15], [OX_R + 120, 55], u);
            } else {
              const u = (t - 0.5) * 2;
              pt = getBezierPoint([OX_R + 120, 55], [OX_R + 120, 95], [OX_R + 20, 95], u);
            }
            maskCtx.lineTo(pt[0], pt[1]);
          }
          maskCtx.lineWidth = 65;
          maskCtx.stroke();
        }

        // R Stroke 3: Graceful curved leg (0.76 -> 0.83)
        if (p > 0.76) {
          const lp3 = Math.min(1.0, (p - 0.76) / 0.07);
          maskCtx.beginPath();
          maskCtx.moveTo(OX_R + 25, 85);
          const steps = Math.max(2, Math.floor(lp3 * 25));
          for (let i = 1; i <= steps; i++) {
            const t = (i / 25) * lp3;
            const pt = getBezierPoint([OX_R + 25, 85], [OX_R + 70, 110], [OX_R + 132, 162], t);
            maskCtx.lineTo(pt[0], pt[1]);
          }
          maskCtx.lineWidth = 65;
          maskCtx.stroke();
        }
        maskCtx.restore();
      }

      // -------------------------------------------------------------
      // LETTER 5: A (Timeline: 0.83 -> 1.00, Zero Gap after R!)
      // -------------------------------------------------------------
      if (p >= 1.0) {
        // A is fully completed
        maskCtx.fillRect(OX_A, 0, OW_A, LOGO_HEIGHT);
      } else if (p > 0.83) {
        maskCtx.save();
        maskCtx.beginPath();
        maskCtx.rect(OX_A, 0, OW_A, LOGO_HEIGHT);
        maskCtx.clip();

        // A Stroke 1: Left diagonal (0.83 -> 0.89)
        const lp1 = Math.min(1.0, (p - 0.83) / 0.06);
        maskCtx.beginPath();
        maskCtx.moveTo(OX_A + 65, 5);
        maskCtx.lineTo(OX_A + 65 - (65 - 10) * lp1, 5 + (165 - 5) * lp1);
        maskCtx.lineWidth = 58;
        maskCtx.stroke();

        // A Stroke 2: Right diagonal (0.89 -> 0.95)
        if (p > 0.89) {
          const lp2 = Math.min(1.0, (p - 0.89) / 0.06);
          maskCtx.beginPath();
          maskCtx.moveTo(OX_A + 65, 5);
          maskCtx.lineTo(OX_A + 65 + (140 - 65) * lp2, 5 + (165 - 5) * lp2);
          maskCtx.lineWidth = 58;
          maskCtx.stroke();
        }

        // A Stroke 3: Horizontal crossbar (0.95 -> 1.00)
        if (p > 0.95) {
          const lp3 = Math.min(1.0, (p - 0.95) / 0.05);
          maskCtx.beginPath();
          maskCtx.moveTo(OX_A + 20, 105);
          maskCtx.lineTo(OX_A + 20 + (110 - 20) * lp3, 105);
          maskCtx.lineWidth = 54;
          maskCtx.stroke();
        }
        maskCtx.restore();
      }

      // 2. Draw authentic logo on canvas, then mask with cumulative strokes ONCE
      ctx.clearRect(0, 0, LOGO_WIDTH, LOGO_HEIGHT);
      ctx.save();
      ctx.drawImage(logoImageRef.current!, 0, 0, LOGO_WIDTH, LOGO_HEIGHT);
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(maskCanvas, 0, 0, LOGO_WIDTH, LOGO_HEIGHT);
      ctx.restore();

      // Continue animation loop
      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isImageLoaded]);

  return (
    <Link
      href="/"
      className={`inline-flex flex-col items-center group py-0.5 relative select-none cursor-pointer ${className}`}
      aria-label="D'NORA Home"
    >
      {/* High-Resolution Logo Container */}
      <div
        className="relative flex items-center justify-center h-7 sm:h-9 lg:h-10 overflow-visible"
        style={{
          aspectRatio: `${LOGO_WIDTH} / ${LOGO_HEIGHT}`,
        }}
      >
        {/* Dynamic Stroke Handwriting Canvas (Plays once on initial site open) */}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain pointer-events-none"
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Subtitle: "LUXURY ESSENTIALS" - guaranteed single line on all mobile screens */}
      {showSubtitle && (
        <div className="flex items-center gap-1 mt-0.5 whitespace-nowrap shrink-0 max-w-full">
          <span
            className={`text-[7.5px] sm:text-[9px] uppercase tracking-[0.26em] sm:tracking-[0.38em] text-[#8C7A6B] font-medium transition-all duration-700 group-hover:text-[#C5A880] group-hover:tracking-[0.32em] sm:group-hover:tracking-[0.44em] whitespace-nowrap select-none ${
              !isComplete ? "opacity-40" : "opacity-100"
            }`}
          >
            LUXURY ESSENTIALS
          </span>
        </div>
      )}
    </Link>
  );
}
