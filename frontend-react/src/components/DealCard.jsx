import React, { useState } from "react";

const CARD_GRADIENT = "from-white via-slate-50 to-white/80";

export default function DealCard({ deal, onViewDetails, isSelected }) {
  const { title, partner, isUnlocked, featured, subtitle, discount, description, logo, category } = deal;
  const statusStyles = isUnlocked
    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
    : "bg-slate-100 text-slate-600 border border-slate-200";
  const [showLogo, setShowLogo] = useState(true);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border ${
        isSelected
          ? "border-indigo-500 bg-white shadow-[0_25px_70px_rgba(79,70,229,0.25)] ring-2 ring-indigo-200/60"
          : "border-slate-200 bg-white/90"
      } shadow-sm transition duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.18)]`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${CARD_GRADIENT} opacity-80`} aria-hidden="true" />
      <div className="relative p-5 bg-white/90">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {logo && showLogo ? (
              <img
                src={logo}
                alt={`${partner || title} logo`}
                className="h-12 w-12 rounded-lg object-contain bg-slate-50 border border-slate-200 p-2"
                onError={() => setShowLogo(false)}
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-indigo-50 border border-slate-200 flex items-center justify-center text-indigo-700 font-semibold">
                {(partner || title || "?").charAt(0)}
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">{category || "Partner deal"}</p>
              <h2 className="text-lg font-semibold text-slate-900 mt-1 leading-tight">{title}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{subtitle || `by ${partner}`}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {featured && <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-800">Featured</span>}
            {discount && <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">{discount}</span>}
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles}`}>
              {isUnlocked ? "Available" : "Restricted"}
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-600 mt-3 line-clamp-3">{description || "Click to view more details."}</p>

        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => onViewDetails?.(deal)}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            View details
          </button>
        </div>
      </div>
    </div>
  );
}
