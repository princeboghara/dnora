import React from "react";
import { DnoraLoadingScreen } from "@/components/ui/DnoraLoadingScreen";

export default function Loading() {
  return (
    <DnoraLoadingScreen
      fullScreen
      text="D'NORA LUXURY ESSENTIALS"
      subtitle="RETRIEVING ATELIER CREATIONS..."
    />
  );
}
