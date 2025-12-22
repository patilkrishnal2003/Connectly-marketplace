import React from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import BackToHomeButton from "../components/BackToHomeButton";
import HeroNavbar from "../components/HeroNavbar";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9ff] via-white to-[#f2f6ff]">
      <HeroNavbar />
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-hero text-slate-900 pt-28 pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute -top-10 -right-10 h-60 w-60 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-6 left-6 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-6 z-10">
          <div className="absolute top-6 right-6">
            <BackToHomeButton />
          </div>
          <div className="text-center space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">About Us</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-slate-900">
              Empowering Startups with Partner Perks
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Connecttly is the premier marketplace for curated partner deals, designed to accelerate startup growth through exclusive perks and resources.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Mission Section */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">Our Mission</h2>
              <p className="text-slate-600 mb-4">
                At Connecttly, we believe every startup deserves access to world-class tools and services at startup-friendly prices. Our marketplace connects innovative companies with curated partner offers, unlocking value that drives growth and success.
              </p>
              <p className="text-slate-600">
                Through our new market strategy, we're expanding our ecosystem to include more diverse partners, enhanced tiered access, and personalized recommendations that match your startup's unique needs.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">How It Works</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-600 font-bold text-lg">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Browse Curated Deals</h3>
                    <p className="text-slate-600">Explore our marketplace of partner offers, from productivity tools to marketing platforms.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-600 font-bold text-lg">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Choose Your Plan</h3>
                    <p className="text-slate-600">Select Standard or Professional access to unlock deals tailored to your growth stage.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-600 font-bold text-lg">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Access Exclusive Perks</h3>
                    <p className="text-slate-600">Redeem credits, get discounts, and leverage partner resources to accelerate your startup.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">Our Values</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Innovation First</h3>
                    <p className="text-slate-600">We partner with cutting-edge companies to bring you the latest tools and technologies.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Community Focused</h3>
                    <p className="text-slate-600">Building connections between startups and partners to foster growth and collaboration.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Quality Assured</h3>
                    <p className="text-slate-600">Every partner deal is vetted and curated to ensure maximum value for your startup.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Ready to Get Started?</h3>
              <p className="text-slate-600 mb-4">Join thousands of startups already benefiting from our partner ecosystem.</p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
              >
                Explore Marketplace →
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
