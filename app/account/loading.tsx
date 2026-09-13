import React from "react";
import { DnoraLoadingScreen } from "@/components/ui/DnoraLoadingScreen";

export default function AccountLoading() {
  return (
    <DnoraLoadingScreen
      fullScreen
      text="D'NORA PATRON CONCIERGE"
      subtitle="RETRIEVING CLIENT PORTFOLIO..."
    />
  );
}
