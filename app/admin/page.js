"use client";

import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import styles from "./dashboard.module.css";

const groups=[
  {label:"WORKSPACE",items:[
    ["Overview","/admin","⌂"],
  ]},
  {label:"PROGRAMMES & IMPACT",items:[
    ["Activity Register","/admin/activities","▤"],
    ["Record Activity","/admin/activities/add","+ "],
    ["Impact & Evidence","/admin/impact","◉"],
    ["Performance","/admin/performance","↗"],
    ["Activity Catalogue","/admin/activity-catalogue","▦"],
    ["Events","/admin/events","▣"],
    ["Event Registrations","/admin/event-registrations","▧"],
  ]},
  {label:"PEOPLE",items:[
    ["Volunteers","/admin/volunteers","♙"],
    ["Volunteer Portal","/volunteer/portal","↗"],
    ["Recruitment","/admin/recruitment","＋"],
    ["Safeguarding Accounts","/admin/safeguarding-accounts","♢"],
    ["Safeguarding Cases","/admin/safeguarding","⚑"],
  ]},
  {label:"FINANCE & RESOURCES",items:[
    ["Volunteer Finance","/admin/volunteer-finance","Ｚ"],
    ["Generosity & Donations","/admin/generosity","♡"],
  ]},
  {label:"COMMUNICATIONS",items:[
    ["News Publishing","/admin/news","▧"],
    ["Website Manager","/admin/website-manager","▣"],
    ["Website Navigation","/admin/website-chrome","☷"],
    ["Media Library","/admin/media-library","▧"],
    ["E-Learning","/elearning","▹"],
  ]},
  {label:"GOVERNANCE",items:[
    ["Data Protection","/admin/data-protection","◇"],
  ]},
];

const metricCards=[
  {title:"Approved volunteers",path:"volunteers",key:"approved",icon:"♙",tone:"blue"},
  {title:"Pending applications",path:"volunteers",key:"pending",icon:"◷",tone:"amber"},
  {title:"People reached",path:"impact",key:"people",icon:"◎",tone:"green"},
  {title:"Activities recorded",path:"impact",key:"activities",icon:"▤",tone:"violet"},
  {title:"Verified volunteer hours",path:"volunteers",key:"verifiedHours",icon:"◷",tone:"blue",hours:true},
  {title:"Upcoming events",path:"events",key:"upcoming",icon:"▣",tone:"green"},
];

function number(value){return Number(value||0).toLocaleString("en-ZM",{maximumFractionDigits:2})}
function money(value){return "ZMW "+number(value)}

