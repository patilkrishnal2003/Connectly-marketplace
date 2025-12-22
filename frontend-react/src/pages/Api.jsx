import React from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import Footer from "../components/Footer";
import HeroNavbar from "../components/HeroNavbar";

const endpoints = [
  {
    name: "List deals",
    path: "GET /v1/deals",
    description: "Retrieve curated perks with filters for category, partner, and eligibility tags.",
  },
  {
    name: "Claim perk",
    path: "POST /v1/deals/{id}/claim",
    description: "Start a redemption workflow and notify partner success teams securely.",
  },
  {
    name: "Webhook events",
    path: "POST /v1/webhooks",
    description: "Receive lifecycle events for claims, renewals, and approvals.",
  },
];

const steps = [
  "Generate an API key from your account settings (coming soon).",
  "Authenticate with a bearer token on every request.",
  "Use sandbox mode to test partner flows without triggering live activations.",
  "Mirror our hero styling in embedded surfaces with the provided component tokens.",
];

export default function Api() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9ff] via-white to-[#eef2ff] text-slate-900">
      <HeroNavbar />
      <header className="relative overflow-hidden bg-gradient-hero pt-28 pb-16 text-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute right-6 top-4 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -left-12 bottom-0 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-6 space-y-8">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "API" }]} />
          <div className="space-y-4">
            <p className="text-sm tracking-[0.35em] uppercase text-primary">Developers</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">Connecttly API</h1>
            <p className="text-lg text-slate-600 max-w-3xl">
              Build on top of Connecttly. The API mirrors our hero-inspired color palette and provides secure, well-documented endpoints for partner workflows.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/documentation"
              className="btn-bubble btn-bubble--dark shadow-glow shadow-primary/20"
            >
              Read docs
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/security"
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/90 px-5 py-3 text-sm font-semibold text-primary hover:border-primary/40 transition shadow-sm"
            >
              View security
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <section className="grid gap-6 md:grid-cols-3">
          {endpoints.map((endpoint) => (
            <div key={endpoint.name} className="rounded-3xl border border-primary/10 bg-white/90 p-6 shadow-lg space-y-3">
              <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">{endpoint.name}</p>
              <p className="text-xs font-semibold text-slate-500">{endpoint.path}</p>
              <p className="text-slate-700">{endpoint.description}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/5 via-white to-accent/10 p-8 shadow-lg">
          <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr] items-center">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Getting started</p>
              <h3 className="text-3xl font-bold text-slate-900">Simple, secure integration</h3>
              <p className="text-slate-600">
                Authentication, throttling, and logging follow modern standards so you can experiment quickly.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {steps.map((step) => (
                <div key={step} className="rounded-2xl border border-primary/10 bg-white/90 p-4 shadow-sm">
                  <p className="text-sm text-slate-700">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-md flex flex-col gap-4 text-center">
          <h3 className="text-2xl font-semibold text-slate-900">Need early access?</h3>
          <p className="text-slate-600 max-w-3xl mx-auto">
            Tell us about your integration goals and we will share sandbox credentials, sample payloads, and design tokens.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/contact"
              className="btn-bubble btn-bubble--dark shadow-glow shadow-primary/20"
            >
              Contact the team
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/community"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-6 py-3 text-sm font-semibold text-primary hover:border-primary/40 transition"
            >
              Join developer group
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
