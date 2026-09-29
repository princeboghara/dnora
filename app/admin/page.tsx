import React from "react";
import { SalesReportDashboard } from "@/components/admin/SalesReportDashboard";
import { getSalesReportData } from "@/lib/data/salesReport";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sales Report Dashboard | DNORA Lifestyle",
  description: "Live real-time sales performance, revenue analytics, and customer orders",
};

export default async function AdminDashboardPage() {
  let initialData = null;
  try {
    initialData = await getSalesReportData();
  } catch (err) {
    console.error("Failed to fetch initial sales report on server:", err);
  }

  return <SalesReportDashboard initialData={initialData} />;
}
