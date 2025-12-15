import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-800 text-white mt-16 transition-colors">
      <div className="max-w-6xl mx-auto px-6 py-14 space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <p className="text-3xl md:text-4xl font-semibold leading-snug">Experience Connecttly for your use case</p>
            <p className="text-white/70 text-sm md:text-base max-w-xl">
              Explore partner perks, or talk to us about curating a marketplace for your community.
            </p>
          </div>
          <a
            href="https://connecttly.com/"
            target="_blank"
            rel="noreferrer"
            className="btn-bubble btn-bubble--white text-black px-6"
          >
            Book a demo
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-white/10 pt-6">
          <div className="space-y-3">
            <h4 className="text-sm uppercase tracking-wide text-white/60">Explore</h4>
            <div className="flex flex-col gap-2 text-white/80 text-sm">
              <Link to="/" className="hover:text-white">Home</Link>
              <Link to="/" className="hover:text-white">Marketplace</Link>
              <Link to="/" className="hover:text-white">Search deals</Link>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm uppercase tracking-wide text-white/60">Account</h4>
            <div className="flex flex-col gap-2 text-white/80 text-sm">
              <Link to="/login" className="hover:text-white">Log in</Link>
              <Link to="/register" className="hover:text-white">Register</Link>
              <Link to="/my-deals" className="hover:text-white">My deals</Link>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm uppercase tracking-wide text-white/60">Company</h4>
            <div className="flex flex-col gap-2 text-white/80 text-sm">
              <Link to="/about" className="hover:text-white">About</Link>
              <Link to="/contact" className="hover:text-white">Contact</Link>
              <Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
              <a href="https://connecttly.com/terms" target="_blank" rel="noreferrer" className="hover:text-white">
                Terms &amp; Conditions
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-white/60 text-sm border-t border-white/10 pt-6">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold">C</span>
            <span>Connecttly Marketplace</span>
          </div>
          <span className="text-white/50">Built for startup perks and partner offers</span>
        </div>
      </div>
    </footer>
  );
}
