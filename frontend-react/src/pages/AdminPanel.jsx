import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider";

const card = "bg-white border border-slate-200 shadow-sm rounded-2xl p-5 space-y-3";
const input = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200";
const button = "px-4 py-2 rounded-lg font-semibold text-white shadow hover:shadow-md transition";

export default function AdminPanel() {
  const { authFetch, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("users");
  const [message, setMessage] = useState("");

  const [users, setUsers] = useState([]);
  const [usersError, setUsersError] = useState("");
  const [deals, setDeals] = useState([]);
  const [dealsError, setDealsError] = useState("");
  const [purchases, setPurchases] = useState([]);
  const [purchasesError, setPurchasesError] = useState("");
  const [services, setServices] = useState([]);
  const [servicesError, setServicesError] = useState("");

  const [createUserForm, setCreateUserForm] = useState({ email: "", name: "", password: "", role: "user" });
  const [usersEditMode, setUsersEditMode] = useState(true);
  const [inlineEdits, setInlineEdits] = useState({});
  const [savingUserId, setSavingUserId] = useState("");
  const [grantSubForm, setGrantSubForm] = useState({ userId: "", planId: "", amount: "0", interval: "" });

  const [dealsEditMode, setDealsEditMode] = useState(true);
  const [dealDrafts, setDealDrafts] = useState({});
  const [editingDealId, setEditingDealId] = useState("");
  const [dealSaving, setDealSaving] = useState(false);
  const [newDealForm, setNewDealForm] = useState({
    id: "",
    title: "",
    partner: "",
    coupon_code: "",
    link: "",
    locked_by_default: true,
    featured: false,
    type: "",
    tier: "standard"
  });

  const [servicesEditMode, setServicesEditMode] = useState(true);
  const [serviceDrafts, setServiceDrafts] = useState({});
  const [editingServiceId, setEditingServiceId] = useState("");
  const [serviceSaving, setServiceSaving] = useState(false);
  const [newServiceForm, setNewServiceForm] = useState({
    id: "",
    title: "",
    description: "",
    price: "",
    price_cents: "",
    billing_interval: "monthly",
    is_active: true
  });

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") {
      navigate("/");
      return;
    }
    loadUsers();
    loadDeals();
    loadPurchases();
    loadServices();
  }, [user, navigate]);

  async function loadUsers() {
    try {
      setUsersError("");
      const res = await authFetch("/api/admin/users?includeSubscriptions=true");
      const json = await res.json();
      if (!res.ok) {
        setUsersError(json.error || "Failed to load users");
        setUsers([]);
        return;
      }
      setUsers(json.users || []);
    } catch (err) {
      console.error("loadUsers failed", err);
      setUsersError("Failed to load users");
      setUsers([]);
    }
  }

  async function loadDeals() {
    try {
      setDealsError("");
      const res = await authFetch("/api/admin/deals");
      const json = await res.json();
      if (!res.ok) {
        setDealsError(json.error || "Failed to load deals");
        setDeals([]);
        return;
      }
      setDeals(json.deals || []);
    } catch (err) {
      console.error("loadDeals failed", err);
      setDealsError("Failed to load deals");
      setDeals([]);
    }
  }

  async function loadPurchases() {
    try {
      setPurchasesError("");
      const res = await authFetch("/api/admin/purchases?limit=200");
      const json = await res.json();
      if (!res.ok) {
        setPurchasesError(json.error || "Failed to load purchases");
        setPurchases([]);
        return;
      }
      setPurchases(json.purchases || []);
    } catch (err) {
      console.error("loadPurchases failed", err);
      setPurchasesError("Failed to load purchases");
      setPurchases([]);
    }
  }

  async function loadServices() {
    try {
      setServicesError("");
      const res = await authFetch("/api/admin/services");
      const json = await res.json();
      if (!res.ok) {
        setServicesError(json.error || "Failed to load subscriptions");
        setServices([]);
        return;
      }
      setServices(json.services || []);
    } catch (err) {
      console.error("loadServices failed", err);
      setServicesError("Failed to load subscriptions");
      setServices([]);
    }
  }

  function setFlash(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  }

  async function handleCreateUser(e) {
    if (e?.preventDefault) e.preventDefault();
    setMessage("");
    const res = await authFetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createUserForm)
    });
    const json = await res.json();
    if (!res.ok) setFlash(json.error || "failed");
    else {
      setCreateUserForm({ email: "", name: "", password: "", role: "user" });
      setFlash("User created");
      loadUsers();
    }
  }

  const updateInlineField = (userId, key, value) => {
    setInlineEdits((prev) => ({ ...prev, [userId]: { ...(prev[userId] || {}), [key]: value } }));
  };

  const resetInlineEdit = (userId) => {
    setInlineEdits((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  };

  async function handleUpdateUserInline(userId) {
    if (!userId) return;
    const draft = inlineEdits[userId] || {};
    const targetUser = users.find((u) => u.id === userId);
    const payload = {};
    if (draft.role && draft.role !== targetUser?.role) payload.role = draft.role;
    if (draft.password) payload.password = draft.password;
    if (draft.name !== undefined && draft.name !== targetUser?.name) payload.name = draft.name;

    if (!Object.keys(payload).length) {
      setFlash("No changes to save");
      return;
    }

    setSavingUserId(userId);
    setMessage("");
    const res = await authFetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) setFlash(json.error || "failed");
    else {
      resetInlineEdit(userId);
      setFlash("User updated");
      loadUsers();
    }
    setSavingUserId("");
  }

  const startDealEdit = (deal) => {
    setEditingDealId(deal.id);
    setDealDrafts((prev) => ({
      ...prev,
      [deal.id]: {
        id: deal.id,
        title: deal.title || "",
        partner: deal.partner || "",
        coupon_code: deal.coupon_code || "",
        link: deal.link || "",
        locked_by_default: deal.locked_by_default !== undefined ? !!deal.locked_by_default : true,
        featured: !!deal.featured,
        type: deal.type || "",
        tier: deal.tier || "standard"
      }
    }));
  };

  const updateDealDraft = (dealId, key, value) => {
    setDealDrafts((prev) => ({ ...prev, [dealId]: { ...(prev[dealId] || {}), [key]: value } }));
  };

  const cancelDealEdit = (dealId) => {
    setDealDrafts((prev) => {
      const next = { ...prev };
      delete next[dealId];
      return next;
    });
    setEditingDealId("");
    setDealSaving(false);
  };

  async function handleCreateDeal() {
    if (!newDealForm.id || !newDealForm.title) {
      setFlash("Deal ID and Title are required");
      return;
    }
    setDealSaving(true);
    const payload = {
      id: newDealForm.id,
      title: newDealForm.title,
      partner: newDealForm.partner,
      coupon_code: newDealForm.coupon_code,
      link: newDealForm.link,
      locked_by_default: !!newDealForm.locked_by_default,
      featured: !!newDealForm.featured,
      type: newDealForm.type || undefined,
      tier: newDealForm.tier || undefined
    };
    const res = await authFetch("/api/admin/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) setFlash(json.error || "failed");
    else {
      setNewDealForm({
        id: "",
        title: "",
        partner: "",
        coupon_code: "",
        link: "",
        locked_by_default: true,
        featured: false,
        type: "",
        tier: "standard"
      });
      setFlash("Deal created");
      loadDeals();
    }
    setDealSaving(false);
  }

  async function saveDealDraft(dealId) {
    const draft = dealDrafts[dealId];
    if (!draft) return;
    setMessage("");
    setDealSaving(true);
    const payload = {
      title: draft.title,
      partner: draft.partner,
      coupon_code: draft.coupon_code,
      link: draft.link,
      locked_by_default: !!draft.locked_by_default,
      featured: !!draft.featured,
      type: draft.type || undefined,
      tier: draft.tier || undefined
    };

    const res = await authFetch(`/api/admin/deals/${dealId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) setFlash(json.error || "failed");
    else {
      cancelDealEdit(dealId);
      setFlash("Deal updated");
      loadDeals();
    }
    setDealSaving(false);
  }

  async function handleDeleteDeal(id) {
    if (!id) return;
    const confirmDelete = window.confirm("Delete this deal? This cannot be undone.");
    if (!confirmDelete) return;
    const res = await authFetch(`/api/admin/deals/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) setFlash(json.error || "failed");
    else {
      if (editingDealId === id) {
        cancelDealEdit(id);
      }
      setFlash("Deal deleted");
      loadDeals();
    }
  }

  const startServiceEdit = (service) => {
    setEditingServiceId(service.id);
    setServiceDrafts((prev) => ({
      ...prev,
      [service.id]: {
        id: service.id,
        title: service.title || "",
        description: service.description || "",
        price: service.price ?? "",
        price_cents: service.price_cents ?? "",
        billing_interval: service.billing_interval || "monthly",
        is_active: service.is_active !== undefined ? service.is_active : true
      }
    }));
  };

  const updateServiceDraft = (serviceId, key, value) => {
    setServiceDrafts((prev) => ({ ...prev, [serviceId]: { ...(prev[serviceId] || {}), [key]: value } }));
  };

  const cancelServiceEdit = (serviceId) => {
    setServiceDrafts((prev) => {
      const next = { ...prev };
      delete next[serviceId];
      return next;
    });
    setEditingServiceId("");
    setServiceSaving(false);
  };

  async function handleCreateService() {
    if (!newServiceForm.id || !newServiceForm.title) {
      setFlash("Plan ID and Title are required");
      return;
    }
    setServiceSaving(true);
    const payload = {
      id: newServiceForm.id,
      title: newServiceForm.title,
      description: newServiceForm.description,
      price: newServiceForm.price === "" ? undefined : Number(newServiceForm.price),
      price_cents: newServiceForm.price_cents === "" ? undefined : Number(newServiceForm.price_cents),
      billing_interval: newServiceForm.billing_interval,
      is_active: !!newServiceForm.is_active
    };
    const res = await authFetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (!res.ok) setFlash(json.error || "failed");
    else {
      setNewServiceForm({
        id: "",
        title: "",
        description: "",
        price: "",
        price_cents: "",
        billing_interval: "monthly",
        is_active: true
      });
      setFlash("Subscription plan created");
      loadServices();
      loadUsers();
    }
    setServiceSaving(false);
  }

  async function saveServiceDraft(serviceId) {
    const draft = serviceDrafts[serviceId];
    if (!draft || !draft.title) {
      setFlash("Plan title is required");
      return;
    }
    setMessage("");
    setServiceSaving(true);
    const payload = {
      title: draft.title,
      description: draft.description,
      price: draft.price === "" ? undefined : Number(draft.price),
      price_cents: draft.price_cents === "" ? undefined : Number(draft.price_cents),
      billing_interval: draft.billing_interval,
      is_active: !!draft.is_active
    };

    const res = await authFetch(`/api/admin/services/${serviceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (!res.ok) setFlash(json.error || "failed");
    else {
      cancelServiceEdit(serviceId);
      setFlash("Subscription updated");
      loadServices();
      loadUsers();
    }
    setServiceSaving(false);
  }

  async function handleDeleteService(id) {
    if (!id) return;
    const confirmDelete = window.confirm("Delete this subscription plan? This cannot be undone.");
    if (!confirmDelete) return;
    const res = await authFetch(`/api/admin/services/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) setFlash(json.error || "failed");
    else {
      if (editingServiceId === id) {
        cancelServiceEdit(id);
      }
      setFlash("Subscription plan deleted");
      loadServices();
      loadUsers();
    }
  }

  async function handleDeleteUser(id) {
    if (!id) return;
    const confirmDelete = window.confirm("Delete this user? This cannot be undone.");
    if (!confirmDelete) return;
    const res = await authFetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) setFlash(json.error || "failed");
    else {
      resetInlineEdit(id);
      setFlash("User deleted");
      loadUsers();
    }
  }

  async function handleGrantSubscription(e) {
    if (e?.preventDefault) e.preventDefault();
    if (!grantSubForm.userId || !grantSubForm.planId) {
      setFlash("Select user and plan to grant");
      return;
    }
    const payload = {
      userId: grantSubForm.userId,
      serviceId: grantSubForm.planId,
      amount: grantSubForm.amount === "" ? 0 : Number(grantSubForm.amount),
      billing_interval: grantSubForm.interval || "monthly",
      status: "completed",
      provider: "admin_grant"
    };
    const res = await authFetch("/api/admin/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) setFlash(json.error || "failed");
    else {
      setGrantSubForm({ userId: "", planId: "", amount: "0", interval: "" });
      setFlash("Subscription granted");
      loadUsers();
      loadServices();
      loadPurchases();
    }
  }

  if (!user) return <div className="p-6">Loading...</div>;
  if (user.role !== "admin") return null;

  const activeNavClass =
    "flex items-center gap-2 w-full px-3 py-2 rounded-xl bg-indigo-600 text-white font-semibold shadow ring-1 ring-indigo-500/60";
  const inactiveNavClass =
    "flex items-center gap-2 w-full px-3 py-2 rounded-xl text-slate-800 hover:bg-indigo-50 hover:text-indigo-800 transition border border-transparent hover:border-indigo-100";

  const handleNavClick = (id) => {
    setActiveSection(id);
    if (id === "deals") loadDeals();
    if (id === "subscriptions") loadServices();
  };

  const getActiveSubscription = (u) => {
    const subs = u.user_subscriptions || u.userSubscriptions || u.UserSubscriptions || [];
    if (!subs.length) return null;
    const active = subs.find((s) => s.status === "active") || subs[0];
    const plan = active.service;
    return {
      title: plan?.title || plan?.id || active.plan_id,
      code: plan?.code || "plan",
      status: active.status,
      started: active.started_at ? new Date(active.started_at).toLocaleDateString() : "n/a",
      expires: active.expires_at ? new Date(active.expires_at).toLocaleDateString() : "open",
      interval: plan?.billing_interval || "monthly"
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-sky-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-slate-100">
          <div className="flex">
            <aside className="w-64 border-r border-slate-200 bg-gradient-to-b from-indigo-50 via-white to-slate-50">
              <div className="px-4 py-5 border-b border-slate-200">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Admin</p>
                <p className="font-semibold text-slate-900">{user.email}</p>
                <p className="text-[11px] text-slate-500">Role: {user.role}</p>
              </div>
              <nav className="p-4 space-y-2">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "users", label: "Users" },
                  { id: "deals", label: "Deals" },
                  { id: "purchases", label: "Purchases" },
                  { id: "subscriptions", label: "Subscriptions" }
                ].map((item) => (
                  <button
                    key={item.id}
                    className={activeSection === item.id ? activeNavClass : inactiveNavClass}
                    onClick={() => handleNavClick(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </aside>

            <main className="flex-1 p-8 space-y-7 bg-white">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-indigo-600">Connecttly Admin</p>
                  <h1 className="text-3xl font-semibold text-slate-900">Control center</h1>
                  <p className="text-sm text-slate-600">Manage users, deals, subscriptions, and purchases in one console.</p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-semibold">Live</span>
                    <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">Secure</span>
                  </div>
                </div>
                {message && (
                  <div className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm shadow">
                    {message}
                  </div>
                )}
              </div>

              {activeSection === "overview" && (
                <div className="space-y-5">
                  <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {[
                      { label: "Users", value: users.length || 0 },
                      { label: "Deals", value: deals.length || 0 },
                      { label: "Subscriptions", value: services.length || 0 },
                      { label: "Purchases", value: purchases.length || 0 }
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-2xl border border-slate-200 bg-slate-50 shadow-sm p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">{stat.label}</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                      </div>
                    ))}
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                    <p className="text-sm text-slate-700">
                      Use the left navigation to access users, deals, purchases, and subscriptions. Inline edits are saved per row; grants and creates are in-line at the top of each table.
                    </p>
                  </section>
                </div>
              )}

              {activeSection === "users" && (
                <div className="space-y-4">
                  <section className={`${card} space-y-4`}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">Users &amp; access</h3>
                        <p className="text-sm text-slate-600">Modern data grid with inline edit rail instead of legacy forms.</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs bg-indigo-50 text-indigo-700 border border-indigo-100">Live directory</span>
                        <button className="text-sm text-indigo-700 underline" type="button" onClick={() => loadUsers()}>
                          Refresh
                        </button>
                      </div>
                    </div>
                    {usersError && (
                      <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {usersError}
                      </div>
                    )}
                    <div className="overflow-x-auto overflow-y-auto pb-2" style={{ scrollbarGutter: "stable" }}>
                      <table className="min-w-[900px] w-full text-[13px] table-auto">
                        <thead className="text-left text-[11px] uppercase text-slate-500 bg-slate-50 sticky top-0">
                          <tr>
                            <th className="px-2 py-2">Email</th>
                            <th className="px-2 py-2">Name</th>
                            <th className="px-2 py-2">Role</th>
                            <th className="px-2 py-2">Password reset</th>
                            <th className="px-2 py-2">Subscription</th>
                            <th className="px-2 py-2">Created</th>
                            <th className="px-2 py-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr className="bg-indigo-50/60 border border-indigo-100/70">
                            <td className="px-2 py-2 align-top">
                              <div className="text-[11px] uppercase tracking-wide text-indigo-600 font-semibold mb-1">New user</div>
                              <input className={`${input} text-sm`} placeholder="email@company.com" value={createUserForm.email} onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })} />
                            </td>
                            <td className="px-2 py-2">
                              <input className={`${input} text-sm`} placeholder="Name" value={createUserForm.name} onChange={(e) => setCreateUserForm({ ...createUserForm, name: e.target.value })} />
                            </td>
                            <td className="px-2 py-2">
                              <select className={`${input} text-sm`} value={createUserForm.role} onChange={(e) => setCreateUserForm({ ...createUserForm, role: e.target.value })}>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className="px-2 py-2">
                              <input type="password" className={`${input} text-sm`} placeholder="Temp password" value={createUserForm.password} onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })} />
                            </td>
                            <td className="px-2 py-2 text-xs text-slate-500">-</td>
                            <td className="px-2 py-2 text-xs text-slate-500">-</td>
                            <td className="px-2 py-2 text-right">
                              <button className={`${button} bg-indigo-600`} type="button" onClick={() => handleCreateUser()}>
                                Create
                              </button>
                            </td>
                          </tr>
                          {users.map((u) => {
                            const sub = getActiveSubscription(u);
                            const draft = inlineEdits[u.id] || {};
                            const nameValue = draft.name !== undefined ? draft.name : u.name || "";
                            const roleValue = draft.role || u.role || "user";
                            const passwordValue = draft.password || "";
                            const hasChanges =
                              !!passwordValue ||
                              (draft.role !== undefined && draft.role !== u.role) ||
                              (draft.name !== undefined && draft.name !== (u.name || ""));
                            return (
                              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-2 py-2 font-semibold text-slate-900">
                                  <div>{u.email}</div>
                                  <div className="text-[11px] text-slate-500 mt-1 truncate">{u.id}</div>
                                </td>
                                <td className="px-2 py-2">
                                  {usersEditMode ? (
                                    <input
                                      className={`${input} text-sm`}
                                      value={nameValue}
                                      onChange={(e) => updateInlineField(u.id, "name", e.target.value)}
                                      placeholder="Name"
                                    />
                                  ) : (
                                    <div className="text-slate-800">{nameValue || "Not set"}</div>
                                  )}
                                </td>
                                <td className="px-2 py-2">
                                  {usersEditMode ? (
                                    <select
                                      className={`${input} text-sm`}
                                      value={roleValue}
                                      onChange={(e) => updateInlineField(u.id, "role", e.target.value)}
                                    >
                                      <option value="user">User</option>
                                      <option value="admin">Admin</option>
                                    </select>
                                  ) : (
                                    <span className="inline-flex px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                                      {roleValue}
                                    </span>
                                  )}
                                </td>
                                <td className="px-2 py-2">
                                  {usersEditMode ? (
                                    <div className="space-y-1">
                                      <input
                                        type="password"
                                        className={`${input} text-sm`}
                                        value={passwordValue}
                                        onChange={(e) => updateInlineField(u.id, "password", e.target.value)}
                                        placeholder="Set new password"
                                      />
                                      <p className="text-[11px] text-slate-500">Only sent on save.</p>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-slate-500">Hidden</span>
                                  )}
                                </td>
                                <td className="px-2 py-2 text-slate-700">
                                  {sub ? (
                                    <div className="text-xs space-y-1">
                                      <div className="font-semibold">{sub.title} ({sub.code})</div>
                                      <div className="inline-flex items-center gap-2">
                                        <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">Status: {sub.status}</span>
                                        <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">{sub.interval}</span>
                                      </div>
                                      <div className="text-slate-600">Start: {sub.started} | Exp: {sub.expires}</div>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-slate-500">No subscription</span>
                                  )}
                                </td>
                                <td className="px-2 py-2 text-slate-600 whitespace-nowrap">
                                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "n/a"}
                                </td>
                                <td className="px-2 py-2">
                                  <div className="flex items-center justify-end gap-2">
                                    {usersEditMode ? (
                                      <>
                                        <button
                                          type="button"
                                          className={`${button} bg-indigo-600 ${!hasChanges ? "opacity-60 cursor-not-allowed" : ""}`}
                                          disabled={!hasChanges || savingUserId === u.id}
                                          onClick={() => handleUpdateUserInline(u.id)}
                                        >
                                          {savingUserId === u.id ? "Saving..." : "Save"}
                                        </button>
                                        {hasChanges && (
                                          <button
                                            type="button"
                                            className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                                            onClick={() => resetInlineEdit(u.id)}
                                          >
                                            Reset
                                          </button>
                                        )}
                                      </>
                                    ) : (
                                      <button
                                        type="button"
                                        className="px-2.5 py-2 rounded-lg border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                                        onClick={() => setUsersEditMode(true)}
                                        aria-label="Edit"
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M12 20h9" />
                                          <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                                        </svg>
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      className="px-3 py-2 rounded-lg border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100"
                                      onClick={() => handleDeleteUser(u.id)}
                                      aria-label="Delete"
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-label="Delete"
                                      >
                                        <path d="M3 6h18" />
                                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                        <path d="M10 11v6" />
                                        <path d="M14 11v6" />
                                      </svg>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          {users.length === 0 && (
                            <tr>
                              <td colSpan="7" className="px-3 py-3 text-slate-500">
                                No users found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              )}

              {activeSection === "deals" && (
                <div className="space-y-4">
                  <section className={card}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">Deals</h3>
                        <p className="text-sm text-slate-600">Streamlined catalog table with inline edit bar, no pop-up forms.</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button className="text-sm text-indigo-700 underline" type="button" onClick={() => loadDeals()}>
                          Refresh
                        </button>
                      </div>
                    </div>
                    {dealsError && (
                      <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {dealsError}
                      </div>
                    )}
                    <div className="overflow-x-auto pb-2" style={{ scrollbarGutter: "stable" }}>
                      <table className="min-w-[560px] w-full text-[12px] table-auto">
                        <thead className="text-left text-[11px] uppercase text-slate-500 bg-slate-50">
                          <tr>
                            <th className="px-2 py-1.5">ID</th>
                            <th className="px-2 py-1.5">Title</th>
                            <th className="px-2 py-1.5">Partner</th>
                            <th className="px-2 py-1.5">Tier</th>
                            <th className="px-2 py-1.5">Type</th>
                            <th className="px-2 py-1.5">Locked</th>
                            <th className="px-2 py-1.5">Featured</th>
                            <th className="px-2 py-1.5">Link</th>
                            <th className="px-2 py-1.5">Coupon</th>
                            <th className="px-2 py-1.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-indigo-50/60 border border-indigo-100/70">
                            <td className="px-2 py-1.5 text-slate-700">
                              <input className={`${input} text-sm`} placeholder="ID" value={newDealForm.id} onChange={(e) => setNewDealForm({ ...newDealForm, id: e.target.value })} />
                            </td>
                            <td className="px-2 py-1.5">
                              <input className={`${input} text-sm`} placeholder="Title" value={newDealForm.title} onChange={(e) => setNewDealForm({ ...newDealForm, title: e.target.value })} />
                            </td>
                            <td className="px-2 py-1.5">
                              <input className={`${input} text-sm`} placeholder="Partner" value={newDealForm.partner} onChange={(e) => setNewDealForm({ ...newDealForm, partner: e.target.value })} />
                            </td>
                            <td className="px-2 py-1.5">
                              <select className={`${input} text-sm`} value={newDealForm.tier} onChange={(e) => setNewDealForm({ ...newDealForm, tier: e.target.value })}>
                                <option value="standard">Standard</option>
                                <option value="professional">Professional</option>
                              </select>
                            </td>
                            <td className="px-2 py-1.5">
                              <input className={`${input} text-sm`} placeholder="Type" value={newDealForm.type} onChange={(e) => setNewDealForm({ ...newDealForm, type: e.target.value })} />
                            </td>
                            <td className="px-2 py-1.5">
                              <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                                <input type="checkbox" checked={newDealForm.locked_by_default} onChange={(e) => setNewDealForm({ ...newDealForm, locked_by_default: e.target.checked })} />
                                Locked
                              </label>
                            </td>
                            <td className="px-2 py-1.5">
                              <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                                <input type="checkbox" checked={newDealForm.featured} onChange={(e) => setNewDealForm({ ...newDealForm, featured: e.target.checked })} />
                                Featured
                              </label>
                            </td>
                            <td className="px-2 py-1.5">
                              <input className={`${input} text-sm`} placeholder="Link" value={newDealForm.link} onChange={(e) => setNewDealForm({ ...newDealForm, link: e.target.value })} />
                            </td>
                            <td className="px-2 py-1.5">
                              <input className={`${input} text-sm`} placeholder="Coupon" value={newDealForm.coupon_code} onChange={(e) => setNewDealForm({ ...newDealForm, coupon_code: e.target.value })} />
                            </td>
                            <td className="px-2 py-1.5 text-right">
                              <button className={`${button} bg-indigo-600 text-xs px-3 py-1.5`} type="button" onClick={handleCreateDeal} disabled={dealSaving}>
                                {dealSaving ? "Saving..." : "Add deal"}
                              </button>
                            </td>
                          </tr>
                          {deals.map((d) => {
                            const draft = dealDrafts[d.id] || {};
                            const isEditing = dealsEditMode && editingDealId === d.id;
                            const titleValue = draft.title !== undefined ? draft.title : d.title || "";
                            const partnerValue = draft.partner !== undefined ? draft.partner : d.partner || "";
                            const tierValue = draft.tier !== undefined ? draft.tier : d.tier || "standard";
                            const typeValue = draft.type !== undefined ? draft.type : d.type || "";
                            const linkValue = draft.link !== undefined ? draft.link : d.link || "";
                            const couponValue = draft.coupon_code !== undefined ? draft.coupon_code : d.coupon_code || "";
                            const lockedValue = draft.locked_by_default !== undefined ? draft.locked_by_default : !!d.locked_by_default;
                            const featuredValue = draft.featured !== undefined ? draft.featured : !!d.featured;
                            return (
                              <tr key={d.id} className="border-b border-slate-100">
                                <td className="px-2 py-1.5 text-slate-700">{d.id}</td>
                                <td className="px-2 py-1.5 font-semibold text-slate-900">
                                  {isEditing ? (
                                    <input className={`${input} text-sm`} value={titleValue} onChange={(e) => updateDealDraft(d.id, "title", e.target.value)} />
                                  ) : (
                                    titleValue
                                  )}
                                </td>
                                <td className="px-2 py-1.5 text-slate-700">
                                  {isEditing ? (
                                    <input className={`${input} text-sm`} value={partnerValue} onChange={(e) => updateDealDraft(d.id, "partner", e.target.value)} />
                                  ) : (
                                    partnerValue || "-"
                                  )}
                                </td>
                                <td className="px-2 py-1.5 text-slate-700 capitalize">
                                  {isEditing ? (
                                    <select className={`${input} text-sm`} value={tierValue} onChange={(e) => updateDealDraft(d.id, "tier", e.target.value)}>
                                      <option value="standard">Standard</option>
                                      <option value="professional">Professional</option>
                                    </select>
                                  ) : (
                                    tierValue || "-"
                                  )}
                                </td>
                                <td className="px-2 py-1.5 text-slate-700">
                                  {isEditing ? (
                                    <input className={`${input} text-sm`} value={typeValue} onChange={(e) => updateDealDraft(d.id, "type", e.target.value)} />
                                  ) : (
                                    typeValue || "-"
                                  )}
                                </td>
                                <td className="px-2 py-1.5 text-slate-700">
                                  {isEditing ? (
                                    <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                                      <input
                                        type="checkbox"
                                        checked={lockedValue}
                                        onChange={(e) => updateDealDraft(d.id, "locked_by_default", e.target.checked)}
                                      />
                                      Locked
                                    </label>
                                  ) : lockedValue ? (
                                    "Yes"
                                  ) : (
                                    "No"
                                  )}
                                </td>
                                <td className="px-2 py-1.5 text-slate-700">
                                  {isEditing ? (
                                    <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                                      <input
                                        type="checkbox"
                                        checked={featuredValue}
                                        onChange={(e) => updateDealDraft(d.id, "featured", e.target.checked)}
                                      />
                                      Featured
                                    </label>
                                  ) : featuredValue ? (
                                    "Yes"
                                  ) : (
                                    "No"
                                  )}
                                </td>
                                <td className="px-2 py-1.5 text-slate-700 max-w-[150px] truncate">
                                  {isEditing ? (
                                    <input className={`${input} text-sm`} value={linkValue} onChange={(e) => updateDealDraft(d.id, "link", e.target.value)} />
                                  ) : (
                                    linkValue || "-"
                                  )}
                                </td>
                                <td className="px-2 py-1.5 text-slate-700 max-w-[80px] truncate">
                                  {isEditing ? (
                                    <input className={`${input} text-sm`} value={couponValue} onChange={(e) => updateDealDraft(d.id, "coupon_code", e.target.value)} />
                                  ) : (
                                    couponValue || "-"
                                  )}
                                </td>
                                <td className="px-2 py-1.5 text-right">
                                  <div className="flex items-center gap-2 justify-end">
                                    {isEditing ? (
                                      <>
                                        <button
                                          className={`${button} bg-indigo-600 text-xs px-3 py-1.5`}
                                          onClick={() => saveDealDraft(d.id)}
                                          disabled={dealSaving}
                                          type="button"
                                        >
                                          {dealSaving ? "Saving..." : "Save"}
                                        </button>
                                        <button
                                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs"
                                          onClick={() => cancelDealEdit(d.id)}
                                          type="button"
                                        >
                                          Cancel
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        className="px-2.5 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 text-xs"
                                        onClick={() => {
                                          setDealsEditMode(true);
                                          startDealEdit(d);
                                        }}
                                        type="button"
                                        aria-label="Edit"
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M12 20h9" />
                                          <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                                        </svg>
                                      </button>
                                    )}
                                    <button
                                      className="text-xs text-rose-700 underline"
                                      onClick={() => handleDeleteDeal(d.id)}
                                      aria-label="Delete"
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M3 6h18" />
                                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                        <path d="M10 11v6" />
                                        <path d="M14 11v6" />
                                      </svg>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          {deals.length === 0 && (
                            <tr>
                              <td colSpan="10" className="px-3 py-3 text-slate-500">
                                No deals found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>

                </div>
              )}

              {activeSection === "purchases" && (
                <div className="space-y-4">
                  <section className={card}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Purchases</h3>
                      <button className="text-sm text-indigo-700 underline" type="button" onClick={() => loadPurchases()}>
                        Refresh
                      </button>
                    </div>
                    {purchasesError && (
                      <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {purchasesError}
                      </div>
                    )}
                    <div className="overflow-auto">
                      <table className="min-w-full text-sm">
                        <thead className="text-left text-xs uppercase text-slate-500 bg-slate-50">
                          <tr>
                            <th className="px-3 py-2">User</th>
                            <th className="px-3 py-2">Service/Plan</th>
                            <th className="px-3 py-2">Amount</th>
                            <th className="px-3 py-2">Status</th>
                            <th className="px-3 py-2">Provider</th>
                            <th className="px-3 py-2">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {purchases.map((p) => (
                            <tr key={p.id} className="border-b border-slate-100">
                              <td className="px-3 py-2 text-slate-700">{p.user_id}</td>
                              <td className="px-3 py-2 text-slate-700">{p.service_id || p.plan_id || "-"}</td>
                              <td className="px-3 py-2 text-slate-700">{typeof p.amount === "number" ? `INR ${p.amount}` : "-"}</td>
                              <td className="px-3 py-2 text-slate-700">{p.status}</td>
                              <td className="px-3 py-2 text-slate-700">{p.provider || "-"}</td>
                              <td className="px-3 py-2 text-slate-600">{p.createdAt ? new Date(p.createdAt).toLocaleString() : "n/a"}</td>
                            </tr>
                          ))}
                          {purchases.length === 0 && (
                            <tr>
                              <td colSpan="6" className="px-3 py-3 text-slate-500">
                                No purchases yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              )}

              {activeSection === "subscriptions" && (
                <div className="space-y-4">
                  <section className={card}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">Subscription plans</h3>
                        <p className="text-sm text-slate-600">Inline grid navigation; no modal forms or manual grants.</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button className="text-sm text-indigo-700 underline" type="button" onClick={() => loadServices()}>
                          Refresh
                        </button>
                      </div>
                    </div>
                    {servicesError && (
                      <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {servicesError}
                      </div>
                    )}
                    <div className="overflow-x-auto overflow-y-auto pb-2" style={{ scrollbarGutter: "stable" }}>
                      <table className="min-w-full text-sm">
                        <thead className="text-left text-xs uppercase text-slate-500 bg-slate-50">
                          <tr>
                            <th className="px-3 py-2">ID</th>
                            <th className="px-3 py-2">Title</th>
                            <th className="px-3 py-2">Interval</th>
                            <th className="px-3 py-2">Price</th>
                            <th className="px-3 py-2">Active</th>
                            <th className="px-3 py-2">Description</th>
                            <th className="px-3 py-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-indigo-50/60 border border-indigo-100/70">
                            <td className="px-3 py-3 text-slate-700">
                              <input className={input} placeholder="ID" value={newServiceForm.id} onChange={(e) => setNewServiceForm({ ...newServiceForm, id: e.target.value })} />
                            </td>
                            <td className="px-3 py-3">
                              <input className={input} placeholder="Title" value={newServiceForm.title} onChange={(e) => setNewServiceForm({ ...newServiceForm, title: e.target.value })} />
                            </td>
                            <td className="px-3 py-3">
                              <select className={input} value={newServiceForm.billing_interval} onChange={(e) => setNewServiceForm({ ...newServiceForm, billing_interval: e.target.value })}>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                              </select>
                            </td>
                            <td className="px-3 py-3">
                              <input type="number" className={input} placeholder="Price" value={newServiceForm.price} onChange={(e) => setNewServiceForm({ ...newServiceForm, price: e.target.value })} />
                            </td>
                            <td className="px-3 py-3">
                              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                                <input type="checkbox" checked={newServiceForm.is_active} onChange={(e) => setNewServiceForm({ ...newServiceForm, is_active: e.target.checked })} />
                                Active
                              </label>
                            </td>
                            <td className="px-3 py-3">
                              <textarea className={`${input} min-h-[60px]`} placeholder="Description" value={newServiceForm.description} onChange={(e) => setNewServiceForm({ ...newServiceForm, description: e.target.value })} />
                            </td>
                            <td className="px-3 py-3 text-right">
                              <button className={`${button} bg-indigo-600`} type="button" onClick={handleCreateService} disabled={serviceSaving}>
                                {serviceSaving ? "Saving..." : "Add plan"}
                              </button>
                            </td>
                          </tr>
                          {services.map((s) => {
                            const draft = serviceDrafts[s.id] || {};
                            const isEditing = servicesEditMode && editingServiceId === s.id;
                            const titleValue = draft.title !== undefined ? draft.title : s.title || "";
                            const intervalValue = draft.billing_interval !== undefined ? draft.billing_interval : s.billing_interval || "monthly";
                            const priceValue = draft.price !== undefined ? draft.price : s.price ?? "";
                            const priceCentsValue = draft.price_cents !== undefined ? draft.price_cents : s.price_cents ?? "";
                            const descValue = draft.description !== undefined ? draft.description : s.description || "";
                            const activeValue = draft.is_active !== undefined ? draft.is_active : s.is_active !== undefined ? s.is_active : true;
                            return (
                              <tr key={s.id} className="border-b border-slate-100">
                                <td className="px-3 py-2 text-slate-700">{s.id}</td>
                                <td className="px-3 py-2 font-semibold text-slate-900">
                                  {isEditing ? (
                                    <input className={input} value={titleValue} onChange={(e) => updateServiceDraft(s.id, "title", e.target.value)} />
                                  ) : (
                                    titleValue || "-"
                                  )}
                                </td>
                                <td className="px-3 py-2 text-slate-700">
                                  {isEditing ? (
                                    <select className={input} value={intervalValue} onChange={(e) => updateServiceDraft(s.id, "billing_interval", e.target.value)}>
                                      <option value="monthly">Monthly</option>
                                      <option value="yearly">Yearly</option>
                                    </select>
                                  ) : (
                                    intervalValue || "-"
                                  )}
                                </td>
                                <td className="px-3 py-2 text-slate-700">
                                  {isEditing ? (
                                    <input
                                      type="number"
                                      className={input}
                                      value={priceValue}
                                      placeholder="Price"
                                      onChange={(e) => updateServiceDraft(s.id, "price", e.target.value)}
                                    />
                                  ) : priceValue !== "" && priceValue !== null ? (
                                    `INR ${priceValue}`
                                  ) : (
                                    "-"
                                  )}
                                </td>
                                <td className="px-3 py-2 text-slate-700">
                                  {isEditing ? (
                                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                                      <input
                                        type="checkbox"
                                        checked={activeValue}
                                        onChange={(e) => updateServiceDraft(s.id, "is_active", e.target.checked)}
                                      />
                                      Active
                                    </label>
                                  ) : activeValue ? (
                                    "Yes"
                                  ) : (
                                    "No"
                                  )}
                                </td>
                                <td className="px-3 py-2 text-slate-700 max-w-xs truncate">
                                  {isEditing ? (
                                    <textarea
                                      className={`${input} min-h-[80px]`}
                                      value={descValue}
                                      onChange={(e) => updateServiceDraft(s.id, "description", e.target.value)}
                                    />
                                  ) : (
                                    descValue || "-"
                                  )}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {isEditing ? (
                                      <>
                                        <button
                                          className={`${button} bg-indigo-600`}
                                          onClick={() => saveServiceDraft(s.id)}
                                          disabled={serviceSaving}
                                          type="button"
                                        >
                                          {serviceSaving ? "Saving..." : "Save"}
                                        </button>
                                        <button
                                          className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                                          onClick={() => cancelServiceEdit(s.id)}
                                          type="button"
                                        >
                                          Cancel
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        className="px-2.5 py-2 rounded-lg border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 text-sm"
                                        onClick={() => {
                                          setServicesEditMode(true);
                                          startServiceEdit(s);
                                        }}
                                        type="button"
                                        aria-label="Edit"
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M12 20h9" />
                                          <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                                        </svg>
                                      </button>
                                    )}
                                    <button
                                      className="text-sm text-rose-700 underline"
                                      onClick={() => handleDeleteService(s.id)}
                                      type="button"
                                      aria-label="Delete"
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-label="Delete"
                                      >
                                        <path d="M3 6h18" />
                                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                        <path d="M10 11v6" />
                                        <path d="M14 11v6" />
                                      </svg>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          {services.length === 0 && (
                            <tr>
                              <td colSpan="7" className="px-3 py-3 text-slate-500">
                                No subscription plans yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section className={card}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Subscriptions overview</h3>
                      <button className="text-sm text-indigo-700 underline" type="button" onClick={() => loadUsers()}>
                        Refresh
                      </button>
                    </div>
                    <div className="overflow-auto">
                      <table className="min-w-full text-sm">
                        <thead className="text-left text-xs uppercase text-slate-500 bg-slate-50">
                          <tr>
                            <th className="px-3 py-2">User</th>
                            <th className="px-3 py-2">Plan</th>
                            <th className="px-3 py-2">Status</th>
                            <th className="px-3 py-2">Start</th>
                            <th className="px-3 py-2">Expires</th>
                            <th className="px-3 py-2">Source</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.flatMap((u) => {
                            const subs = u.user_subscriptions || u.userSubscriptions || u.UserSubscriptions || [];
                            if (!subs.length) return [];
                            return subs.map((s) => (
                              <tr key={`${u.id}-${s.id}`} className="border-b border-slate-100">
                                <td className="px-3 py-2 text-slate-700">{u.email}</td>
                                <td className="px-3 py-2 text-slate-700">{s.service?.title || s.plan_id}</td>
                                <td className="px-3 py-2 text-slate-700">{s.status}</td>
                                <td className="px-3 py-2 text-slate-600">{s.started_at ? new Date(s.started_at).toLocaleDateString() : "n/a"}</td>
                                <td className="px-3 py-2 text-slate-600">{s.expires_at ? new Date(s.expires_at).toLocaleDateString() : "open"}</td>
                                <td className="px-3 py-2 text-slate-700">{s.source || "-"}</td>
                              </tr>
                            ));
                          })}
                          {users.every((u) => {
                            const subs = u.user_subscriptions || u.userSubscriptions || u.UserSubscriptions || [];
                            return subs.length === 0;
                          }) && (
                            <tr>
                              <td colSpan="6" className="px-3 py-3 text-slate-500">
                                No subscriptions yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section className={card}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">Grant subscription</h3>
                        <p className="text-sm text-slate-600">Zero-cost grant to activate a plan for a user.</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs bg-slate-100 text-slate-800 border border-slate-200">Admin grant</span>
                    </div>
                    <form onSubmit={handleGrantSubscription} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <select className={input} value={grantSubForm.userId} onChange={(e) => setGrantSubForm({ ...grantSubForm, userId: e.target.value })}>
                        <option value="">Select user</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.email}
                          </option>
                        ))}
                      </select>
                      <select className={input} value={grantSubForm.planId} onChange={(e) => setGrantSubForm({ ...grantSubForm, planId: e.target.value })}>
                        <option value="">Select plan</option>
                        {services.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title || s.id}
                          </option>
                        ))}
                      </select>
                      <select
                        className={input}
                        value={grantSubForm.interval || ""}
                        onChange={(e) => setGrantSubForm({ ...grantSubForm, interval: e.target.value })}
                      >
                        <option value="">Interval</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          className={input}
                          placeholder="Amount (defaults 0)"
                          value={grantSubForm.amount}
                          onChange={(e) => setGrantSubForm({ ...grantSubForm, amount: e.target.value })}
                          min="0"
                        />
                        <button className={`${button} bg-emerald-600`} type="submit">
                          Grant
                        </button>
                      </div>
                    </form>
                    <p className="text-xs text-slate-500">Creates a completed admin purchase with the selected plan.</p>
                  </section>
                </div>
              )}

            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
