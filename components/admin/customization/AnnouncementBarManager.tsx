"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Clock,
  Sparkles,
  ExternalLink,
  Loader2,
  Save,
} from "lucide-react";
import { AnnouncementConfig, AnnouncementItem } from "@/types";
import { useToast } from "@/components/ui/Toast";

interface AnnouncementBarManagerProps {
  onConfigChange?: (config: AnnouncementConfig) => void;
  isDraftMode?: boolean;
}

export function AnnouncementBarManager({ onConfigChange, isDraftMode = true }: AnnouncementBarManagerProps) {
  const { success, error } = useToast();
  const [config, setConfig] = useState<AnnouncementConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal / Form state for Add/Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AnnouncementItem | null>(null);
  const [itemText, setItemText] = useState("");
  const [itemLink, setItemLink] = useState("");
  const [itemBadge, setItemBadge] = useState("");
  const [itemActive, setItemActive] = useState(true);

  // Load announcements config from API
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await fetch("/api/announcements");
        if (res.ok) {
          const data: AnnouncementConfig = await res.json();
          if (isMounted) {
            setConfig(data);
            if (onConfigChange) onConfigChange(data);
          }
        }
      } catch (err) {
        console.error("Failed to load announcements:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const persistConfig = async (newConfig: AnnouncementConfig) => {
    setConfig(newConfig);
    if (onConfigChange) onConfigChange(newConfig);

    if (isDraftMode) {
      // Keep changes staged locally so storefront is untouched until "Publish Changes" is clicked
      success("Changes staged in draft. Click 'Publish Changes' above to apply to live storefront.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interval_seconds: newConfig.interval_seconds,
          is_active: newConfig.is_active,
          items: newConfig.items,
        }),
      });
      if (!res.ok) throw new Error("Failed to save announcements");
      success("Announcement settings updated.");
    } catch {
      error("Failed to update announcement settings.");
    } finally {
      setSaving(false);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setItemText("");
    setItemLink("/shop");
    setItemBadge("");
    setItemActive(true);
    setModalOpen(true);
  };

  const openEditModal = (item: AnnouncementItem) => {
    setEditingItem(item);
    setItemText(item.text);
    setItemLink(item.link || "");
    setItemBadge(item.badge || "");
    setItemActive(item.is_active);
    setModalOpen(true);
  };

  const handleSaveItem = () => {
    if (!itemText.trim()) {
      error("Announcement text cannot be empty.");
      return;
    }
    if (!config) return;

    let updatedItems: AnnouncementItem[];
    if (editingItem) {
      updatedItems = config.items.map((i) =>
        i.id === editingItem.id
          ? {
              ...i,
              text: itemText.trim(),
              link: itemLink.trim() || undefined,
              badge: itemBadge.trim() || undefined,
              is_active: itemActive,
            }
          : i
      );
    } else {
      const newItem: AnnouncementItem = {
        id: `ann-${Date.now()}`,
        text: itemText.trim(),
        link: itemLink.trim() || undefined,
        badge: itemBadge.trim() || undefined,
        is_active: itemActive,
        sort_order: config.items.length + 1,
      };
      updatedItems = [...config.items, newItem];
    }

    const updatedConfig = { ...config, items: updatedItems };
    persistConfig(updatedConfig);
    setModalOpen(false);
  };

  const handleDeleteItem = (id: string) => {
    if (!config) return;
    const updatedItems = config.items.filter((i) => i.id !== id);
    persistConfig({ ...config, items: updatedItems });
  };

  const handleToggleItemActive = (id: string) => {
    if (!config) return;
    const updatedItems = config.items.map((i) =>
      i.id === id ? { ...i, is_active: !i.is_active } : i
    );
    persistConfig({ ...config, items: updatedItems });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    if (!config) return;
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= config.items.length) return;

    const newItems = [...config.items];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIdx, 0, moved);

    // Re-index sort_order
    const sorted = newItems.map((item, idx) => ({ ...item, sort_order: idx + 1 }));
    persistConfig({ ...config, items: sorted });
  };

  const handleIntervalChange = (val: number) => {
    if (!config) return;
    persistConfig({ ...config, interval_seconds: val });
  };

  const handleGlobalActiveToggle = () => {
    if (!config) return;
    persistConfig({ ...config, is_active: !config.is_active });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-white rounded-2xl border border-slate-200/80">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
        <span className="ml-2 text-xs font-semibold text-slate-500">Loading announcement bar manager...</span>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="space-y-6">
      {/* Settings Row: Interval & Auto-Swipe Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Auto-Swipe & Transition Timer</span>
            </h3>
            <p className="text-xs text-slate-500">
              Customize how fast multiple announcements rotate on the storefront.
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Master Toggle */}
            <div className="flex items-center gap-2.5 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-700">Auto-Rotate</span>
              <button
                type="button"
                onClick={handleGlobalActiveToggle}
                className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                  config.is_active ? "bg-indigo-600" : "bg-slate-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    config.is_active ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Interval Slider & Display */}
            <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-700">Slide Time:</span>
              <input
                type="range"
                min={2}
                max={15}
                step={1}
                value={config.interval_seconds}
                onChange={(e) => handleIntervalChange(Number(e.target.value))}
                className="w-24 accent-indigo-600 cursor-pointer"
              />
              <span className="text-xs font-bold text-indigo-600 font-mono w-8">
                {config.interval_seconds}s
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements List Header & Add Button */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Active Announcements ({config.items.length})
            </h3>
            <p className="text-xs text-slate-500">
              Add multiple announcements. They will smoothly swipe on the storefront and live preview.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-b from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-[0_2px_8px_rgba(79,70,229,0.3)] active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Announcement</span>
          </button>
        </div>

        {/* List Items */}
        <div className="divide-y divide-slate-100">
          {config.items.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No announcements added yet. Click &quot;Add Announcement&quot; to create your first announcement message.
            </div>
          ) : (
            config.items.map((item, index) => (
              <div
                key={item.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, "up")}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === config.items.length - 1}
                      onClick={() => handleMove(index, "down")}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="w-6 text-center text-xs font-mono font-bold text-slate-400">
                    #{index + 1}
                  </span>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.text}</p>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.link && (
                      <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{item.link}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleItemActive(item.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      item.is_active
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {item.is_active ? "Active" : "Hidden"}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Edit Announcement"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal for Add / Edit Announcement */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-bold text-slate-900">
                {editingItem ? "Edit Announcement" : "Create New Announcement"}
              </h4>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Announcement Message Text *
                </label>
                <input
                  type="text"
                  value={itemText}
                  onChange={(e) => setItemText(e.target.value)}
                  placeholder="e.g. COMPLIMENTARY EXPRESS DELIVERY ACROSS INDIA"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Destination Link URL (Optional)
                </label>
                <input
                  type="text"
                  value={itemLink}
                  onChange={(e) => setItemLink(e.target.value)}
                  placeholder="/shop or https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Badge Tag (Optional)
                </label>
                <input
                  type="text"
                  value={itemBadge}
                  onChange={(e) => setItemBadge(e.target.value)}
                  placeholder="e.g. Exclusive, Free Shipping, Festive"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="ann-active"
                  checked={itemActive}
                  onChange={(e) => setItemActive(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="ann-active" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Activate and display this announcement on storefront
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveItem}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md active:scale-95 transition-all"
              >
                {editingItem ? "Save Changes" : "Add Announcement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
