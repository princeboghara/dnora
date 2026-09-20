"use client";

import React, { useState, useEffect } from "react";
import { Link2 } from "lucide-react";
import { ProductCategory } from "@/types";

interface PageLinkSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
  label?: string;
}

const STATIC_ROUTES = [
  { group: "Storefront Pages", options: [
    { label: "Home Page (/)", value: "/" },
    { label: "Catalog / All Handbags (/shop)", value: "/shop" },
    { label: "Best Sellers (/shop?best_seller=true)", value: "/shop?best_seller=true" },
    { label: "New In (/shop?new_arrival=true)", value: "/shop?new_arrival=true" },
    { label: "Member Account (/account)", value: "/account" },
  ]},
  { group: "Policies & Concierge", options: [
    { label: "Privacy Policy (/privacy)", value: "/privacy" },
    { label: "Terms & Conditions (/terms)", value: "/terms" },
    { label: "Shipping Policy (/shipping)", value: "/shipping" },
    { label: "Return & Refund Policy (/refunds)", value: "/refunds" },
  ]},
];

export function PageLinkSelect({
  value,
  onChange,
  className = "",
  id,
  label,
}: PageLinkSelectProps) {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [explicitCustom, setExplicitCustom] = useState(false);
  const [customInput, setCustomInput] = useState(value || "");

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const isPredefined = Boolean(
    !value ||
    STATIC_ROUTES.some((g) => g.options.some((o) => o.value === value)) ||
    categories.some((c) => `/category/${c.slug}` === value)
  );

  const isCustom = !isPredefined || explicitCustom;

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === "__custom__") {
      setExplicitCustom(true);
      setCustomInput(value || "https://");
    } else {
      setExplicitCustom(false);
      onChange(selected);
    }
  };

  const handleCustomBlur = () => {
    onChange(customInput.trim());
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-[#73706A]">
          {label}
        </label>
      )}

      <div className="flex flex-col gap-2">
        <div className="relative">
          <select
            id={id}
            value={isCustom ? "__custom__" : value}
            onChange={handleSelectChange}
            className="w-full bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm px-3 py-2 text-xs text-[#0E0E0E] font-medium focus:outline-none focus:border-[#0E0E0E] transition-colors appearance-none cursor-pointer pr-8"
          >
            <option value="">Select an Active Store Page Link...</option>

            {STATIC_ROUTES.map((group) => (
              <optgroup key={group.group} label={group.group}>
                {group.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </optgroup>
            ))}

            {categories.length > 0 && (
              <optgroup label="Product Categories">
                {categories.map((cat) => (
                  <option key={cat.id} value={`/category/${cat.slug}`}>
                    {cat.name} (/category/{cat.slug})
                  </option>
                ))}
              </optgroup>
            )}

            <optgroup label="Custom Option">
              <option value="__custom__">Custom URL / External Link &rarr;</option>
            </optgroup>
          </select>

          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#73706A]">
            <Link2 className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Custom URL Input if Custom Selected */}
        {isCustom && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => {
                setCustomInput(e.target.value);
                onChange(e.target.value);
              }}
              onBlur={handleCustomBlur}
              placeholder="e.g. /shop?filter=clutch or https://..."
              className="flex-1 bg-white border border-[#0E0E0E] rounded-sm px-3 py-1.5 text-xs text-[#0E0E0E] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                setExplicitCustom(false);
                onChange("/shop");
              }}
              className="text-[10px] text-[#73706A] hover:text-[#0E0E0E] underline whitespace-nowrap"
            >
              Reset to Dropdown
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
