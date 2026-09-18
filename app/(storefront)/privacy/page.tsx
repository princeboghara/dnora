import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | DNORA Luxury House",
  description: "Learn how DNORA collects, uses, and safeguards your personal information.",
};

export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </h1>

        <div className="space-y-6 text-sm text-[#403E3B] leading-relaxed">
          <p className="text-xs uppercase tracking-[0.18em] text-[#73706A]">
            Last Updated: January 2026
          </p>

          <section className="space-y-3">
            <h2 className="text-base font-semibold uppercase tracking-wider text-[#0E0E0E]">
              1. Commitment to Privacy
            </h2>
            <p>
              DNORA Luxury House (&quot;DNORA&quot;, &quot;we&quot;, &quot;our&quot;) is committed to respecting and protecting the privacy of our patrons. This Privacy Policy details how we collect, use, and safeguard personal information obtained through our digital boutique and associated client services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold uppercase tracking-wider text-[#0E0E0E]">
              2. Information We Collect
            </h2>
            <p>
              We collect information you provide directly, including your name, email address, postal address, phone number, and payment details when completing an acquisition, registering an account, or contacting our Concierge atelier.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold uppercase tracking-wider text-[#0E0E0E]">
              3. Use of Information
            </h2>
            <p>
              Collected data is utilized strictly to fulfill your orders, verify client authenticity, process transactions securely, dispatch shipment updates, and provide personalized concierge support.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold uppercase tracking-wider text-[#0E0E0E]">
              4. Data Protection & Security
            </h2>
            <p>
              DNORA employs industry-standard encryption protocols and secure database architectures to safeguard personal data against unauthorized access, loss, or disclosure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold uppercase tracking-wider text-[#0E0E0E]">
              5. Contact Concierge
            </h2>
            <p>
              For inquiries regarding personal data or to request data deletion, contact our Concierge at <span className="font-medium text-[#0E0E0E]">concierge@dnora.luxury</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
