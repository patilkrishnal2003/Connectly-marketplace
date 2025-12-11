import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider";

export default function AdminPanel() {
  const { authFetch, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const dealFormDefaults = {
    id: "",
    title: "",
    partner: "",
    coupon_code: "",
    link: "",
    type: "coupon",
    locked_by_default: true,
    featured: false,
  };
  const [form, setForm] = useState(() => ({ ...dealFormDefaults }));
  const [editForm, setEditForm] = useState(() => ({ ...dealFormDefaults }));
  const [mapForm, setMapForm] = useState({ serviceId: "", dealId: "" });
  const [unlockForm, setUnlockForm] = useState({ userId: "", dealId: "" });
  const [createAdminForm, setCreateAdminForm] = useState({ email: "", name: "", password: "" });
  const [simulateForm, setSimulateForm] = useState({ userId: "", serviceId: "" });
  const [purchaseForm, setPurchaseForm] = useState({ userId: "", serviceId: "", amount: 0, status: "completed" });
  const [message, setMessage] = useState("");
  const fallbackServices = [
    { id: "service_basic", title: "Standard Plan" },
    { id: "service_pro", title: "Professional Plan" }
  ];

  async function loadDeals() {
    const res = await authFetch("/api/admin/deals");
    const json = await res.json();
    setDeals(json.deals || []);
  }

  async function loadServices() {
    const res = await authFetch("/api/admin/services");
    const json = await res.json();
    setServices(json.services || []);
  }

  async function loadUsers() {
    const res = await authFetch("/api/admin/users");
    const json = await res.json();
    setUsers(json.users || []);
  }

  async function loadPurchases() {
    const res = await authFetch("/api/admin/purchases?limit=200");
    const json = await res.json();
    setPurchases(json.purchases || []);
  }

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") {
      navigate("/");
      return;
    }
    loadDeals();
    loadServices();
    loadUsers();
    loadPurchases();
  }, [user]);

  async function createDeal(e) {
    e.preventDefault();
    setMessage("");
    const res = await authFetch("/api/admin/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const json = await res.json();
    if (!res.ok) setMessage(json.error || "failed");
    else {
      setMessage("Saved");
      setForm({ ...dealFormDefaults });
      loadDeals();
    }
  }

  async function editDeal(e) {
    e.preventDefault();
    setMessage("");
    const res = await authFetch("/api/admin/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm)
    });
    const json = await res.json();
    if (!res.ok) setMessage(json.error || "failed");
    else {
      setMessage("Updated");
      setEditForm({ ...dealFormDefaults });
      loadDeals();
    }
  }

  async function mapService(e) {
    e.preventDefault();
    setMessage("");
    const res = await authFetch("/api/admin/map-service", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mapForm)
    });
    const json = await res.json();
    if (!res.ok) setMessage(json.error || "failed");
    else {
      setMessage("Mapped");
      setMapForm({ serviceId: "", dealId: "" });
    }
  }

  async function manualUnlock(e) {
    e.preventDefault();
    setMessage("");
    const res = await authFetch("/api/admin/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(unlockForm)
    });
    const json = await res.json();
    if (!res.ok) setMessage(json.error || "failed");
    else {
      setMessage(json.message === "already_unlocked" ? "Already unlocked" : "Unlocked");
      setUnlockForm({ userId: "", dealId: "" });
    }
  }

  async function createAdmin(e) {
    e.preventDefault();
    setMessage("");
    const res = await authFetch("/api/admin/create-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createAdminForm)
    });
    const json = await res.json();
    if (!res.ok) setMessage(json.error || "failed");
    else {
      setMessage("Admin created");
      setCreateAdminForm({ email: "", name: "", password: "" });
      loadUsers();
    }
  }

  async function simulatePurchase(e) {
    e.preventDefault();
    setMessage("");
    const res = await authFetch("/api/admin/simulate-purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(simulateForm)
    });
    const json = await res.json();
    if (!res.ok) setMessage(json.error || "failed");
    else {
      setMessage("Purchase simulated");
      setSimulateForm({ userId: "", serviceId: "" });
    }
  }

  async function createPurchase(e) {
    e.preventDefault();
    setMessage("");
    const res = await authFetch("/api/admin/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(purchaseForm)
    });
    const json = await res.json();
    if (!res.ok) setMessage(json.error || "failed");
    else {
      setMessage("Subscription recorded");
      setPurchaseForm({ userId: "", serviceId: "", amount: 0, status: "completed" });
      loadPurchases();
    }
  }

  async function deletePurchase(id) {
    setMessage("");
    const res = await authFetch(`/api/admin/purchase/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) setMessage(json.error || "failed");
    else {
      setMessage("Subscription removed");
      loadPurchases();
    }
  }

  async function addPresetPurchase(serviceId) {
    if (!purchaseForm.userId) {
      setMessage("Select a user first");
      return;
    }
    setMessage("");
    const res = await authFetch("/api/admin/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...purchaseForm, serviceId })
    });
    const json = await res.json();
    if (!res.ok) setMessage(json.error || "failed");
    else {
      setMessage("Subscription recorded");
      loadPurchases();
    }
  }

  if (!user) return <div className="p-6">Loading...</div>;
  if (user.role !== "admin") return null;

  const cardClass = "bg-white/80 backdrop-blur border border-slate-200 shadow-sm rounded-2xl p-5 space-y-3";
  const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200";
  const labelClass = "text-sm font-medium text-slate-700";
  const buttonBase = "px-4 py-2 rounded-lg font-semibold text-white shadow hover:shadow-md transition";
  const mergedServices = React.useMemo(() => {
    const existing = new Set(services.map(s => s.id));
    const extras = fallbackServices.filter(f => !existing.has(f.id));
    return [...services, ...extras];
  }, [services]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-slate-50 to-white py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <section className="bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-800 text-white rounded-3xl p-8 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-white/70">Admin console</p>
              <h1 className="text-3xl font-bold leading-tight">Manage partner deals, unlocks, and users</h1>
              <p className="text-white/70 text-sm max-w-2xl">
                Create, edit, and map deals to services, unlock perks for users, and simulate purchases from one place.
              </p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-sm">
              <div className="text-white/70">Signed in as</div>
              <div className="font-semibold">{user.email}</div>
              <div className="text-white/60">Role: {user.role}</div>
            </div>
          </div>
          {message && <div className="text-sm bg-white/10 border border-white/20 rounded-lg px-3 py-2 inline-block">{message}</div>}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className={cardClass}>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Deals</p>
              <h2 className="text-lg font-semibold text-slate-900">Add a new deal</h2>
              <p className="text-sm text-slate-500">Creates a deal in the database so it shows up on the marketplace.</p>
            </div>
            <form onSubmit={createDeal} className="grid grid-cols-1 gap-3">
              <label className={labelClass}>
                Deal ID
                <input placeholder="deal_canva_30" value={form.id} onChange={e=>setForm({...form,id:e.target.value})} className={inputClass} />
              </label>
              <label className={labelClass}>
                Title
                <input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className={inputClass} />
              </label>
              <label className={labelClass}>
                Partner
                <input placeholder="Partner" value={form.partner} onChange={e=>setForm({...form,partner:e.target.value})} className={inputClass} />
              </label>
              <label className={labelClass}>
                Coupon Code
                <input placeholder="Coupon code" value={form.coupon_code} onChange={e=>setForm({...form,coupon_code:e.target.value})} className={inputClass} />
              </label>
              <label className={labelClass}>
                Destination link
                <input placeholder="https://partner.com/redeem" value={form.link} onChange={e=>setForm({...form,link:e.target.value})} className={inputClass} />
              </label>
              <label className={labelClass}>
                Deal type
                <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className={inputClass}>
                  <option value="coupon">Coupon code</option>
                  <option value="link">Direct link</option>
                </select>
              </label>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-700">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" checked={!!form.locked_by_default} onChange={e=>setForm({...form,locked_by_default:e.target.checked})} />
                  Locked by default (requires unlock)
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" checked={!!form.featured} onChange={e=>setForm({...form,featured:e.target.checked})} />
                  Mark as featured
                </label>
              </div>
              <button className={`${buttonBase} bg-indigo-600`}>Save deal</button>
            </form>
          </section>

          <section className={cardClass}>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Deals</p>
              <h2 className="text-lg font-semibold text-slate-900">Edit Deal</h2>
              <p className="text-sm text-slate-500">Update details for an existing deal already stored in the backend.</p>
            </div>
            <form onSubmit={editDeal} className="grid grid-cols-1 gap-3">
              <label className={labelClass}>
                Deal ID to edit
                <input placeholder="Deal ID" value={editForm.id} onChange={e=>setEditForm({...editForm,id:e.target.value})} className={inputClass} />
              </label>
              <label className={labelClass}>
                Title
                <input placeholder="Title" value={editForm.title} onChange={e=>setEditForm({...editForm,title:e.target.value})} className={inputClass} />
              </label>
              <label className={labelClass}>
                Partner
                <input placeholder="Partner" value={editForm.partner} onChange={e=>setEditForm({...editForm,partner:e.target.value})} className={inputClass} />
              </label>
              <label className={labelClass}>
                Coupon Code
                <input placeholder="Coupon code" value={editForm.coupon_code} onChange={e=>setEditForm({...editForm,coupon_code:e.target.value})} className={inputClass} />
              </label>
              <label className={labelClass}>
                Destination link
                <input placeholder="https://partner.com/redeem" value={editForm.link} onChange={e=>setEditForm({...editForm,link:e.target.value})} className={inputClass} />
              </label>
              <label className={labelClass}>
                Deal type
                <select value={editForm.type} onChange={e=>setEditForm({...editForm,type:e.target.value})} className={inputClass}>
                  <option value="coupon">Coupon code</option>
                  <option value="link">Direct link</option>
                </select>
              </label>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-700">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" checked={!!editForm.locked_by_default} onChange={e=>setEditForm({...editForm,locked_by_default:e.target.checked})} />
                  Locked by default
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" checked={!!editForm.featured} onChange={e=>setEditForm({...editForm,featured:e.target.checked})} />
                  Featured
                </label>
              </div>
              <button className={`${buttonBase} bg-indigo-500`}>Update Deal</button>
            </form>
          </section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className={cardClass}>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Users</p>
              <h2 className="text-lg font-semibold text-slate-900">User directory</h2>
              <p className="text-sm text-slate-500">View all users and their roles.</p>
            </div>
            <div className="max-h-72 overflow-auto pr-1 space-y-2">
              {users.map(u => (
                <div key={u.id} className="p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="font-semibold text-slate-900">{u.email}</div>
                  <div className="text-sm text-slate-600">Name: {u.name || "—"} • Role: {u.role}</div>
                  <div className="text-xs text-slate-500">Joined: {u.createdAt ? new Date(u.createdAt).toLocaleString() : "—"}</div>
                </div>
              ))}
              {users.length === 0 && <div className="text-sm text-slate-500">No users found.</div>}
            </div>
          </section>

          <section className={cardClass}>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Mapping</p>
              <h2 className="text-lg font-semibold text-slate-900">Map Services to Deals</h2>
            </div>
            <form onSubmit={mapService} className="grid grid-cols-1 gap-3">
              <select value={mapForm.serviceId} onChange={e=>setMapForm({...mapForm,serviceId:e.target.value})} className={inputClass}>
                <option value="">Select Service</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
              <select value={mapForm.dealId} onChange={e=>setMapForm({...mapForm,dealId:e.target.value})} className={inputClass}>
                <option value="">Select Deal</option>
                {deals.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
              </select>
              <button className={`${buttonBase} bg-emerald-600`}>Map Service</button>
            </form>
          </section>

          <section className={cardClass}>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Unlocks</p>
              <h2 className="text-lg font-semibold text-slate-900">Manual Unlock</h2>
            </div>
            <form onSubmit={manualUnlock} className="grid grid-cols-1 gap-3">
              <select value={unlockForm.userId} onChange={e=>setUnlockForm({...unlockForm,userId:e.target.value})} className={inputClass}>
                <option value="">Select User</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.email}</option>)}
              </select>
              <select value={unlockForm.dealId} onChange={e=>setUnlockForm({...unlockForm,dealId:e.target.value})} className={inputClass}>
                <option value="">Select Deal</option>
                {deals.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
              </select>
              <button className={`${buttonBase} bg-amber-600`}>Unlock Deal</button>
            </form>
          </section>

          <section className={cardClass}>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Admins</p>
              <h2 className="text-lg font-semibold text-slate-900">Create Admin</h2>
            </div>
            <form onSubmit={createAdmin} className="grid grid-cols-1 gap-3">
              <input placeholder="Email" value={createAdminForm.email} onChange={e=>setCreateAdminForm({...createAdminForm,email:e.target.value})} className={inputClass} />
              <input placeholder="Name" value={createAdminForm.name} onChange={e=>setCreateAdminForm({...createAdminForm,name:e.target.value})} className={inputClass} />
              <input type="password" placeholder="Password" value={createAdminForm.password} onChange={e=>setCreateAdminForm({...createAdminForm,password:e.target.value})} className={inputClass} />
              <button className={`${buttonBase} bg-rose-600`}>Create Admin</button>
            </form>
          </section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className={cardClass}>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Simulate</p>
              <h2 className="text-lg font-semibold text-slate-900">Simulate Purchase</h2>
            </div>
            <form onSubmit={simulatePurchase} className="grid grid-cols-1 gap-3">
              <select value={simulateForm.userId} onChange={e=>setSimulateForm({...simulateForm,userId:e.target.value})} className={inputClass}>
                <option value="">Select User</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.email}</option>)}
              </select>
              <select value={simulateForm.serviceId} onChange={e=>setSimulateForm({...simulateForm,serviceId:e.target.value})} className={inputClass}>
                <option value="">Select Service</option>
                {mergedServices.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
              <button className={`${buttonBase} bg-purple-600`}>Simulate Purchase</button>
            </form>
          </section>

          <section className={cardClass}>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Subscriptions</p>
              <h2 className="text-lg font-semibold text-slate-900">Manage user subscriptions</h2>
              <p className="text-sm text-slate-500">Add or remove subscriptions manually (no payment capture).</p>
            </div>
            <form onSubmit={createPurchase} className="grid grid-cols-1 gap-3">
              <select value={purchaseForm.userId} onChange={e=>setPurchaseForm({...purchaseForm,userId:e.target.value})} className={inputClass}>
                <option value="">Select User</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.email}</option>)}
              </select>
              <select value={purchaseForm.serviceId} onChange={e=>setPurchaseForm({...purchaseForm,serviceId:e.target.value})} className={inputClass}>
                <option value="">Select Service</option>
                {mergedServices.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
              <input type="number" step="0.01" placeholder="Amount (optional)" value={purchaseForm.amount} onChange={e=>setPurchaseForm({...purchaseForm,amount: parseFloat(e.target.value) || 0})} className={inputClass} />
              <select value={purchaseForm.status} onChange={e=>setPurchaseForm({...purchaseForm,status:e.target.value})} className={inputClass}>
                <option value="completed">completed</option>
                <option value="pending">pending</option>
                <option value="failed">failed</option>
              </select>
              <button className={`${buttonBase} bg-emerald-600`}>Add subscription</button>
            </form>
            <div className="flex flex-wrap gap-2 text-sm">
              <button type="button" onClick={()=>addPresetPurchase("service_basic")} className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white text-slate-700">Add Standard</button>
              <button type="button" onClick={()=>addPresetPurchase("service_pro")} className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white text-slate-700">Add Professional</button>
            </div>
            <div className="grid gap-3 max-h-64 overflow-auto pr-1">
              {purchases.map(p => (
                <div key={p.id} className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                  <div className="text-sm text-slate-700">
                    <div className="font-semibold text-slate-900">User: {p.user_id}</div>
                    <div>Service: {p.service_id} • Status: {p.status}</div>
                    <div className="text-xs text-slate-500">Amount: {p.amount} • {p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}</div>
                  </div>
                  <button onClick={()=>deletePurchase(p.id)} className="text-sm text-rose-600 hover:underline">Delete</button>
                </div>
              ))}
              {purchases.length === 0 && <div className="text-sm text-slate-500">No subscriptions yet.</div>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
