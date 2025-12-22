import React from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import Footer from "../components/Footer";
import HeroNavbar from "../components/HeroNavbar";

const sections = [
  {
    title: "What we collect",
    copy: "We use cookies to remember preferences, enable secure sessions, and understand how visitors explore the marketplace.",
  },
  {
    title: "How we use cookies",
    copy: "Cookies help power login flows, analytics, and product feedback. We do not sell personal data.",
  },
  {
    title: "Your controls",
    copy: "You can manage cookies in your browser. Essential cookies keep the site functional and aligned with our hero experience.",
  }
];

const tips = [
  "Analytics cookies measure performance without storing sensitive data.",
  "Security cookies protect logins and admin-only areas.",
  "Preference cookies remember your language, theme, and saved deals.",
];

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9ff] via-white to-[#eef2ff] text-slate-900">
      <HeroNavbar />
      <header className="relative overflow-hidden bg-gradient-hero pt-28 pb-16 text-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute right-6 top-4 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -left-12 bottom-0 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-6 space-y-8">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Cookie Policy" }]} />
          <div className="space-y-4">
            <p className="text-sm tracking-[0.35em] uppercase text-primary">Legal</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">Cookie Policy</h1>
            <p className="text-lg text-slate-600 max-w-3xl">
              Learn how we use cookies to deliver the same polished hero visuals, secure sessions, and tailored partner experiences across Connecttly.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/privacy-policy"
              className="btn-bubble btn-bubble--dark shadow-glow shadow-primary/20"
            >
              View privacy policy
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

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <section className="space-y-6">
          {sections.map((section) => (
            <article key={section.title} className="rounded-3xl border border-primary/10 bg-white/90 shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-slate-900">{section.title}</h2>
              <p className="text-slate-700 mt-2">{section.copy}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/5 via-white to-accent/10 p-8 shadow-lg">
          <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr] items-center">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Transparency</p>
              <h3 className="text-3xl font-bold text-slate-900">How we honor your choices</h3>
              <p className="text-slate-600">
                Manage cookies anytime. We respect opt-outs and keep the experience fast and reliable.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {tips.map((tip) => (
                <div key={tip} className="rounded-2xl border border-primary/10 bg-white/90 p-4 shadow-sm">
                  <p className="text-sm text-slate-700">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-md flex flex-col gap-4 text-center">
          <h3 className="text-2xl font-semibold text-slate-900">Questions about cookies?</h3>
          <p className="text-slate-600 max-w-3xl mx-auto">
            Reach out and we will share details on retention, vendors, and settings.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/contact"
              className="btn-bubble btn-bubble--dark shadow-glow shadow-primary/20"
            >
              Contact support
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/legal"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-6 py-3 text-sm font-semibold text-primary hover:border-primary/40 transition"
            >
              Visit legal center
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
