import React from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import Footer from "../components/Footer";
import HeroNavbar from "../components/HeroNavbar";

const roles = [
  {
    title: "Product Designer",
    location: "Remote / US friendly",
    focus: "End-to-end flows for hero, marketplace, and legal experiences with consistent gradients.",
  },
  {
    title: "Senior Frontend Engineer",
    location: "Remote",
    focus: "Ship UI with React, Tailwind, and Vite while keeping performance and accessibility tight.",
  },
  {
    title: "Partner Success Lead",
    location: "Hybrid / EU",
    focus: "Work with 200+ partners to launch perks, verify eligibility, and delight customers.",
  }
];

const values = [
  "Design consistency—every page should feel like the hero.",
  "High-trust collaboration between product, partners, and customers.",
  "Actionable feedback loops and transparent communication.",
  "Bias for clarity, quality, and measurable customer outcomes.",
];

const benefits = [
  "Remote-first with coworking support",
  "Wellness, home office, and learning stipends",
  "Inclusive parental leave and flexible schedules",
  "Annual retreat focused on product vision and customer stories"
];

export default function Careers() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9ff] via-white to-[#eef2ff] text-slate-900">
      <HeroNavbar />
      <header className="relative overflow-hidden bg-gradient-hero pt-28 pb-16 text-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute -right-10 top-4 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute left-6 bottom-0 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-6 space-y-8">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Careers" }]} />
          <div className="space-y-4">
            <p className="text-sm tracking-[0.35em] uppercase text-primary">Join us</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">Careers at Connecttly</h1>
            <p className="text-lg text-slate-600 max-w-3xl">
              Help build the marketplace for startup perks. We keep a consistent color story, friendly hero sections, and a bias toward helpful experiences across every page you touch.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/about"
              className="btn-bubble btn-bubble--dark shadow-glow shadow-primary/20"
            >
              Learn about us
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/90 px-5 py-3 text-sm font-semibold text-primary hover:border-primary/40 transition shadow-sm"
            >
              Refer a teammate
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-primary/10 bg-white/90 shadow-lg p-6 space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Our values</p>
            <h2 className="text-3xl font-bold text-slate-900">How we work</h2>
            <p className="text-slate-700">
              We operate with empathy for founders and partners. The same polish you see in our hero experiences shows up in how we collaborate and ship.
            </p>
            <ul className="space-y-2">
              {values.map((value) => (
                <li key={value} className="flex items-start gap-3 text-slate-700">
                  <span className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-primary to-accent" />
                  <p>{value}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/5 via-white to-accent/10 p-6 shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Benefits</p>
            <h2 className="text-3xl font-bold text-slate-900">Feel supported</h2>
            <p className="text-slate-700">
              We invest in flexibility, focus time, and learning so you can do your best work.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="rounded-2xl border border-primary/10 bg-white/90 p-4 shadow-sm">
                  <p className="text-sm text-slate-700">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-md space-y-6">
          <div className="flex items-center justify-between flex-col sm:flex-row gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">Open roles</p>
              <h3 className="text-2xl font-bold text-slate-900">We are hiring builders</h3>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-95"
            >
              Share your profile
            </Link>
          </div>
          <div className="grid gap-4">
            {roles.map((role) => (
              <div key={role.title} className="rounded-2xl border border-border bg-white/90 p-5 shadow-sm flex flex-col gap-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">{role.location}</p>
                    <h4 className="text-xl font-semibold text-slate-900">{role.title}</h4>
                  </div>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
                  >
                    Apply now
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
                <p className="text-slate-700">{role.focus}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
