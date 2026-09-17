"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ToastProvider } from "@/components/ui/Toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);

  // If on login page, render clean standalone view
  if (pathname === "/admin/login") {
    return <ToastProvider>{children}</ToastProvider>;
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#FBFBFB] text-[#0E0E0E] flex">
        {/* Sidebar */}
        <AdminSidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          customizerOpen={customizerOpen}
          onOpenCustomizer={() => setCustomizerOpen(true)}
          onCloseCustomizer={() => setCustomizerOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
          <AdminHeader
            onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
            onOpenCustomizer={() => setCustomizerOpen(true)}
          />
          <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
