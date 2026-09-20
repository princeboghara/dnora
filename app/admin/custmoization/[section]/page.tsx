import React, { Suspense } from "react";
import { CustomizationManager } from "@/components/admin/CustomizationManager";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

interface CustmoizationSectionPageProps {
  params: Promise<{
    section: string;
  }>;
}

export default async function CustmoizationSectionPage({
  params,
}: CustmoizationSectionPageProps) {
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
      <CustomizationManager activeSlug={section} basePath="/admin/custmoization" />
    </Suspense>
  );
}
