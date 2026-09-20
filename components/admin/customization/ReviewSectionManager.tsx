"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  Star,
  ShieldCheck,
  Loader2,
  Eye,
  EyeOff,
  User,
  ShoppingBag,
} from "lucide-react";
import { CustomerReview } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";

interface ReviewSectionManagerProps {
  onReviewsChange?: (reviews: CustomerReview[]) => void;
}

export function ReviewSectionManager({ onReviewsChange }: ReviewSectionManagerProps) {
  const { success, error } = useToast();
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [productName, setProductName] = useState("");
  const [verifiedPurchase, setVerifiedPurchase] = useState(true);
  const [status, setStatus] = useState<"active" | "hidden">("active");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/admin/reviews?t=${Date.now()}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.reviews)) {
        setReviews(json.reviews);
        if (onReviewsChange) onReviewsChange(json.reviews);
      }
    } catch {
      error("Failed to load customer reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleOpenAdd = () => {
    setEditingReview(null);
    setCustomerName("");
    setRating(5);
    setReviewText("");
    setProductName("");
    setVerifiedPurchase(true);
    setStatus("active");
    setModalOpen(true);
  };

  const handleOpenEdit = (rev: CustomerReview) => {
    setEditingReview(rev);
    setCustomerName(rev.customer_name);
    setRating(rev.rating || 5);
    setReviewText(rev.review);
    setProductName(rev.product_name || "");
    setVerifiedPurchase(rev.verified_purchase ?? true);
    setStatus(rev.status || "active");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !reviewText.trim()) {
      error("Please enter a customer name and review text");
      return;
    }

    setSubmitting(true);
    try {
      if (editingReview) {
        // Edit existing review
        const res = await fetch("/api/admin/reviews", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingReview.id,
            customer_name: customerName.trim(),
            rating,
            review: reviewText.trim(),
            product_name: productName.trim() || null,
            verified_purchase: verifiedPurchase,
            status,
          }),
        });

        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || "Failed to update review");

        success("Review updated successfully");
      } else {
        // Create new review
        const res = await fetch("/api/admin/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_name: customerName.trim(),
            rating,
            review: reviewText.trim(),
            product_name: productName.trim() || null,
            verified_purchase: verifiedPurchase,
            status,
          }),
        });

        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || "Failed to create review");

        success("Review added to database successfully");
      }

      setModalOpen(false);
      await fetchReviews();
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Failed to save review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (rev: CustomerReview) => {
    const nextStatus = rev.status === "active" ? "hidden" : "active";
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rev.id,
          status: nextStatus,
        }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      success(`Review status set to ${nextStatus}`);
      await fetchReviews();
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Failed to change status");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete the review from "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete review");
      success("Review deleted permanently from database");
      await fetchReviews();
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Failed to delete review");
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const query = search.toLowerCase();
    return (
      r.customer_name.toLowerCase().includes(query) ||
      r.review.toLowerCase().includes(query) ||
      (r.product_name && r.product_name.toLowerCase().includes(query))
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header with Search and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Star className="w-4 h-4 text-indigo-600 fill-indigo-600" />
            <span>Database Customer Reviews ({reviews.length})</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            100% database-driven patron praise from Supabase <code className="font-mono text-indigo-600">customer_reviews</code> table.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reviews..."
              className="w-44 sm:w-56 pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Review</span>
          </button>
        </div>
      </div>

      {/* Review List */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="text-xs">Loading database reviews...</span>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-xl">
          <p className="text-xs font-semibold text-slate-500">No reviews found in database</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Click &ldquo;Add Review&rdquo; to insert a new verified review into Supabase.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className={`p-4 rounded-xl border transition-all ${
                rev.status === "active"
                  ? "bg-white border-slate-200/90 shadow-2xs"
                  : "bg-slate-50/60 border-slate-200/60 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Stars */}
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>

                    <span className="font-bold text-xs text-slate-900">{rev.customer_name}</span>

                    {rev.verified_purchase && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Verified Purchase
                      </span>
                    )}

                    {rev.product_name && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        <ShoppingBag className="w-2.5 h-2.5 text-slate-500" />
                        {rev.product_name}
                      </span>
                    )}

                    <span
                      className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
                        rev.status === "active"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {rev.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    &ldquo;{rev.review}&rdquo;
                  </p>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-1 shrink-0 pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(rev)}
                    title={rev.status === "active" ? "Hide from storefront" : "Show on storefront"}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    {rev.status === "active" ? (
                      <Eye className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(rev)}
                    title="Edit review"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(rev.id, rev.customer_name)}
                    title="Delete review"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Edit Review */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingReview ? "Edit Customer Review" : "Add New Customer Review"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Sophia Laurent"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Rating (1 - 5 Stars) *
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500 bg-white"
              >
                <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                <option value={3}>⭐⭐⭐ 3 Stars</option>
                <option value={2}>⭐⭐ 2 Stars</option>
                <option value={1}>⭐ 1 Star</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "active" | "hidden")}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500 bg-white"
              >
                <option value="active">Active (Visible)</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Product Name (Optional)
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. The Marais Handbag"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Review Testimonial Text *
            </label>
            <textarea
              required
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write the customer's testimonial or feedback here..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="verifiedPurchaseCheck"
              checked={verifiedPurchase}
              onChange={(e) => setVerifiedPurchase(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="verifiedPurchaseCheck" className="text-xs font-medium text-slate-700 cursor-pointer">
              Mark as Verified Purchase
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-60 cursor-pointer"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />}
              <span>{editingReview ? "Save Changes" : "Create Review"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
