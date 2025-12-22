import React from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import Footer from "../components/Footer";
import HeroNavbar from "../components/HeroNavbar";

const documents = [
  {
    title: "Privacy Policy",
    summary: "How we collect, use, and protect data across the marketplace experience.",
    to: "/privacy-policy"
  },
  {
    title: "Terms of Service",
    summary: "Rules for using Connecttly, claiming perks, and interacting with partners.",
    to: "/terms"
  },
  {
    title: "Cookie Policy",
    summary: "Details about cookies, preferences, and your controls.",
    to: "/cookie-policy"
  },
  {
    title: "Security Center",
    summary: "Security practices, controls, and how to report vulnerabilities.",
    to: "/security"
  }
];

const commitments = [
  "Consistent hero styling across every legal and policy page for clarity.",
  "Plain-language summaries paired with deeper sections for legal teams.",
  "Fast responses to data requests, compliance reviews, and security reports.",
];

export default function Legal() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9ff] via-white to-[#eef2ff] text-slate-900">
      <HeroNavbar />
      <header className="relative overflow-hidden bg-gradient-hero pt-28 pb-16 text-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute -left-12 top-4 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-8 bottom-0 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-6 space-y-8">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Legal" }]} />
          <div className="space-y-4">
            <p className="text-sm tracking-[0.35em] uppercase text-primary">Legal</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">Legal center</h1>
            <p className="text-lg text-slate-600 max-w-3xl">
              Centralized legal resources inspired by the layout on connecttly.com/legal. The same hero gradient and friendly UI make policies easy to read.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/contact"
              className="btn-bubble btn-bubble--dark shadow-glow shadow-primary/20"
            >
              Talk to legal
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/security"
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/90 px-5 py-3 text-sm font-semibold text-primary hover:border-primary/40 transition shadow-sm"
            >
              Security overview
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <section className="grid gap-6 md:grid-cols-2">
          {documents.map((doc) => (
            <div key={doc.title} className="rounded-3xl border border-primary/10 bg-white/90 p-6 shadow-lg space-y-3">
              <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">{doc.title}</p>
              <p className="text-slate-700">{doc.summary}</p>
              <Link
                to={doc.to}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
              >
                View document
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/5 via-white to-accent/10 p-8 shadow-lg">
          <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr] items-center">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Our approach</p>
              <h3 className="text-3xl font-bold text-slate-900">Transparent by design</h3>
              <p className="text-slate-600">
                We align with industry standards, explain changes clearly, and keep the same design quality across every policy page.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {commitments.map((commitment) => (
                <div key={commitment} className="rounded-2xl border border-primary/10 bg-white/90 p-4 shadow-sm">
                  <p className="text-sm text-slate-700">{commitment}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-md flex flex-col gap-4 text-center">
          <h3 className="text-2xl font-semibold text-slate-900">Need a custom agreement?</h3>
          <p className="text-slate-600 max-w-3xl mx-auto">
            For enterprise procurements, DPAs, or security questionnaires, we will collaborate with your legal and security teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/contact"
              className="btn-bubble btn-bubble--dark shadow-glow shadow-primary/20"
            >
              Contact us
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/security"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-6 py-3 text-sm font-semibold text-primary hover:border-primary/40 transition"
            >
              Request documents
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
