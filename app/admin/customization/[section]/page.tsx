import React, { Suspense } from "react";
import { CustomizationManager } from "@/components/admin/CustomizationManager";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

interface CustomizationSectionPageProps {
  params: Promise<{
    section: string;
  }>;
}

export default async function CustomizationSectionPage({
  params,
}: CustomizationSectionPageProps) {
  const resolvedParams = await params;
  const section = resolvedParams.section || "annoucemnetbar";

  return (
    <Suspense
      fallback={
        <div className="py-24 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0E0E0E]" />
          <span className="text-xs uppercase tracking-widest text-[#73706A] mt-3 font-semibold">
            Loading Customizer...
          </span>
        </div>
      }
    >
      <CustomizationManager activeSlug={section} basePath="/admin/customization" />
    </Suspense>
  );
}
