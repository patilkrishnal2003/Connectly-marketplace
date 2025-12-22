import React from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import BackToHomeButton from "../components/BackToHomeButton";
import HeroNavbar from "../components/HeroNavbar";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9ff] via-white to-[#f2f6ff]">
      {/* Header */}
      <HeroNavbar />
      <header className="relative overflow-hidden bg-gradient-hero text-slate-900 pt-28 pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute -top-10 right-6 h-60 w-60 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-6 z-10">
          <div className="absolute top-6 right-6">
            <BackToHomeButton />
          </div>
          <div className="text-center space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Legal</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">Privacy Policy</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Your privacy is important to us. Learn how we collect, use, and protect your personal information.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white border border-slate-200 shadow-lg rounded-3xl p-8 md:p-12">
          <div className="prose prose-slate max-w-none">
            <p className="text-sm text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

            <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Information We Collect</h2>
            <p className="text-slate-600 mb-6">
              We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This may include your name, email address, payment information, and any other information you choose to provide.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-slate-600 mb-6">
              We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and communicate with you about products, services, and promotional offers.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. Information Sharing</h2>
            <p className="text-slate-600 mb-6">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information with trusted third-party service providers who assist us in operating our website and conducting our business.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Data Security</h2>
            <p className="text-slate-600 mb-6">
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Cookies and Tracking</h2>
            <p className="text-slate-600 mb-6">
              We use cookies and similar technologies to enhance your experience on our website, analyze usage patterns, and provide personalized content. You can control cookie settings through your browser preferences.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Your Rights</h2>
            <p className="text-slate-600 mb-6">
              You have the right to access, update, or delete your personal information. You may also opt out of receiving promotional communications from us at any time.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Changes to This Policy</h2>
            <p className="text-slate-600 mb-6">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "last updated" date.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Contact Us</h2>
            <p className="text-slate-600 mb-6">
              If you have any questions about this privacy policy, please contact us through our contact page or email us directly.
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-12 pt-8 border-t border-slate-200">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Marketplace
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
