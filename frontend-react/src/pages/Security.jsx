import React from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import Footer from "../components/Footer";
import HeroNavbar from "../components/HeroNavbar";

const pillars = [
  {
    title: "Data protection",
    detail: "Encryption in transit and at rest, strict access controls, and audit logging across admin actions.",
  },
  {
    title: "Compliance",
    detail: "SOC 2-inspired controls, GDPR alignment, and clear legal pages that mirror the hero experience.",
  },
  {
    title: "Availability",
    detail: "Redundant infrastructure and monitoring to keep the marketplace and hero sections fast.",
  }
];

const practices = [
  "Role-based access for admins, finance, and founders.",
  "Security reviews for every partner offer before listing.",
  "Regular backups, disaster recovery drills, and uptime targets.",
  "Vendor management and data processing agreements on request.",
];

export default function Security() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9ff] via-white to-[#eef2ff] text-slate-900">
      <HeroNavbar />
      <header className="relative overflow-hidden bg-gradient-hero pt-28 pb-16 text-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute left-6 top-4 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-8 bottom-0 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-6 space-y-8">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Security" }]} />
          <div className="space-y-4">
            <p className="text-sm tracking-[0.35em] uppercase text-primary">Trust</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">Security center</h1>
            <p className="text-lg text-slate-600 max-w-3xl">
              Security is built into every hero, footer, and admin experience. Here is how we protect customers, partners, and data.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/legal"
              className="btn-bubble btn-bubble--dark shadow-glow shadow-primary/20"
            >
              View legal docs
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/90 px-5 py-3 text-sm font-semibold text-primary hover:border-primary/40 transition shadow-sm"
            >
              Request a report
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        <section className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="rounded-3xl border border-primary/10 bg-white/90 p-6 shadow-lg space-y-3">
              <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">{pillar.title}</p>
              <p className="text-slate-700">{pillar.detail}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/5 via-white to-accent/10 p-8 shadow-lg">
          <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr] items-center">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Practices</p>
              <h3 className="text-3xl font-bold text-slate-900">How we operate</h3>
              <p className="text-slate-600">
                Clear documentation, consistent UI, and privacy-first defaults keep you confident while browsing the marketplace.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {practices.map((practice) => (
                <div key={practice} className="rounded-2xl border border-primary/10 bg-white/90 p-4 shadow-sm">
                  <p className="text-sm text-slate-700">{practice}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-md flex flex-col gap-4 text-center">
          <h3 className="text-2xl font-semibold text-slate-900">Need to report an issue?</h3>
          <p className="text-slate-600 max-w-3xl mx-auto">
            If you spot a vulnerability or have compliance questions, contact us. We will respond quickly with remediation details.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/contact"
              className="btn-bubble btn-bubble--dark shadow-glow shadow-primary/20"
            >
              Contact security
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/privacy-policy"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-6 py-3 text-sm font-semibold text-primary hover:border-primary/40 transition"
            >
              Review privacy policy
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
