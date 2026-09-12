import React from "react";
import { DnoraLoadingScreen } from "@/components/ui/DnoraLoadingScreen";

export default function AdminLoading() {
  return (
    <DnoraLoadingScreen
      fullScreen
      mode="admin"
      text="D'NORA ATELIER CONSOLE"
      subtitle="SYNCHRONIZING CONTROL TERMINAL..."
    />
  );
}
