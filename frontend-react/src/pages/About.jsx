import React from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import HeroNavbar from "../components/HeroNavbar";
import Breadcrumbs from "../components/Breadcrumbs";

const stats = [
  { label: "Partner network", value: "200+", detail: "curated SaaS & cloud providers" },
  { label: "Member savings", value: "$14M", detail: "negotiated perks redeemed to date" },
  { label: "Global reach", value: "32", detail: "countries with active partner teams" },
  { label: "Response speed", value: "<24h", detail: "average partner activation time" },
];

const pillars = [
  {
    title: "Partner-led growth OS",
    description: "A single, trusted place to activate discounts, credits, and lifecycle benefits for every team.",
  },
  {
    title: "Market-ready curation",
    description: "Offers vetted for today’s AI-native, security-first stacks so you adopt with confidence.",
  },
  {
    title: "Signals, not noise",
    description: "Personalized recommendations by stage, industry, and budget so you never overbuy tooling.",
  },
];

const evolution = [
  {
    title: "Launch faster",
    detail: "Instant eligibility checks and guided setup flows reduce time-to-value for every perk.",
  },
  {
    title: "Stay cost efficient",
    detail: "Dynamic tiers and transparent savings projections help finance teams plan with clarity.",
  },
  {
    title: "Scale with confidence",
    detail: "Compliance-ready partners and verified credits keep infra, data, and GTM teams aligned.",
  },
];

