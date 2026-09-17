import { z } from "zod";

export const productImageSchema = z.object({
  id: z.string().optional(),
  product_id: z.string().optional(),
  cloudinary_public_id: z.string(),
  secure_url: z.string().url(),
  alt_text: z.string().default(""),
  sort_order: z.number().default(0),
});

export const productColorVariantSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Color name is required"),
  color_hex: z.string().min(3, "Valid color code required"),
  images: z.array(productImageSchema).default([]),
});

export const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters").max(120),
  slug: z.string().min(2).max(150).optional(),
  short_description: z.string().min(5, "Short description is required").max(200),
  description: z.string().min(10, "Detailed description is required"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  compare_at_price: z.coerce.number().positive().optional().nullable(),
  sku: z.string().min(2, "SKU is required").max(50),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  category_id: z.string().min(1, "Please select a category"),
  is_best_seller: z.boolean().default(false),
  is_new_arrival: z.boolean().default(false),
  status: z.enum(["draft", "active", "archived"]).default("active"),
  images: z.array(productImageSchema).min(1, "At least one product image is required"),
  color_variants: z.array(productColorVariantSchema).optional().default([]),
});

export type ProductInput = z.infer<typeof productSchema>;
