"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteFooter, SiteHeader } from "../../components/SiteChrome";
import styles from "./admin.module.css";

const statusOptions = ["pending", "approved", "rejected", "inactive"];

export default function VolunteerAdmin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [applications, setApplications] = useState([]);
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
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
    setAuthenticated(false); setApplications([]); setSelectedId(null); setError("");
  }

  async function updateStatus(id, nextStatus) {
    const response = await fetch("/api/admin/volunteers", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: nextStatus }) });
    const data = await response.json();
    if (response.status === 401) { setAuthenticated(false); return; }
    if (!response.ok) { setError(data.error || "Unable to update status."); return; }
    setApplications((current) => current.map((item) => item.id === id ? { ...item, status: nextStatus } : item));
  }

  const categories = useMemo(() => [...new Set(applications.map((item) => item.category).filter(Boolean))].sort(), [applications]);
  const filtered = useMemo(() => applications.filter((item) => {
    const matchesStatus = status === "all" || item.status === status;
    const matchesCategory = category === "all" || item.category === category;
    const haystack = `${item.full_name} ${item.email} ${item.location} ${item.category}`.toLowerCase();
    return matchesStatus && matchesCategory && haystack.includes(query.toLowerCase());
  }), [applications, status, category, query]);
  const counts = statusOptions.reduce((acc, key) => ({ ...acc, [key]: applications.filter((item) => item.status === key).length }), {});
  const selected = applications.find((item) => item.id === selectedId);

  if (!authenticated) return (
    <>
      <SiteHeader ctaLabel="Back to site" ctaHref="/" />
      <main className={styles.loginPage}><div className={styles.loginShell}>
        <div className={styles.loginMark}>VSI</div>
        <p className="kicker">ADMIN ACCESS</p><h1>Volunteer applications</h1>
        <p>Sign in to review and manage volunteer applications.</p>
        <form onSubmit={login} className={styles.loginForm}>
          <label htmlFor="admin-password">Admin password</label>
          <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {loginError && <div className={styles.error}>{loginError}</div>}
          <button type="submit">Sign in <span aria-hidden="true">↗</span></button>
        </form>
      </div></main>
      <SiteFooter />
    </>
  );

  return (
    <>
      <SiteHeader ctaLabel="Public site" ctaHref="/" />
      <main className={styles.page}><div className={styles.shell}>
        <div className={styles.topline}><span>VSI VOLUNTEER MANAGEMENT</span><div className={styles.topActions}><button onClick={loadApplications}>Refresh <span aria-hidden="true">↻</span></button><button className={styles.logoutButton} onClick={logout}>Log out <span aria-hidden="true">↪</span></button></div></div>
        <header className={styles.header}><div><p className="kicker">ADMIN · PEOPLE &amp; COMMUNITY</p><h1>Volunteer applications</h1><p>Review incoming applications, explore applicant details and manage volunteer status.</p></div><div className={styles.headerBadge}><span>LIVE</span><small>Application pipeline</small></div></header>
        <div className={styles.stats}>
          <button className={styles.stat} onClick={() => setStatus("all")}><strong>{applications.length}</strong><span>Total applications</span></button>
          <button className={styles.stat} onClick={() => setStatus("pending")}><strong>{counts.pending || 0}</strong><span>Pending review</span></button>
          <button className={styles.stat} onClick={() => setStatus("approved")}><strong>{counts.approved || 0}</strong><span>Approved</span></button>
          <button className={styles.stat} onClick={() => setStatus("rejected")}><strong>{counts.rejected || 0}</strong><span>Rejected</span></button>
        </div>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, location..." aria-label="Search applications" /></div>
          <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status"><option value="all">All statuses</option>{statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by volunteer area"><option value="all">All volunteer areas</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.resultsBar}><span>{filtered.length} {filtered.length === 1 ? "application" : "applications"}</span><button onClick={() => { setQuery(""); setStatus("all"); setCategory("all"); }}>Clear filters</button></div>
        {loading ? <div className={styles.empty}>Loading applications<span className={styles.loadingDots}>...</span></div> : filtered.length === 0 ? <div className={styles.empty}>No applications match your filters.</div> : <div className={styles.list}>{filtered.map((item) => {
          const initials = item.full_name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
          const isSelected = selectedId === item.id;
          return <article className={`${styles.card} ${isSelected ? styles.cardSelected : ""}`} key={item.id}>
            <button className={styles.cardButton} onClick={() => setSelectedId(isSelected ? null : item.id)} aria-expanded={isSelected}>
              <div className={styles.cardMain}><div className={styles.avatar}>{initials}</div><div><h2>{item.full_name}</h2><p>{item.email} · {item.phone}</p><p>{item.location} · {item.category}</p></div></div>
              <div className={styles.cardSide}><span className={`${styles.badge} ${styles[item.status]}`}>{item.status}</span><span className={styles.chevron} aria-hidden="true">{isSelected ? "−" : "+"}</span></div>
            </button>
            {isSelected && <div className={styles.details}>
              <div className={styles.detailGrid}><div><span>Full name</span><strong>{item.full_name}</strong></div><div><span>Email</span><a href={`mailto:${item.email}`}>{item.email}</a></div><div><span>Phone</span><a href={`tel:${item.phone}`}>{item.phone}</a></div><div><span>Location</span><strong>{item.location || "—"}</strong></div><div><span>Volunteer area</span><strong>{item.category || "—"}</strong></div><div><span>Applied</span><strong>{new Date(item.created_at).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}</strong></div></div>
              <div className={styles.detailActions}><label htmlFor={`status-${item.id}`}>Application status</label><select id={`status-${item.id}`} value={item.status} onChange={(event) => updateStatus(item.id, event.target.value)}>{statusOptions.map((option) => <option key={option}>{option}</option>)}</select></div>
            </div>}
          </article>;
        })}</div>}
      </div></main>
      <SiteFooter />
    </>
  );
}
