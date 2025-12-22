import React from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import Footer from "../components/Footer";
import HeroNavbar from "../components/HeroNavbar";

const channels = [
  {
    title: "Monthly sessions",
    detail: "Live walkthroughs of the roadmap, hero updates, and new partner perks.",
    action: { label: "Save my seat", to: "/roadmap" }
  },
  {
    title: "Founder circles",
    detail: "Small-group chats on tooling, savings, and lessons from activating benefits.",
    action: { label: "Request invite", to: "/contact" }
  },
  {
    title: "Resource library",
    detail: "Templates, checklists, and recorded demos that share our consistent UI patterns.",
    action: { label: "Browse docs", to: "/documentation" }
  }
];

const values = [
  "Keep discussions practical, inclusive, and respectful.",
  "Share screenshots and flows that match our hero and footer styling.",
  "Protect partner and customer data—no confidential details.",
];

export default function Community() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9ff] via-white to-[#eef2ff] text-slate-900">
      <HeroNavbar />
      <header className="relative overflow-hidden bg-gradient-hero pt-28 pb-16 text-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute -right-12 top-4 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute left-8 bottom-0 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-6 space-y-8">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Community" }]} />
          <div className="space-y-4">
            <p className="text-sm tracking-[0.35em] uppercase text-primary">Community</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">Connecttly community</h1>
            <p className="text-lg text-slate-600 max-w-3xl">
              Operators, founders, and partners connect here. Every touchpoint keeps the same clean gradients and hero treatment you expect.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/documentation"
              className="btn-bubble btn-bubble--dark shadow-glow shadow-primary/20"
            >
              Explore guides
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/faq"
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/90 px-5 py-3 text-sm font-semibold text-primary hover:border-primary/40 transition shadow-sm"
            >
              Visit help center
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <section className="grid gap-6 md:grid-cols-3">
          {channels.map((channel) => (
            <div key={channel.title} className="rounded-3xl border border-primary/10 bg-white/90 p-6 shadow-lg space-y-3">
              <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">{channel.title}</p>
              <p className="text-slate-700">{channel.detail}</p>
              <Link
                to={channel.action.to}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
              >
                {channel.action.label}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/5 via-white to-accent/10 p-8 shadow-lg">
          <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr] items-center">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Community guidelines</p>
              <h3 className="text-3xl font-bold text-slate-900">Build with empathy</h3>
              <p className="text-slate-600">
                We maintain a respectful, privacy-aware space for sharing. Help keep the tone as polished as our UI.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {values.map((value) => (
                <div key={value} className="rounded-2xl border border-primary/10 bg-white/90 p-4 shadow-sm">
                  <p className="text-sm text-slate-700">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-md flex flex-col gap-4 text-center">
          <h3 className="text-2xl font-semibold text-slate-900">Share your voice</h3>
          <p className="text-slate-600 max-w-3xl mx-auto">
            Recommend partners, share a success story, or ask for product tweaks. We will route your feedback to the right team.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/contact"
              className="btn-bubble btn-bubble--dark shadow-glow shadow-primary/20"
            >
              Send feedback
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/blog"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-6 py-3 text-sm font-semibold text-primary hover:border-primary/40 transition"
            >
              Read community stories
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
