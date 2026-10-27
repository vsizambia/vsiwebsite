"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "../../components/SiteChrome";
import styles from "./report.module.css";

const initial = { reporterType:"", anonymous:false, reporterName:"", reporterContact:"", safeContactMethod:"", affectedPersonType:"", affectedPersonAgeBand:"unknown", concernCategory:"", concernDetails:"", incidentDate:"", immediateDanger:false, safeToContact:false, website:"" };
const categories = [["abuse","Abuse"],["neglect","Neglect"],["exploitation","Exploitation"],["sexual_exploitation_abuse","Sexual exploitation or abuse"],["harassment","Harassment"],["bullying","Bullying"],["unsafe_practice","Unsafe practice or environment"],["retaliation","Retaliation or threats"],["other","Other concern"]];
export default function SafeguardingReportPage() {
  const [form,setForm]=useState(initial),[sending,setSending]=useState(false),[error,setError]=useState(""),[reference,setReference]=useState("");
  const update=(key,value)=>setForm(current=>({...current,[key]:value}));
  async function submit(event){
    event.preventDefault();setError("");setSending(true);
    try{
      const response=await fetch("/api/safeguarding/reports",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||"We could not submit the report.");
      setReference(result.reference||"Received");setForm(initial);
    }catch(e){setError(e.message||"We could not submit the report. Please try again.");}
    finally{setSending(false);}
  }
  return <><SiteHeader/><main className={styles.page}><div className={styles.shell}>
    <Link className={styles.back} href="/">← VSI home</Link>
    <header className={styles.hero}><p className={styles.kicker}>VISIONARY STUDENTS INITIATIVE</p><h1>Report a safeguarding concern</h1><p>You can tell VSI about a concern involving a child, programme participant, volunteer, staff member, partner or anyone affected by VSI-related activities. You do not need to be certain that harm occurred before raising a concern.</p></header>
    <section className={styles.notice}><strong>If someone is in immediate danger</strong><p>Do not wait for this form to be reviewed. Contact local emergency services or the appropriate child-protection or law-enforcement authority, and seek help from a trusted person who can act safely.</p></section>
    {reference ? <section className={styles.success} role="status"><h2>Report received</h2><p>Thank you for raising this concern. Keep this reference for your own records:</p><strong className={styles.reference}>{reference}</strong><p>VSI will review the information and take appropriate steps. This form is not an emergency service. If it is safe to do so, use a trusted contact channel if you need to provide further information.</p><button onClick={()=>setReference("")}>Submit another report</button></section> : <form className={styles.form} onSubmit={submit}>
      <h2>Share what you can</h2><p className={styles.intro}>Fields marked required help VSI understand the concern. Please do not include information that is not needed to explain the safety issue.</p>
      <label className={styles.check}><input type="checkbox" checked={form.anonymous} onChange={e=>update("anonymous",e.target.checked)}/> I want to report anonymously</label>
      {!form.anonymous && <div className={styles.grid}><label>Your name (optional)<input maxLength={160} value={form.reporterName} onChange={e=>update("reporterName",e.target.value)} autoComplete="name"/></label><label>Safe contact details (optional)<input maxLength={200} value={form.reporterContact} onChange={e=>update("reporterContact",e.target.value)} placeholder="Phone or email"/></label><label>Preferred safe contact method<select value={form.safeContactMethod} onChange={e=>update("safeContactMethod",e.target.value)}><option value="">Choose if applicable</option><option value="phone">Phone call</option><option value="text">Text message</option><option value="email">Email</option><option value="in_person">In person through a trusted contact</option><option value="other">Other / discuss first</option></select></label></div>}
      <div className={styles.grid}><label>What is your relationship to the concern? *<select required value={form.reporterType} onChange={e=>update("reporterType",e.target.value)}><option value="">Choose one</option><option value="affected_person">I am affected</option><option value="witness">I witnessed or heard about it</option><option value="parent_guardian">Parent or guardian</option><option value="staff_volunteer">VSI staff member or volunteer</option><option value="partner">Implementing partner</option><option value="other">Other</option></select></label><label>Who may be affected? *<select required value={form.affectedPersonType} onChange={e=>update("affectedPersonType",e.target.value)}><option value="">Choose one</option><option value="child">Child (under 18)</option><option value="programme_participant">Programme participant</option><option value="volunteer">Volunteer</option><option value="staff">Staff member</option><option value="partner">Partner representative</option><option value="other">Other person</option><option value="unknown">Not sure</option></select></label><label>Age group of the affected person<select value={form.affectedPersonAgeBand} onChange={e=>update("affectedPersonAgeBand",e.target.value)}><option value="unknown">Not sure / prefer not to say</option><option value="under_13">Under 13</option><option value="13_17">13–17</option><option value="18_plus">18 or older</option></select></label><label>Type of concern *<select required value={form.concernCategory} onChange={e=>update("concernCategory",e.target.value)}><option value="">Choose a category</option>{categories.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label>Approximate date (optional)<input type="date" value={form.incidentDate} onChange={e=>update("incidentDate",e.target.value)} max={new Date().toISOString().slice(0,10)}/></label></div>
      <label className={styles.check}><input type="checkbox" checked={form.immediateDanger} onChange={e=>update("immediateDanger",e.target.checked)}/> Someone may be in immediate danger or needs urgent protection</label>
      <label>What happened, or what are you concerned about? *<textarea required minLength={20} maxLength={5000} rows={7} value={form.concernDetails} onChange={e=>update("concernDetails",e.target.value)} placeholder="Share what you know, when and where it happened, and any immediate safety concerns. It is okay to say what you do not know."/></label>
      {!form.anonymous && <label className={styles.check}><input type="checkbox" checked={form.safeToContact} onChange={e=>update("safeToContact",e.target.checked)}/> It is safe for VSI to contact me using the details I provided</label>}
      <label className={styles.honeypot} aria-hidden="true">Leave this field empty<input tabIndex="-1" autoComplete="off" value={form.website} onChange={e=>update("website",e.target.value)}/></label>
      <p className={styles.privacy}>VSI will restrict access to safeguarding reports to authorised personnel and use the information to assess risk, take protective action and make referrals where appropriate. Information may need to be shared with competent authorities where required to protect someone or meet legal obligations. Do not use this form to seek emergency assistance.</p>
      {error&&<div className={styles.error} role="alert">{error}</div>}
      <button className={styles.submit} type="submit" disabled={sending}>{sending?"Submitting securely…":"Submit safeguarding report"}</button>
    </form>}
  </div></main><SiteFooter/></>;
}
