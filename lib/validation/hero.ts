import { z } from "zod";

export const heroBannerSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100),
  subtitle: z.string().max(200).optional(),
  media_type: z.enum(["image", "video"]),
  media_url: z.string().url("Must be a valid media URL"),
  mobile_media_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  button_text: z.string().min(1, "Button text is required").max(50),
  button_link: z.string().min(1, "Button link is required"),
  duration_seconds: z.coerce.number().int().min(2, "Duration must be at least 2 seconds").max(30).default(5),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  text_alignment: z.enum(["left", "center", "right"]).default("left"),
});

export type HeroBannerInput = z.infer<typeof heroBannerSchema>;
