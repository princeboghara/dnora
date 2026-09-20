"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Check,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crop as CropIcon,
  Move,
  Sliders,
  Grid,
} from "lucide-react";

export type AspectRatioType = "1:1" | "4:5" | "16:9" | "free";

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob, croppedUrl: string) => void;
  initialAspectRatio?: AspectRatioType;
  title?: string;
}

export function ImageCropperModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  initialAspectRatio = "4:5",
  title = "Adjust & Crop Photo (Instagram Style)",
}: ImageCropperModalProps) {
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>(initialAspectRatio);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 }); // in pixels relative to center
  const [isDragging, setIsDragging] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  const viewportRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, initialPanX: 0, initialPanY: 0 });

  // Reset state whenever a new image is loaded
  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setAspectRatio(initialAspectRatio);
    }
  }, [isOpen, imageSrc, initialAspectRatio]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  // Drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialPanX: pan.x,
      initialPanY: pan.y,
    };
  };

  // Drag move
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      setPan({
        x: dragStartRef.current.initialPanX + dx,
        y: dragStartRef.current.initialPanY + dy,
      });
    },
    [isDragging]
  );

  // Drag end
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    setZoom((prev) => Math.min(3.5, Math.max(0.8, prev + delta)));
  };

  // Aspect ratio calculation for viewport frame
  const getViewportDimensions = () => {
    const baseSize = 360; // Base reference size in pixels
    switch (aspectRatio) {
      case "1:1":
        return { width: baseSize, height: baseSize };
      case "4:5":
        return { width: baseSize, height: Math.round(baseSize * 1.25) };
      case "16:9":
        return { width: baseSize, height: Math.round(baseSize * (9 / 16)) };
      case "free":
      default:
        return { width: baseSize, height: Math.round(baseSize * 1.1) };
    }
  };

  const viewportDims = getViewportDimensions();

  // Export cropped canvas
  const handleApplyCrop = () => {
    if (!imageRef.current || !viewportRef.current) return;

    const img = imageRef.current;
    const viewport = viewportRef.current;
    const vpRect = viewport.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    // Determine target canvas resolution (high-res export)
    let targetWidth = 1200;
    let targetHeight = 1500;
    if (aspectRatio === "1:1") {
      targetWidth = 1200;
      targetHeight = 1200;
    } else if (aspectRatio === "16:9") {
      targetWidth = 1600;
      targetHeight = 900;
    } else if (aspectRatio === "4:5") {
      targetWidth = 1200;
      targetHeight = 1500;
    } else {
      targetWidth = Math.round(vpRect.width * 2.5);
      targetHeight = Math.round(vpRect.height * 2.5);
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background white fill
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Calculate crop source coordinates relative to natural image
    const scaleToNatural = img.naturalWidth / imgRect.width;
    const sourceX = (vpRect.left - imgRect.left) * scaleToNatural;
    const sourceY = (vpRect.top - imgRect.top) * scaleToNatural;
    const sourceWidth = vpRect.width * scaleToNatural;
    const sourceHeight = vpRect.height * scaleToNatural;

    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      targetWidth,
      targetHeight
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const croppedUrl = URL.createObjectURL(blob);
        onCropComplete(blob, croppedUrl);
        onClose();
      },
      "image/jpeg",
      0.92
    );
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="bg-white max-w-xl w-full rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <CropIcon className="w-4 h-4 text-slate-900" />
            <h3 className="text-sm font-heading font-bold text-slate-900 tracking-tight">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Aspect Ratio Selector Pills (Instagram Style) */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mr-1">
              Ratio:
            </span>
            <button
              type="button"
              onClick={() => setAspectRatio("4:5")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                aspectRatio === "4:5"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              4:5 (Portrait)
            </button>
            <button
              type="button"
              onClick={() => setAspectRatio("1:1")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                aspectRatio === "1:1"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              1:1 (Square)
            </button>
            <button
              type="button"
              onClick={() => setAspectRatio("16:9")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                aspectRatio === "16:9"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              16:9 (Landscape)
            </button>
            <button
              type="button"
              onClick={() => setAspectRatio("free")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                aspectRatio === "free"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              Free
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Rule-of-Thirds Grid"
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              showGrid
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Interactive Cropper Viewport Area */}
        <div className="flex-1 bg-slate-950 p-4 sm:p-6 flex items-center justify-center overflow-hidden relative">
          <div
            ref={viewportRef}
            onMouseDown={handleMouseDown}
            onWheel={handleWheel}
            className={`relative overflow-hidden bg-slate-900 border-2 border-white/60 shadow-2xl cursor-grab ${
              isDragging ? "cursor-grabbing" : ""
            }`}
            style={{
              width: `${viewportDims.width}px`,
              height: `${viewportDims.height}px`,
              maxHeight: "56vh",
              maxWidth: "100%",
            }}
          >
            {/* The Pan-able & Zoom-able Image */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center center",
                transition: isDragging ? "none" : "transform 0.08s ease-out",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={handleImageLoad}
                className="max-w-none max-h-none pointer-events-none select-none"
                style={{
                  minWidth: `${viewportDims.width}px`,
                  minHeight: `${viewportDims.height}px`,
                  objectFit: "contain",
                }}
              />
            </div>

            {/* Instagram 3x3 Rule-of-Thirds Grid Overlay */}
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
                <div className="border-r border-b border-white/30" />
                <div className="border-r border-b border-white/30" />
                <div className="border-b border-white/30" />
                <div className="border-r border-b border-white/30" />
                <div className="border-r border-b border-white/30" />
                <div className="border-b border-white/30" />
                <div className="border-r border-white/30" />
                <div className="border-r border-white/30" />
                <div className="" />
              </div>
            )}

            {/* Corner Crop Accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white pointer-events-none" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white pointer-events-none" />
          </div>

          <div className="absolute bottom-2 left-4 text-[10px] text-white/50 pointer-events-none flex items-center gap-1">
            <Move className="w-3 h-3" />
            <span>Drag image to pan anywhere • Scroll or slider to zoom</span>
          </div>
        </div>

        {/* Controls Bar: Zoom Slider + Reset */}
        <div className="px-5 py-3 bg-white border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.8, z - 0.1))}
              className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min="0.8"
              max="3.5"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3.5, z + 0.1))}
              className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-slate-600 font-bold min-w-[36px]">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            className="inline-flex items-center gap-1.5 px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-colors cursor-pointer active:scale-[0.98]"
          >
            <Check className="w-4 h-4" />
            <span>Apply Crop &amp; Upload</span>
          </button>
        </div>
      </div>
    </div>
  );
}
