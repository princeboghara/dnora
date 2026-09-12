"use client";

import React, { useState, useEffect } from "react";
import { Star, Check, EyeOff, Trash2, MessageSquare } from "lucide-react";
import { Review } from "@/types";
import { formatDate } from "@/lib/utils";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      setIsLoading(true);
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data } = await supabase
            .from("reviews")
            .select("*")
            .order("created_at", { ascending: false });

          if (data && data.length > 0) {
            setReviews(
              data.map((r: any) => ({
                id: r.id,
                product_id: r.product_id,
                user_name: r.user_name,
                user_email: r.user_email,
                rating: r.rating,
                title: r.title,
                comment: r.comment,
                verified_purchase: r.verified_purchase ?? true,
                images: r.images || [],
                status: r.status || "approved",
                created_at: r.created_at,
              }))
            );
          } else {
            setReviews([]);
          }
        } catch {
          setReviews([]);
        }
      } else {
        setReviews([]);
      }
      setIsLoading(false);
    }
    loadReviews();
  }, []);

  const handleStatus = async (id: string, status: "approved" | "hidden") => {
    setReviews(
      reviews.map((r) => (r.id === id ? { ...r, status } : r))
    );
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("reviews").update({ status }).eq("id", id);
      } catch {
        // Ignore
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this patron review permanently?")) {
      setReviews(reviews.filter((r) => r.id !== id));
      if (isSupabaseConfigured() && supabase) {
        try {
          await supabase.from("reviews").delete().eq("id", id);
        } catch {
          // Ignore
        }
      }
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold font-mono">
            Reputation &amp; Acclaim
          </span>
          <h1 className="font-sans text-2xl sm:text-3xl text-[#0F172A] uppercase tracking-[0.12em] font-bold mt-1">
            Client Reviews Moderation
          </h1>
        </div>
        <span className="text-xs text-[#64748B] font-mono px-3 py-1.5 rounded-xl neu-inset bg-[#F1F5F9] font-semibold">
          {reviews.length} Client Testimonials
        </span>
      </div>

      <div className="rounded-3xl neu-card bg-white border border-slate-200/80 p-6 shadow-sm">
        <div className="rounded-2xl overflow-hidden border border-slate-200/80">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase tracking-widest text-[#475569] bg-[#F8FAFC] border-b border-slate-200 font-mono font-semibold">
              <tr>
                <th className="p-4">Patron</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Impression &amp; Commentary</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#0F172A]">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#64748B]">
                    <div className="max-w-md mx-auto space-y-2">
                      <MessageSquare className="w-8 h-8 mx-auto text-[#C5A880]/60" />
                      <p className="text-sm font-semibold text-[#0F172A]">
                        {isLoading ? "Retrieving reviews..." : "No Patron Reviews Submitted Yet"}
                      </p>
                      <p className="text-[11px] text-[#64748B]">
                        {isLoading
                          ? "Syncing with moderation queue..."
                          : "When clients submit impressions or ratings on creations, they will appear here for executive approval."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-[#0F172A]">{rev.user_name}</p>
                      <p className="text-[10px] text-[#64748B]">{rev.user_email}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex text-[#C5A880]">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? "fill-[#C5A880] text-[#C5A880]" : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="p-4 max-w-md">
                      <p className="font-sans font-bold text-[#0F172A] uppercase tracking-wide text-xs">{rev.title}</p>
                      <p className="text-[11px] text-[#64748B] line-clamp-2 mt-0.5">{rev.comment}</p>
                    </td>
                    <td className="p-4 text-[#64748B] whitespace-nowrap font-mono">
                      {formatDate(rev.created_at)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border ${
                          rev.status === "approved"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {rev.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {rev.status !== "approved" ? (
                          <button
                            onClick={() => handleStatus(rev.id, "approved")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] uppercase font-bold hover:bg-emerald-100 transition-all cursor-pointer"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatus(rev.id, "hidden")}
                            className="px-2.5 py-1 rounded-lg neu-btn text-[#64748B] hover:text-[#0F172A] text-[10px] uppercase font-bold transition-all cursor-pointer"
                          >
                            Hide
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(rev.id)}
                          className="p-1.5 rounded-lg neu-btn text-[#64748B] hover:text-red-500 cursor-pointer transition-all"
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
