import React, { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider";
import BackToHomeButton from "../components/BackToHomeButton";

export default function MyDeals() {
  const { user, authFetch } = useContext(AuthContext);
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.userId) {
      navigate("/login");
      return;
    }

    async function loadUnlocked() {
      try {
        setLoading(true);
        const res = await authFetch(`/api/deals?userId=${encodeURIComponent(user.userId)}`);
        const json = await res.json();
        setDeals((json.deals || []).filter((d) => d.isUnlocked));
      } catch (err) {
        console.error("Failed to load deals", err);
      } finally {
        setLoading(false);
      }
    }

    loadUnlocked();
  }, [user, authFetch, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-6 relative">
        <div className="absolute top-6 right-6">
          <BackToHomeButton />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">Your perks</p>
            <h1 className="text-3xl font-bold">My Deals</h1>
            <p className="text-sm text-slate-600">
              View everything you've unlocked and jump back into a deal.
            </p>
          </div>
          <Link to="/" className="btn-bubble btn-bubble--white text-slate-900">
            My account
          </Link>
        </div>

        {loading ? (
          <div className="text-slate-600">Loading your deals...</div>
        ) : deals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-600">
            No unlocked deals yet. Browse the marketplace to claim perks.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deals.map((deal) => (
              <div key={deal.id} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Unlocked</p>
                    <h3 className="text-lg font-semibold text-slate-900">{deal.title}</h3>
                    <p className="text-sm text-slate-600">{deal.partner}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                    Active
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-bubble btn-bubble--dark self-start"
                  onClick={() => navigate(`/deal/${deal.id}`, { state: { deal: { ...deal, isUnlocked: true } } })}
                >
                  View deal
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
