"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "../../components/SiteChrome";
import styles from "./impact.module.css";

export default function ImpactAdminPage() {
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authenticated, setAuthenticated] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/impact", { cache: "no-store" });
      const data = await response.json();
      if (response.status === 401) { setAuthenticated(false); return; }
      if (!response.ok) throw new Error(data.error || "Unable to load Impact cards.");
      setProgrammes(data.programmes || []);
      setAuthenticated(true);
    } catch (e) {
      setError(e.message || "Unable to load Impact cards.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function updateProgramme(index, field, value) {
    setProgrammes((current) => current.map((item, i) => i === index ? { ...item, [field]: value } : item));
    setNotice("");
  }

  function updateMetric(programmeIndex, metricIndex, field, value) {
    setProgrammes((current) => current.map((programme, i) => i !== programmeIndex ? programme : {
      ...programme,
      metrics: programme.metrics.map((metric, j) => j === metricIndex ? { ...metric, [field]: value } : metric),
    }));
    setNotice("");
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = { programmes: programmes.map((programme) => ({
        ...programme,
        metrics: programme.metrics.map((metric) => ({ ...metric, value: metric.value === "" || metric.value === null || metric.value === undefined ? null : Number(metric.value) })),
      })) };
      const response = await fetch("/api/admin/impact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.status === 401) { setAuthenticated(false); throw new Error("Your admin session has expired. Please return to Admin and sign in again."); }
      if (!response.ok) throw new Error(data.error || "Unable to save Impact cards.");
      setProgrammes(data.programmes || []);
      setNotice("Impact cards saved. The public Impact page will show the updated figures.");
    } catch (e) {
      setError(e.message || "Unable to save Impact cards.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <SiteHeader ctaLabel="Administration" ctaHref="/admin" />
      <main className={styles.page}>
        <div className={styles.shell}>
          <div className={styles.breadcrumb}><Link href="/admin">← Admin dashboard</Link><span> / Impact & Evidence</span></div>
          <header className={styles.hero}>
            <div><p className={styles.eyebrow}>CONTENT MANAGEMENT</p><h1>Impact & Evidence</h1><p>Update programme descriptions and the figures displayed on the public Impact page.</p></div>
            <span className={styles.heroMark}>IM</span>
          </header>
          {!authenticated ? (
            <section className={styles.message}><h2>Admin sign-in required</h2><p>Your secure session is missing or has expired.</p><Link href="/admin">Return to VSI Admin to sign in</Link></section>
          ) : loading ? (
            <section className={styles.message}>Loading Impact cards…</section>
          ) : (
            <form className={styles.form} onSubmit={save}>
              {error && <div className={styles.error} role="alert">{error}</div>}
              {notice && <div className={styles.notice} role="status">{notice}</div>}
              {programmes.map((programme, index) => (
                <section className={styles.card} key={programme.programme_key}>
                  <div className={styles.cardHead}>
                    <span className={styles.number}>{programme.number}</span>
                    <div><p className={styles.cardEyebrow}>PROGRAMME CARD {programme.number}</p><h2>{programme.title}</h2></div>
                  </div>
                  <div className={styles.fields}>
                    <label>Card title<input value={programme.title} maxLength={120} onChange={(e) => updateProgramme(index, "title", e.target.value)} required /></label>
                    <label>Category label<input value={programme.category} maxLength={80} onChange={(e) => updateProgramme(index, "category", e.target.value)} required /></label>
                    <label className={styles.full}>Description<textarea value={programme.description} maxLength={500} rows={3} onChange={(e) => updateProgramme(index, "description", e.target.value)} required /></label>
                  </div>
                  <div className={styles.metricHeading}><h3>Impact figures</h3><span>Leave a figure blank if it is not yet verified.</span></div>
                  <div className={styles.metrics}>
                    {programme.metrics.map((metric, metricIndex) => (
                      <div className={styles.metric} key={metric.key}>
                        <label>Metric label<input value={metric.label} maxLength={90} onChange={(e) => updateMetric(index, metricIndex, "label", e.target.value)} required /></label>
                        <label>Figure<input type="number" min="0" step="1" inputMode="numeric" placeholder="Not entered" value={metric.value ?? ""} onChange={(e) => updateMetric(index, metricIndex, "value", e.target.value)} /></label>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
              <div className={styles.footerActions}>
                <p>Changes are published to the public Impact page when you save.</p>
                <button type="submit" disabled={saving || loading || programmes.length !== 4}>{saving ? "Saving changes…" : "Save and publish impact cards"}</button>
              </div>
            </form>
          )}
          {error && (!authenticated || loading) && <div className={styles.error} role="alert">{error}</div>}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
