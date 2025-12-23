import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MessageCircle, Phone, ShieldCheck, Clock, MapPin, ArrowUpRight } from "lucide-react";
import Footer from "../components/Footer";
import Breadcrumbs from "../components/Breadcrumbs";
import HeroNavbar from "../components/HeroNavbar";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const supportChannels = [
    {
      title: "Email support",
      description: "Reach our support specialists for anything related to your account or claims.",
      action: "support@connecttly.com",
      href: "mailto:support@connecttly.com",
      icon: Mail,
    },
    {
      title: "Partner with us",
      description: "Share your program and we'll help you launch perks for founders in days.",
      action: "partners@connecttly.com",
      href: "mailto:partners@connecttly.com",
      icon: ShieldCheck,
    },
    {
      title: "Talk to sales",
      description: "Get a walkthrough of Professional and Enterprise perks tailored to your team.",
      action: "sales@connecttly.com",
      href: "mailto:sales@connecttly.com",
      icon: Phone,
    },
    {
      title: "Help Center",
      description: "Browse answers, guides, and tips to activate perks faster.",
      action: "Visit FAQ",
      to: "/faq",
      icon: MessageCircle,
    },
  ];

  const quickLinks = [
    {
      title: "Explore the FAQ",
      description: "Find answers instantly for billing, security, or getting started.",
      to: "/faq",
      icon: MessageCircle,
    },
    {
      title: "Manage subscription",
      description: "Update your plan or invoices in a couple of clicks.",
      to: "/subscription-plans",
      icon: ShieldCheck,
    },
    {
      title: "View claimed deals",
      description: "Review the perks you've unlocked and their redemption steps.",
      to: "/my-deals",
      icon: ArrowUpRight,
    },
  ];

  const contactDetails = [
    {
      title: "Email",
      detail: "info@connecttly.com",
      href: "mailto:info@connecttly.com",
      icon: Mail,
    },
    {
      title: "Phone / WhatsApp",
      detail: "+91 7905212348",
      href: "tel:+917905212348",
      icon: Phone,
    },
    {
      title: "Hours",
      detail: "Mon–Fri, 10:00–18:00 IST",
      icon: Clock,
    },
    {
      title: "Address (INDIA)",
      detail: "Blr10-Vaishnavi, Signature No. 78/9, Bellandur, Bangalore, Bangalore South",
      icon: MapPin,
    },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.message) {
      setError("Please fill in all fields");
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("Contact form submission error:", err);
      setError("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col overflow-x-hidden overflow-y-auto">
      <HeroNavbar />
      <header className="relative overflow-hidden bg-gradient-hero flex-shrink-0 pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-start mb-6">
            <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Contact" }]} />
          </div>
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Support</p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-slate-900">
              Contact Connecttly
            </h1>
            <p className="text-lg text-muted-foreground">
              We're here to help with marketplace access, billing questions, and partnership requests. Reach our team any time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href="https://connecttly.com/demo"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground px-6 py-3 text-sm font-semibold shadow-soft hover:shadow-lg transition"
              >
                Book a call
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <a
                href="#contact-form"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-white/90 px-6 py-3 text-sm font-semibold text-foreground shadow-sm hover:border-primary hover:text-primary transition"
              >
                Send a message
              </a>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-white/80 px-4 py-3 shadow-sm text-left flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Response time</p>
                <p className="text-sm font-semibold text-foreground">Under 1 business day</p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-white/80 px-4 py-3 shadow-sm text-left flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Availability</p>
                <p className="text-sm font-semibold text-foreground">Global, remote-first</p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-white/80 px-4 py-3 shadow-sm text-left flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Priority</p>
                <p className="text-sm font-semibold text-foreground">Pro members first</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 pb-16 -mt-10 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div
            id="contact-form"
            className="order-1 bg-white border border-border shadow-lg rounded-3xl p-8 scroll-mt-24 lg:order-none"
          >
            <div className="flex items-start justify-between gap-3 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Contact form</p>
                <h2 className="text-2xl font-semibold text-foreground">Send a message</h2>
                <p className="text-sm text-muted-foreground">We reply to every request with a real human—no bots.</p>
              </div>
              <div className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">On duty</div>
            </div>

            {submitted && (
              <div className="mb-6 text-emerald-700 text-sm rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3">
                Thanks for reaching out. A team member will respond shortly.
              </div>
            )}

            {error && (
              <div className="mb-6 text-red-600 text-sm rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Full name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition"
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Work email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">How can we help?</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition resize-none"
                  placeholder="Share details about your request, the deal you're trying to claim, or the page where you need help."
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary text-primary-foreground font-semibold py-3 shadow-soft hover:shadow-lg transition"
              >
                Send message
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </form>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-border bg-[#f6f1e5] p-8 shadow-md lg:sticky lg:top-28">
            <div className="absolute -left-10 top-0 h-full w-12 bg-gradient-to-r from-[#ece4d2] to-transparent" aria-hidden />
            <div className="absolute -right-10 top-0 h-full w-12 bg-gradient-to-l from-[#ece4d2] to-transparent" aria-hidden />
            <div className="space-y-4 relative">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Contact details</p>
                <h2 className="text-3xl font-bold text-slate-900">Prefer a direct line? We've got you covered.</h2>
              </div>

              <div className="space-y-4">
                {contactDetails.map((detail, index) => {
                  const Icon = detail.icon;
                  return (
                    <div
                      key={detail.title}
                      className="rounded-2xl bg-white border border-border/60 p-5 shadow-sm flex flex-col gap-4"
                    >
                      <div className="flex gap-4 items-start">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold text-foreground">{detail.title}</h3>
                          {detail.href ? (
                            <a
                              href={detail.href}
                              className="text-base text-muted-foreground hover:text-primary transition-colors font-medium"
                            >
                              {detail.detail}
                            </a>
                          ) : (
                            <p className="text-base text-muted-foreground font-medium">{detail.detail}</p>
                          )}
                        </div>
                      </div>
                      {index < contactDetails.length - 1 && (
                        <div className="h-px w-full bg-border/60" aria-hidden />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                <Mail className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Start with email</p>
                <h2 className="text-2xl font-semibold text-foreground">Tell us how we can help</h2>
                <p className="text-sm text-muted-foreground">
                  Share as much detail as possible so we can route you to the right teammate and respond quickly.
                </p>
                <a
                  href="mailto:support@connecttly.com"
                  className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary/80 transition-colors"
                >
                  support@connecttly.com
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {supportChannels.map((channel) => {
              const Icon = channel.icon;
              const Wrapper = channel.to ? Link : "a";
              const wrapperProps = channel.to
                ? { to: channel.to }
                : {
                    href: channel.href,
                    target: channel.href?.startsWith("http") ? "_blank" : undefined,
                    rel: channel.href?.startsWith("http") ? "noreferrer" : undefined,
                  };

              return (
                <Wrapper
                  key={channel.title}
                  {...wrapperProps}
                  className="group rounded-2xl border border-border bg-white p-5 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-200 flex flex-col gap-3"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground">{channel.title}</h3>
                      <ArrowUpRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm text-muted-foreground">{channel.description}</p>
                    <p className="text-sm font-semibold text-primary">{channel.action}</p>
                  </div>
                </Wrapper>
              );
            })}
          </div>
        </div>

        <section className="rounded-3xl border border-border bg-gradient-to-r from-primary/5 via-white to-accent/5 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Need something fast?</p>
              <h3 className="text-xl font-semibold text-foreground">Use a quick link to get answers</h3>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary border border-border shadow-sm hover:border-primary"
            >
              Back to marketplace
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  to={item.to}
                  className="group rounded-2xl border border-border bg-white/80 px-5 py-4 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="text-base font-semibold text-foreground mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
