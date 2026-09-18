import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping Policy | DNORA Luxury House",
  description: "Complimentary express shipping and secure insured delivery for all DNORA luxury handbags.",
};

export default function ShippingPolicyPage() {
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
          Shipping Policy
        </h1>

        <div className="space-y-6 text-sm text-[#403E3B] leading-relaxed">
          <p className="text-xs uppercase tracking-[0.18em] text-[#73706A]">
            Last Updated: January 2026
          </p>

          <section className="space-y-3">
            <h2 className="text-base font-semibold uppercase tracking-wider text-[#0E0E0E]">
              1. Complimentary Insured Delivery
            </h2>
            <p>
              DNORA provides complimentary insured delivery across India for all luxury handbag acquisitions. Every shipment is carefully packaged in our signature archival protective box and dust cover.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold uppercase tracking-wider text-[#0E0E0E]">
              2. Processing &amp; Dispatch Timeline
            </h2>
            <p>
              Orders placed before 2:00 PM IST are processed and prepared within 24–48 business hours. You will receive an automated dispatch notification with real-time tracking via SMS and email.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold uppercase tracking-wider text-[#0E0E0E]">
              3. Delivery Windows
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-sm text-[#403E3B]">
              <li>Metro Cities: 2–4 business days</li>
              <li>Rest of India: 4–6 business days</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold uppercase tracking-wider text-[#0E0E0E]">
              4. Signature on Delivery
            </h2>
            <p>
              To ensure safe custody of your luxury goods, high-value packages require an authorized signature upon physical handover.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
