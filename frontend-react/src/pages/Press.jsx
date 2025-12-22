import React from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import Footer from "../components/Footer";
import HeroNavbar from "../components/HeroNavbar";

const resources = [
  {
    title: "Press kit",
    detail: "Brand assets, logos, color values, and hero mockups that match the rest of the site.",
    cta: { label: "Download kit", to: "/contact" }
  },
  {
    title: "Fast facts",
    detail: "One-page overview of savings, partner coverage, and recent milestones.",
    cta: { label: "View highlights", to: "/about" }
  },
  {
    title: "Spokespeople",
    detail: "Founder, product, and partner leads available for commentary on startup ecosystems.",
    cta: { label: "Request interview", to: "/contact" }
  }
];

const mentions = [
  "Marketplace design focused on clarity and trusted partners",
  "AI-native deal discovery tuned for security teams",
  "Global network of perks spanning 200+ SaaS providers",
];

export default function Press() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9ff] via-white to-[#eef2ff] text-slate-900">
      <HeroNavbar />
      <header className="relative overflow-hidden bg-gradient-hero pt-28 pb-16 text-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute left-8 top-4 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-8 bottom-0 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-6 space-y-8">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Press" }]} />
          <div className="space-y-4">
            <p className="text-sm tracking-[0.35em] uppercase text-primary">Media</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">Press resources</h1>
            <p className="text-lg text-slate-600 max-w-3xl">
              Access brand assets, fast facts, and story angles. Every asset pairs with the same gradients and hero layouts used across Connecttly.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/contact"
              className="btn-bubble btn-bubble--dark shadow-glow shadow-primary/20"
            >
              Talk to comms
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/90 px-5 py-3 text-sm font-semibold text-primary hover:border-primary/40 transition shadow-sm"
            >
              Company overview
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <section className="grid gap-6 md:grid-cols-3">
          {resources.map((resource) => (
            <div key={resource.title} className="rounded-3xl border border-primary/10 bg-white/90 p-6 shadow-lg space-y-3">
              <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">{resource.title}</p>
              <p className="text-slate-700">{resource.detail}</p>
              <Link
                to={resource.cta.to}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
              >
                {resource.cta.label}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/5 via-white to-accent/10 p-8 shadow-lg">
          <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr] items-center">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Story angles</p>
              <h3 className="text-3xl font-bold text-slate-900">Topics journalists ask about</h3>
              <p className="text-slate-600">
                Whether you cover SaaS, ecosystems, or AI-driven procurement, we have operators and data to share.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {mentions.map((item) => (
                <div key={item} className="rounded-2xl border border-primary/10 bg-white/90 p-4 shadow-sm">
                  <p className="text-sm text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-md flex flex-col gap-4 text-center">
          <h3 className="text-2xl font-semibold text-slate-900">Need a quote or briefing?</h3>
          <p className="text-slate-600 max-w-3xl mx-auto">
            We respond quickly with data points, visuals, and spokespeople. Let us know your angle and deadline.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/contact"
              className="btn-bubble btn-bubble--dark shadow-glow shadow-primary/20"
            >
              Contact PR
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/legal"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-6 py-3 text-sm font-semibold text-primary hover:border-primary/40 transition"
            >
              View legal center
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
