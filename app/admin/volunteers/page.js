"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteFooter, SiteHeader } from "../../components/SiteChrome";
import styles from "./admin.module.css";

const statusOptions = ["pending", "approved", "rejected", "inactive"];
const rejectionReasons = [
  ["age_eligibility", "Age / eligibility"],
  ["recruitment_closed", "Recruitment closed"],
  ["incomplete_application", "Incomplete application"],
  ["role_fit", "Role / skills fit"],
  ["safeguarding", "Safeguarding / verification"],
  ["capacity", "Current programme capacity"],
  ["other", "Other documented reason"],
];

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
  const [savingId, setSavingId] = useState(null);
  const [reviewReason, setReviewReason] = useState("");
  const [reviewNote, setReviewNote] = useState("");

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

  function selectApplicant(item) {
    const opening = selectedId !== item.id;
    setSelectedId(opening ? item.id : null);
    if (opening) {
      setReviewReason(item.rejection_reason || "");
      setReviewNote(item.rejection_note || "");
    }
  }

  async function updateStatus(id, nextStatus) {
    if (nextStatus === "rejected") {
      const item = applications.find((entry) => entry.id === id);
      setSelectedId(id); setReviewReason(item?.rejection_reason || ""); setReviewNote(item?.rejection_note || "");
      return;
    }
    await saveReview(id, nextStatus, "", "");
  }

  async function saveReview(id, nextStatus, rejectionReason, rejectionNote) {
    setSavingId(id); setError("");
    try {
      const response = await fetch("/api/admin/volunteers", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: nextStatus, rejectionReason, rejectionNote }) });
      const data = await response.json();
      if (response.status === 401) { setAuthenticated(false); return; }
      if (!response.ok) throw new Error(data.error || "Unable to update application.");
      setApplications((current) => current.map((item) => item.id === id ? { ...item, ...data.volunteer } : item));
      setReviewReason(data.volunteer.rejection_reason || "");
      setReviewNote(data.volunteer.rejection_note || "");
    } catch (err) { setError(err.message); }
    finally { setSavingId(null); }
  }

  const categories = useMemo(() => [...new Set(applications.map((item) => item.category).filter(Boolean))].sort(), [applications]);
  const filtered = useMemo(() => applications.filter((item) => {
    const matchesStatus = status === "all" || item.status === status;
    const matchesCategory = category === "all" || item.category === category;
    const haystack = `${item.full_name} ${item.email} ${item.location} ${item.category} ${item.current_occupation || ""}`.toLowerCase();
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

  const activeCount = counts.approved || 0;
  const pendingCount = counts.pending || 0;

  return (
    <>
      <SiteHeader ctaLabel="Public site" ctaHref="/" />
      <main className={styles.page}><div className={styles.shell}>
        <div className={styles.topline}><span>VSI IMS <b>/</b> Volunteer Management</span><div><span className={styles.connected}><i /> Connected</span><button onClick={loadApplications}>Refresh ↻</button><button onClick={logout}>Log out ↪</button></div></div>

        <section className={styles.hero}>
          <div><p className="kicker light">PEOPLE &amp; DELIVERY</p><h1>Volunteer Management</h1><p>Manage VSI volunteers, readiness and recruitment across programmes and activities.</p></div>
          <div className={styles.heroOrb}><span>V</span></div>
        </section>

        <section className={styles.stats} aria-label="Volunteer overview">
          <button className={`${styles.stat} ${styles.statNavy}`} onClick={() => setStatus("approved")}><span className={styles.statIcon}>♟</span><small>ACTIVE VOLUNTEERS</small><strong>{activeCount}</strong><b>Approved volunteers</b><em>Current volunteer register</em></button>
          <button className={`${styles.stat} ${styles.statBlue}`} onClick={() => setStatus("pending")}><span className={styles.statIcon}>+</span><small>APPLICANTS</small><strong>{applications.length}</strong><b>Applications received</b><em>{pendingCount} awaiting review</em></button>
          <button className={`${styles.stat} ${styles.statYellow}`} onClick={() => setStatus("pending")}><span className={styles.statIcon}>↗</span><small>PENDING REVIEW</small><strong>{pendingCount}</strong><b>Need a decision</b><em>Review and document outcome</em></button>
          <button className={`${styles.stat} ${styles.statWhite}`} onClick={() => setStatus("all")}><span className={styles.statIcon}>#</span><small>REGISTER</small><strong>{applications.length}</strong><b>Total volunteer records</b><em>Applicants, approved, inactive and rejected</em></button>
        </section>

        <section className={styles.registerPanel}>
          <div className={styles.registerHeader}><div><p className="kicker">VOLUNTEER REGISTER</p><h2>Volunteers</h2></div><strong>{filtered.length} shown</strong></div>
          <div className={styles.toolbar}><div className={styles.searchWrap}><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, location, occupation..." aria-label="Search applications" /></div><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status"><option value="all">All statuses</option>{statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by volunteer area"><option value="all">All volunteer areas</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select><button className={styles.clearButton} onClick={() => { setQuery(""); setStatus("all"); setCategory("all"); }}>Clear</button></div>
          {error && <div className={styles.error}>{error}</div>}
          {loading ? <div className={styles.empty}>Loading volunteer register<span className={styles.loadingDots}>...</span></div> : filtered.length === 0 ? <div className={styles.empty}>No volunteer records match your filters.</div> : <div className={styles.list}>{filtered.map((item) => {
            const initials = item.full_name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
            const isSelected = selectedId === item.id;
            return <article className={`${styles.card} ${isSelected ? styles.cardSelected : ""}`} key={item.id}>
              <button className={styles.cardButton} onClick={() => selectApplicant(item)} aria-expanded={isSelected}>
                <div className={styles.cardMain}><div className={styles.avatar}>{initials}</div><div><h3>{item.full_name}</h3><p>{item.age ? `${item.age} years · ` : ""}{item.current_occupation || "Occupation not provided"} · {item.location}</p><p>{item.email} · {item.category}</p></div></div>
                <div className={styles.cardSide}><span className={`${styles.badge} ${styles[item.status]}`}>{item.status}</span><span className={styles.chevron}>{isSelected ? "−" : "+"}</span></div>
              </button>
              {isSelected && <div className={styles.details}>
                <div className={styles.detailGrid}>
                  <div><span>Full name</span><strong>{item.full_name}</strong></div><div><span>Age</span><strong>{item.age || "—"}</strong></div><div><span>Current occupation / status</span><strong>{item.current_occupation || "—"}</strong></div><div><span>Education / qualification</span><strong>{item.education || "—"}</strong></div><div><span>Email</span><a href={`mailto:${item.email}`}>{item.email}</a></div><div><span>Phone</span><a href={`tel:${item.phone}`}>{item.phone}</a></div><div><span>Location</span><strong>{item.location || "—"}</strong></div><div><span>Volunteer area</span><strong>{item.category || "—"}</strong></div><div><span>Availability</span><strong>{item.availability || "—"}</strong></div><div><span>Applied</span><strong>{new Date(item.created_at).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}</strong></div></div>
                <div className={styles.longFields}><div><span>Skills, experience &amp; qualifications</span><p>{item.skills || "—"}</p></div><div><span>Motivation</span><p>{item.motivation || "—"}</p></div><div><span>Emergency contact</span><p>{item.emergency_name || "—"} · {item.emergency_phone || "—"}</p></div></div>
                <div className={styles.reviewPanel}><div className={styles.reviewHeader}><div><span>APPLICATION DECISION</span><strong>Review &amp; document outcome</strong></div>{item.reviewed_at && <small>Reviewed {new Date(item.reviewed_at).toLocaleDateString()}</small>}</div><div className={styles.reviewControls}><label>Status<select value={item.status} onChange={(event) => updateStatus(item.id, event.target.value)}>{statusOptions.map((option) => <option key={option}>{option}</option>)}</select></label></div>
                  {item.status === "rejected" && <div className={styles.rejectionBox}><label>Reason for rejection *<select value={reviewReason} onChange={(event) => setReviewReason(event.target.value)}><option value="">Select a documented reason</option>{rejectionReasons.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label>Reviewer note (recommended)<textarea rows="3" value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="Briefly record the decision context and any useful follow-up." /></label><p className={styles.policyNote}>Record objective programme or eligibility reasons only. Do not use political affiliation, political opinion, ethnicity, religion or other protected characteristics as a rejection basis.</p><button className={styles.saveReview} disabled={savingId === item.id || !reviewReason} onClick={() => saveReview(item.id, "rejected", reviewReason, reviewNote)}>{savingId === item.id ? "Saving…" : "Save rejection decision"}</button></div>}
                  {item.status !== "rejected" && item.rejection_reason && <p className={styles.previousReason}>Previous rejection reason: {rejectionReasons.find(([value])=>value===item.rejection_reason)?.[1] || item.rejection_reason}</p>}
                </div>
              </div>}
            </article>;
          })}</div>}
        </section>
      </div></main>
      <SiteFooter />
    </>
  );
}
