"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ToastProvider } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Restore collapsed state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("dnora_admin_sidebar_collapsed");
      if (stored !== null) {
        setSidebarCollapsed(stored === "true");
      }
    } catch {
      // ignore
    }
  }, []);

  const handleToggleCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("dnora_admin_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // If on login page, render clean standalone view
  if (pathname === "/admin/login") {
    return <ToastProvider>{children}</ToastProvider>;
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex">
        {/* Sidebar */}
        <AdminSidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          customizerOpen={customizerOpen}
          onOpenCustomizer={() => setCustomizerOpen(true)}
          onCloseCustomizer={() => setCustomizerOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />

        {/* Main Content Area */}
        <div
          className={cn(
            "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
            sidebarCollapsed ? "md:pl-20" : "md:pl-64"
          )}
        >
          <AdminHeader
            onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
            onOpenCustomizer={() => setCustomizerOpen(true)}
            sidebarCollapsed={sidebarCollapsed}
            onToggleCollapse={handleToggleCollapse}
          />
          <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