export default function AdminDashboard(){
  const[authenticated,setAuthenticated]=useState(false);
  const[checking,setChecking]=useState(true);
  const[authStep,setAuthStep]=useState("password");
  const[password,setPassword]=useState("");
  const[authCode,setAuthCode]=useState("");
  const[error,setError]=useState("");
  const[summary,setSummary]=useState(null);
  const[summaryLoading,setSummaryLoading]=useState(false);
  const[menuOpen,setMenuOpen]=useState(false);

  async function checkSession(){
    try{const r=await fetch("/api/admin/volunteers",{cache:"no-store"});setAuthenticated(r.ok)}
    catch{setAuthenticated(false)}
    finally{setChecking(false)}
  }
  useEffect(()=>{checkSession()},[]);
  async function loadSummary(){
    setSummaryLoading(true);setError("");
    try{const r=await fetch("/api/admin/dashboard",{cache:"no-store"});const d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to load dashboard summaries.");setSummary(d)}
    catch(e){setError(e.message)}
    finally{setSummaryLoading(false)}
  }
  useEffect(()=>{if(authenticated)loadSummary()},[authenticated]);
  async function login(e){
    e.preventDefault();setError("");
    try{
      const payload=authStep==="code"?{code:authCode}:{password};
      const r=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to sign in.");
      if(d.requiresAuthenticator){setAuthStep("code");setAuthCode("");return}
      setPassword("");setAuthCode("");setAuthenticated(true);
    }catch(e){setError(e.message)}
  }
  async function logout(){
    await fetch("/api/admin/login",{method:"DELETE"});
    setAuthenticated(false);setAuthStep("password");setPassword("");setAuthCode("");setSummary(null);
  }

  const metrics=useMemo(()=>metricCards.map(item=>{
    const value=summary?.[item.path]?.[item.key];
    return {...item,value:value===undefined?null:item.hours?Number(value).toFixed(2):number(value)};
  }),[summary]);

  if(checking)return <main className={styles.center}><div className={styles.loading}>Loading VSI workspace…</div></main>;
  if(!authenticated)return <main className={styles.loginPage}><section className={styles.loginShell}><div className={styles.logo}>VSI</div><p className={styles.eyebrow}>SECURE ADMIN ACCESS</p><h1>VSI Administration</h1><p className={styles.loginIntro}>{authStep==="code"?"Enter the 6-digit code from your Authenticator app to continue.":"Sign in to open the VSI dashboard and administration workspace."}</p><form onSubmit={login} className={styles.form}>{authStep==="password"?<><label htmlFor="admin-password">Admin password</label><input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/></>:<><label htmlFor="admin-auth-code">Authenticator code</label><input id="admin-auth-code" type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" value={authCode} onChange={e=>setAuthCode(e.target.value.replace(/\D/g,"").slice(0,6))} required autoFocus/></>}{error&&<div className={styles.error}>{error}</div>}<button type="submit">{authStep==="code"?"Verify code":"Sign in"} <span>→</span></button>{authStep==="code"&&<button type="button" className={styles.back} onClick={()=>{setAuthStep("password");setAuthCode("");setError("")}}>← Back to password</button>}</form></section></main>;

  return <div className={styles.workspace}>
    <aside className={`${styles.sidebar} ${menuOpen?styles.sidebarOpen:""}`}>
      <Link href="/admin" className={styles.brand}><span className={styles.brandMark}>V</span><span><strong>VSI</strong><small>ADMIN WORKSPACE</small></span></Link>
      <div className={styles.navScroll}>{groups.map(group=><section className={styles.navGroup} key={group.label}><p>{group.label}</p>{group.items.map(([label,href,icon])=><Link key={href} href={href} onClick={()=>setMenuOpen(false)} className={href==="/admin"?styles.activeLink:styles.navLink}><span className={styles.navIcon}>{icon}</span>{label}{href==="/admin"&&<span className={styles.activeDot}/>}</Link>)}</section>)}</div>
      <div className={styles.sidebarBottom}><span className={styles.secureDot}/> Secure administration session</div>
    </aside>
    {menuOpen&&<button className={styles.scrim} aria-label="Close navigation" onClick={()=>setMenuOpen(false)}/>}
    <main className={styles.main}>
      <header className={styles.topbar}><button className={styles.menuButton} onClick={()=>setMenuOpen(v=>!v)} aria-label="Toggle navigation">☰</button><div className={styles.breadcrumb}>VSI <span>/</span> Dashboard</div><div className={styles.topActions}><span className={styles.session}><i/> Secure session</span><button onClick={loadSummary} disabled={summaryLoading}>{summaryLoading?"Refreshing…":"Refresh ↻"}</button><button className={styles.logout} onClick={logout}>Log out ↗</button></div></header>
      <div className={styles.content}>
        <section className={styles.welcome}><div><p className={styles.eyebrow}>VISIONARY STUDENTS INITIATIVE</p><h1>Good to see you.</h1><p>Your organisation at a glance. Choose a workspace from the sidebar to get things done.</p></div><div className={styles.welcomeMark}>VSI<span>Empowering students.<br/>Building a better Zambia.</span></div></section>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>ORGANISATIONAL OVERVIEW</p><h2>Dashboard summary</h2></div><span className={styles.liveLabel}><i/> Live data</span></div>
        {error&&<div className={styles.errorBanner}>{error}<button onClick={loadSummary}>Try again</button></div>}
        <section className={styles.metrics}>{metrics.map(item=><Link href={item.path==="volunteers"?"/admin/volunteers":item.path==="impact"?"/admin/impact":"/admin/events"} key={item.title} className={styles.metricCard}><span className={`${styles.metricIcon} ${styles[item.tone]}`}>{item.icon}</span><span className={styles.metricTitle}>{item.title}</span><strong>{summaryLoading||item.value===null?"—":item.value}</strong><small>View details <b>→</b></small></Link>)}</section>
        <section className={styles.lowerGrid}>
          <div className={styles.panel}><div className={styles.panelHeading}><div><p className={styles.eyebrow}>QUICK ACCESS</p><h2>Frequently used</h2></div></div><div className={styles.quickLinks}><Link href="/admin/volunteers"><span>♙</span><div><strong>Manage volunteers</strong><small>Applications, profiles and assignments</small></div><b>→</b></Link><Link href="/admin/activities"><span>▤</span><div><strong>Review activity register</strong><small>Verify service entries and hours</small></div><b>→</b></Link><Link href="/admin/impact"><span>◎</span><div><strong>Update impact records</strong><small>Programme results and evidence</small></div><b>→</b></Link><Link href="/admin/events"><span>▣</span><div><strong>Manage events</strong><small>Events and participant registrations</small></div><b>→</b></Link></div></div>
          <div className={styles.panel}><div className={styles.panelHeading}><div><p className={styles.eyebrow}>FINANCE SNAPSHOT</p><h2>Volunteer finance</h2></div><Link href="/admin/volunteer-finance">Open finance →</Link></div><div className={styles.financeRows}><div><span>Membership received</span><strong>{summary?money(summary.finance?.membershipPaid):"—"}</strong></div><div><span>Outstanding balances</span><strong>{summary?money(summary.finance?.outstanding):"—"}</strong></div><div><span>Volunteer donations</span><strong>{summary?money(summary.finance?.donations):"—"}</strong></div><div><span>Total spent</span><strong>{summary?money(summary.finance?.totalSpent):"—"}</strong></div></div><p className={styles.note}>These figures reflect the existing volunteer finance records.</p></div>
        </section>
        <footer className={styles.footer}>Visionary Students Initiative <span>·</span> Internal administration workspace</footer>
      </div>
    </main>
  </div>;
}
