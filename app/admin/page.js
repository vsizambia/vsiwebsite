"use client";

import {useEffect,useState} from "react";
import Link from "next/link";
import {SiteFooter,SiteHeader} from "../components/SiteChrome";
import styles from "./dashboard.module.css";

const modules=[
  {eyebrow:"PEOPLE",title:"Volunteer Management",text:"Review applications, manage the volunteer register, assignments and profiles.",href:"/admin/volunteers",icon:"V",featured:true},
  {eyebrow:"CONTENT",title:"News Publishing",text:"Create, edit, publish and manage VSI news stories and media.",href:"/admin/news",icon:"N"},
  {eyebrow:"EVENTS",title:"Events",text:"Manage VSI events and event registrations.",href:"/admin/events",icon:"E",events:true},
  {eyebrow:"DELIVERY",title:"Master Activity Catalogue",text:"Manage the approved Directorate → Project → Activity library.",href:"/admin/activity-catalogue",icon:"C"}
];

export default function AdminDashboard(){
  const[authenticated,setAuthenticated]=useState(false),[checking,setChecking]=useState(true),[authStep,setAuthStep]=useState("password"),[password,setPassword]=useState(""),[authCode,setAuthCode]=useState(""),[error,setError]=useState("");

  async function checkSession(){
    try{const r=await fetch("/api/admin/volunteers",{cache:"no-store"});setAuthenticated(r.ok);}catch{setAuthenticated(false)}finally{setChecking(false)}
  }
  useEffect(()=>{checkSession()},[]);

  async function login(e){
    e.preventDefault();setError("");
    try{
      const payload=authStep==="code"?{code:authCode}:{password};
      const r=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const d=await r.json();
      if(!r.ok)throw new Error(d.error||"Unable to sign in.");
      if(d.requiresAuthenticator){setAuthStep("code");setAuthCode("");return;}
      setPassword("");setAuthCode("");setAuthenticated(true);
    }catch(e){setError(e.message)}
  }

  async function logout(){await fetch("/api/admin/login",{method:"DELETE"});setAuthenticated(false);setAuthStep("password");setPassword("");setAuthCode("");}

  if(checking)return <><SiteHeader ctaLabel="Back to site" ctaHref="/"/><main className={styles.center}><div className={styles.loading}>Loading VSI Admin...</div></main><SiteFooter/></>;

  if(!authenticated)return <><SiteHeader ctaLabel="Back to site" ctaHref="/"/><main className={styles.loginPage}><div className={styles.loginShell}><div className={styles.logo}>VSI</div><p className="kicker">ADMIN ACCESS</p><h1>VSI Administration</h1><p className={styles.loginIntro}>{authStep==="code"?"Enter the 6-digit code from your Authenticator app to continue.":"Sign in to access all VSI administration tools from one place."}</p><form onSubmit={login} className={styles.form}>{authStep==="password"?<><label htmlFor="admin-password">Admin password</label><input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/></>:<><label htmlFor="admin-auth-code">Authenticator code</label><input id="admin-auth-code" type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" value={authCode} onChange={e=>setAuthCode(e.target.value.replace(/\D/g,"").slice(0,6))} required autoFocus/><small>Open Google Authenticator, Microsoft Authenticator or Authy and enter the current 6-digit code.</small></>}{error&&<div className={styles.error}>{error}</div>}<button type="submit">{authStep==="code"?"Verify code":"Sign in"} <span>↗</span></button>{authStep==="code"&&<button type="button" className={styles.back} onClick={()=>{setAuthStep("password");setAuthCode("");setError("")}}>← Back to password</button>}</form></div></main><SiteFooter/></>;

  return <><SiteHeader ctaLabel="Public site" ctaHref="/"/><main className={styles.page}><div className={styles.shell}><header className={styles.topbar}><div></div><div className={styles.actions}><span className={styles.connected}><i/> Secure session</span><button onClick={logout}>Log out ↪</button></div></header><section className={styles.hero}><div><h1>VSI Administration Control Centre</h1></div><div className={styles.heroMark}>VSI</div></section><section className={styles.grid}>{modules.map((item)=><div className={`${styles.card} ${item.featured?styles.featured:""}`} key={item.href}>{item.events?<><div className={styles.cardTop}><span className={styles.icon}>{item.icon}</span><span className={styles.eyebrow}>{item.eyebrow}</span></div><h2>{item.title}</h2><p>{item.text}</p><div className={styles.subLinks}><Link href="/admin/events">Manage Events</Link><Link href="/admin/event-registrations">Event Registrations</Link></div></>:<Link className={styles.cardLink} href={item.href}><div className={styles.cardTop}><span className={styles.icon}>{item.icon}</span><span className={styles.eyebrow}>{item.eyebrow}</span></div><h2>{item.title}</h2><p>{item.text}</p><span className={styles.open}>Open {item.title} <b>→</b></span></Link>}</div>)}</section></div></main><SiteFooter/></>;
}
