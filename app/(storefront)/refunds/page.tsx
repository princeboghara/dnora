import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Return & Refund Policy | DNORA Luxury House",
  description: "Learn about DNORA complimentary 7-day returns, exchanges, and refund procedures.",
};

export default function RefundsPage() {
  return (
    <div className="min-h-screen bg-white text-[#0E0E0E] py-14 sm:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#73706A] hover:text-[#0E0E0E] mb-8 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold uppercase tracking-tight mb-8">
          Return &amp; Refund Policy
        </h1>

        <div className="space-y-6 text-sm text-[#403E3B] leading-relaxed">
          <p className="text-xs uppercase tracking-[0.18em] text-[#73706A]">
            Last Updated: January 2026
          </p>

          <section className="space-y-3">
            <h2 className="text-base font-semibold uppercase tracking-wider text-[#0E0E0E]">
              1. 7-Day Complimentary Returns
            </h2>
            <p>
              We want you to be completely delighted with your DNORA acquisition. Unused items in their original condition, with intact security tags, protective films, dust bags, and packaging, may be returned or exchanged within 7 days of delivery.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold uppercase tracking-wider text-[#0E0E0E]">
              2. Return Process
            </h2>
            <p>
              To initiate a return or exchange, contact our Concierge at <span className="font-medium text-[#0E0E0E]">concierge@dnora.luxury</span> with your Order ID. A complimentary secure courier pickup will be scheduled at your doorstep.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold uppercase tracking-wider text-[#0E0E0E]">
              3. Quality Inspection &amp; Refund
            </h2>
            <p>
              Upon receipt at our atelier, pieces are thoroughly examined by our artisans. Approved refunds are credited to the original method of payment within 5–7 business days.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
