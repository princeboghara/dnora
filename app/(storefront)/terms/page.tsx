import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions | DNORA Luxury House",
  description: "Terms and conditions governing the acquisition of DNORA luxury goods and use of our boutique services.",
};

export default function TermsPage() {
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
          Terms &amp; Conditions
        </h1>

        <div className="space-y-6 text-sm text-[#403E3B] leading-relaxed">
          <p className="text-xs uppercase tracking-[0.18em] text-[#73706A]">
            Last Updated: January 2026
          </p>

          <section className="space-y-3">
            <h2 className="text-base font-semibold uppercase tracking-wider text-[#0E0E0E]">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or purchasing from DNORA Luxury House, you agree to be bound by these Terms &amp; Conditions, our Privacy Policy, and all applicable laws and regulations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold uppercase tracking-wider text-[#0E0E0E]">
              2. Product Authenticity &amp; Integrity
            </h2>
            <p>
              All DNORA pieces are genuine artisan creations crafted from premium full-grain leather and precision hardware. Each item undergoes strict quality assessment before dispatch.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold uppercase tracking-wider text-[#0E0E0E]">
              3. Pricing &amp; Availability
            </h2>
            <p>
              Prices are displayed in Indian Rupees (INR) inclusive of applicable taxes unless stated otherwise. We reserve the right to revise prices or discontinue pieces at our sole discretion without prior notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold uppercase tracking-wider text-[#0E0E0E]">
              4. Intellectual Property
            </h2>
            <p>
              All content, trademarks, silhouette designs, photography, and brand materials are the exclusive intellectual property of DNORA Luxury House.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
