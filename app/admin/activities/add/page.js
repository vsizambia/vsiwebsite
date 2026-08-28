"use client";

import {useEffect,useMemo,useState} from "react";
import {useRouter} from "next/navigation";
import {SiteFooter,SiteHeader} from "../../../components/SiteChrome";
import styles from "./add.module.css";

const emptyForm={activityDate:new Date().toISOString().slice(0,10),activityName:"",project:"",location:"",startTime:"08:00",endTime:"14:00",description:""};
function hoursBetween(start,end){if(!start||!end)return 0;const [sh,sm]=start.split(":").map(Number);const [eh,em]=end.split(":").map(Number);let minutes=(eh*60+em)-(sh*60+sm);if(minutes<0)minutes+=1440;return Number((minutes/60).toFixed(2));}

export default function AddVolunteerActivity(){
 const router=useRouter();
 const [volunteers,setVolunteers]=useState([]),[search,setSearch]=useState(""),[selected,setSelected]=useState(null),[form,setForm]=useState(emptyForm),[error,setError]=useState(""),[saving,setSaving]=useState(false),[loading,setLoading]=useState(true),[saved,setSaved]=useState(false);
 useEffect(()=>{let alive=true;fetch("/api/admin/volunteers",{cache:"no-store"}).then(async r=>{const d=await r.json();if(r.status===401)throw new Error("Admin authentication required.");if(!r.ok)throw new Error(d.error||"Unable to load approved volunteers.");if(alive)setVolunteers((d.applications||[]).filter(v=>v.status==="approved"));}).catch(e=>alive&&setError(e.message)).finally(()=>alive&&setLoading(false));return()=>{alive=false};},[]);
 const matches=useMemo(()=>{const q=search.trim().toLowerCase();if(!q||selected)return [];return volunteers.filter(v=>`${v.full_name} ${v.volunteer_id||""}`.toLowerCase().includes(q)).slice(0,8);},[search,selected,volunteers]);
 const hours=hoursBetween(form.startTime,form.endTime);
 function chooseVolunteer(v){setSelected(v);setSearch(v.full_name);setError("");}
 function clearVolunteer(){setSelected(null);setSearch("");}
 async function submit(e){e.preventDefault();if(!selected){setError("Please enter and select an approved volunteer from the list.");return;}setSaving(true);setError("");setSaved(false);try{const r=await fetch("/api/admin/activity",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({volunteerId:selected.id,activityDate:form.activityDate,activityName:form.activityName,project:form.project,location:form.location,startTime:form.startTime,endTime:form.endTime,description:form.description,supervisorName:selected.line_manager_name||"",verified:false})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to save activity.");setSaved(true);setForm(emptyForm);setTimeout(()=>router.push("/admin/activities"),900);}catch(e){setError(e.message)}finally{setSaving(false);}}
 return <>
  <SiteHeader ctaLabel="Activity Register" ctaHref="/admin/activities"/>
  <main className={styles.activityPage}>
   <div className={styles.activityShell}>
    <div className="topline"><span>VSI IMS <b>/</b> Record Volunteer Activity</span><button type="button" onClick={()=>router.push("/admin/activities")}>Back to register</button></div>
    <section className={styles.activityHeader}><p className="kicker">VOLUNTEER HOURS</p><h1>Record volunteer activity.</h1><p>Record an activity for an approved VSI volunteer. Activities start as unverified and are reviewed before verified hours count toward the volunteer profile.</p></section>
    <form className={styles.formCard} onSubmit={submit}>
     <section className={styles.section}>
      <div className={styles.sectionIntro}><span>01</span><div><h2>Approved volunteer</h2><p>Search by name. The volunteer's VSI ID and supervisor details are pulled automatically from their profile.</p></div></div>
      <div className={styles.grid}>
       <div className={`${styles.field} ${styles.full}`}><label htmlFor="volunteer-search">Volunteer name *</label><div className={styles.searchArea}><input id="volunteer-search" value={search} onChange={e=>{setSearch(e.target.value);if(selected)setSelected(null)}} placeholder={loading?"Loading approved volunteers…":"Start typing volunteer name"} disabled={loading} autoComplete="off" />{matches.length>0&&<div className={styles.suggestions}>{matches.map(v=><button type="button" key={v.id} className={styles.suggestion} onClick={()=>chooseVolunteer(v)}><strong>{v.full_name}</strong><span>{v.volunteer_id||"VSI ID not assigned"}</span></button>)}</div>}</div></div>
       {selected&&<div className={styles.profileCard}><div className={styles.profileItem}><span>VOLUNTEER</span><strong>{selected.full_name}</strong></div><div className={styles.profileItem}><span>VSI ID NUMBER</span><strong>{selected.volunteer_id||"—"}</strong></div><div className={styles.full}><button type="button" className={styles.clear} onClick={clearVolunteer}>Change volunteer</button></div></div>}
      </div>
     </section>
     {selected&&<section className={styles.section}>
      <div className={styles.sectionIntro}><span>02</span><div><h2>Supervisor</h2><p>The supervisor is taken directly from the selected volunteer's profile.</p></div></div>
      <div className={styles.grid}><div className={styles.supervisorBox}><div className={styles.supervisorTitle}><div><p className="kicker">VOLUNTEER SUPERVISOR</p></div><strong>From volunteer profile</strong></div><div className={styles.profileCard} style={{padding:0,border:0,background:"transparent"}}><div className={styles.profileItem}><span>NAME</span><strong>{selected.line_manager_name||"Not recorded on profile"}</strong></div><div className={styles.profileItem}><span>TITLE</span><strong>{selected.line_manager_title||"—"}</strong></div><div className={styles.profileItem}><span>PHONE</span><strong>{selected.line_manager_phone||"—"}</strong></div><div className={styles.profileItem}><span>EMAIL</span><strong>{selected.line_manager_email||"—"}</strong></div></div></div></div>
     </section>}
     <section className={styles.section}>
      <div className={styles.sectionIntro}><span>{selected?"03":"02"}</span><div><h2>Activity details</h2><p>Record the activity, where it took place and the time served.</p></div></div>
      <div className={styles.grid}>
       <label className={styles.field}>Activity date *<input type="date" value={form.activityDate} onChange={e=>setForm({...form,activityDate:e.target.value})} required /></label>
       <label className={styles.field}>Activity name *<input placeholder="e.g. Community outreach session" value={form.activityName} onChange={e=>setForm({...form,activityName:e.target.value})} required /></label>
       <label className={styles.field}>Project / programme<input placeholder="Programme or project" value={form.project} onChange={e=>setForm({...form,project:e.target.value})} /></label>
       <label className={styles.field}>Location<input placeholder="Where the activity took place" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} /></label>
       <label className={styles.field}>Start time *<input type="time" value={form.startTime} onChange={e=>setForm({...form,startTime:e.target.value})} required /></label>
       <label className={styles.field}>End time *<input type="time" value={form.endTime} onChange={e=>setForm({...form,endTime:e.target.value})} required /></label>
       <div className={styles.field}><span>Hours served</span><div className={styles.hoursBox}><strong>{hours.toFixed(2)} hours</strong></div><span className={styles.helper}>Calculated automatically from the start and end time.</span></div>
       <label className={styles.field}>Description<input placeholder="Brief description of the volunteer's contribution" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></label>
      </div>
     </section>
     <section className={styles.section}>
      <div className={styles.sectionIntro}><span>{selected?"04":"03"}</span><div><h2>Submit for verification</h2><p>Activities are recorded as unverified until an administrator reviews them.</p></div></div>
      <div className={styles.grid}><div className={styles.submitRow}><button className={styles.button} disabled={saving||!selected}>{saving?"Saving…":"Add activity for verification →"}</button><span className={styles.helper}>New activity starts as <strong>unverified</strong>.</span></div>{saved&&<div className={styles.status}>Activity recorded successfully. Returning to the Activity Register…</div>}{error&&<div className={styles.error}>{error}</div>}</div>
     </section>
    </form>
   </div>
  </main>
  <SiteFooter/>
 </>;
}
