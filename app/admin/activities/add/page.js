"use client";

import {useEffect,useMemo,useState} from "react";
import {useRouter} from "next/navigation";
import {SiteFooter,SiteHeader} from "../../../components/SiteChrome";
import styles from "../../volunteers/admin.module.css";

const emptyForm={
  activityDate:new Date().toISOString().slice(0,10),
  activityName:"",
  project:"",
  location:"",
  startTime:"08:00",
  endTime:"14:00",
  description:""
};

function hoursBetween(start,end){
  if(!start||!end)return 0;
  const [sh,sm]=start.split(":").map(Number);
  const [eh,em]=end.split(":").map(Number);
  let minutes=(eh*60+em)-(sh*60+sm);
  if(minutes<0)minutes+=1440;
  return Number((minutes/60).toFixed(2));
}

export default function AddVolunteerActivity(){
  const router=useRouter();
  const [volunteers,setVolunteers]=useState([]);
  const [search,setSearch]=useState("");
  const [selected,setSelected]=useState(null);
  const [form,setForm]=useState(emptyForm);
  const [error,setError]=useState("");
  const [saving,setSaving]=useState(false);
  const [loading,setLoading]=useState(true);
  const [saved,setSaved]=useState(false);

  useEffect(()=>{
    let alive=true;
    fetch("/api/admin/volunteers",{cache:"no-store"})
      .then(async r=>{
        const d=await r.json();
        if(r.status===401)throw new Error("Admin authentication required.");
        if(!r.ok)throw new Error(d.error||"Unable to load approved volunteers.");
        if(alive)setVolunteers((d.applications||[]).filter(v=>v.status==="approved"));
      })
      .catch(e=>alive&&setError(e.message))
      .finally(()=>alive&&setLoading(false));
    return()=>{alive=false};
  },[]);

  const matches=useMemo(()=>{
    const q=search.trim().toLowerCase();
    if(!q||selected)return [];
    return volunteers.filter(v=>`${v.full_name} ${v.volunteer_id||""}`.toLowerCase().includes(q)).slice(0,8);
  },[search,selected,volunteers]);

  const hours=hoursBetween(form.startTime,form.endTime);

  function chooseVolunteer(volunteer){
    setSelected(volunteer);
    setSearch(volunteer.full_name);
    setError("");
  }

  function clearVolunteer(){
    setSelected(null);
    setSearch("");
  }

  async function submit(e){
    e.preventDefault();
    if(!selected){setError("Please enter and select an approved volunteer from the list.");return;}
    setSaving(true);setError("");setSaved(false);
    try{
      const r=await fetch("/api/admin/activity",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          volunteerId:selected.id,
          activityDate:form.activityDate,
          activityName:form.activityName,
          project:form.project,
          location:form.location,
          startTime:form.startTime,
          endTime:form.endTime,
          description:form.description,
          supervisorName:selected.line_manager_name||"",
          verified:false
        })
      });
      const d=await r.json();
      if(!r.ok)throw new Error(d.error||"Unable to save activity.");
      setSaved(true);
      setForm(emptyForm);
      setTimeout(()=>router.push("/admin/activities"),900);
    }catch(e){setError(e.message)}finally{setSaving(false)}
  }

  return <>
    <SiteHeader ctaLabel="Activity Register" ctaHref="/admin/activities"/>
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.topline}>
          <span>VSI IMS <b>/</b> Record Volunteer Activity</span>
          <button type="button" onClick={()=>router.push("/admin/activities")}>Back to register</button>
        </div>

        <section className={styles.hero}>
          <div>
            <p className="kicker light">VOLUNTEER HOURS</p>
            <h1>Record volunteer activity</h1>
            <p>Record an activity for an approved VSI volunteer. Activities start as unverified and are reviewed before verified hours count toward the volunteer profile.</p>
          </div>
        </section>

        <section className={styles.registerPanel}>
          <div className={styles.registerHeader}>
            <div><p className="kicker">APPROVED VOLUNTEER</p><h2>Select volunteer</h2></div>
            <strong>Approved volunteers only</strong>
          </div>

          <div style={{position:"relative",marginBottom:20}}>
            <label style={{display:"block",fontWeight:700,marginBottom:7}}>Volunteer name</label>
            <input
              value={search}
              onChange={e=>{setSearch(e.target.value);if(selected)setSelected(null)}}
              placeholder={loading?"Loading approved volunteers…":"Start typing volunteer name"}
              disabled={loading}
              autoComplete="off"
              style={{width:"100%"}}
            />
            {matches.length>0&&<div style={{position:"absolute",zIndex:5,left:0,right:0,top:"100%",background:"white",border:"1px solid #d9dee8",borderRadius:10,boxShadow:"0 12px 30px rgba(0,0,0,.10)",overflow:"hidden"}}>
              {matches.map(v=><button type="button" key={v.id} onClick={()=>chooseVolunteer(v)} style={{display:"block",width:"100%",textAlign:"left",padding:"12px 14px",border:0,borderBottom:"1px solid #eef1f5",background:"white",cursor:"pointer"}}>
                <strong>{v.full_name}</strong><span style={{display:"block",fontSize:13,opacity:.7}}>{v.volunteer_id||"VSI ID not assigned"}</span>
              </button>)}
            </div>}
          </div>

          {selected&&<div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:16,marginBottom:24,padding:18,borderRadius:12,background:"#f5f7fa"}}>
            <div><span style={{display:"block",fontSize:12,fontWeight:700,opacity:.65}}>VOLUNTEER</span><strong>{selected.full_name}</strong></div>
            <div><span style={{display:"block",fontSize:12,fontWeight:700,opacity:.65}}>VSI ID NUMBER</span><strong>{selected.volunteer_id||"—"}</strong></div>
            <div style={{gridColumn:"1 / -1"}}><button type="button" className={styles.clearButton} onClick={clearVolunteer}>Change volunteer</button></div>
          </div>}

          {selected&&<div style={{marginBottom:24}}>
            <div className={styles.registerHeader} style={{marginBottom:12}}>
              <div><p className="kicker">SUPERVISOR</p><h2>Volunteer supervisor</h2></div>
              <strong>From volunteer profile</strong>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:16,padding:18,border:"1px solid #e5e9ef",borderRadius:12}}>
              <div><span style={{display:"block",fontSize:12,fontWeight:700,opacity:.65}}>NAME</span><strong>{selected.line_manager_name||"Not recorded on profile"}</strong></div>
              <div><span style={{display:"block",fontSize:12,fontWeight:700,opacity:.65}}>TITLE</span><strong>{selected.line_manager_title||"—"}</strong></div>
              <div><span style={{display:"block",fontSize:12,fontWeight:700,opacity:.65}}>PHONE</span><strong>{selected.line_manager_phone||"—"}</strong></div>
              <div><span style={{display:"block",fontSize:12,fontWeight:700,opacity:.65}}>EMAIL</span><strong>{selected.line_manager_email||"—"}</strong></div>
            </div>
          </div>}

          <form onSubmit={submit} className={styles.toolbar} style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:12}}>
            <input type="date" value={form.activityDate} onChange={e=>setForm({...form,activityDate:e.target.value})} required/>
            <input placeholder="Activity name *" value={form.activityName} onChange={e=>setForm({...form,activityName:e.target.value})} required/>
            <input placeholder="Project / programme" value={form.project} onChange={e=>setForm({...form,project:e.target.value})}/>
            <input placeholder="Location" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/>
            <input type="time" value={form.startTime} onChange={e=>setForm({...form,startTime:e.target.value})} required/>
            <input type="time" value={form.endTime} onChange={e=>setForm({...form,endTime:e.target.value})} required/>
            <div style={{display:"flex",alignItems:"center",padding:"0 12px",border:"1px solid #e5e9ef",borderRadius:8,background:"#f8fafc"}}><span style={{fontSize:13,opacity:.7}}>Calculated hours:&nbsp;</span><strong>{hours.toFixed(2)} hrs</strong></div>
            <input placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
            <div style={{gridColumn:"1 / -1",display:"flex",alignItems:"center",gap:12,marginTop:4}}>
              <button className={styles.saveReview} disabled={saving||!selected}>{saving?"Saving…":"Add activity for verification"}</button>
              <span style={{fontSize:13,opacity:.7}}>Activities start as unverified.</span>
            </div>
          </form>
          {saved&&<div style={{marginTop:14,padding:12,borderRadius:8,background:"#eef8f1"}}>Activity recorded successfully. Returning to the Activity Register…</div>}
          {error&&<div className={styles.error}>{error}</div>}
        </section>
      </div>
    </main>
    <SiteFooter/>
  </>;
}
