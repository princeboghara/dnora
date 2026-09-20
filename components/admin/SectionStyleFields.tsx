"use client";

import React from "react";
import { Type, Palette, Maximize2, MoveHorizontal } from "lucide-react";
import { FONT_OPTIONS, FONT_FAMILY_MAP, getResolvedFontFamily } from "@/lib/font-constants";

export { FONT_FAMILY_MAP };

export interface SectionStyleValues {
  heading_color?: string;
  heading_font_size?: string;
  heading_font_family?: string;
  heading_font_weight?: string;
  card_gap?: number;
}

interface SectionStyleFieldsProps {
  title: string;
  sampleTitle?: string;
  values: SectionStyleValues;
  onChange: (updated: SectionStyleValues) => void;
  defaultGap?: number;
  sectionType?: "categories" | "products" | "videos";
}

const COLOR_PRESETS = [
  { label: "Executive Noir", value: "#0F172A" },
  { label: "Deep Slate", value: "#1E293B" },
  { label: "Cool Charcoal", value: "#334155" },
  { label: "Royal Indigo", value: "#4F46E5" },
  { label: "Electric Violet", value: "#7C3AED" },
  { label: "Emerald Luxury", value: "#059669" },
  { label: "Crimson Velvet", value: "#BE123C" },
  { label: "Pure Graphite", value: "#475569" },
];