const steps = [
  {
    label: "01",
    title: "Discover",
    copy: "Curated, trend-aligned partner inventory that reflects what high-performing teams use right now.",
  },
  {
    label: "02",
    title: "Activate",
    copy: "Secure redemption, concierge guidance, and milestone-based perks that grow with your company.",
  },
  {
    label: "03",
    title: "Evolve",
    copy: "Performance insights and partner refreshes so your stack remains modern without the research tax.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9ff] via-white to-[#eef2ff] text-slate-900">
      <HeroNavbar />
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-white to-primary/5" />
        <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-20 lg:pb-24">
          <div className="flex items-center justify-start">
            <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "About" }]} />
          </div>

          <div className="mt-6 lg:mt-10 grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                About Connecttly
              </span>
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Building the marketplace for partner-led, efficient growth.
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl">
                  We connect modern teams to curated partner perks, AI-ready stacks, and activation support so you can scale confidently without losing speed or budget discipline.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/"
                  className="btn-bubble btn-bubble--dark shadow-glow shadow-primary/20"
                >
                  Explore marketplace
                  <span aria-hidden="true">→</span>
                </Link>
                <a
                  href="#vision"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/20 bg-white/80 text-primary font-semibold hover:border-primary/40 transition"
                >
                  View our vision
                  <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M13 5l7 7-7 7M5 5h8" />
                  </svg>
                </a>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-primary/10 bg-white/70 px-4 py-5 shadow-sm backdrop-blur"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">{stat.label}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-sm text-slate-500">{stat.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-8 rounded-3xl bg-gradient-to-br from-primary/15 via-white to-primary/10 blur-2xl" />
              <div className="relative rounded-3xl border border-primary/10 bg-white/80 p-6 shadow-lg backdrop-blur">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-primary font-semibold uppercase tracking-[0.2em]">New market wave</p>
                    <h2 className="mt-2 text-2xl font-semibold leading-tight text-slate-900">Partner ecosystem built for AI-era teams</h2>
                  </div>
                  <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">2025</span>
                </div>
                <p className="mt-4 text-slate-600">
                  The next decade belongs to teams who adopt smarter, safer stacks. Connecttly curates the best partner benefits, from cloud credits to GTM accelerators, so you capture upside without the heavy lift.
                </p>
                <div className="mt-6 grid sm:grid-cols-2 gap-3">
                  {pillars.map((pillar) => (
                    <div key={pillar.title} className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                      <h3 className="text-base font-semibold text-slate-900">{pillar.title}</h3>
                      <p className="mt-2 text-sm text-slate-600">{pillar.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pb-20 space-y-16">
        <section id="vision" className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">Our mission</p>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">Equip every startup with enterprise-grade partner advantages.</h2>
            <p className="text-lg text-slate-600">
              We believe access should be equitable. Connecttly modernizes how founders, operators, and finance teams discover, activate, and manage partner perks so you grow with clarity—not guesswork.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {evolution.map((item) => (
                <div key={item.title} className="rounded-2xl border border-primary/10 bg-white/80 p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/5 via-white to-primary/10 p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">CX</div>
              <div>
                <p className="text-sm text-primary font-semibold">Customer-first, always</p>
                <p className="text-sm text-slate-600">Guided support and tailored activations</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {["Personalized onboarding for every perk", "Live partner success coverage in <24 hours", "Security and compliance alignment baked in"].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                  <p className="text-slate-700">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-white/80 border border-primary/10 p-4">
              <p className="text-sm text-slate-500">“Connecttly made our partner stack simple. We activated credits, tools, and GTM perks without the usual back-and-forth.”</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Operations Lead, Series A Fintech</p>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-2xl border border-primary/10 bg-white/80 p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                <span aria-hidden="true">★</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-900">{pillar.title}</h3>
              <p className="mt-2 text-slate-600">{pillar.description}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/5 via-white to-primary/5 p-8 shadow-md">
          <div className="grid lg:grid-cols-[0.6fr_1fr] gap-8">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">How it works</p>
              <h2 className="text-3xl font-bold leading-tight">Partner-first operating system</h2>
              <p className="text-slate-600">
                Modern perks, clear eligibility, and guided activations—so you get to value in days, not weeks. Every interaction keeps your primary colorway and brand tone consistent.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {steps.map((step) => (
                <div key={step.label} className="rounded-2xl border border-primary/10 bg-white/80 p-5 shadow-sm">
                  <p className="text-xs font-semibold text-primary uppercase tracking-[0.2em]">{step.label}</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{step.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-[1fr_1.05fr] gap-10">
          <div className="rounded-3xl border border-primary/10 bg-white/80 p-7 shadow-md">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold">∞</div>
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">Why now</p>
                <h3 className="text-xl font-semibold text-slate-900">A marketplace tuned to modern market trends</h3>
              </div>
            </div>
            <p className="mt-4 text-slate-600">
              AI-driven productivity, efficient spend, and security are the new baseline. Connecttly’s partner roster evolves with these shifts—ensuring your stack is relevant, composable, and responsibly priced.
            </p>
            <div className="mt-6 space-y-3">
              {[
                "AI-ready offers across data, GTM, and automation partners.",
                "Compliance-forward perks that satisfy enterprise procurement.",
                "Benchmarking signals so you know what top performers adopt next.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-primary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-primary/10 bg-primary/5 p-7 shadow-inner">
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-primary border border-primary/10">Startups</span>
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-primary border border-primary/10">Scaleups</span>
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-primary border border-primary/10">Enterprises</span>
            </div>
            <h3 className="mt-4 text-2xl font-bold text-slate-900">Curated value for every stage</h3>
            <p className="mt-2 text-slate-700">
              From first credit to global rollout, Connecttly aligns perks to your growth curve while keeping the experience consistent with our primary colorway and brand tone.
            </p>
            <div className="mt-6 grid sm:grid-cols-3 gap-4">
              {["Go-to-market accelerators", "Product & data tooling", "Infrastructure & security"].map((item) => (
                <div key={item} className="rounded-2xl bg-white/80 border border-primary/10 p-4 text-slate-800 shadow-sm">
                  <p className="font-semibold">{item}</p>
                  <p className="mt-2 text-sm text-slate-600">Exclusive perks and credits aligned to each motion.</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-white p-8 shadow-lg">
          <div className="grid md:grid-cols-[1fr_0.9fr] gap-6 md:gap-10 items-center">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">Leadership note</p>
              <h2 className="text-3xl font-bold text-slate-900">We built Connecttly to unlock momentum for every builder.</h2>
              <p className="text-slate-600">
                “Partner ecosystems shouldn’t be confusing or reserved for large enterprises. We’re here to make them transparent, accessible, and tuned to what modern teams need to win.”
              </p>
              <p className="text-sm font-semibold text-slate-900">Founding Team, Connecttly</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-white to-primary/5 border border-primary/10 p-6">
              <h3 className="text-lg font-semibold text-slate-900">Our commitment</h3>
              <div className="mt-4 space-y-3">
                {[
                  "Continuous partner refreshes that mirror market trends.",
                  "Transparent savings insights for finance and ops teams.",
                  "Hands-on activation support with measurable outcomes.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                    <p className="text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="text-center space-y-4">
          <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">Ready to explore</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">See how Connecttly can extend your runway</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Activate the perks, credits, and partner services used by the most efficient teams in the market today.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/"
              className="btn-bubble btn-bubble--dark shadow-glow shadow-primary/30"
            >
              Explore marketplace
              <span aria-hidden="true">→</span>
            </Link>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/20 bg-white text-primary font-semibold hover:border-primary/40 transition"
            >
              Talk to our team
              <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M13 5l7 7-7 7M5 5h8" />
              </svg>
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
