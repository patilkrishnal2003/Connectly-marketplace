import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider";

const card = "bg-white border border-slate-200 shadow-sm rounded-2xl p-5 space-y-3";
const input = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200";
const button = "px-4 py-2 rounded-lg font-semibold text-white shadow hover:shadow-md transition";

export default function AdminPanel() {
  const { authFetch, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");
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
  const [updateUserForm, setUpdateUserForm] = useState({ userId: "", role: "user", password: "", name: "" });
  const [grantSubForm, setGrantSubForm] = useState({ userId: "", planId: "", startedAt: "", expiresAt: "" });
  const [dealForm, setDealForm] = useState({
    id: "",
    title: "",
    partner: "",
    coupon_code: "",
    link: "",
    locked_by_default: false,
    featured: false,
    type: ""
  });
  const [editingDealId, setEditingDealId] = useState("");
  const [serviceForm, setServiceForm] = useState({
    id: "",
    title: "",
    description: "",
    price: "",
    price_cents: "",
    billing_interval: "monthly",
    code: "",
    is_active: true
  });
  const [editingServiceId, setEditingServiceId] = useState("");

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
    e.preventDefault();
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

  async function handleUpdateUser(e) {
    e.preventDefault();
    if (!updateUserForm.userId) return;
    setMessage("");
    const payload = {};
    if (updateUserForm.role) payload.role = updateUserForm.role;
    if (updateUserForm.password) payload.password = updateUserForm.password;
    if (updateUserForm.name) payload.name = updateUserForm.name;

    const res = await authFetch(`/api/admin/users/${updateUserForm.userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) setFlash(json.error || "failed");
    else {
      setUpdateUserForm({ userId: "", role: "user", password: "", name: "" });
      setFlash("User updated");
      loadUsers();
    }
  }

  async function handleSaveDeal(e) {
    e.preventDefault();
    setMessage("");
    const payload = {
      id: dealForm.id,
      title: dealForm.title,
      partner: dealForm.partner,
      coupon_code: dealForm.coupon_code,
      link: dealForm.link,
      locked_by_default: !!dealForm.locked_by_default,
      featured: !!dealForm.featured,
      type: dealForm.type || undefined
    };

    let res;
    if (editingDealId) {
      res = await authFetch(`/api/admin/deals/${editingDealId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } else {
      res = await authFetch("/api/admin/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }

    const json = await res.json();
    if (!res.ok) setFlash(json.error || "failed");
    else {
      setDealForm({
        id: "",
        title: "",
        partner: "",
        coupon_code: "",
        link: "",
        locked_by_default: false,
        featured: false,
        type: ""
      });
      setEditingDealId("");
      setFlash(editingDealId ? "Deal updated" : "Deal saved");
      loadDeals();
    }
  }

  function handleEditDeal(deal) {
    setDealForm({
      id: deal.id,
      title: deal.title || "",
      partner: deal.partner || "",
      coupon_code: deal.coupon_code || "",
      link: deal.link || "",
      locked_by_default: !!deal.locked_by_default,
      featured: !!deal.featured,
      type: deal.type || ""
    });
    setEditingDealId(deal.id);
    setActiveSection("deals");
  }

  async function handleDeleteDeal(id) {
    if (!id) return;
    const confirmDelete = window.confirm("Delete this deal? This cannot be undone.");
    if (!confirmDelete) return;
    setMessage("");

    const res = await authFetch(`/api/admin/deals/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) setFlash(json.error || "failed");
    else {
      if (editingDealId === id) {
        setDealForm({
          id: "",
          title: "",
          partner: "",
          coupon_code: "",
          link: "",
          locked_by_default: false,
          featured: false,
          type: ""
        });
        setEditingDealId("");
      }
      setFlash("Deal deleted");
      loadDeals();
    }
  }

  async function handleSaveService(e) {
    e.preventDefault();
    setMessage("");
    const payload = {
      id: serviceForm.id,
      title: serviceForm.title,
      description: serviceForm.description,
      price: serviceForm.price === "" ? undefined : serviceForm.price,
      price_cents: serviceForm.price_cents === "" ? undefined : serviceForm.price_cents,
      billing_interval: serviceForm.billing_interval,
      code: serviceForm.code,
      is_active: !!serviceForm.is_active
    };

    let res;
    if (editingServiceId) {
      res = await authFetch(`/api/admin/services/${editingServiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } else {
      res = await authFetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }

    const json = await res.json();
    if (!res.ok) setFlash(json.error || "failed");
    else {
      setServiceForm({
        id: "",
        title: "",
        description: "",
        price: "",
        price_cents: "",
        billing_interval: "monthly",
        code: "",
        is_active: true
      });
      setEditingServiceId("");
      setFlash(editingServiceId ? "Subscription updated" : "Subscription plan saved");
      loadServices();
      loadUsers();
    }
  }

  function handleEditService(service) {
    setServiceForm({
      id: service.id,
      title: service.title || "",
      description: service.description || "",
      price: service.price ?? "",
      price_cents: service.price_cents ?? "",
      billing_interval: service.billing_interval || "monthly",
      code: service.code || "",
      is_active: service.is_active !== undefined ? service.is_active : true
    });
    setEditingServiceId(service.id);
    setActiveSection("subscriptions");
  }

  async function handleDeleteUser(id) {
    if (!id) return;
    const confirmDelete = window.confirm("Delete this user? This cannot be undone.");
    if (!confirmDelete) return;
    const res = await authFetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) setFlash(json.error || "failed");
    else {
      setFlash("User deleted");
      loadUsers();
    }
  }

  async function handleGrantSubscription(e) {
    e.preventDefault();
    if (!grantSubForm.userId || !grantSubForm.planId) return;
    const payload = {
      planId: grantSubForm.planId,
      status: "active",
      startedAt: grantSubForm.startedAt || undefined,
      expiresAt: grantSubForm.expiresAt || undefined,
      source: "admin_grant"
    };
    const res = await authFetch(`/api/admin/users/${grantSubForm.userId}/subscriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) setFlash(json.error || "failed");
    else {
      setGrantSubForm({ userId: "", planId: "", startedAt: "", expiresAt: "" });
      setFlash(json.refreshed ? "Subscription refreshed" : "Subscription granted");
      loadUsers();
    }
  }

  if (!user) return <div className="p-6">Loading...</div>;
  if (user.role !== "admin") return null;

  const activeNavClass = "flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow";
  const inactiveNavClass = "flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition";

  const handleNavClick = (id) => {
    setActiveSection(id);
    if (id === "deals") loadDeals();
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="flex">
            <aside className="w-64 border-r border-slate-200 bg-slate-50/80">
              <div className="px-4 py-4 border-b border-slate-200">
                <p className="text-xs uppercase tracking-wide text-slate-500">Admin</p>
                <p className="font-semibold">{user.email}</p>
                <p className="text-xs text-slate-500">Role: {user.role}</p>
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

            <main className="flex-1 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Admin console</h1>
                  <p className="text-sm text-slate-600">Manage users and their subscriptions.</p>
                </div>
                {message && (
                  <div className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
                    {message}
                  </div>
                )}
              </div>

              {activeSection === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <section className={card}>
                    <h3 className="text-lg font-semibold">Quick stats</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-slate-500 text-xs uppercase">Users</div>
                        <div className="text-xl font-bold">{users.length}</div>
                      </div>
                    </div>
                  </section>
                  <section className={card}>
                    <h3 className="text-lg font-semibold">Security notes</h3>
                    <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                      <li>Admin endpoints require auth + admin role.</li>
                      <li>User deletion confirmed explicitly.</li>
                      <li>Subscriptions granted here are zero-dollar admin grants.</li>
                    </ul>
                  </section>
                </div>
              )}

              {activeSection === "users" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <section className={card}>
                      <h3 className="text-lg font-semibold">Create user</h3>
                      <form onSubmit={handleCreateUser} className="space-y-3">
                        <input className={input} placeholder="Email" value={createUserForm.email} onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })} />
                        <input className={input} placeholder="Name" value={createUserForm.name} onChange={(e) => setCreateUserForm({ ...createUserForm, name: e.target.value })} />
                        <input type="password" className={input} placeholder="Password" value={createUserForm.password} onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })} />
                        <select className={input} value={createUserForm.role} onChange={(e) => setCreateUserForm({ ...createUserForm, role: e.target.value })}>
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button className={`${button} bg-indigo-600`}>Create user</button>
                      </form>
                    </section>

                    <section className={card}>
                      <h3 className="text-lg font-semibold">Update user / reset password</h3>
                      <form onSubmit={handleUpdateUser} className="space-y-3">
                        <select className={input} value={updateUserForm.userId} onChange={(e) => setUpdateUserForm({ ...updateUserForm, userId: e.target.value })}>
                          <option value="">Select user</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.email}
                            </option>
                          ))}
                        </select>
                        <input className={input} placeholder="Name (optional)" value={updateUserForm.name} onChange={(e) => setUpdateUserForm({ ...updateUserForm, name: e.target.value })} />
                        <select className={input} value={updateUserForm.role} onChange={(e) => setUpdateUserForm({ ...updateUserForm, role: e.target.value })}>
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                        <input type="password" className={input} placeholder="New password (optional)" value={updateUserForm.password} onChange={(e) => setUpdateUserForm({ ...updateUserForm, password: e.target.value })} />
                        <div className="flex gap-2">
                          <button className={`${button} bg-indigo-500`} type="submit">Save changes</button>
                          {updateUserForm.userId && (
                            <button type="button" className="px-4 py-2 rounded-lg font-semibold text-rose-700 border border-rose-200 bg-rose-50 hover:bg-rose-100" onClick={() => handleDeleteUser(updateUserForm.userId)}>
                              Delete user
                            </button>
                          )}
                        </div>
                      </form>
                    </section>
                  </div>

                  <section className={card}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">User list</h3>
                      <button className="text-sm text-indigo-700 underline" type="button" onClick={() => loadUsers()}>
                        Refresh
                      </button>
                    </div>
                    {usersError && (
                      <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {usersError}
                      </div>
                    )}
                    <div className="overflow-auto">
                      <table className="min-w-full text-sm">
                        <thead className="text-left text-xs uppercase text-slate-500 bg-slate-50">
                          <tr>
                            <th className="px-3 py-2">Email</th>
                            <th className="px-3 py-2">Name</th>
                            <th className="px-3 py-2">Role</th>
                            <th className="px-3 py-2">Created</th>
                            <th className="px-3 py-2">Subscription</th>
                            <th className="px-3 py-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u) => {
                            const sub = getActiveSubscription(u);
                            return (
                              <tr key={u.id} className="border-b border-slate-100">
                                <td className="px-3 py-2 font-semibold text-slate-900">{u.email}</td>
                                <td className="px-3 py-2 text-slate-700">{u.name || "?"}</td>
                                <td className="px-3 py-2 text-slate-700">{u.role}</td>
                                <td className="px-3 py-2 text-slate-600">{u.createdAt ? new Date(u.createdAt).toLocaleString() : "n/a"}</td>
                                <td className="px-3 py-2 text-slate-700">
                                  {sub ? (
                                    <div className="text-xs space-y-1">
                                      <div className="font-semibold">{sub.title} ({sub.code})</div>
                                      <div>Status: {sub.status}</div>
                                      <div>Start: {sub.started} | Exp: {sub.expires}</div>
                                      <div>Interval: {sub.interval}</div>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-slate-500">No subscription</span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  <button className="text-xs text-rose-600 underline" onClick={() => handleDeleteUser(u.id)}>
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                          {users.length === 0 && (
                            <tr>
                              <td colSpan="6" className="px-3 py-3 text-slate-500">
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
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{editingDealId ? "Edit deal" : "Create deal"}</h3>
                      <button className="text-sm text-indigo-700 underline" type="button" onClick={() => loadDeals()}>
                        Refresh
                      </button>
                    </div>
                    {dealsError && (
                      <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {dealsError}
                      </div>
                    )}
                    <form onSubmit={handleSaveDeal} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input className={input} placeholder="ID (unique)" value={dealForm.id} onChange={(e) => setDealForm({ ...dealForm, id: e.target.value })} required={!editingDealId} />
                      <input className={input} placeholder="Title" value={dealForm.title} onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })} />
                      <input className={input} placeholder="Partner" value={dealForm.partner} onChange={(e) => setDealForm({ ...dealForm, partner: e.target.value })} />
                      <input className={input} placeholder="Coupon code" value={dealForm.coupon_code} onChange={(e) => setDealForm({ ...dealForm, coupon_code: e.target.value })} />
                      <input className={input} placeholder="Link" value={dealForm.link} onChange={(e) => setDealForm({ ...dealForm, link: e.target.value })} />
                      <input className={input} placeholder="Type (e.g., standard/professional)" value={dealForm.type} onChange={(e) => setDealForm({ ...dealForm, type: e.target.value })} />
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input type="checkbox" checked={dealForm.locked_by_default} onChange={(e) => setDealForm({ ...dealForm, locked_by_default: e.target.checked })} />
                        Locked by default
                      </label>
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input type="checkbox" checked={dealForm.featured} onChange={(e) => setDealForm({ ...dealForm, featured: e.target.checked })} />
                        Featured
                      </label>
                      <div className="md:col-span-2 flex gap-2">
                        <button className={`${button} bg-indigo-600`} type="submit">
                          {editingDealId ? "Update deal" : "Save deal"}
                        </button>
                        {editingDealId && (
                          <button
                            type="button"
                            className="px-4 py-2 rounded-lg font-semibold text-slate-700 border border-slate-200 bg-white hover:bg-slate-50"
                            onClick={() => {
                              setDealForm({
                                id: "",
                                title: "",
                                partner: "",
                                coupon_code: "",
                                link: "",
                                locked_by_default: false,
                                featured: false,
                                type: ""
                              });
                              setEditingDealId("");
                            }}
                          >
                            Cancel edit
                          </button>
                        )}
                      </div>
                    </form>
                  </section>

                  <section className={card}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Deals list</h3>
                      <button className="text-sm text-indigo-700 underline" type="button" onClick={() => loadDeals()}>
                        Refresh
                      </button>
                    </div>
                    <div className="overflow-auto">
                      <table className="min-w-full text-sm">
                        <thead className="text-left text-xs uppercase text-slate-500 bg-slate-50">
                          <tr>
                            <th className="px-3 py-2">ID</th>
                            <th className="px-3 py-2">Title</th>
                            <th className="px-3 py-2">Partner</th>
                            <th className="px-3 py-2">Featured</th>
                            <th className="px-3 py-2">Locked</th>
                            <th className="px-3 py-2">Type</th>
                            <th className="px-3 py-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deals.map((d) => (
                            <tr key={d.id} className="border-b border-slate-100">
                              <td className="px-3 py-2 text-slate-700">{d.id}</td>
                              <td className="px-3 py-2 font-semibold text-slate-900">{d.title}</td>
                              <td className="px-3 py-2 text-slate-700">{d.partner || "-"}</td>
                              <td className="px-3 py-2 text-slate-700">{d.featured ? "Yes" : "No"}</td>
                              <td className="px-3 py-2 text-slate-700">{d.locked_by_default ? "Yes" : "No"}</td>
                              <td className="px-3 py-2 text-slate-700">{d.type || "-"}</td>
                              <td className="px-3 py-2 text-right">
                                <div className="flex items-center gap-2 justify-end">
                                  <button className="text-xs text-indigo-700 underline" onClick={() => handleEditDeal(d)}>
                                    Edit
                                  </button>
                                  <button className="text-xs text-rose-700 underline" onClick={() => handleDeleteDeal(d.id)}>
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {deals.length === 0 && (
                            <tr>
                              <td colSpan="7" className="px-3 py-3 text-slate-500">
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
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{editingServiceId ? "Edit subscription plan" : "Add subscription plan"}</h3>
                      <button className="text-sm text-indigo-700 underline" type="button" onClick={() => loadServices()}>
                        Refresh
                      </button>
                    </div>
                    {servicesError && (
                      <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {servicesError}
                      </div>
                    )}
                    <form onSubmit={handleSaveService} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input className={input} placeholder="Plan ID (unique)" value={serviceForm.id} onChange={(e) => setServiceForm({ ...serviceForm, id: e.target.value })} required={!editingServiceId} />
                      <input className={input} placeholder="Title" value={serviceForm.title} onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })} />
                      <input className={input} placeholder="Display code (optional)" value={serviceForm.code} onChange={(e) => setServiceForm({ ...serviceForm, code: e.target.value })} />
                      <select className={input} value={serviceForm.billing_interval} onChange={(e) => setServiceForm({ ...serviceForm, billing_interval: e.target.value })}>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                      <input type="number" className={input} placeholder="Price" value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })} />
                      <input type="number" className={input} placeholder="Price (cents)" value={serviceForm.price_cents} onChange={(e) => setServiceForm({ ...serviceForm, price_cents: e.target.value })} />
                      <textarea className={`${input} min-h-[90px]`} placeholder="Description / validity notes" value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} />
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input type="checkbox" checked={serviceForm.is_active} onChange={(e) => setServiceForm({ ...serviceForm, is_active: e.target.checked })} />
                        Active
                      </label>
                      <div className="md:col-span-2 flex gap-2">
                        <button className={`${button} bg-indigo-600`} type="submit">
                          {editingServiceId ? "Update plan" : "Save plan"}
                        </button>
                        {editingServiceId && (
                          <button
                            type="button"
                            className="px-4 py-2 rounded-lg font-semibold text-slate-700 border border-slate-200 bg-white hover:bg-slate-50"
                            onClick={() => {
                              setServiceForm({
                                id: "",
                                title: "",
                                description: "",
                                price: "",
                                price_cents: "",
                                billing_interval: "monthly",
                                code: "",
                                is_active: true
                              });
                              setEditingServiceId("");
                            }}
                          >
                            Cancel edit
                          </button>
                        )}
                      </div>
                    </form>
                  </section>

                  <section className={card}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Subscription plans</h3>
                      <button className="text-sm text-indigo-700 underline" type="button" onClick={() => loadServices()}>
                        Refresh
                      </button>
                    </div>
                    <div className="overflow-auto">
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
                          {services.map((s) => (
                            <tr key={s.id} className="border-b border-slate-100">
                              <td className="px-3 py-2 text-slate-700">{s.id}</td>
                              <td className="px-3 py-2 font-semibold text-slate-900">{s.title}</td>
                              <td className="px-3 py-2 text-slate-700">{s.billing_interval || "-"}</td>
                              <td className="px-3 py-2 text-slate-700">
                                {s.price !== undefined && s.price !== null ? `INR ${s.price}` : s.price_cents !== undefined && s.price_cents !== null ? `${s.price_cents} cents` : "-"}
                              </td>
                              <td className="px-3 py-2 text-slate-700">{s.is_active ? "Yes" : "No"}</td>
                              <td className="px-3 py-2 text-slate-700 max-w-xs truncate">{s.description || "-"}</td>
                              <td className="px-3 py-2 text-right">
                                <button className="text-xs text-indigo-700 underline" onClick={() => handleEditService(s)}>
                                  Edit
                                </button>
                              </td>
                            </tr>
                          ))}
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
                    <h3 className="text-lg font-semibold">Grant subscription (zero-cost)</h3>
                    <form onSubmit={handleGrantSubscription} className="space-y-3">
                      <select className={input} value={grantSubForm.userId} onChange={(e) => setGrantSubForm({ ...grantSubForm, userId: e.target.value })}>
                        <option value="">Select user</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.email}
                          </option>
                        ))}
                      </select>
                      <input className={input} placeholder="Plan ID" value={grantSubForm.planId} onChange={(e) => setGrantSubForm({ ...grantSubForm, planId: e.target.value })} />
                      <input type="date" className={input} value={grantSubForm.startedAt} onChange={(e) => setGrantSubForm({ ...grantSubForm, startedAt: e.target.value })} />
                      <input type="date" className={input} value={grantSubForm.expiresAt} onChange={(e) => setGrantSubForm({ ...grantSubForm, expiresAt: e.target.value })} />
                      <button className={`${button} bg-emerald-600`}>Grant/Refresh subscription</button>
                    </form>
                    <p className="text-xs text-slate-500">Subscriptions here are treated as $0 admin grants.</p>
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

