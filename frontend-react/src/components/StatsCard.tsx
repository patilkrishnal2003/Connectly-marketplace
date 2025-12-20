import type { ReactNode } from "react";

interface StatsCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}

export default function StatsCard({ icon, title, value, subtitle, className = "" }: StatsCardProps) {
  return (
    <article
      className={`flex items-center gap-4 rounded-3xl border border-slate-200 bg-white/90 px-6 py-5 shadow-[0_25px_45px_rgba(15,23,42,0.08)] ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-600">
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{title}</p>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
    </article>
  );
}
