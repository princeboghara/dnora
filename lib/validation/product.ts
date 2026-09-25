import { z } from "zod";

export const productImageSchema = z.object({
  id: z.string().optional(),
  product_id: z.string().optional(),
  cloudinary_public_id: z.string().optional().default(""),
  secure_url: z.string().min(1, "Image URL is required"),
  alt_text: z.string().optional().default(""),
  sort_order: z.number().optional().default(0),
});

export const productColorVariantSchema = z.object({
  id: z.string().default(() => `var_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`),
  name: z.string().min(1, "Color name is required"),
  color_hex: z.string().min(1, "Color code is required"),
  images: z.array(productImageSchema).default([]),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  slug: z.string().optional(),
  short_description: z.string().optional().default(""),
  description: z.string().optional().default(""),
  price: z.coerce.number().positive("Price must be greater than 0"),
  compare_at_price: z.coerce.number().optional().nullable(),
  sku: z.string().optional().default(""),
  stock: z.coerce.number().int().min(0).default(0),
  category_id: z.string().optional().default(""),
  is_best_seller: z.boolean().optional().default(false),
  is_new_arrival: z.boolean().optional().default(false),
  status: z.enum(["draft", "active", "archived"]).optional().default("active"),
  images: z.array(productImageSchema).optional().default([]),
  color_variants: z.array(productColorVariantSchema).optional().default([]),
});

export type ProductInput = z.infer<typeof productSchema>;
