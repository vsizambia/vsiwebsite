"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./admin.module.css";

const statusOptions = ["pending", "approved", "rejected", "inactive"];

export default function VolunteerAdmin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [applications, setApplications] = useState([]);
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadApplications() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/volunteers", { cache: "no-store" });
      const data = await response.json();
      if (response.status === 401) { setAuthenticated(false); return; }
      if (!response.ok) throw new Error(data.error || "Unable to load applications.");
      setAuthenticated(true); setApplications(data.applications || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadApplications(); }, []);

  async function login(event) {
    event.preventDefault(); setLoginError("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to sign in.");
      setPassword(""); setAuthenticated(true); loadApplications();
    } catch (err) { setLoginError(err.message); }
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthenticated(false); setApplications([]);
  }

  async function updateStatus(id, nextStatus) {
    const response = await fetch("/api/admin/volunteers", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: nextStatus }) });
    const data = await response.json();
    if (response.status === 401) { setAuthenticated(false); return; }
    if (!response.ok) { setError(data.error || "Unable to update status."); return; }
    setApplications((current) => current.map((item) => item.id === id ? { ...item, status: nextStatus } : item));
  }

  const filtered = useMemo(() => applications.filter((item) => {
    const matchesStatus = status === "all" || item.status === status;
    const haystack = `${item.full_name} ${item.email} ${item.location} ${item.category}`.toLowerCase();
    return matchesStatus && haystack.includes(query.toLowerCase());
  }), [applications, status, query]);

  const counts = statusOptions.reduce((acc, key) => ({ ...acc, [key]: applications.filter((item) => item.status === key).length }), {});

  if (!authenticated) return (
    <main className={styles.page}><div className={styles.shell}>
      <div className={styles.topline}><span>VSI VOLUNTEER MANAGEMENT</span></div>
      <header className={styles.header}><div><p className="kicker">ADMIN ACCESS</p><h1>Volunteer applications</h1><p>Sign in to review and manage volunteer applications.</p></div></header>
      <form onSubmit={login} style={{ maxWidth: 460 }}>
        <label htmlFor="admin-password">Admin password</label>
        <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        {loginError && <div className={styles.error}>{loginError}</div>}
        <button type="submit">Sign in</button>
      </form>
    </div></main>
  );

  return (
    <main className={styles.page}><div className={styles.shell}>
      <div className={styles.topline}><span>VSI VOLUNTEER MANAGEMENT</span><div><button onClick={loadApplications}>Refresh</button><button onClick={logout}>Sign out</button></div></div>
      <header className={styles.header}><div><p className="kicker">ADMIN</p><h1>Volunteer applications</h1><p>Review incoming applications and manage volunteer status.</p></div></header>
      <div className={styles.stats}><div><strong>{applications.length}</strong><span>Total</span></div><div><strong>{counts.pending || 0}</strong><span>Pending</span></div><div><strong>{counts.approved || 0}</strong><span>Approved</span></div><div><strong>{counts.rejected || 0}</strong><span>Rejected</span></div></div>
      <div className={styles.toolbar}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, location..." /><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option>{statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
      {error && <div className={styles.error}>{error}</div>}
      {loading ? <div className={styles.empty}>Loading applications...</div> : filtered.length === 0 ? <div className={styles.empty}>No applications found.</div> : <div className={styles.list}>{filtered.map((item) => <article className={styles.card} key={item.id}><div className={styles.cardMain}><div className={styles.avatar}>{item.full_name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div><div><h2>{item.full_name}</h2><p>{item.email} · {item.phone}</p><p>{item.location} · {item.category}</p></div></div><div className={styles.cardSide}><span className={`${styles.badge} ${styles[item.status]}`}>{item.status}</span><select value={item.status} onChange={(event) => updateStatus(item.id, event.target.value)}>{statusOptions.map((option) => <option key={option}>{option}</option>)}</select><small>{new Date(item.created_at).toLocaleDateString()}</small></div></article>)}</div>}
    </div></main>
  );
}
