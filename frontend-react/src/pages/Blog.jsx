import React from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import Footer from "../components/Footer";
import HeroNavbar from "../components/HeroNavbar";

const posts = [
  {
    title: "How to evaluate partner perks in 2025",
    tag: "Guides",
    summary: "A concise checklist for founders and finance teams to compare offers without losing speed.",
    link: "/documentation"
  },
  {
    title: "Security-first stacks for AI-native teams",
    tag: "Security",
    summary: "Designing your marketplace workflow around encryption, auditability, and data residency.",
    link: "/security"
  },
  {
    title: "Lessons from 200+ partner activations",
    tag: "Product",
    summary: "Patterns we see when customers redeem perks, plus what we are building next on the roadmap.",
    link: "/roadmap"
  },
  {
    title: "Meet the Connecttly community",
    tag: "Community",
    summary: "Why operators across roles join our monthly sessions and how to get involved.",
    link: "/community"
  }
];

const highlights = [
  "Same gradient hero styling as the homepage for a cohesive reading experience.",
  "Actionable templates for deal reviews, budgets, and onboarding checklists.",
  "Spotlights on partners, customer stories, and platform updates in one place.",
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9ff] via-white to-[#eef2ff] text-slate-900">
      <HeroNavbar />
      <header className="relative overflow-hidden bg-gradient-hero pt-28 pb-16 text-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute -left-14 top-6 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-8 bottom-0 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-6 space-y-8">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Blog" }]} />
          <div className="space-y-4">
            <p className="text-sm tracking-[0.35em] uppercase text-primary">Insights</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">Connecttly blog</h1>
            <p className="text-lg text-slate-600 max-w-3xl">
              Product updates, partner spotlights, and operator-friendly guides with the same clean palette and hero layout you see elsewhere on the site.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/changelog"
              className="btn-bubble btn-bubble--dark shadow-glow shadow-primary/20"
            >
              Latest release
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/community"
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/90 px-5 py-3 text-sm font-semibold text-primary hover:border-primary/40 transition shadow-sm"
            >
              Submit a story
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <section className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <article
              key={post.title}
              className="rounded-3xl border border-primary/10 bg-white/90 shadow-lg p-6 space-y-3"
            >
              <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em]">{post.tag}</span>
              <h2 className="text-2xl font-bold text-slate-900">{post.title}</h2>
              <p className="text-slate-700">{post.summary}</p>
              <Link
                to={post.link}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
              >
                Continue reading
                <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/5 via-white to-accent/10 p-8 shadow-lg">
          <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr] items-center">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Why operators read</p>
              <h3 className="text-3xl font-bold text-slate-900">Clarity, speed, and design consistency</h3>
              <p className="text-slate-600">
                Each article inherits the same hero-driven color system so the blog feels like an extension of the marketplace experience.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {highlights.map((item) => (
                <div key={item} className="rounded-2xl border border-primary/10 bg-white/90 p-4 shadow-sm">
                  <p className="text-sm text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-md flex flex-col gap-4 text-center">
          <h3 className="text-2xl font-semibold text-slate-900">Want to feature a partner or customer story?</h3>
          <p className="text-slate-600 max-w-3xl mx-auto">
            Tell us what you would like to see covered and we will coordinate visuals, quotes, and review cycles.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/press"
              className="btn-bubble btn-bubble--dark shadow-glow shadow-primary/20"
            >
              View press kit
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-6 py-3 text-sm font-semibold text-primary hover:border-primary/40 transition"
            >
              Pitch a topic
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
