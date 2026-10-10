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
const listValue = value => {
  if (Array.isArray(value)) return value.map(item => String(item ?? "").trim()).filter(Boolean).join(", ") || "—";
  if (value === null || value === undefined) return "—";
  if (typeof value !== "string") return String(value);
  const text = value.trim();
  if (!text) return "—";
  if ((text.startsWith("[") && text.endsWith("]")) || (text.startsWith('"') && text.endsWith('"'))) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed.map(item => String(item ?? "").trim()).filter(Boolean).join(", ") || "—";
      if (typeof parsed === "string") return parsed.trim() || "—";
    } catch {}
  }
  return text;
};

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
  const [profileDetails,setProfileDetails] = useState(null);
  const [tab,setTab] = useState("overview");

  const loadPortal = useCallback(async () => {
    const response = await fetch("/api/volunteer-portal/session",{cache:"no-store"});
    if (!response.ok) { setPhase("login"); return; }
    const data = await response.json();
    setVolunteer(data.volunteer);
    const detailResponse = await fetch("/api/volunteer-portal/profile-details",{cache:"no-store"});
    setProfileDetails(detailResponse.ok ? await detailResponse.json() : null);
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

  async function resendCode() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/volunteer-portal/request-code",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({volunteerId,email})});
      const data = await response.json();
      if (!response.ok) { setMessage(data.error || data.message || "We could not send another code. Please try again."); return; }
      if (!data.challengeId) { setMessage("Too many attempts. Please wait before requesting another code."); return; }
      setChallengeId(data.challengeId);
      setCode("");
      setMessage("A new verification request has been made. Use the newest code email if it arrives; codes expire after 10 minutes.");
    } catch {
      setMessage("Connection problem. Please try requesting another code.");
    } finally {
      setBusy(false);
    }
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
    finally { setVolunteer(null); setStatement(null); setProfileDetails(null); setChallengeId(""); setCode(""); setPhase("login"); setMessage("You have signed out."); setBusy(false); }
  }

  const assigned = useMemo(() => [
    ["Directorate",volunteer?.directorate],
    ["Programme",listValue(volunteer?.programme)],
    ["Project",listValue(volunteer?.project)],
    ["Activity",listValue(volunteer?.activity)],
  ].filter(([,v])=>v && v!=="—"),[volunteer]);

  const profileSections = [
    ["Identity and contact", [["VSI ID","volunteer_id"],["Full name","full_name"],["Status","status"],["Email","email"],["Phone","phone"],["Date of birth","age"],["Nationality","nationality"],["Gender","gender"],["Faith","faith"]]],
    ["Location", [["Province","province"],["District","district"],["Constituency","constituency"],["Ward","ward"],["Location","location"]]],
    ["Education, skills and availability", [["Current occupation","current_occupation"],["Education","education"],["Volunteer area","category"],["Skills","skills"],["Availability","availability"],["Hours per week","hours_per_week"],["Motivation","motivation"],["Past volunteer positions","past_volunteer_positions"],["Volunteering elsewhere","volunteering_elsewhere"],["Other volunteering details","other_volunteering_details"]]],
    ["References and emergency contact", [["Reference name","reference_name"],["Reference organisation","reference_organization"],["Reference phone","reference_phone"],["Reference email","reference_email"],["Emergency contact","emergency_name"],["Emergency phone","emergency_phone"]]],
    ["Safeguarding and declarations", [["Criminal conviction declared","criminal_conviction"],["Criminal offence details","criminal_offence_details"],["Disability declared","disability"],["Disability certificate","disability_certificate"],["Disability certificate name","disability_certificate_name"],["Membership fee acknowledged","membership_fee_acknowledged"]]],
    ["Assignment and supervision", [["Directorate","directorate"],["Programme","programme"],["Project","project"],["Activity","activity"],["Supervisor name","line_manager_name"],["Supervisor title","line_manager_title"],["Supervisor phone","line_manager_phone"],["Supervisor email","line_manager_email"],["Application submitted","created_at"]]]
  ];
  const displayField = (key,value) => {
    if (["volunteering_elsewhere","criminal_conviction","disability","membership_fee_acknowledged"].includes(key)) {
      if (value === true || value === "true" || value === 1) return "Yes";
      if (value === false || value === "false" || value === 0) return "No";
    }
    if (key === "created_at") return dateLabel(value);
    if (["programme","project","activity"].includes(key)) { const formatted = listValue(value); return key === "activity" && formatted === "—" ? "No specific activity assigned" : formatted; }
    return value === null || value === undefined || value === "" ? "—" : String(value);
  };

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
              <button className={styles.secondaryButton} type="button" disabled={busy} onClick={resendCode}>{busy ? "Please wait…" : "Didn't receive a code? Send again"}</button>
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
          <button className={tab==="profile"?styles.activeTab:""} onClick={()=>setTab("profile")}>Full profile</button>
          <button className={tab==="service"?styles.activeTab:""} onClick={()=>setTab("service")}>Service & development</button>
          <button className={tab==="finance"?styles.activeTab:""} onClick={()=>setTab("finance")}>Contribution statement</button>
          <button className={tab==="records"?styles.activeTab:""} onClick={()=>setTab("records")}>Finance records</button>
        </nav>
        {message && <p className={styles.notice} role="status">{message}</p>}
        {tab==="overview" ? (
          <section className={styles.metrics} aria-label="Volunteer summary">
            <article><span>TOTAL VERIFIED SERVICE HOURS</span><strong>{Number(profileDetails?.hours?.total||0).toFixed(2)}</strong><small>Verified volunteer service</small></article>
            <article><span>PROFESSIONAL DEVELOPMENT HOURS</span><strong>{Number(profileDetails?.hours?.development||0).toFixed(2)}</strong><small>Verified development activities</small></article>
            <article><span>MEMBERSHIP FINANCE</span><strong>{money(statement?.outstanding)}</strong><small>{money(statement?.paidTotal)} paid of {money(statement?.expectedTotal)} expected · outstanding balance</small></article>
          </section>
        ) : tab==="finance" ? (
          <section className={styles.panel}>
            <div className={styles.statementHeading}><div><div className={styles.eyebrow}>MEMBERSHIP FINANCE</div><h2>Your contribution statement</h2><p>Expected contributions start in the month your application was submitted and run through the current calendar month.</p></div><button className={styles.refresh} onClick={()=>{setPhase("loading");loadPortal().then(()=>setTab("finance")).catch(()=>setPhase("portal"));}}>Refresh statement</button></div>
            {statement ? <><div className={styles.statementTotals}><div><span>Contribution period</span><strong>{monthLabel(statement.firstContributionMonth)} – {monthLabel(statement.throughMonth)}</strong></div><div><span>Expected</span><strong>{money(statement.expectedTotal)}</strong></div><div><span>Payments recorded</span><strong>{money(statement.paidTotal)}</strong></div><div><span>Balance outstanding</span><strong>{money(statement.outstanding)}</strong></div></div>
              <div className={styles.tableWrap}><table><thead><tr><th>Contribution month</th><th>Expected</th><th>Paid</th><th>Balance</th><th>Status</th><th>Payment reference</th></tr></thead><tbody>{statement.months.map(row=><tr key={row.month}><td>{monthLabel(row.month)}</td><td>{money(row.amountDue)}</td><td>{money(row.amountPaid)}</td><td>{money(row.balance)}</td><td><span className={row.status==="Paid"?styles.paid:row.status==="Part-paid"?styles.partial:styles.unpaid}>{row.status}</span></td><td>{row.reference || "—"}</td></tr>)}</tbody></table></div>
              {statement.credit>0 && <p className={styles.notice}>Your recorded payments exceed expected contributions by {money(statement.credit)}. Please contact VSI administration to reconcile this credit.</p>}<p className={styles.disclaimer}>{statement.adjustmentNote} This is a read-only statement, not a payment receipt. If a payment is missing or a figure appears incorrect, contact VSI administration for reconciliation.</p>
            </> : <p className={styles.muted}>The contribution statement could not be loaded. Please refresh the page or try again later.</p>}
          </section>
        ) : tab==="profile" ? (
          <section className={styles.panel}>
            <div className={styles.panelHeading}><div><div className={styles.eyebrow}>OFFICIAL RECORD · READ ONLY</div><h2>Complete volunteer profile</h2><p className={styles.muted}>The same official profile information available to VSI administration, displayed read-only for the account owner.</p></div></div>
            {profileSections.map(([heading,fields])=><div className={styles.readOnlySection} key={heading}><h3>{heading}</h3><dl className={styles.details}>{fields.map(([label,key])=><div key={key}><dt>{label}</dt><dd>{displayField(key,profileDetails?.profile?.[key])}</dd></div>)}</dl></div>)}
            <p className={styles.readOnlyNote}>Only authorised VSI administration staff can edit profile details, assignments or approval status. Contact administration to request a correction.</p>
          </section>
        ) : tab==="service" ? (
          <section className={styles.panel}>
            <div className={styles.panelHeading}><div><div className={styles.eyebrow}>SERVICE & DEVELOPMENT</div><h2>Your activity history</h2><p className={styles.muted}>This is a read-only record. Verified hours are identified separately.</p></div></div>
            <section className={styles.metrics}><article><span>VERIFIED SERVICE HOURS</span><strong>{Number(profileDetails?.hours?.total||0).toFixed(2)}</strong><small>Recorded service</small></article><article><span>THIS WEEK</span><strong>{Number(profileDetails?.hours?.week||0).toFixed(2)}</strong><small>Verified hours</small></article><article><span>VERIFIED ACTIVITIES</span><strong>{profileDetails?.hours?.verifiedActivities||0}</strong><small>Service entries</small></article><article><span>DEVELOPMENT HOURS</span><strong>{Number(profileDetails?.hours?.development||0).toFixed(2)}</strong><small>Verified professional development</small></article></section>
            <div className={styles.readOnlySection}><h3>Volunteer service history</h3><div className={styles.tableWrap}><table><thead><tr><th>Date</th><th>Activity</th><th>Project</th><th>Location</th><th>Time</th><th>Hours</th><th>Status</th><th>Supervisor</th><th>Facilitator</th><th>SDGs / AU Agenda</th><th>Description</th></tr></thead><tbody>{(profileDetails?.activities||[]).filter(a=>!String(a.activity_code||"").trim().toUpperCase().startsWith("FAHR")).length ? (profileDetails?.activities||[]).filter(a=>!String(a.activity_code||"").trim().toUpperCase().startsWith("FAHR")).map(a=><tr key={a.id}><td>{dateLabel(a.activity_date)}</td><td>{a.activity_name||a.activity_code||"—"}</td><td>{a.project||"—"}</td><td>{a.location||"—"}</td><td>{String(a.start_time||"").slice(0,5)}–{String(a.end_time||"").slice(0,5)}</td><td>{Number(a.hours||0).toFixed(2)}</td><td>{a.verified?"Verified":"Unverified"}</td><td>{a.supervisor_name||"—"}</td><td>{a.facilitator||"—"}</td><td>{[a.sdgs,a.au_agenda].filter(Boolean).join(" / ")||"—"}</td><td>{a.description||"—"}</td></tr>) : <tr><td colSpan="11">No service activity recorded.</td></tr>}</tbody></table></div></div>
            <div className={styles.readOnlySection}><h3>Professional development history</h3><div className={styles.tableWrap}><table><thead><tr><th>Date</th><th>Activity</th><th>Description</th><th>Hours</th><th>Status</th></tr></thead><tbody>{(profileDetails?.activities||[]).filter(a=>String(a.activity_code||"").trim().toUpperCase().startsWith("FAHR")).length ? (profileDetails?.activities||[]).filter(a=>String(a.activity_code||"").trim().toUpperCase().startsWith("FAHR")).map(a=><tr key={a.id}><td>{dateLabel(a.activity_date)}</td><td>{a.activity_name||a.activity_code||"—"}</td><td>{a.description||"—"}</td><td>{Number(a.hours||0).toFixed(2)}</td><td>{a.verified?"Verified":"Unverified"}</td></tr>) : <tr><td colSpan="5">No professional development recorded.</td></tr>}</tbody></table></div></div>
          </section>
        ) : (
          <section className={styles.panel}>
            <div className={styles.panelHeading}><div><div className={styles.eyebrow}>FINANCIAL RECORDS · READ ONLY</div><h2>Membership, donations and other payments</h2><p className={styles.muted}>Records currently linked to your volunteer account. Contact VSI administration if a payment or donation is missing.</p></div></div>
            <section className={styles.metrics}><article><span>MEMBERSHIP PAID</span><strong>{money((profileDetails?.finance?.payments||[]).reduce((sum,p)=>sum+Number(p.amount_paid||0),0))}</strong><small>Recorded contributions</small></article><article><span>DONATIONS</span><strong>{money((profileDetails?.finance?.donations||[]).reduce((sum,d)=>sum+Number(d.amount||0),0))}</strong><small>Recorded donations</small></article><article><span>OTHER PAYMENTS</span><strong>{money((profileDetails?.finance?.otherPayments||[]).reduce((sum,p)=>sum+Number(p.amount||0),0))}</strong><small>Recorded other payments</small></article></section>
            <div className={styles.readOnlySection}><h3>Membership payments</h3><div className={styles.tableWrap}><table><thead><tr><th>Month</th><th>Due</th><th>Paid</th><th>Status</th><th>Payment date</th><th>Method</th><th>Reference</th><th>Notes</th></tr></thead><tbody>{profileDetails?.finance?.payments?.length ? profileDetails.finance.payments.map(p=><tr key={p.id}><td>{monthLabel(String(p.payment_month||"").slice(0,7))}</td><td>{money(p.amount_due)}</td><td>{money(p.amount_paid)}</td><td>{p.status||"—"}</td><td>{dateLabel(p.payment_date)}</td><td>{p.payment_method||"—"}</td><td>{p.reference||"—"}</td><td>{p.notes||"—"}</td></tr>) : <tr><td colSpan="8">No membership payment records.</td></tr>}</tbody></table></div></div>
            <div className={styles.readOnlySection}><h3>Donations</h3><div className={styles.tableWrap}><table><thead><tr><th>Cause</th><th>Amount</th><th>Date</th><th>Method</th><th>Reference</th><th>Notes</th></tr></thead><tbody>{profileDetails?.finance?.donations?.length ? profileDetails.finance.donations.map(d=><tr key={d.id}><td>{d.cause||"—"}</td><td>{money(d.amount)}</td><td>{dateLabel(d.donation_date)}</td><td>{d.payment_method||"—"}</td><td>{d.reference||"—"}</td><td>{d.notes||"—"}</td></tr>) : <tr><td colSpan="6">No donations recorded.</td></tr>}</tbody></table></div></div>
            <div className={styles.readOnlySection}><h3>Other payments</h3><div className={styles.tableWrap}><table><thead><tr><th>Description</th><th>Amount</th><th>Date</th><th>Method</th><th>Reference</th><th>Notes</th></tr></thead><tbody>{profileDetails?.finance?.otherPayments?.length ? profileDetails.finance.otherPayments.map(p=><tr key={p.id}><td>{p.description||"—"}</td><td>{money(p.amount)}</td><td>{dateLabel(p.payment_date)}</td><td>{p.payment_method||"—"}</td><td>{p.reference||"—"}</td><td>{p.notes||"—"}</td></tr>) : <tr><td colSpan="6">No other payment records.</td></tr>}</tbody></table></div></div>
            <p className={styles.readOnlyNote}>Finance records cannot be edited or deleted from the volunteer portal. Corrections and reconciliations remain under VSI administration control.</p>
          </section>
        )}
        <footer className={styles.footer}>© 2026 Visionary Students Initiative <a href="/privacy-policy">Privacy Policy</a><a href="/volunteer">Volunteer information</a></footer>
      </div>
    </main>
  );
}
