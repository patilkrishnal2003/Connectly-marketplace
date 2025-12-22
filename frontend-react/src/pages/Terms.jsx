import React from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import BackToHomeButton from "../components/BackToHomeButton";
import HeroNavbar from "../components/HeroNavbar";

const sections = [
  {
    title: "Acceptance of service",
    body:
      "By accessing Connecttly, you agree to these Terms & Conditions and our Privacy Policy. Use of the platform means you consent to the way we deliver partner deals, process payments, and safeguard your data."
  },
  {
    title: "Use of the marketplace",
    body:
      "You must keep your account in good standing, honor partner-specific eligibility, and only claim perks for legitimate teams. Attempts to spoof usage or bypass verification may result in suspension."
  },
  {
    title: "Subscriptions and billing",
    body:
      "Plans renew automatically unless canceled. We bill the current method on file, and refunds are handled on a case-by-case basis when we cannot fulfill a promised perk."
  },
  {
    title: "Partner deals",
    body:
      "Deals are provided by third-party partners. Each deal has its own terms. Connecttly acts as a facilitator and does not guarantee pricing or availability beyond what the partner publishes."
  },
  {
    title: "Content policy",
    body:
      "You are responsible for the content you upload, submit, or share via Connecttly. We reserve the right to remove anything that violates our community guidelines or applicable law."
  },
  {
    title: "Limitation of liability",
    body:
      "Connecttly is not liable for indirect or consequential damages arising from your use of the service. Our maximum liability is limited to the amount paid for the subscription in the preceding 12 months."
  }
];

const highlights = [
  "Curated partner deals vetted for quality and compliance.",
  "Transparent billing with real-time plan controls.",
  "Control access for team members through roles and permissions.",
  "Enterprise-grade encrypted data protection and SOC2 compliance.",
  "Responsive support for all plan levels with faster SLAs for Pro."
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50 text-slate-900">
      <HeroNavbar />
      <header className="relative overflow-hidden bg-gradient-to-br from-[#f8f4ff] via-[#efe6ff] to-[#f4edff] pt-28 pb-16 text-slate-900">
        <div className="absolute -top-6 -right-6 h-56 w-56 rounded-full bg-[#c4b5fd]/60 blur-3xl" />
        <div className="absolute bottom-0 left-8 h-72 w-72 rounded-full bg-[#fcd34d]/60 blur-3xl" />
        <div className="max-w-5xl mx-auto px-6 space-y-8 text-center relative">
          <div className="absolute -top-4 right-4">
            <BackToHomeButton />
          </div>
          <div>
            <p className="text-sm tracking-[0.4em] uppercase text-indigo-600">
              Legal
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              Terms & Conditions
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            These terms outline how Connecttly delivers partner perks, manages subscriptions, and protects your account. They build on the same premium, community-first experience you see on the homepage.
          </p>
          <div className="flex flex-col sm:flex-row sm:justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:opacity-95"
            >
              Back to marketplace
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-indigo-100 px-6 py-3 text-sm font-semibold text-indigo-700 bg-white/80 hover:bg-white transition"
            >
              Contact support
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <section className="rounded-3xl border border-slate-200 bg-white/90 shadow-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Our commitments</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">Reliable, transparent experience</h2>
              <p className="text-slate-600 mt-3">
                We mirror the palette, gradients, and premium feel from the hero so the policy page looks and feels like an extension of the marketplace.
              </p>
            </div>
            <div className="space-y-2">
              {highlights.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                  <p className="text-sm text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          {sections.map((section) => (
            <article key={section.title} className="rounded-3xl border border-slate-200 bg-white/90 shadow-lg p-6">
              <h3 className="text-2xl font-semibold text-slate-900">{section.title}</h3>
              <p className="text-slate-600 mt-3">{section.body}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-[#ede9fe] via-white to-slate-50 p-8">
          <div className="flex flex-col gap-4 text-center">
            <h3 className="text-2xl font-semibold text-slate-900">Need a different agreement?</h3>
            <p className="text-slate-600">
              For enterprise contracts, white-label programs, or custom deals we can draft a tailored contract that covers your legal and compliance needs.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:opacity-95"
            >
              Talk to legal
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
