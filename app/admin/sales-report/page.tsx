import React from "react";
import { SalesReportDashboard } from "@/components/admin/SalesReportDashboard";

export const metadata = {
  title: "Sales Report | DNORA Lifestyle",
  description: "Track your sales performance and growth across purse categories",
};

export default function SalesReportPage() {
  return <SalesReportDashboard />;
}
