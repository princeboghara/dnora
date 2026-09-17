"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Check,
  Sliders,
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Users,
  Image as ImageIcon,
  Star,
  Video,
  Ticket,
  BarChart3,
  Settings,
  Shield,
  Tag,
  Globe,
  Sparkles,
  Flame,
  Box,
  Folder,
  Loader2,
  User,
  Package,
  MapPin,
  Megaphone,
} from "lucide-react";
import { SidebarMenuItem, SidebarSubmenuItem } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

export const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe,
  ShoppingBag,
  ShoppingCart,
  Package,
  MapPin,
  User,
  Megaphone,
  Box,
  Sparkles,
  Tag,
  Flame,
  Folder,
  Star,
  LayoutDashboard,
  Users,
  Image: ImageIcon,
  Video,
  Ticket,
  BarChart3,
  Settings,
  Shield,
  Sliders,
};

export type NavigationTarget = "storefront" | "account" | "admin";

interface SidebarCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: SidebarMenuItem[];
  initialTarget?: NavigationTarget;
  onSaveSuccess: (updatedItems: SidebarMenuItem[], target: NavigationTarget) => void;
}

export function SidebarCustomizerModal({
  isOpen,
  onClose,
  items: initialAdminItems,
  initialTarget = "storefront",
  onSaveSuccess,
}: SidebarCustomizerModalProps) {
  const { success, error } = useToast();
  const [activeTarget, setActiveTarget] = useState<NavigationTarget>(initialTarget);
  const [targetItems, setTargetItems] = useState<Record<NavigationTarget, SidebarMenuItem[]>>({
    storefront: [],
    account: [],
    admin: [],
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editing state for top-level item
  const [editingItem, setEditingItem] = useState<{
    isNew: boolean;
    data: SidebarMenuItem;
  } | null>(null);

  // Editing state for submenu item
  const [editingSubmenu, setEditingSubmenu] = useState<{
    parentId: string;
    isNew: boolean;
    data: SidebarSubmenuItem;
  } | null>(null);

  // Load items for the current active target whenever modal opens or target changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function fetchTargetItems() {
      setLoading(true);
      try {
        if (activeTarget === "admin") {
          const res = await fetch("/api/admin/sidebar");
          if (res.ok) {
            const data = await res.json();
            if (isMounted && Array.isArray(data.items)) {
              setTargetItems((prev) => ({ ...prev, admin: data.items }));
            }
          }
        } else {
          const res = await fetch(`/api/navigation?target=${activeTarget}`);
          if (res.ok) {
            const data = await res.json();
            if (isMounted && Array.isArray(data.items)) {
              setTargetItems((prev) => ({ ...prev, [activeTarget]: data.items }));
            }
          }
        }
      } catch (err) {
        console.error("Failed to load navigation for target:", activeTarget, err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchTargetItems();
    return () => {
      isMounted = false;
    };
  }, [isOpen, activeTarget]);

  const currentItems = targetItems[activeTarget] || [];

  const updateCurrentItems = (newItems: SidebarMenuItem[]) => {
    setTargetItems((prev) => ({
      ...prev,
      [activeTarget]: newItems,
    }));
  };

  // Reorder parent items
  const moveItem = (index: number, direction: "up" | "down") => {
    const newItems = [...currentItems];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, moved);
    updateCurrentItems(newItems);
  };

  // Delete parent item
  const deleteItem = (id: string) => {
    updateCurrentItems(currentItems.filter((item) => item.id !== id));
  };

  // Reorder submenu
  const moveSubmenu = (parentId: string, subIndex: number, direction: "up" | "down") => {
    const updated = currentItems.map((item) => {
      if (item.id !== parentId || !item.submenus) return item;
      const newSubs = [...item.submenus];
      const targetIndex = direction === "up" ? subIndex - 1 : subIndex + 1;
      if (targetIndex < 0 || targetIndex >= newSubs.length) return item;
      const [moved] = newSubs.splice(subIndex, 1);
      newSubs.splice(targetIndex, 0, moved);
      return { ...item, submenus: newSubs };
    });
    updateCurrentItems(updated);
  };

  // Delete submenu
  const deleteSubmenu = (parentId: string, subId: string) => {
    const updated = currentItems.map((item) => {
      if (item.id !== parentId || !item.submenus) return item;
      return {
        ...item,
        submenus: item.submenus.filter((sub) => sub.id !== subId),
      };
    });
    updateCurrentItems(updated);
  };

  // Save parent item edit/create
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const { isNew, data } = editingItem;
    if (!data.label.trim()) {
      error("Menu item label is required.");
      return;
    }

    if (isNew) {
      const newItem: SidebarMenuItem = {
        ...data,
        id: `nav-${Date.now()}`,
        is_active: true,
        submenus: data.submenus || [],
      };
      updateCurrentItems([...currentItems, newItem]);
    } else {
      updateCurrentItems(currentItems.map((it) => (it.id === data.id ? data : it)));
    }

    setEditingItem(null);
  };

  // Save submenu edit/create
  const handleSaveSubmenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubmenu) return;

    const { parentId, isNew, data } = editingSubmenu;
    if (!data.label.trim()) {
      error("Submenu label is required.");
      return;
    }

    const updated = currentItems.map((parent) => {
      if (parent.id !== parentId) return parent;
      const currentSubs = parent.submenus || [];
      if (isNew) {
        const newSub: SidebarSubmenuItem = {
          ...data,
          id: `sub-${Date.now()}`,
          is_active: true,
        };
        return { ...parent, submenus: [...currentSubs, newSub] };
      } else {
        return {
          ...parent,
          submenus: currentSubs.map((s) => (s.id === data.id ? data : s)),
        };
      }
    });

    updateCurrentItems(updated);
    setEditingSubmenu(null);
  };

  // Save all changes to database
  const handleSaveToDatabase = async () => {
    try {
      setSaving(true);
      if (activeTarget === "admin") {
        const res = await fetch("/api/admin/sidebar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: currentItems }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to save admin sidebar.");
      } else {
        const res = await fetch("/api/navigation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target: activeTarget, items: currentItems }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to save navigation.");
      }

      success(
        `${
          activeTarget === "storefront"
            ? "Member & Storefront Drawer"
            : activeTarget === "account"
            ? "Member Account Portal"
            : "Admin Sidebar"
        } navigation updated successfully.`
      );
      onSaveSuccess(currentItems, activeTarget);
      onClose();
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Failed to update navigation.");
    } finally {
      setSaving(false);
    }
  };

  // Reset to factory defaults
  const handleResetToDefault = async () => {
    const targetName =
      activeTarget === "storefront"
        ? "Member & Storefront Drawer"
        : activeTarget === "account"
        ? "Member Account Portal"
        : "Admin Sidebar";

    if (!window.confirm(`Reset ${targetName} navigation to factory defaults?`)) {
      return;
    }

    try {
      setSaving(true);
      let resetItems: SidebarMenuItem[] = [];
      if (activeTarget === "admin") {
        const res = await fetch("/api/admin/sidebar", { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to reset.");
        resetItems = data.items;
      } else {
        const res = await fetch(`/api/navigation?target=${activeTarget}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to reset.");
        resetItems = data.items;
      }

      success(`${targetName} reset to factory defaults.`);
      updateCurrentItems(resetItems);
      onSaveSuccess(resetItems, activeTarget);
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Failed to reset navigation.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Custom Navigation & Sidebar Manager"
        maxWidth="2xl"
      >
        <div className="space-y-6">
          {/* Target Tabs: Member Drawer vs Account Portal vs Admin Sidebar */}
          <div className="flex border-b border-[#E8E5DE] gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTarget("storefront")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
                activeTarget === "storefront"
                  ? "border-[#0E0E0E] text-[#0E0E0E] bg-[#FAF9F6]"
                  : "border-transparent text-[#73706A] hover:text-[#0E0E0E]"
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-[#8F7449]" />
              <span>Member / Storefront Drawer</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTarget("account")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
                activeTarget === "account"
                  ? "border-[#0E0E0E] text-[#0E0E0E] bg-[#FAF9F6]"
                  : "border-transparent text-[#73706A] hover:text-[#0E0E0E]"
              }`}
            >
              <User className="w-3.5 h-3.5 text-[#8F7449]" />
              <span>Member Account Portal</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTarget("admin")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
                activeTarget === "admin"
                  ? "border-[#0E0E0E] text-[#0E0E0E] bg-[#FAF9F6]"
                  : "border-transparent text-[#73706A] hover:text-[#0E0E0E]"
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-[#8F7449]" />
              <span>Admin Sidebar</span>
            </button>
          </div>

          {/* Subheader and Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#E8E5DE]">
            <p className="text-xs text-[#73706A]">
              {activeTarget === "storefront"
                ? "Manage items, nested submenus, and routes shown in the website slide-out drawer for members & visitors."
                : activeTarget === "account"
                ? "Manage tabs and submenus in the Member Account Portal (/account)."
                : "Manage navigation modules in the Executive Admin Suite sidebar."}
            </p>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleResetToDefault}
                disabled={saving || loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E8E5DE] hover:bg-[#FAF9F6] text-[#73706A] hover:text-[#0E0E0E] text-xs font-semibold rounded-sm transition-colors disabled:opacity-50"
                title="Reset to factory navigation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Default
              </button>

              <button
                type="button"
                onClick={() =>
                  setEditingItem({
                    isNew: true,
                    data: {
                      id: "",
                      label: "",
                      href:
                        activeTarget === "storefront"
                          ? "/shop"
                          : activeTarget === "account"
                          ? "/account?tab=orders"
                          : "/admin",
                      icon:
                        activeTarget === "storefront"
                          ? "ShoppingBag"
                          : activeTarget === "account"
                          ? "Package"
                          : "LayoutDashboard",
                      is_active: true,
                      submenus: [],
                    },
                  })
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0E0E0E] hover:bg-[#242321] text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
                Add Item
              </button>
            </div>
          </div>

          {/* Navigation Items List */}
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {loading ? (
              <div className="text-center py-12 text-[#73706A] text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#8F7449]" />
                <span>Loading navigation hierarchy...</span>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="text-center py-12 text-[#73706A] text-xs">
                No menu items configured for this section. Click &quot;Add Item&quot; or &quot;Reset Default&quot;.
              </div>
            ) : (
              currentItems.map((item, index) => {
                const IconComp = ICON_MAP[item.icon] || ShoppingBag;

                return (
                  <div
                    key={item.id || index}
                    className="p-3.5 bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm space-y-2.5 transition-all hover:border-[#D5D2CA]"
                  >
                    {/* Top Parent Item Header */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => moveItem(index, "up")}
                            disabled={index === 0}
                            className="p-0.5 text-[#73706A] hover:text-[#0E0E0E] disabled:opacity-20 disabled:hover:text-[#73706A]"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItem(index, "down")}
                            disabled={index === currentItems.length - 1}
                            className="p-0.5 text-[#73706A] hover:text-[#0E0E0E] disabled:opacity-20 disabled:hover:text-[#73706A]"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="w-8 h-8 rounded-sm bg-white border border-[#E8E5DE] flex items-center justify-center text-[#0E0E0E]">
                          <IconComp className="w-4 h-4 text-[#8F7449]" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-[#0E0E0E]">
                              {item.label}
                            </span>
                            {item.badge && (
                              <span className="px-1.5 py-0.2 bg-[#E8E5DE] text-[#0E0E0E] text-[9px] font-bold uppercase rounded-xs">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#73706A] font-mono">
                            {item.href || "No direct route (Accordion Header)"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setEditingSubmenu({
                              parentId: item.id,
                              isNew: true,
                              data: {
                                id: "",
                                label: "",
                                href: item.href || "/",
                              },
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#73706A] hover:text-[#0E0E0E] bg-white border border-[#E8E5DE] rounded-sm transition-colors"
                          title="Add Submenu Link"
                        >
                          <Plus className="w-3 h-3 text-[#C5A880]" />
                          Submenu
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setEditingItem({
                              isNew: false,
                              data: item,
                            })
                          }
                          className="p-1.5 text-[#73706A] hover:text-[#0E0E0E] bg-white border border-[#E8E5DE] rounded-sm transition-colors"
                          title="Edit Item"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteItem(item.id)}
                          className="p-1.5 text-[#73706A] hover:text-rose-600 bg-white border border-[#E8E5DE] hover:border-rose-200 rounded-sm transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Submenus Accordion List */}
                    {item.submenus && item.submenus.length > 0 && (
                      <div className="pl-8 pt-1 space-y-1.5 border-t border-[#E8E5DE]/60">
                        <span className="text-[9px] uppercase tracking-wider text-[#A8A49C] font-semibold block">
                          Nested Submenus ({item.submenus.length})
                        </span>
                        <div className="space-y-1">
                          {item.submenus.map((sub, sIdx) => (
                            <div
                              key={sub.id || sIdx}
                              className="flex items-center justify-between p-2 bg-white border border-[#E8E5DE] rounded-sm text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <div className="flex flex-col">
                                  <button
                                    type="button"
                                    onClick={() => moveSubmenu(item.id, sIdx, "up")}
                                    disabled={sIdx === 0}
                                    className="p-0.5 text-[#73706A] disabled:opacity-20"
                                  >
                                    <ArrowUp className="w-2.5 h-2.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveSubmenu(item.id, sIdx, "down")}
                                    disabled={sIdx === item.submenus!.length - 1}
                                    className="p-0.5 text-[#73706A] disabled:opacity-20"
                                  >
                                    <ArrowDown className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                                <span className="font-medium text-[#0E0E0E]">
                                  {sub.label}
                                </span>
                                {sub.badge && (
                                  <span className="px-1 py-0.2 bg-[#E8E5DE] text-[9px] uppercase font-bold rounded-xs">
                                    {sub.badge}
                                  </span>
                                )}
                                <span className="text-[10px] text-[#73706A] font-mono">
                                  {sub.href}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingSubmenu({
                                      parentId: item.id,
                                      isNew: false,
                                      data: sub,
                                    })
                                  }
                                  className="p-1 text-[#73706A] hover:text-[#0E0E0E]"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteSubmenu(item.id, sub.id)}
                                  className="p-1 text-[#73706A] hover:text-rose-600"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E5DE]">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#73706A] hover:text-[#0E0E0E] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving || loading}
              onClick={handleSaveToDatabase}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0E0E0E] hover:bg-[#242321] text-white text-xs font-semibold uppercase tracking-widest rounded-sm transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-[#C5A880]" />
                  Save & Apply Changes
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit/Create Parent Menu Modal */}
      <Modal
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title={editingItem?.isNew ? "Add Navigation Item" : "Edit Navigation Item"}
        maxWidth="md"
      >
        {editingItem && (
          <form onSubmit={handleSaveItem} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0E0E0E] mb-1.5">
                Item Label *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Handbag Collections / My Orders"
                value={editingItem.data.label}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    data: { ...editingItem.data, label: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm focus:outline-none focus:border-[#0E0E0E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0E0E0E] mb-1.5">
                Route Link (URL)
              </label>
              <input
                type="text"
                placeholder="e.g. /shop or /#categories or /account?tab=orders"
                value={editingItem.data.href || ""}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    data: { ...editingItem.data, href: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm focus:outline-none focus:border-[#0E0E0E]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#0E0E0E] mb-1.5">
                  Select Icon
                </label>
                <select
                  value={editingItem.data.icon}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      data: { ...editingItem.data, icon: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm focus:outline-none focus:border-[#0E0E0E]"
                >
                  {Object.keys(ICON_MAP).map((iconName) => (
                    <option key={iconName} value={iconName}>
                      {iconName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0E0E0E] mb-1.5">
                  Optional Badge
                </label>
                <input
                  type="text"
                  placeholder="e.g. New / Hot / Exclusive"
                  value={editingItem.data.badge || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      data: { ...editingItem.data, badge: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm focus:outline-none focus:border-[#0E0E0E]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E5DE]">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-xs text-[#73706A] hover:text-[#0E0E0E]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0E0E0E] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#242321]"
              >
                {editingItem.isNew ? "Add Item" : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit/Create Submenu Modal */}
      <Modal
        isOpen={Boolean(editingSubmenu)}
        onClose={() => setEditingSubmenu(null)}
        title={editingSubmenu?.isNew ? "Add Submenu Link" : "Edit Submenu Link"}
        maxWidth="md"
      >
        {editingSubmenu && (
          <form onSubmit={handleSaveSubmenu} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0E0E0E] mb-1.5">
                Submenu Label *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Tote Bags / Best Sellers"
                value={editingSubmenu.data.label}
                onChange={(e) =>
                  setEditingSubmenu({
                    ...editingSubmenu,
                    data: { ...editingSubmenu.data, label: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm focus:outline-none focus:border-[#0E0E0E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0E0E0E] mb-1.5">
                Route Link (URL) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. /shop?category=Tote"
                value={editingSubmenu.data.href}
                onChange={(e) =>
                  setEditingSubmenu({
                    ...editingSubmenu,
                    data: { ...editingSubmenu.data, href: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm focus:outline-none focus:border-[#0E0E0E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0E0E0E] mb-1.5">
                Optional Badge
              </label>
              <input
                type="text"
                placeholder="e.g. Hot / 24h / New"
                value={editingSubmenu.data.badge || ""}
                onChange={(e) =>
                  setEditingSubmenu({
                    ...editingSubmenu,
                    data: { ...editingSubmenu.data, badge: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm focus:outline-none focus:border-[#0E0E0E]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E5DE]">
              <button
                type="button"
                onClick={() => setEditingSubmenu(null)}
                className="px-4 py-2 text-xs text-[#73706A] hover:text-[#0E0E0E]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0E0E0E] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#242321]"
              >
                {editingSubmenu.isNew ? "Add Submenu" : "Save Submenu"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
