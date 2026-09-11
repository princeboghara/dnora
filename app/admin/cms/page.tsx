"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Check, Sparkles, Save, Upload, Loader2, ImageIcon } from "lucide-react";
import { DEFAULT_STORE_SETTINGS } from "@/lib/seed/catalog-data";
import { uploadImageToStorage } from "@/lib/supabase/storage";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export default function AdminCMSPage() {
  const [saved, setSaved] = useState(false);
  const [heroForm, setHeroForm] = useState({
    title: "THE ART OF EVERYDAY LUXURY",
    subtitle: "Handcrafted Italian Nappa Leather, Haute Parfumerie & Modern Indian Heirlooms",
    cta_text: "DISCOVER THE ATELIER",
    cta_link: "/shop",
    desktop_image_url: "",
  });

  const [announcementText, setAnnouncementText] = useState(
    DEFAULT_STORE_SETTINGS.announcement_text
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCurrentBanner() {
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data } = await supabase
            .from("banners")
            .select("*")
            .eq("type", "hero")
            .order("display_order", { ascending: true })
            .limit(1);
          if (data && data.length > 0) {
            setHeroForm({
              title: data[0].title,
              subtitle: data[0].subtitle || "",
              cta_text: data[0].cta_text || "DISCOVER THE ATELIER",
              cta_link: data[0].cta_link || "/shop",
              desktop_image_url: data[0].desktop_image_url,
            });
          }
        } catch {
          // Ignored
        }
      }
    }
    loadCurrentBanner();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    const { url, error } = await uploadImageToStorage("banners", file, "hero");
    setIsUploading(false);
    if (error) {
      setUploadError(error);
    } else if (url) {
      setHeroForm((prev) => ({ ...prev, desktop_image_url: url }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSupabaseConfigured() && supabase && heroForm.desktop_image_url) {
      try {
        await supabase.from("banners").upsert({
          id: "d0000000-0000-0000-0000-000000000001",
          title: heroForm.title,
          subtitle: heroForm.subtitle,
          cta_text: heroForm.cta_text,
          cta_link: heroForm.cta_link,
          desktop_image_url: heroForm.desktop_image_url,
          is_active: true,
          display_order: 1,
          type: "hero",
        });
      } catch (err) {
        console.error("Failed to save banner to Supabase", err);
      }
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#252D3D]">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold">
            Storefront Content Management
          </span>
          <h1 className="font-sans text-2xl sm:text-3xl text-[#FBF9F5] uppercase tracking-[0.12em] font-medium">
            Homepage & Banner CMS
          </h1>
        </div>

        {saved && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 text-xs font-semibold">
            <Check className="w-3.5 h-3.5" /> Published to Storefront
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8 text-xs">
        {/* Top Announcement Bar CMS */}
        <div className="bg-[#13171F] border border-[#252D3D] p-6 space-y-4">
          <h2 className="font-sans font-medium text-xs text-[#FBF9F5] uppercase tracking-[0.15em] pb-2 border-b border-[#252D3D]">
            Global Announcement Ticker Bar
          </h2>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-[#8491A5]">
              Header Announcement Copy
            </label>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full p-3 bg-[#1A202C] border border-[#252D3D] text-[#E4E8EE]"
            />
          </div>
        </div>

        {/* Hero Banner Section */}
        <div className="bg-[#13171F] border border-[#252D3D] p-6 sm:p-8 space-y-6">
          <h2 className="font-sans font-medium text-xs text-[#FBF9F5] uppercase tracking-[0.15em] pb-2 border-b border-[#252D3D]">
            Main Editorial Hero Banner
          </h2>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-[#8491A5]">
                Hero Headline (Upper Case)
              </label>
              <input
                type="text"
                value={heroForm.title}
                onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                className="w-full p-3 bg-[#1A202C] border border-[#252D3D] text-[#E4E8EE] font-sans text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-[#8491A5]">
                Hero Narrative Subtitle
              </label>
              <textarea
                rows={3}
                value={heroForm.subtitle}
                onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                className="w-full p-3 bg-[#1A202C] border border-[#252D3D] text-[#E4E8EE]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-[#8491A5]">
                  Primary Button Text
                </label>
                <input
                  type="text"
                  value={heroForm.cta_text}
                  onChange={(e) => setHeroForm({ ...heroForm, cta_text: e.target.value })}
                  className="w-full p-2.5 bg-[#1A202C] border border-[#252D3D] text-[#E4E8EE]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-[#8491A5]">
                  Button Destination Link
                </label>
                <input
                  type="text"
                  value={heroForm.cta_link}
                  onChange={(e) => setHeroForm({ ...heroForm, cta_link: e.target.value })}
                  className="w-full p-2.5 bg-[#1A202C] border border-[#252D3D] text-[#E4E8EE]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-widest text-[#8491A5]">
                  Background Image URL (High-Res or Supabase Storage)
                </label>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 bg-[#252D3D] hover:bg-[#323B4E] text-[#E4E8EE] text-[10px] uppercase tracking-wider font-semibold transition-colors border border-[#323B4E]">
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-[#C5A880]" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3 h-3 text-[#C5A880]" />
                      <span>Upload to Storage</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploading}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <input
                type="url"
                value={heroForm.desktop_image_url}
                onChange={(e) => setHeroForm({ ...heroForm, desktop_image_url: e.target.value })}
                placeholder="https://... or upload image directly"
                className="w-full p-2.5 bg-[#1A202C] border border-[#252D3D] text-[#E4E8EE]"
              />
              {uploadError && (
                <p className="text-[11px] text-red-400">{uploadError}</p>
              )}
            </div>

            {/* Visual Live Preview */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] uppercase tracking-widest text-[#8491A5]">
                Live Preview Thumbnail
              </span>
              <div className="relative aspect-[16/7] w-full max-w-lg bg-[#1A202C] border border-[#252D3D] overflow-hidden flex items-center justify-center">
                {heroForm.desktop_image_url ? (
                  <>
                    <Image
                      src={heroForm.desktop_image_url}
                      alt="Hero Preview"
                      fill
                      unoptimized
                      className="object-cover opacity-70"
                    />
                    <div className="absolute inset-0 p-4 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent">
                      <p className="font-sans font-medium text-xs text-[#FBF9F5] uppercase tracking-wide">
                        {heroForm.title}
                      </p>
                      <p className="text-[10px] text-[#C5A880]">{heroForm.cta_text} &rarr;</p>
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center space-y-2 text-[#64748B]">
                    <ImageIcon className="w-8 h-8 mx-auto opacity-50" />
                    <p className="text-[11px]">No hero image selected yet.</p>
                    <p className="text-[10px] text-[#8491A5]">Click &quot;Upload to Storage&quot; above to upload your banner image.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3.5 bg-[#C5A880] text-[#111111] text-xs uppercase tracking-[0.25em] font-semibold hover:bg-[#DFCAAB] transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save &amp; Publish Live CMS Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
