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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold font-mono">
            Governance &amp; Security
          </span>
          <h1 className="font-sans text-2xl sm:text-3xl text-[#0F172A] uppercase tracking-[0.12em] font-bold mt-1">
            Admin Activity Audit Trail
          </h1>
        </div>
        <span className="text-xs text-[#64748B] font-mono px-3 py-1.5 rounded-xl neu-inset bg-[#F1F5F9] font-semibold">
          {logs.length} Recorded Events
        </span>
      </div>

      <div className="rounded-3xl neu-card bg-white border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-sm text-xs">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-[#64748B]">
            <div className="max-w-md mx-auto space-y-2">
              <ShieldCheck className="w-8 h-8 mx-auto text-[#C5A880]/60" />
              <p className="text-sm font-semibold text-[#0F172A]">
                {isLoading ? "Retrieving audit trails..." : "No Administrative Events Logged Yet"}
              </p>
              <p className="text-[11px] text-[#64748B]">
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
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] uppercase tracking-wider font-mono font-bold">
                    {log.action}
                  </span>
                  <span className="font-bold text-[#0F172A]">
                    {log.target_type}: {log.target_id}
                  </span>
                </div>
                {log.details && <p className="text-[#64748B] font-medium">{log.details}</p>}
                <p className="text-[10px] text-[#64748B]">Initiated by: <strong className="text-[#0F172A]">{log.admin_name}</strong></p>
              </div>

              <span className="text-[11px] font-mono text-[#64748B] whitespace-nowrap">
                {formatDate(log.created_at)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
