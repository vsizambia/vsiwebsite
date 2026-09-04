"use client";

import {useEffect,useState} from "react";
import Link from "next/link";
import {SiteFooter,SiteHeader} from "../components/SiteChrome";
import styles from "./dashboard.module.css";
import summaryStyles from "./dashboard-summary.module.css";

const modules=[
  {title:"Volunteer Management",text:"Review applications, manage the volunteer register, assignments and profiles.",href:"/admin/volunteers",featured:true,summaryKey:"volunteers",metrics:[["approved","APPROVED VOLUNTEERS"],["pending","PENDING REVIEW"],["verifiedHours","TOTAL VERIFIED VOLUNTEER HOURS"]]},
  {title:"News Publishing",text:"Create, edit, publish and manage VSI news stories and media.",href:"/admin/news",summaryKey:"news",metrics:[["published","PUBLISHED"],["drafts","DRAFTS"],["total","TOTAL STORIES"]]},
  {title:"Events",text:"Manage VSI events and event registrations.",href:"/admin/events",events:true,summaryKey:"events",metrics:[["upcoming","UPCOMING EVENTS"],["registrations","REGISTRATIONS"],["completed","COMPLETED EVENTS"]]},
  {title:"Master Activity Catalogue",text:"Manage the approved Directorate → Project → Activity library.",href:"/admin/activity-catalogue",summaryKey:"catalogue",metrics:[["activities","ACTIVITIES"],["projects","PROJECTS"],["directorates","DIRECTORATES"]]}
];

function formatHours(value){const n=Number(value||0);return `${n.toLocaleString(undefined,{maximumFractionDigits:2})} hrs`}

export default function AdminDashboard(){
  const[authenticated,setAuthenticated]=useState(false),[checking,setChecking]=useState(true),[authStep,setAuthStep]=useState("password"),[password,setPassword]=useState(""),[authCode,setAuthCode]=useState(""),[error,setError]=useState(""),[summary,setSummary]=useState(null),[summaryLoading,setSummaryLoading]=useState(false);
  async function checkSession(){try{const r=await fetch("/api/admin/volunteers",{cache:"no-store"});setAuthenticated(r.ok);}catch{setAuthenticated(false)}finally{setChecking(false)}}
  useEffect(()=>{checkSession()},[]);
  async function loadSummary(){setSummaryLoading(true);try{const r=await fetch("/api/admin/dashboard",{cache:"no-store"});const d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to load dashboard summaries.");setSummary(d)}catch(e){setError(e.message)}finally{setSummaryLoading(false)}}
  useEffect(()=>{if(authenticated)loadSummary()},[authenticated]);
  async function login(e){e.preventDefault();setError("");try{const payload=authStep==="code"?{code:authCode}:{password};const r=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to sign in.");if(d.requiresAuthenticator){setAuthStep("code");setAuthCode("");return}setPassword("");setAuthCode("");setAuthenticated(true)}catch(e){setError(e.message)}}
  async function logout(){await fetch("/api/admin/login",{method:"DELETE"});setAuthenticated(false);setAuthStep("password");setPassword("");setAuthCode("");setSummary(null)}
  if(checking)return <><SiteHeader ctaLabel="Back to site" ctaHref="/"/><main className={styles.center}><div className={styles.loading}>Loading VSI Admin...</div></main><SiteFooter/></>;
  if(!authenticated)return <><SiteHeader ctaLabel="Back to site" ctaHref="/"/><main className={styles.loginPage}><div className={styles.loginShell}><div className={styles.logo}>VSI</div><p className="kicker">ADMIN ACCESS</p><h1>VSI Administration</h1><p className={styles.loginIntro}>{authStep==="code"?"Enter the 6-digit code from your Authenticator app to continue.":"Sign in to access all VSI administration tools from one place."}</p><form onSubmit={login} className={styles.form}>{authStep==="password"?<><label htmlFor="admin-password">Admin password</label><input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/></>:<><label htmlFor="admin-auth-code">Authenticator code</label><input id="admin-auth-code" type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" value={authCode} onChange={e=>setAuthCode(e.target.value.replace(/\D/g,"").slice(0,6))} required autoFocus/><small>Open Google Authenticator, Microsoft Authenticator or Authy and enter the current 6-digit code.</small></>}{error&&<div className={styles.error}>{error}</div>}<button type="submit">{authStep==="code"?"Verify code":"Sign in"} <span>↗</span></button>{authStep==="code"&&<button type="button" className={styles.back} onClick={()=>{setAuthStep("password");setAuthCode("");setError("")}}>← Back to password</button>}</form></div></main><SiteFooter/></>;
  const metricValue=(key,name)=>{const value=summary?.[name]?.[key];if(summaryLoading||value===undefined)return "—";return key==="verifiedHours"?formatHours(value):Number(value).toLocaleString()};
  const renderSummary=item=><div className={summaryStyles.summary}>{item.metrics.map(([key,label])=><div className={summaryStyles.summaryItem} key={key}><strong>{metricValue(key,item.summaryKey)}</strong><span>{label}</span></div>)}</div>;
  return <><SiteHeader ctaLabel="Public site" ctaHref="/"/><main className={styles.page}><div className={styles.shell}><header className={styles.topbar}><div></div><div className={styles.actions}><span className={styles.connected}><i/> Secure session</span><button onClick={logout}>Log out ↪</button></div></header><section className={styles.hero}><div className={styles.heroContent}><h1>VSI Administration Control Centre</h1><p>What would you like to manage?</p></div></section><section className={styles.grid}>{modules.map((item)=><div className={`${styles.card} ${item.featured?styles.featured:""}`} key={item.href}>{item.events?<><h2>{item.title}</h2><p>{item.text}</p>{renderSummary(item)}<div className={styles.subLinks}><Link href="/admin/events">Manage Events</Link><Link href="/admin/event-registrations">Event Registrations</Link></div></>:<Link className={styles.cardLink} href={item.href}><h2>{item.title}</h2><p>{item.text}</p>{renderSummary(item)}<span className={styles.open}>Open {item.title} <b>→</b></span></Link>}</div>)}</section></div></main><SiteFooter/></>;
}
