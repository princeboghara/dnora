import { redirect } from "next/navigation";
import { SECTION_SLUG_MAP } from "@/components/admin/CustomizationManager";

export const dynamic = "force-dynamic";

interface AdminHomepageProps {
  searchParams: Promise<{
    tab?: string;
  }>;
}

export default async function AdminHomepagePage({ searchParams }: AdminHomepageProps) {
  const resolvedParams = await searchParams;
  const tab = resolvedParams.tab;

  if (tab && SECTION_SLUG_MAP[tab.toLowerCase()]) {
    const slug = tab.toLowerCase();
    redirect(`/admin/customization/${slug}`);
  }

  redirect("/admin/customization/announcementbar");
}
