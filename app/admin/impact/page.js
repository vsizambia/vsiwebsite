"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "../../components/SiteChrome";
import { ECZ_2026_LOCATION_HIERARCHY } from "../../data/ecz-2026-location-hierarchy";
import styles from "./impact.module.css";

const PROGRAMME_META={
  "ovc-support":{label:"Community Service & Humanitarian Action",category:"COMMUNITY IMPACT",fields:[["people_reached","People reached"],["items_donated","Items / supplies donated"],["schools_supported","Schools / institutions supported"]]},
  "clean-green-healthy":{label:"Keep Zambia Clean, Green and Healthy",category:"COMMUNITY ACTION",fields:[["marketeers_reached","Marketeers reached"],["male_marketeers_reached","Men reached (optional)"],["female_marketeers_reached","Women reached (optional)"]],help:"Gender counts are optional. Enter them only when they were actually recorded — do not estimate."},
  "education-support":{label:"Education, Schools & Youth Development",category:"LEARNING & OPPORTUNITY",fields:[["male_reached","Boys reached"],["female_reached","Girls reached"],["schools_supported","Schools supported"],["items_donated","Books / learning items donated"]]},
  "civic-voter":{label:"Civic & Voter Education",category:"CIVIC LEADERSHIP",fields:[["people_reached","People reached"]],help:"Record people reached by civic or voter education activity. Keep all voter education non-partisan and informational."},
  "youth-policy":{label:"Youth Policy Dialogue & Participation",category:"YOUTH VOICE",fields:[["male_reached","Male participants"],["female_reached","Female participants"],["institutions_engaged","Institutions engaged"]]},
  "policy-contribution":{label:"Policy Advocacy, Research & Governance",category:"POLICY & ADVOCACY",fields:[["documents_contributed","Policy & research outputs"],["institutions_engaged","Institutions engaged"]]},
  "community-health":{label:"Community Health & Wellbeing",category:"HEALTH & WELLBEING",fields:[["people_reached","People reached"],["institutions_engaged","Health facilities / institutions engaged"]]},
  "youth-skills":{label:"Youth Skills, Innovation & Economic Empowerment",category:"YOUTH DEVELOPMENT",fields:[["male_reached","Male reached"],["female_reached","Female reached"]]}
};
const blank={programme_key:"ovc-support",catalogue_activity_id:"",activity_name:"",activity_date:new Date().toISOString().slice(0,10),province:"",district:"",constituency:"",ward:"",partner:"",male_reached:"",female_reached:"",marketeers_reached:"",documents_contributed:"",institutions_engaged:"",notes:"",male_marketeers_reached:"",female_marketeers_reached:"",people_reached:"",items_donated:"",schools_supported:"",youth_participants:"",trees_planted:""};
const CATALOGUE_FILTERS={
  "ovc-support": row=>["Social Welfare & Care Project","Humanitarian Aid & Disaster Relief Project","School Donations & Resources Project","Community Resource Mobilisation & Aid Project","Community Service and Volunteerism Project"].includes(row.project),
  "clean-green-healthy": row=>row.project==="Keep Zambia Clean, Green and Healthy Project",
  "education-support": row=>["School Outreach Project","School Donations & Resources Project"].includes(row.project),
  "civic-voter": row=>["Voter Education Project","National Values and Principles Awareness Project","Community Service and Volunteerism Project"].includes(row.project),
  "youth-policy": row=>["Youth Policy Participation","Policy Dialogue Project"].includes(row.project),
  "policy-contribution": row=>row.directorate==="Directorate of Policy, Advocacy & Research" && !["Youth Policy Participation","Policy Dialogue Project"].includes(row.project),
  "community-health": row=>["Health Awareness & Education","Healthy Lifestyles & Wellness","Adolescent & Youth Health","Mental Health & Psychosocial Wellbeing","Substance Abuse Prevention","Community Health Outreach","Hygiene, Sanitation & Environmental Health","First Aid & Health Safety"].includes(row.project),
  "youth-skills": row=>["Agriculture and Agro-processing Project","Technology and Innovation Entrepreneurship Project","Volunteer Management Project"].includes(row.project)
};

