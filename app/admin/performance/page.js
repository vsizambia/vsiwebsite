"use client";
import {useEffect,useMemo,useState} from "react";
import {SiteFooter,SiteHeader} from "../../components/SiteChrome";
import styles from "../volunteers/admin.module.css";

const target=6;
function pct(value){return Math.min(100,Math.round((Number(value||0)/target)*100));}
function BarList({items,metric="hours",limit=8}){
 const rows=items.slice(0,limit),max=Math.max(1,...rows.map(x=>Number(x[metric]||0)));
 if(!rows.length)return <div className={styles.empty}>No verified data yet.</div>;
 return <div className={styles.chart}>{rows.map((x,i)=><div className={styles.barRow} key={`${x.label}-${i}`}><div className={styles.barLabel}><span>{x.label}</span><b>{Number(x[metric]||0).toFixed(metric==="hours"?2:0)}{metric==="hours"?" hrs":""}</b></div><div className={styles.barTrack}><i style={{width:`${Math.max(5,(Number(x[metric]||0)/max)*100)}%`}}/></div><small>{x.volunteers} volunteer{x.volunteers===1?"":"s"}</small></div>)}</div>;
}
export default function VolunteerPerformance(){
 const[data,setData]=useState(null),[error,setError]=useState("");
 async function load(){try{setError("");const r=await fetch("/api/admin/performance",{cache:"no-store"}),d=await r.json();if(!r.ok)throw new Error(d.error);setData(d)}catch(e){setError(e.message)}}
 useEffect(()=>{load()},[]);
 const top=useMemo(()=>data?.volunteers||[],[data]);
 if(!data)return <><SiteHeader ctaLabel="Volunteer Register" ctaHref="/admin/volunteers"/><main className={styles.page}><div className={styles.shell}><div className={styles.topline}><span>VSI IMS <b>/</b> Volunteer Performance</span><button onClick={load}>Refresh ↻</button></div><div className={styles.empty}>{error||"Loading performance report…"}</div></div></main><SiteFooter/></>;
 const s=data.summary, rate=s.approved?Math.round((s.target_met/s.approved)*100):0, average=s.approved?s.week_hours/s.approved:0;
 return <><SiteHeader ctaLabel="Volunteer Register" ctaHref="/admin/volunteers"/><main className={styles.page}><div className={styles.shell}>
  <div className={styles.topline}><span>VSI IMS <b>/</b> Volunteer Performance</span><button onClick={load}>Refresh ↻</button></div>
  <section className={styles.hero}><div><p className="kicker light">HOURS &amp; PERFORMANCE</p><h1>Volunteer Performance</h1><p>Monitor verified volunteer hours against VSI's recommended six-hour weekly commitment.</p></div></section>
  {error&&<div className={styles.error}>{error}</div>}
  <section className={styles.stats}>
   <div className={`${styles.stat} ${styles.statNavy}`}><small>ACTIVE VOLUNTEERS</small><strong>{s.approved}</strong><b>Approved volunteers</b><em>{s.pending} pending applications</em></div>
   <div className={`${styles.stat} ${styles.statYellow}`}><small>THIS WEEK</small><strong>{s.week_hours.toFixed(2)}</strong><b>Verified hours</b><em>{average.toFixed(2)} average per active volunteer</em></div>
   <div className={`${styles.stat} ${styles.statBlue}`}><small>TARGET MET</small><strong>{s.target_met}</strong><b>Volunteers at 6+ hrs</b><em>{rate}% of active volunteers</em></div>
   <div className={`${styles.stat} ${styles.statWhite}`}><small>BELOW TARGET</small><strong>{s.below_target}</strong><b>Need attention</b><em>Under the 6-hour weekly target</em></div>
  </section>
  <section className={styles.analytics}><div className={styles.analyticsHead}><div><p className="kicker">WEEKLY PERFORMANCE</p><h2>Verified hours over the last 8 weeks</h2></div><strong>Target: 6 hrs / volunteer / week</strong></div><div className={styles.chart}>{data.trend.map((x,i)=><div className={styles.barRow} key={x.week}><div className={styles.barLabel}><span>Week {i+1} · {x.week}</span><b>{x.hours.toFixed(2)} hrs</b></div><div className={styles.barTrack}><i style={{width:`${Math.max(4,Math.min(100,(x.hours/Math.max(1,s.approved*target))*100))}%`}}/></div></div>)}</div></section>
  <section className={styles.analytics}><div className={styles.analyticsHead}><div><p className="kicker">PROGRAMME REPORTING</p><h2>Hours by programme</h2></div><strong>{s.total_hours.toFixed(2)} verified hours all time</strong></div><BarList items={data.programme}/></section>
  <section className={styles.analytics}><div className={styles.analyticsHead}><div><p className="kicker">PROJECT REPORTING</p><h2>Hours by project</h2></div><strong>Verified activity only</strong></div><BarList items={data.project}/></section>
  <section className={styles.registerPanel}><div className={styles.registerHeader}><div><p className="kicker">VOLUNTEER PERFORMANCE</p><h2>Weekly leaderboard</h2></div><strong>6 hrs target</strong></div><div className={styles.list}>{top.slice(0,15).map(v=>{const p=pct(v.week_hours);return <article className={styles.card} key={v.id}><div className={styles.cardButton}><div className={styles.cardMain}><div className={styles.avatar}>{v.full_name.split(" ").map(x=>x[0]).join("").slice(0,2)}</div><div><h3>{v.full_name}</h3><p>{v.programme||"Programme not assigned"} · {v.project||"Project not assigned"}</p><div className={styles.hoursTrack}><i style={{width:`${p}%`}}/></div></div><div className={styles.cardSide}><strong>{v.week_hours.toFixed(2)} / 6 hrs</strong><span className={`${styles.badge} ${p>=100?styles.approved:styles.pending}`}>{p>=100?"target met":`${p}%`}</span><small>{v.total_hours.toFixed(2)} hrs total · {v.activity_count} verified activities</small></div></div></article>})}</div></section>
  <section className={styles.registerPanel}><div className={styles.registerHeader}><div><p className="kicker">QUICK ACTIONS</p><h2>Continue managing volunteers</h2></div></div><div className={styles.toolbar}><a className={styles.saveReview} href="/admin/volunteers">Volunteer Register ↗</a><a className={styles.saveReview} href="/admin/activities">Activity Register ↗</a></div></section>
 </div></main><SiteFooter/></>;
}
