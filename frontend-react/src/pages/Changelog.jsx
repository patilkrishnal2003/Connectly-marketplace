import React from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import Footer from "../components/Footer";
import HeroNavbar from "../components/HeroNavbar";

const releases = [
  {
    version: "2025.03",
    date: "Mar 2025",
    title: "Partner intelligence refresh",
    highlights: [
      "Added partner readiness badges and eligibility notes inline",
      "Deal detail pages now surface savings projections for each tier",
      "My Deals supports reminders for expiring credits"
    ]
  },
  {
    version: "2025.02",
    date: "Feb 2025",
    title: "Workflow polish",
    highlights: [
      "New guided onboarding for founders, finance, and GTM roles",
      "Checkout and payments aligned to the latest subscription plans",
      "Improved accessibility for keyboard navigation and contrast"
    ]
  },
  {
    version: "2025.01",
    date: "Jan 2025",
    title: "Insights launch",
    highlights: [
      "Savings tracker cards in the hero now mirror activated perks",
      "Admin view gains exportable reports for partner redemptions",
      "Faster search relevance for AI, security, and cloud categories"
    ]
  }
];

const improvements = [
  "Performance tuning across deal grids and filters",
  "Refined gradients and hero visuals for consistent color across pages",
  "Clearer copy for compliance, billing, and partner activation steps",
  "Stronger empty states that guide first-time marketplace visitors"
];

const delivery = [
  {
    label: "Release notes",
    description: "Summaries for every milestone with supporting screenshots and links.",
    action: { label: "View blog", to: "/blog" }
  },
  {
    label: "Roadmap calls",
    description: "Monthly sessions with founders, ops, and product to review in-flight work.",
    action: { label: "See roadmap", to: "/roadmap" }
  },
  {
    label: "Feedback loop",
    description: "Submit requests and see when they enter discovery, build, or beta.",
    action: { label: "Join community", to: "/community" }
  }
];

export default function Changelog() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9ff] via-white to-[#eef2ff] text-slate-900">
      <HeroNavbar />
      <header className="relative overflow-hidden bg-gradient-hero pt-28 pb-16 text-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute -left-16 top-8 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-10 bottom-0 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-6 space-y-8">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Changelog" }]} />
          <div className="space-y-4">
            <p className="text-sm tracking-[0.35em] uppercase text-primary">Product updates</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">Changelog</h1>
            <p className="text-lg text-slate-600 max-w-3xl">
              Every release keeps the same gradient-forward, hero-first experience you see on the homepage. Follow along to see what shipped and what is coming next.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/roadmap"
              className="btn-bubble btn-bubble--dark shadow-glow shadow-primary/20"
            >
              View roadmap
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/community"
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/90 px-5 py-3 text-sm font-semibold text-primary hover:border-primary/40 transition shadow-sm"
            >
              Request a feature
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        <section className="grid gap-6 md:grid-cols-2">
          {releases.map((release) => (
            <article
              key={release.version}
              className="rounded-3xl border border-primary/10 bg-white/90 shadow-lg p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">{release.date}</p>
                  <h2 className="text-2xl font-bold text-slate-900">{release.title}</h2>
                </div>
                <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">{release.version}</span>
              </div>
              <ul className="space-y-2">
                {release.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-700">
                    <span className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-primary to-accent" />
                    <p>{item}</p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/5 via-white to-accent/10 p-8 shadow-lg">
          <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr] items-center">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Quality of life</p>
              <h3 className="text-3xl font-bold text-slate-900">Design and experience improvements</h3>
              <p className="text-slate-600">
                Visual polish, accessibility, and performance updates that match the hero aesthetic across every new page you explore.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {improvements.map((item) => (
                <div key={item} className="rounded-2xl border border-primary/10 bg-white/90 p-4 shadow-sm">
                  <p className="text-sm text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {delivery.map((item) => (
            <div key={item.label} className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-md flex flex-col gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">{item.label}</p>
                <p className="mt-2 text-slate-700">{item.description}</p>
              </div>
              <Link
                to={item.action.to}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
              >
                {item.action.label}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
