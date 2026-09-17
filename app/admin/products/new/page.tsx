import React from "react";
import { ProductEditor } from "@/components/admin/ProductEditor";

export const metadata = {
  title: "Add New Handbag / Product | DNORA Admin",
};

export default function NewProductPage() {
  return (
    <div className="py-2">
      <ProductEditor mode="create" />
    </div>
  );
}
