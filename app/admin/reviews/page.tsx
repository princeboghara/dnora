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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#252D3D]">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold">
            Reputation &amp; Acclaim
          </span>
          <h1 className="font-sans text-2xl sm:text-3xl text-[#FBF9F5] uppercase tracking-[0.12em] font-medium">
            Client Reviews Moderation
          </h1>
        </div>
        <span className="text-xs text-[#8491A5] font-mono">
          {reviews.length} Client Testimonials
        </span>
      </div>

      <div className="bg-[#13171F] border border-[#252D3D] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="text-[10px] uppercase tracking-widest text-[#8491A5] bg-[#1A202C] border-b border-[#252D3D]">
            <tr>
              <th className="p-4">Patron</th>
              <th className="p-4">Rating</th>
              <th className="p-4">Impression &amp; Commentary</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#252D3D] text-[#E4E8EE]">
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-[#8491A5]">
                  <div className="max-w-md mx-auto space-y-2">
                    <MessageSquare className="w-8 h-8 mx-auto text-[#C5A880]/50" />
                    <p className="text-sm font-medium text-[#FBF9F5]">
                      {isLoading ? "Retrieving reviews..." : "No Patron Reviews Submitted Yet"}
                    </p>
                    <p className="text-[11px] text-[#8491A5]">
                      {isLoading
                        ? "Syncing with moderation queue..."
                        : "When clients submit impressions or ratings on creations, they will appear here for executive approval."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              reviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-[#1A202C]/60 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold text-[#FBF9F5]">{rev.user_name}</p>
                    <p className="text-[10px] text-[#8491A5]">{rev.user_email}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex text-[#C5A880]">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? "fill-current" : "text-[#252D3D]"
                          }`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="p-4 max-w-md">
                    <p className="font-sans font-medium text-[#FBF9F5] uppercase tracking-wide text-xs">{rev.title}</p>
                    <p className="text-[11px] text-[#8491A5] line-clamp-2">{rev.comment}</p>
                  </td>
                  <td className="p-4 text-[#8491A5] whitespace-nowrap">
                    {formatDate(rev.created_at)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border ${
                        rev.status === "approved"
                          ? "bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30"
                          : "bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30"
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
                          className="px-2.5 py-1 bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 text-[10px] uppercase font-semibold hover:bg-[#10B981] hover:text-[#111111]"
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatus(rev.id, "hidden")}
                          className="px-2.5 py-1 bg-[#252D3D] text-[#8491A5] hover:text-[#E4E8EE] text-[10px] uppercase"
                        >
                          Hide
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(rev.id)}
                        className="p-1 text-[#8491A5] hover:text-[#EF4444]"
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
  );
}