export default function ImpactAdminPage(){
 const[programmes,setProgrammes]=useState([]),[activities,setActivities]=useState([]),[catalogue,setCatalogue]=useState([]),[form,setForm]=useState(blank),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[deleting,setDeleting]=useState(null),[authenticated,setAuthenticated]=useState(true),[error,setError]=useState(""),[notice,setNotice]=useState("");
 async function load(){setLoading(true);setError("");try{const r=await fetch("/api/admin/impact",{cache:"no-store"}),d=await r.json();if(r.status===401){setAuthenticated(false);return}if(!r.ok)throw new Error(d.error||"Unable to load Impact register.");setProgrammes(d.programmes||[]);setActivities(d.activities||[]);setAuthenticated(true)}catch(e){setError(e.message)}finally{setLoading(false)}}
 useEffect(()=>{load();(async()=>{try{const r=await fetch("/api/admin/activity-catalogue?active=true",{cache:"no-store"});const d=await r.json();if(r.ok)setCatalogue(d.activities||[])}catch(e){console.error(e)}})()},[]);
 const selected=PROGRAMME_META[form.programme_key];
 const catalogueOptions=useMemo(()=>catalogue.filter(CATALOGUE_FILTERS[form.programme_key]||(()=>true)),[catalogue,form.programme_key]);
 const selectedCatalogue=catalogue.find(x=>String(x.id)===String(form.catalogue_activity_id));
 const province=useMemo(()=>ECZ_2026_LOCATION_HIERARCHY.find(x=>x.name===form.province),[form.province]);
 const districts=province?.districts||[];
 const district=districts.find(x=>x.name===form.district);
 const constituencies=district?.constituencies||[];
 const constituency=constituencies.find(x=>x.name===form.constituency);
 const wards=constituency?.wards||[];
 function change(field,value){setForm(f=>{const n={...f,[field]:value};if(field==="province"){n.district="";n.constituency="";n.ward=""}if(field==="district"){n.constituency="";n.ward=""}if(field==="constituency")n.ward="";return n});setNotice("");setError("")}
 function programmeChange(value){setForm({...blank,programme_key:value,activity_date:form.activity_date});setNotice("");setError("")}
 function catalogueChange(id){const row=catalogue.find(x=>String(x.id)===String(id));setForm(f=>({...f,catalogue_activity_id:id,activity_name:row?.activity||""}));setNotice("");setError("")}
 async function save(e){e.preventDefault();setSaving(true);setError("");setNotice("");try{const payload={...form}; payload.catalogue_activity_id=form.catalogue_activity_id||null;for(const k of ["male_reached","female_reached","male_marketeers_reached","female_marketeers_reached","marketeers_reached","documents_contributed","institutions_engaged","people_reached","items_donated","schools_supported","youth_participants","trees_planted"])payload[k]=payload[k]===""?null:Number(payload[k]);const r=await fetch("/api/admin/impact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}),d=await r.json();if(r.status===401){setAuthenticated(false);throw new Error("Your admin session has expired. Please sign in again.")}if(!r.ok)throw new Error(d.error||"Unable to save activity.");setActivities(a=>[d.activity,...a]);setProgrammes(d.programmes||programmes);setForm({...blank,programme_key:form.programme_key,activity_date:form.activity_date});setNotice("Activity saved. The public Impact figures have been updated.");}catch(e){setError(e.message)}finally{setSaving(false)}}
 async function remove(id){if(!window.confirm("Delete this Impact activity? The public totals will be recalculated."))return;setDeleting(id);setError("");try{const r=await fetch("/api/admin/impact",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})}),d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to delete activity.");setActivities(a=>a.filter(x=>x.id!==id));setProgrammes(d.programmes||programmes);setNotice("Activity deleted and Impact totals recalculated.")}catch(e){setError(e.message)}finally{setDeleting(null)}}
 const programmeName=key=>PROGRAMME_META[key]?.label||key;
 if(!authenticated)return <><SiteHeader ctaLabel="Administration" ctaHref="/admin"/><main className={styles.page}><div className={styles.shell}><section className={styles.message}><h2>Admin sign-in required</h2><p>Your secure session is missing or has expired.</p><Link href="/admin">Return to VSI Admin to sign in</Link></section></div></main><SiteFooter/></>;
 return <><SiteHeader ctaLabel="Administration" ctaHref="/admin"/><main className={styles.page}><div className={styles.shell}>
  <div className={styles.breadcrumb}><Link href="/admin">← Admin dashboard</Link><span> / Impact &amp; Evidence</span></div>
  <header className={styles.hero}><div><p className={styles.eyebrow}>IMPACT &amp; EVIDENCE</p><h1>Impact Activity Register</h1><p>Record the activities that make up the figures shown on the public Impact dashboard.</p></div><span className={styles.heroMark}>IM</span></header>
  {error&&<div className={styles.error} role="alert">{error}</div>}{notice&&<div className={styles.notice} role="status">{notice}</div>}
  {loading?<section className={styles.message}>Loading Impact register…</section>:<form className={styles.formCard} onSubmit={save}>
   <section className={styles.section}><div className={styles.sectionIntro}><span>01</span><div><h2>Select programme</h2><p>Choose the programme first. The relevant Impact fields will appear automatically.</p></div></div>
    <div className={styles.programmeSelect}><label>Programme<select value={form.programme_key} onChange={e=>programmeChange(e.target.value)}>{Object.entries(PROGRAMME_META).map(([key,m])=><option key={key} value={key}>{m.label}</option>)}</select></label><div className={styles.programmeBadge}><strong>{selected.label}</strong><span>{selected.category}</span></div></div>
   </section>
   <section className={styles.section}><div className={styles.sectionIntro}><span>02</span><div><h2>Activity details</h2><p>Every saved activity contributes to the programme totals.</p></div></div>
    <div className={styles.grid}><label className={styles.field}>Activity / project *<select value={form.catalogue_activity_id} onChange={e=>catalogueChange(e.target.value)} required><option value="">Select from VSI Master Activity Catalogue</option>{catalogueOptions.map(x=><option key={x.id} value={x.id}>{x.activity_code} — {x.activity}</option>)}</select></label><label className={styles.field}>Activity date *<input type="date" value={form.activity_date} onChange={e=>change("activity_date",e.target.value)} required/></label><label className={styles.field}>Partners involved<input value={form.partner} onChange={e=>change("partner",e.target.value)} placeholder="Organisation(s), institution(s) or partner(s)"/></label><label className={styles.field}>Notes<input value={form.notes} onChange={e=>change("notes",e.target.value)} placeholder="Optional context or evidence note"/></label></div>
    {selectedCatalogue&&<div className={styles.catalogueMeta}><div><span>PROJECT</span><strong>{selectedCatalogue.project||"—"}</strong></div><div><span>ACTIVITY CODE</span><strong>{selectedCatalogue.activity_code}</strong></div><div><span>SDG ALIGNMENT</span><strong>{selectedCatalogue.sdgs||"—"}</strong></div><div><span>AU AGENDA 2063</span><strong>{selectedCatalogue.au_agenda_2063||"—"}</strong></div></div>}
   </section>
   <section className={styles.section}><div className={styles.sectionIntro}><span>03</span><div><h2>Location</h2><p>Use the verified ECZ hierarchy. Selecting a level filters the next level automatically.</p></div></div>
    <div className={styles.locationGrid}>
     <label className={styles.field}>Province<select value={form.province} onChange={e=>change("province",e.target.value)}><option value="">Select province</option>{ECZ_2026_LOCATION_HIERARCHY.map(x=><option key={x.id}>{x.name}</option>)}</select></label>
     <label className={styles.field}>District<select value={form.district} onChange={e=>change("district",e.target.value)} disabled={!form.province}><option value="">{form.province?"Select district":"Select province first"}</option>{districts.map(x=><option key={x.id}>{x.name}</option>)}</select></label>
     <label className={styles.field}>Constituency<select value={form.constituency} onChange={e=>change("constituency",e.target.value)} disabled={!form.district}><option value="">{form.district?"Select constituency":"Select district first"}</option>{constituencies.map(x=><option key={x.id}>{x.name}</option>)}</select></label>
     <label className={styles.field}>Ward<select value={form.ward} onChange={e=>change("ward",e.target.value)} disabled={!form.constituency}><option value="">{form.constituency?"Select ward":"Select constituency first"}</option>{wards.map(x=><option key={x.id}>{x.name}</option>)}</select></label>
    </div>
   </section>
   <section className={styles.section}><div className={styles.sectionIntro}><span>04</span><div><h2>Impact figures</h2><p>Enter only the measures relevant to the selected programme. These figures are automatically rolled into the public dashboard.</p></div></div>
    <div className={styles.metrics}>{selected.fields.map(([key,label])=><label className={styles.metric} key={key}>{label}<input type="number" min="0" step="1" inputMode="numeric" value={form[key]} onChange={e=>change(key,e.target.value)} placeholder="0"/></label>)}</div>
   </section>
   <div className={styles.formActions}><span>Save the activity to update the public Impact totals.</span><button type="submit" disabled={saving}>{saving?"Saving activity…":"Save activity →"}</button></div>
  </form>}
  {!loading&&<section className={styles.registerPanel}><div className={styles.registerHeader}><div><p className={styles.eyebrowDark}>ACTIVITY REGISTER</p><h2>Activities contributing to Impact figures</h2><p>Each row is the evidence behind the programme totals.</p></div><strong>{activities.length} activities</strong></div>
   {activities.length===0?<div className={styles.empty}>No Impact activities have been entered yet.</div>:<div className={styles.tableWrap}><table><thead><tr><th>Date</th><th>Programme / activity</th><th>Location</th><th>Partner</th><th>Figures</th><th></th></tr></thead><tbody>{activities.map(a=><tr key={a.id}><td>{new Date(a.activity_date+"T00:00:00").toLocaleDateString("en-GB")}</td><td><strong>{programmeName(a.programme_key)}</strong><span>{a.activity_name}</span></td><td><strong>{a.ward||"—"}</strong><span>{[a.constituency,a.district,a.province].filter(Boolean).join(" · ")||"Location not recorded"}</span></td><td>{a.partner||"—"}</td><td><span className={styles.figureList}>{[["B",a.male_reached],["G",a.female_reached],["Mk",a.marketeers_reached],["M",a.male_marketeers_reached],["W",a.female_marketeers_reached],["D",a.documents_contributed],["I",a.institutions_engaged]].filter(([,v])=>v!==null&&v!==undefined).map(([k,v])=><b key={k}>{k} {Number(v).toLocaleString()}</b>)}</span></td><td><button type="button" className={styles.deleteButton} onClick={()=>remove(a.id)} disabled={deleting===a.id}>{deleting===a.id?"…":"Delete"}</button></td></tr>)}</tbody></table></div>}
  </section>}
 </div></main><SiteFooter/></>;
}