export function SectionStyleFields({
  title,
  values,
  onChange,
  defaultGap = 20,
}: SectionStyleFieldsProps) {
  const currentColor = values.heading_color || "#0F172A";
  const currentFontSizeStr = values.heading_font_size || "32px";
  const currentFontSizeNum = parseInt(currentFontSizeStr.replace("px", ""), 10) || 32;
  const currentFontFamily = values.heading_font_family || "arial-rounded";
  const currentFontWeight = values.heading_font_weight || "800";
  const currentGap = values.card_gap !== undefined ? values.card_gap : defaultGap;

  const handleUpdate = (patch: Partial<SectionStyleValues>) => {
    onChange({
      ...values,
      ...patch,
    });
  };

  return (
    <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-xs transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {title} Heading & Layout Styling
            </h4>
            <p className="text-[11px] text-slate-500">
              Customize typography, weights, sizing, and spacing in real time.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200/80 shadow-2xs">
          Live Controls
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Heading Typography & Colors */}
        <div className="space-y-4">
          {/* 1. Heading Color */}
          <div>
            <label className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-600" />
                <span>Heading Color</span>
              </span>
              <span className="font-mono text-[11px] text-slate-900 font-bold">{currentColor}</span>
            </label>
            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shrink-0 shadow-2xs">
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => handleUpdate({ heading_color: e.target.value })}
                  className="absolute inset-0 w-14 h-14 -top-2 -left-2 cursor-pointer opacity-100"
                  title="Pick heading color"
                />
              </div>
              <input
                type="text"
                value={currentColor}
                onChange={(e) => handleUpdate({ heading_color: e.target.value })}
                placeholder="#0F172A"
                className="flex-1 bg-white border border-slate-200 px-3.5 py-2 text-xs font-mono text-slate-900 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
              />
            </div>
            {/* Color Swatch Presets */}
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handleUpdate({ heading_color: preset.value })}
                  title={preset.label}
                  className={`w-6 h-6 rounded-full border transition-all cursor-pointer shadow-2xs ${
                    currentColor.toLowerCase() === preset.value.toLowerCase()
                      ? "ring-2 ring-indigo-600 ring-offset-2 scale-110"
                      : "border-black/10 hover:scale-110 active:scale-95"
                  }`}
                  style={{ backgroundColor: preset.value }}
                />
              ))}
            </div>
          </div>

          {/* 2. Heading Font Family */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Font Family / Style
            </label>
            <select
              value={currentFontFamily}
              onChange={(e) => handleUpdate({ heading_font_family: e.target.value })}
              className="w-full bg-white border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-900 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs cursor-pointer"
            >
              <optgroup label="Rounded & Soft">
                <option value="arial-rounded">Arial Rounded MT Bold (Default Signature)</option>
              </optgroup>
              <optgroup label="Modern Editorial Sans">
                <option value="jakarta">Plus Jakarta Sans (Modern Luxury)</option>
                <option value="inter">Inter (Clean Neo-Grotesque)</option>
                <option value="outfit">Outfit (Modern Geometric)</option>
                <option value="montserrat">Montserrat (Urban Minimalist)</option>
                <option value="dm-sans">DM Sans (Precision Clean)</option>
                <option value="urbanist">Urbanist (Contemporary Luxury)</option>
                <option value="space-grotesk">Space Grotesk (Tech Editorial)</option>
              </optgroup>
              <optgroup label="High-Fashion & Italian Luxury">
                <option value="tenor-sans">Tenor Sans (Luxury Atelier)</option>
                <option value="marcellus">Marcellus (Roman High Luxury)</option>
                <option value="italiana">Italiana (Milano Couture)</option>
                <option value="prata">Prata (Didone Editorial Elegance)</option>
              </optgroup>
              <optgroup label="Editorial & Luxury Serif">
                <option value="playfair">Playfair Display (Vogue Editorial Serif)</option>
                <option value="cinzel">Cinzel (Architectural Roman Serif)</option>
                <option value="cormorant">Cormorant Garamond (Artisan Luxury Serif)</option>
                <option value="bodoni">Bodoni Moda (Parisian Haute Couture)</option>
                <option value="lora">Lora (Contemporary Literary Serif)</option>
              </optgroup>
              <optgroup label="Bold & Architectural Display">
                <option value="syne">Syne (High-Fashion Editorial Display)</option>
                <option value="oswald">Oswald (Condensed Architectural Bold)</option>
                <option value="bebas-neue">Bebas Neue (High-Impact Condensed)</option>
              </optgroup>
              <optgroup label="Classic & System">
                <option value="classic-arial">Classic Arial (Neutral Sans)</option>
                <option value="georgia">Georgia (Classic Book Serif)</option>
                <option value="mono">Atelier Monospace (Technical Courier)</option>
              </optgroup>
            </select>
          </div>

          {/* 3. Heading Font Weight */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Font Weight
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Normal", value: "400" },
                { label: "Semi", value: "600" },
                { label: "Bold", value: "700" },
                { label: "Extra", value: "800" },
              ].map((wt) => (
                <button
                  key={wt.value}
                  type="button"
                  onClick={() => handleUpdate({ heading_font_weight: wt.value })}
                  className={`py-2 px-2 text-xs rounded-xl border font-bold transition-all cursor-pointer ${
                    currentFontWeight === wt.value
                      ? "bg-[#0F172A] text-white border-[#0F172A] shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50 shadow-2xs active:scale-95"
                  }`}
                >
                  {wt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Font Size & Item Gap Slider */}
        <div className="space-y-4">
          {/* 4. Font Size */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Heading Font Size</span>
              </span>
              <span className="font-mono text-xs font-bold text-slate-900">
                {currentFontSizeNum}px
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="52"
              step="2"
              value={currentFontSizeNum}
              onChange={(e) => handleUpdate({ heading_font_size: `${e.target.value}px` })}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            {/* Font Size Presets */}
            <div className="flex items-center gap-2 mt-2">
              {[
                { label: "24px", val: "24px" },
                { label: "32px", val: "32px" },
                { label: "40px", val: "40px" },
                { label: "48px", val: "48px" },
              ].map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => handleUpdate({ heading_font_size: preset.val })}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                    currentFontSizeStr === preset.val
                      ? "bg-[#0F172A] text-white border-[#0F172A] shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50 shadow-2xs active:scale-95"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Product / Card Gap */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              <span className="flex items-center gap-1.5">
                <MoveHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                <span>Card Gap (Between 2 Items/Products)</span>
              </span>
              <span className="font-mono text-xs font-bold text-slate-900">
                {currentGap}px
              </span>
            </div>
            <input
              type="range"
              min="6"
              max="48"
              step="2"
              value={currentGap}
              onChange={(e) => handleUpdate({ card_gap: Number(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            {/* Gap Presets */}
            <div className="flex items-center gap-1.5 mt-2">
              {[
                { label: "Tight 8px", val: 8 },
                { label: "12px", val: 12 },
                { label: "16px", val: 16 },
                { label: "24px", val: 24 },
                { label: "Wide 32px", val: 32 },
              ].map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => handleUpdate({ card_gap: preset.val })}
                  className={`flex-1 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-xl border transition-all cursor-pointer ${
                    currentGap === preset.val
                      ? "bg-[#0F172A] text-white border-[#0F172A] shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50 shadow-2xs active:scale-95"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
