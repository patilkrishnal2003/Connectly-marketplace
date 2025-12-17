import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import BackToHomeButton from "../components/BackToHomeButton";

const planMeta = {
  standard: { name: "Starter", price: "$99/mo", perks: ["Starter-tier deals", "Up to $5k value", "Email support"] },
  starter: { name: "Starter", price: "$99/mo", perks: ["Starter-tier deals", "Up to $5k value", "Email support"] },
  professional: {
    name: "Professional",
    price: "$199/mo",
    perks: ["Everything in Starter", "Pro-only deals", "Priority support", "Early access"]
  }
};

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [loadingPay, setLoadingPay] = useState(false);
  const fallbackTestKey = "rzp_test_RrBetjhV0NXkMM";
  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY || fallbackTestKey;
  const usingFallbackKey = !import.meta.env.VITE_RAZORPAY_KEY;
  const params = new URLSearchParams(location.search);
  const planId = (params.get("planId") || "").toLowerCase();
  const plan = planMeta[planId] || { name: planId || "Selected plan", price: "-", perks: [] };
  const numericPrice = (() => {
    const match = (plan.price || "").match(/(\d+(\.\d+)?)/);
    return match ? Number(match[1]) : 0;
  })();

  useEffect(() => {
    // Load Razorpay script only once
    if (window.Razorpay) {
      setRazorpayReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayReady(true);
    script.onerror = () => setRazorpayReady(false);
    document.body.appendChild(script);
  }, []);

  const handleRazorpay = () => {
    if (!window.Razorpay) {
      alert("Payment gateway not ready. Please try again in a moment.");
      return;
    }
    setLoadingPay(true);
    const amountPaise = Math.max(1, Math.round(numericPrice * 100));
    const options = {
      key: razorpayKey,
      amount: amountPaise,
      currency: "INR",
      name: "Connecttly Marketplace",
      description: `${plan.name} plan purchase`,
      handler: () => {
        setLoadingPay(false);
        navigate("/payment/success", { state: { plan: plan.name } });
      },
      modal: {
        ondismiss: () => setLoadingPay(false)
      },
      prefill: {},
      notes: { planId: planId || plan.name }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center px-4 relative">
      <div className="absolute top-6 right-6">
        <BackToHomeButton />
      </div>
      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Payment gateway</p>
            <h1 className="text-3xl font-semibold">Complete your purchase</h1>
            <p className="text-sm text-slate-600 mt-1">
              You are purchasing the <span className="font-semibold">{plan.name}</span> plan.
            </p>
            {usingFallbackKey && (
              <p className="text-[11px] text-amber-600 mt-2">
                Using demo payment key. Set VITE_RAZORPAY_KEY for live checkout.
              </p>
            )}
          </div>
          <Link to="/" className="px-4 py-2 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 hover:bg-white">
            Back to marketplace
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
            <p className="text-sm uppercase tracking-wide text-slate-500">{plan.name} plan</p>
            <div className="text-4xl font-bold text-slate-900">{plan.price}</div>
            <ul className="space-y-2 text-sm text-slate-700">
              {plan.perks.map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">Payment summary</p>
              <p className="text-sm text-slate-600">Secure checkout powered by Connecttly Marketplace.</p>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-700">
              <span>Plan</span>
              <span className="font-semibold">{plan.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-700">
              <span>Amount</span>
              <span className="font-semibold">{plan.price}</span>
            </div>
            <button
              type="button"
              className="w-full px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700"
              onClick={handleRazorpay}
              disabled={loadingPay}
            >
              {loadingPay ? "Opening Razorpay..." : razorpayReady ? "Proceed to pay" : "Loading payment..."}
            </button>
            <p className="text-[11px] text-slate-500">
              You will complete payment via Razorpay and return here automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
