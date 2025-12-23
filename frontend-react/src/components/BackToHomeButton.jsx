import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BackToHomeButton({ className = "" }) {
  const { pathname } = useLocation();

  if (pathname === "/about") return null;

  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-white ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      Back to home
    </Link>
  );
}
