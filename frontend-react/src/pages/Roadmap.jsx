import React from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import Footer from "../components/Footer";
import HeroNavbar from "../components/HeroNavbar";

const roadmapColumns = [
  {
    title: "Now shipping",
    badge: "In progress",
    items: [
      "Expanded partner verification with SOC 2 and GDPR signals",
      "Usage-based savings estimator across hero and pricing",
      "Community-driven deal reviews with moderation controls"
    ]
  },
  {
    title: "Coming next",
    badge: "Planned",
    items: [
      "Multi-seat workflows for finance, procurement, and IT",
      "Localized experiences for EU and APAC founders",
      "Automated renewal reminders tied to payment status"
    ]
  },
  {
    title: "Exploring",
    badge: "Discovery",
    items: [
      "Deeper CRM syncing for partner-sourced opportunities",
      "AI playbooks for onboarding and compliance questionnaires",
      "Benchmarks to compare your stack to similar-stage teams"
    ]
  }
];

const milestones = [
  {
    label: "Q2 2025",
    title: "Security & trust",
    copy: "Cookie policy, security center, and legal hub roll out across the same gradient hero style for consistency.",
  },
  {
    label: "Q3 2025",
    title: "Collaboration",
    copy: "Shared workspaces for founders, finance, and GTM teams to co-manage perks and approvals.",
  },
  {
    label: "Q4 2025",
    title: "Intelligence",
    copy: "Predictive recommendations that connect partner offers with your active tooling and spend trends.",
  },
];

export default function Roadmap() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9ff] via-white to-[#eef2ff] text-slate-900">
      <HeroNavbar />
      <header className="relative overflow-hidden bg-gradient-hero pt-28 pb-16 text-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute left-10 bottom-0 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-6 space-y-8">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Roadmap" }]} />
          <div className="space-y-4">
            <p className="text-sm tracking-[0.35em] uppercase text-primary">Future plans</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">Product roadmap</h1>
            <p className="text-lg text-slate-600 max-w-3xl">
              A transparent look at what we are building next for the Connecttly marketplace. Each phase keeps the same UI color, gradient hero treatment, and crisp layout you see on the homepage.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/changelog"
              className="btn-bubble btn-bubble--dark shadow-glow shadow-primary/20"
            >
              View changelog
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/community"
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/90 px-5 py-3 text-sm font-semibold text-primary hover:border-primary/40 transition shadow-sm"
            >
              Join roadmap reviews
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <section className="grid gap-6 md:grid-cols-3">
          {roadmapColumns.map((column) => (
            <div key={column.title} className="rounded-3xl border border-primary/10 bg-white/90 p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">{column.title}</h2>
                <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">{column.badge}</span>
              </div>
              <ul className="space-y-2">
                {column.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-700">
                    <span className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-primary to-accent" />
                    <p>{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/5 via-white to-accent/10 p-8 shadow-lg">
          <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr] items-center">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Quarterly milestones</p>
              <h3 className="text-3xl font-bold text-slate-900">What to expect next</h3>
              <p className="text-slate-600">
                We plan around quality, not just speed. Each milestone keeps accessibility, trust, and a cohesive hero experience front and center.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {milestones.map((milestone) => (
                <div key={milestone.label} className="rounded-2xl border border-primary/10 bg-white/90 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">{milestone.label}</p>
                  <h4 className="mt-2 text-lg font-semibold text-slate-900">{milestone.title}</h4>
                  <p className="mt-2 text-sm text-slate-700">{milestone.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-md flex flex-col gap-4 text-center">
          <h3 className="text-2xl font-semibold text-slate-900">Want to influence the roadmap?</h3>
          <p className="text-slate-600 max-w-3xl mx-auto">
            Share the workflows, partners, and compliance requirements you need. We will respond with the status, timeline, and how it affects the current plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/contact"
              className="btn-bubble btn-bubble--dark shadow-glow shadow-primary/20"
            >
              Talk to product
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/community"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-6 py-3 text-sm font-semibold text-primary hover:border-primary/40 transition"
            >
              Share feedback
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
