"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./portal.module.css";

const money = value => new Intl.NumberFormat("en-ZM",{style:"currency",currency:"ZMW",maximumFractionDigits:2}).format(Number(value)||0);
const monthLabel = value => {
  if (!value) return "—";
  const d = new Date(`${value}-01T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? value : new Intl.DateTimeFormat("en-GB",{month:"long",year:"numeric",timeZone:"UTC"}).format(d);
};
const dateLabel = value => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : new Intl.DateTimeFormat("en-GB",{day:"2-digit",month:"short",year:"numeric",timeZone:"Africa/Lusaka"}).format(d);
};
const listValue = value => Array.isArray(value) ? value.join(", ") : typeof value === "string" ? value : "—";

export default function VolunteerPortalClient() {
  const [volunteerId,setVolunteerId] = useState("");
  const [email,setEmail] = useState("");
  const [challengeId,setChallengeId] = useState("");
  const [code,setCode] = useState("");
  const [phase,setPhase] = useState("loading");
  const [message,setMessage] = useState("");
  const [busy,setBusy] = useState(false);
  const [volunteer,setVolunteer] = useState(null);
  const [statement,setStatement] = useState(null);
  const [tab,setTab] = useState("overview");

  const loadPortal = useCallback(async () => {
    const response = await fetch("/api/volunteer-portal/session",{cache:"no-store"});
    if (!response.ok) { setPhase("login"); return; }
    const data = await response.json();
    setVolunteer(data.volunteer);
    const statementResponse = await fetch("/api/volunteer-portal/statement",{cache:"no-store"});
    if (statementResponse.ok) {
      const statementData = await statementResponse.json();
      setStatement(statementData.statement);
    } else {
      const statementData = await statementResponse.json().catch(()=>({}));
      setMessage(statementData.error || "Your contribution statement could not be loaded.");
    }
    setPhase("portal");
  },[]);

  useEffect(() => { loadPortal().catch(()=>{setPhase("login");}); },[loadPortal]);

  async function requestCode(event) {
    event.preventDefault();
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/volunteer-portal/request-code",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({volunteerId,email})});
      const data = await response.json();
      if (!response.ok) { setMessage(data.error || data.message || "We could not start verification. Please try again."); return; }
      if (!data.challengeId) { setMessage("Too many attempts. Please wait before requesting another code."); return; }
      setChallengeId(data.challengeId);
      setPhase("verify");
      setMessage("If the details match an approved VSI volunteer record, a verification code has been sent to the registered email address.");
    } catch { setMessage("Connection problem. Please try again."); }
    finally { setBusy(false); }
  }

  async function verifyCode(event) {
    event.preventDefault();
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/volunteer-portal/verify-code",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({challengeId,code})});
      const data = await response.json();
      if (!response.ok) { setMessage(data.error || "The code could not be verified."); return; }
      setCode(""); setMessage(""); setPhase("loading");
      await loadPortal();
    } catch { setMessage("Connection problem. Please try again."); }
    finally { setBusy(false); }
  }

  async function signOut() {
    setBusy(true);
    try { await fetch("/api/volunteer-portal/logout",{method:"POST"}); }
    finally { setVolunteer(null); setStatement(null); setChallengeId(""); setCode(""); setPhase("login"); setMessage("You have signed out."); setBusy(false); }
  }

  const assigned = useMemo(() => [
    ["Directorate",volunteer?.directorate],
    ["Programme",listValue(volunteer?.programme)],
    ["Project",listValue(volunteer?.project)],
    ["Activity",listValue(volunteer?.activity)],
  ].filter(([,v])=>v && v!=="—"),[volunteer]);

  if (phase === "loading") return <main className={styles.page}><div className={styles.shell}><a className={styles.brand} href="/volunteer">VSI <span>VOLUNTEER PORTAL</span></a><div className={styles.loading}>Loading your secure portal…</div></div></main>;

  if (phase === "login" || phase === "verify") return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <a className={styles.brand} href="/volunteer">VSI <span>VOLUNTEER PORTAL</span></a>
        <section className={styles.authCard}>
          <div className={styles.eyebrow}>VISIONARY STUDENTS INITIATIVE</div>
          <h1>{phase === "verify" ? "Check your email" : "Welcome back, volunteer."}</h1>
          <p className={styles.lede}>{phase === "verify" ? "Enter the six-digit verification code sent to your registered email. The code expires after 10 minutes." : "Sign in securely to view your volunteer profile and membership contribution statement."}</p>
          {phase === "login" ? (
            <form className={styles.form} onSubmit={requestCode}>
              <label>VSI Volunteer ID<input value={volunteerId} onChange={e=>setVolunteerId(e.target.value.toUpperCase())} autoComplete="username" placeholder="e.g. VSIV001" required maxLength={32}/></label>
              <label>Registered email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" placeholder="The email used in your application" required maxLength={254}/></label>
              <button disabled={busy} type="submit">{busy ? "Requesting code…" : "Email me a verification code"} <span aria-hidden="true">→</span></button>
            </form>
          ) : (
            <form className={styles.form} onSubmit={verifyCode}>
              <label>Six-digit verification code<input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="000000" required/></label>
              <button disabled={busy || code.length!==6} type="submit">{busy ? "Verifying…" : "Verify and sign in"} <span aria-hidden="true">→</span></button>
              <button className={styles.secondaryButton} type="button" disabled={busy} onClick={()=>{setPhase("login");setCode("");setMessage("");}}>Back to sign in</button>
            </form>
          )}
          {message && <p className={styles.notice} role="status">{message}</p>}
          <p className={styles.privacy}>For your protection, access is limited to approved volunteers and codes are single-use. Never share your verification code.</p>
        </section>
        <a className={styles.backLink} href="/volunteer">← Back to VSI volunteering</a>
      </div>
    </main>
  );

  return (
    <main className={styles.page}>
      <div className={styles.dashboardShell}>
        <header className={styles.topbar}>
          <a className={styles.brand} href="/volunteer">VSI <span>VOLUNTEER PORTAL</span></a>
          <button className={styles.signOut} onClick={signOut} disabled={busy}>Sign out</button>
        </header>
        <section className={styles.welcome}>
          <div><div className={styles.eyebrow}>YOUR VSI ACCOUNT</div><h1>Hello, {volunteer?.full_name?.split(" ")[0] || "volunteer"}.</h1><p>Your volunteer profile and membership contribution summary.</p></div>
          <div className={styles.idCard}><span>VOLUNTEER ID</span><strong>{volunteer?.volunteer_id || "—"}</strong><small>Status: {volunteer?.status || "Approved"}</small></div>
        </section>
        <nav className={styles.tabs} aria-label="Volunteer portal sections">
          <button className={tab==="overview"?styles.activeTab:""} onClick={()=>setTab("overview")}>Overview</button>
          <button className={tab==="finance"?styles.activeTab:""} onClick={()=>setTab("finance")}>Contribution statement</button>
        </nav>
        {message && <p className={styles.notice} role="status">{message}</p>}
        {tab==="overview" ? (
          <>
            <section className={styles.metrics}>
              <article><span>MONTHLY CONTRIBUTION</span><strong>{money(30)}</strong><small>Per calendar month</small></article>
              <article><span>TOTAL EXPECTED</span><strong>{money(statement?.expectedTotal)}</strong><small>{statement?.monthsExpected ?? 0} contribution months</small></article>
              <article><span>RECORDED PAYMENTS</span><strong>{money(statement?.paidTotal)}</strong><small>From VSI finance records</small></article>
              <article><span>OUTSTANDING</span><strong>{money(statement?.outstanding)}</strong><small>{statement?.credit>0 ? `Credit: ${money(statement.credit)}` : "Based on records currently available"}</small></article>
            </section>
            <section className={styles.contentGrid}>
              <article className={styles.panel}>
                <div className={styles.panelHeading}><div><div className={styles.eyebrow}>VOLUNTEER PROFILE</div><h2>Your details</h2></div></div>
                <dl className={styles.details}>
                  <div><dt>Full name</dt><dd>{volunteer?.full_name || "—"}</dd></div>
                  <div><dt>Registered email</dt><dd>{volunteer?.email || "—"}</dd></div>
                  <div><dt>Application submitted</dt><dd>{dateLabel(volunteer?.created_at)}</dd></div>
                  <div><dt>Current occupation</dt><dd>{volunteer?.current_occupation || "—"}</dd></div>
                  <div><dt>Education</dt><dd>{volunteer?.education || "—"}</dd></div>
                  <div><dt>Skills</dt><dd>{volunteer?.skills || "—"}</dd></div>
                  <div><dt>Availability</dt><dd>{volunteer?.availability || "—"}</dd></div>
                  <div><dt>Hours per week</dt><dd>{volunteer?.hours_per_week ? `${volunteer.hours_per_week} hours` : "—"}</dd></div>
                </dl>
              </article>
              <article className={styles.panel}>
                <div className={styles.eyebrow}>YOUR ASSIGNMENT</div><h2>Programme placement</h2>
                {assigned.length ? <dl className={styles.details}>{assigned.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl> : <p className={styles.muted}>No programme placement details are currently recorded on your profile. Contact VSI administration if you believe this is incorrect.</p>}
                <div className={styles.callout}><strong>Need to update your details?</strong><p>Contact VSI administration so changes can be reviewed and reflected in the official record.</p><a href="mailto:vsizambia@gmail.com">Contact VSI →</a></div>
              </article>
            </section>
          </>
        ) : (
          <section className={styles.panel}>
            <div className={styles.statementHeading}><div><div className={styles.eyebrow}>MEMBERSHIP FINANCE</div><h2>Your contribution statement</h2><p>Expected contributions start in the month your application was submitted and run through the current calendar month.</p></div><button className={styles.refresh} onClick={()=>{setPhase("loading");loadPortal().then(()=>setTab("finance")).catch(()=>setPhase("portal"));}}>Refresh statement</button></div>
            {statement ? <>
              <div className={styles.statementTotals}>
                <div><span>Contribution period</span><strong>{monthLabel(statement.firstContributionMonth)} – {monthLabel(statement.throughMonth)}</strong></div>
                <div><span>Expected</span><strong>{money(statement.expectedTotal)}</strong></div>
                <div><span>Payments recorded</span><strong>{money(statement.paidTotal)}</strong></div>
                <div><span>Balance outstanding</span><strong>{money(statement.outstanding)}</strong></div>
              </div>
              <div className={styles.tableWrap}><table><thead><tr><th>Contribution month</th><th>Expected</th><th>Paid</th><th>Balance</th><th>Status</th><th>Payment reference</th></tr></thead><tbody>{statement.months.map(row=><tr key={row.month}><td>{monthLabel(row.month)}</td><td>{money(row.amountDue)}</td><td>{money(row.amountPaid)}</td><td>{money(row.balance)}</td><td><span className={row.status==="Paid"?styles.paid:row.status==="Part-paid"?styles.partial:styles.unpaid}>{row.status}</span></td><td>{row.reference || "—"}</td></tr>)}</tbody></table></div>
              {statement.credit>0 && <p className={styles.notice}>Your recorded payments exceed expected contributions by {money(statement.credit)}. Please contact VSI administration to reconcile this credit.</p>}
              <p className={styles.disclaimer}>{statement.adjustmentNote} This is a read-only statement, not a payment receipt. If a payment is missing or a figure appears incorrect, contact VSI administration for reconciliation.</p>
            </> : <p className={styles.muted}>The contribution statement could not be loaded. Please refresh the page or try again later.</p>}
          </section>
        )}
        <footer className={styles.footer}>© 2026 Visionary Students Initiative <a href="/privacy-policy">Privacy Policy</a><a href="/volunteer">Volunteer information</a></footer>
      </div>
    </main>
  );
}
