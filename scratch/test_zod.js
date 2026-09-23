const { z } = require("zod");

const heroBannerBaseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100),
  heading: z.string().max(100).optional().nullable().or(z.literal("")),
  subtitle: z.string().max(200).optional().nullable().or(z.literal("")),
  media_type: z.enum(["image", "video"]),
  media_url: z.string().min(1, "Media URL is required"),
  tablet_media_url: z.string().optional().nullable().or(z.literal("")),
  mobile_media_url: z.string().optional().nullable().or(z.literal("")),
  button_text: z.string().max(50).optional().nullable().or(z.literal("")),
  button_link: z.string().optional().or(z.literal("")),
  duration_seconds: z.coerce.number().int().min(2, "Duration must be at least 2 seconds").max(30),
  sort_order: z.coerce.number().int(),
  is_active: z.boolean(),
  status: z.enum(["draft", "published", "archived"]),
  text_alignment: z.enum(["left", "center", "right"]),
  start_date: z.string().optional().nullable().or(z.literal("")),
  end_date: z.string().optional().nullable().or(z.literal("")),
});

const heroBannerUpdateSchema = heroBannerBaseSchema.partial();

const input1 = { heading: null, subtitle: null };
console.log("Input 1 (null):", heroBannerUpdateSchema.parse(input1));

const input2 = { heading: "", subtitle: "" };
console.log("Input 2 (empty string):", heroBannerUpdateSchema.parse(input2));
