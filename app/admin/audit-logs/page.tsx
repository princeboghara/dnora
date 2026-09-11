"use client";

import React, { useState, useEffect } from "react";
import { History, ShieldCheck, Clock } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

interface AdminLog {
  id: string;
  admin_name: string;
  action: string;
  target_type: string;
  target_id: string;
  details?: string;
  created_at: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      setIsLoading(true);
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data } = await supabase
            .from("admin_activity_logs")
            .select("*")
            .order("created_at", { ascending: false });

          if (data && data.length > 0) {
            setLogs(
              data.map((l: any) => ({
                id: l.id,
                admin_name: l.admin_name || "Super Admin",
                action: l.action || "SYSTEM_EVENT",
                target_type: l.target_type || "SYSTEM",
                target_id: l.target_id || "—",
                details: l.metadata?.details || `${l.action} on ${l.target_type}`,
                created_at: l.created_at,
              }))
            );
          } else {
            setLogs([]);
          }
        } catch {
          setLogs([]);
        }
      } else {
        setLogs([]);
      }
      setIsLoading(false);
    }

    loadLogs();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#252D3D]">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold">
            Governance &amp; Security
          </span>
          <h1 className="font-serif text-3xl text-[#FBF9F5] uppercase tracking-wide">
            Admin Activity Audit Trail
          </h1>
        </div>
        <span className="text-xs text-[#8491A5] font-mono">
          {logs.length} Recorded Events
        </span>
      </div>

      <div className="bg-[#13171F] border border-[#252D3D] divide-y divide-[#252D3D] text-xs">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-[#8491A5]">
            <div className="max-w-md mx-auto space-y-2">
              <ShieldCheck className="w-8 h-8 mx-auto text-[#C5A880]/50" />
              <p className="text-sm font-medium text-[#FBF9F5]">
                {isLoading ? "Retrieving audit trails..." : "No Administrative Events Logged Yet"}
              </p>
              <p className="text-[11px] text-[#8491A5]">
                {isLoading
                  ? "Verifying security log records..."
                  : "All future governance actions (product publishing, pricing overrides, status adjustments, CMS changes) will be permanently recorded here."}
              </p>
            </div>
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#1A202C]/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#C5A880]/20 text-[#C5A880] text-[9px] uppercase tracking-wider font-mono font-bold">
                    {log.action}
                  </span>
                  <span className="font-semibold text-[#FBF9F5]">
                    {log.target_type}: {log.target_id}
                  </span>
                </div>
                {log.details && <p className="text-[#8491A5]">{log.details}</p>}
                <p className="text-[10px] text-[#8491A5]">Initiated by: {log.admin_name}</p>
              </div>

              <span className="text-[10px] font-mono text-[#8491A5] whitespace-nowrap">
                {formatDate(log.created_at)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
