"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteFooter, SiteHeader } from "../../components/SiteChrome";
import styles from "../volunteers/admin.module.css";

const TARGET = 6;

function percent(value) {
  return Math.min(100, Math.round((Number(value || 0) / TARGET) * 100));
}

function BarList({ items = [], limit = 8 }) {
  const rows = items.slice(0, limit);
  const max = Math.max(1, ...rows.map((item) => Number(item.hours || 0)));

  if (!rows.length) {
    return <div className={styles.empty}>No verified data yet.</div>;
  }

  return (
    <div className={styles.chart}>
      {rows.map((item, index) => {
        const width = Math.max(5, (Number(item.hours || 0) / max) * 100);
        return (
          <div className={styles.barRow} key={`${item.label}-${index}`}>
            <div className={styles.barLabel}>
              <span>{item.label}</span>
              <b>{Number(item.hours || 0).toFixed(2)} hrs</b>
            </div>
            <div className={styles.barTrack}>
              <i style={{ width: `${width}%` }} />
            </div>
            <small>
              {item.volunteers} volunteer{item.volunteers === 1 ? "" : "s"}
            </small>
          </div>
        );
      })}
    </div>
  );
}

export default function VolunteerPerformance() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      const response = await fetch("/api/admin/performance", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load report.");
      setData(result);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const volunteers = useMemo(() => data?.volunteers || [], [data]);

  if (!data) {
    return (
      <>
        <SiteHeader ctaLabel="Volunteer Register" ctaHref="/admin/volunteers" />
        <main className={styles.page}>
          <div className={styles.shell}>
            <div className={styles.topline}>
              <span>VSI IMS <b>/</b> Volunteer Performance</span>
              <button onClick={load}>Refresh ↻</button>
            </div>
            <div className={styles.empty}>{error || "Loading performance report…"}</div>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const summary = data.summary || {};
  const approved = Number(summary.approved || 0);
  const weekHours = Number(summary.week_hours || 0);
  const targetMet = Number(summary.target_met || 0);
  const belowTarget = Number(summary.below_target || 0);
  const totalHours = Number(summary.total_hours || 0);
  const targetRate = approved ? Math.round((targetMet / approved) * 100) : 0;
  const average = approved ? weekHours / approved : 0;

  return (
    <>
      <SiteHeader ctaLabel="Volunteer Register" ctaHref="/admin/volunteers" />
      <main className={styles.page}>
        <div className={styles.shell}>
          <div className={styles.topline}>
            <span>VSI IMS <b>/</b> Volunteer Performance</span>
            <button onClick={load}>Refresh ↻</button>
          </div>

          <section className={styles.hero}>
            <div>
              <p className="kicker light">HOURS &amp; PERFORMANCE</p>
              <h1>Volunteer Performance</h1>
              <p>Monitor verified volunteer hours against VSI&apos;s recommended six-hour weekly commitment.</p>
            </div>
          </section>

          {error && <div className={styles.error}>{error}</div>}

          <section className={styles.stats}>
            <div className={`${styles.stat} ${styles.statNavy}`}>
              <small>ACTIVE VOLUNTEERS</small>
              <strong>{approved}</strong>
              <b>Approved volunteers</b>
              <em>{Number(summary.pending || 0)} pending applications</em>
            </div>
            <div className={`${styles.stat} ${styles.statYellow}`}>
              <small>THIS WEEK</small>
              <strong>{weekHours.toFixed(2)}</strong>
              <b>Verified hours</b>
              <em>{average.toFixed(2)} average per active volunteer</em>
            </div>
            <div className={`${styles.stat} ${styles.statBlue}`}>
              <small>TARGET MET</small>
              <strong>{targetMet}</strong>
              <b>Volunteers at 6+ hrs</b>
              <em>{targetRate}% of active volunteers</em>
            </div>
            <div className={`${styles.stat} ${styles.statWhite}`}>
              <small>BELOW TARGET</small>
              <strong>{belowTarget}</strong>
              <b>Need attention</b>
              <em>Under the 6-hour weekly target</em>
            </div>
          </section>

          <section className={styles.analytics}>
            <div className={styles.analyticsHead}>
              <div>
                <p className="kicker">WEEKLY PERFORMANCE</p>
                <h2>Verified hours over the last 8 weeks</h2>
              </div>
              <strong>Target: 6 hrs / volunteer / week</strong>
            </div>
            <div className={styles.chart}>
              {(data.trend || []).map((item, index) => {
                const width = Math.max(4, Math.min(100, (Number(item.hours || 0) / Math.max(1, approved * TARGET)) * 100));
                return (
                  <div className={styles.barRow} key={String(item.week)}>
                    <div className={styles.barLabel}>
                      <span>Week {index + 1} · {item.week}</span>
                      <b>{Number(item.hours || 0).toFixed(2)} hrs</b>
                    </div>
                    <div className={styles.barTrack}>
                      <i style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={styles.analytics}>
            <div className={styles.analyticsHead}>
              <div>
                <p className="kicker">PROGRAMME REPORTING</p>
                <h2>Hours by programme</h2>
              </div>
              <strong>{totalHours.toFixed(2)} verified hours all time</strong>
            </div>
            <BarList items={data.programme} />
          </section>

          <section className={styles.analytics}>
            <div className={styles.analyticsHead}>
              <div>
                <p className="kicker">PROJECT REPORTING</p>
                <h2>Hours by project</h2>
              </div>
              <strong>Verified activity only</strong>
            </div>
            <BarList items={data.project} />
          </section>

          <section className={styles.registerPanel}>
            <div className={styles.registerHeader}>
              <div>
                <p className="kicker">VOLUNTEER PERFORMANCE</p>
                <h2>Weekly leaderboard</h2>
              </div>
              <strong>6 hrs target</strong>
            </div>
            <div className={styles.list}>
              {volunteers.slice(0, 15).map((volunteer) => {
                const value = Number(volunteer.week_hours || 0);
                const progress = percent(value);
                return (
                  <article className={styles.card} key={volunteer.id}>
                    <div className={styles.cardButton}>
                      <div className={styles.cardMain}>
                        <div className={styles.avatar}>
                          {volunteer.full_name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <h3>{volunteer.full_name}</h3>
                          <p>{volunteer.programme || "Programme not assigned"} · {volunteer.project || "Project not assigned"}</p>
                          <div className={styles.hoursTrack}>
                            <i style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className={styles.cardSide}>
                        <strong>{value.toFixed(2)} / 6 hrs</strong>
                        <span className={`${styles.badge} ${progress >= 100 ? styles.approved : styles.pending}`}>
                          {progress >= 100 ? "target met" : `${progress}%`}
                        </span>
                        <small>{Number(volunteer.total_hours || 0).toFixed(2)} hrs total · {Number(volunteer.activity_count || 0)} verified activities</small>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className={styles.registerPanel}>
            <div className={styles.registerHeader}>
              <div>
                <p className="kicker">QUICK ACTIONS</p>
                <h2>Continue managing volunteers</h2>
              </div>
            </div>
            <div className={styles.toolbar}>
              <a className={styles.saveReview} href="/admin/volunteers">Volunteer Register ↗</a>
              <a className={styles.saveReview} href="/admin/activities">Activity Register ↗</a>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
