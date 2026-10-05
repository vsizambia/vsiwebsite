"use client";

import { useEffect, useMemo, useState } from "react";

const PALETTE=["#094074","#3c6997","#003566","#ffc300","#ffd60a"];
const metricValue=(programme,key)=>{const metric=(programme?.metrics||[]).find(item=>item.key===key);return metric?.value==null||metric.value===""?0:Number(metric.value)||0};
const formatValue=value=>Number(value||0).toLocaleString();
const alignmentTokens=(rows,field,pattern)=>{const counts={};rows.forEach(row=>{(row[field]||"").match(pattern)?.forEach(token=>{const key=token.trim();if(key)counts[key]=(counts[key]||0)+1})});return Object.entries(counts).sort((a,b)=>b[1]-a[1])};
const shareStyle=(male,female)=>{const total=male+female;if(!total)return {background:"#e8eef3"};const split=male/total*100;return {background:"conic-gradient(#094074 0 "+split+"%, #ffd60a "+split+"% 100%)"}};

function BarList({items,empty}){const max=Math.max(1,...items.map(item=>item.value));return items.length?<div className="impact-bar-list">{items.map((item,index)=><div className="impact-bar-row" key={item.label}><div className="impact-bar-label"><span>{item.label}</span><strong>{formatValue(item.value)}</strong></div><div className="impact-bar-track"><i style={{width:Math.max(3,item.value/max*100)+"%",background:PALETTE[index%PALETTE.length]}}/></div></div>)}</div>:<div className="impact-empty">{empty}</div>}

function AlignmentList({items}){return items.length?<div className="impact-alignment-list">{items.map(([label,value],index)=><div className="impact-alignment-item" key={label}><span className="impact-alignment-dot" style={{background:PALETTE[index%PALETTE.length]}}/><div><strong>{label}</strong><small>{value} catalogue activities</small></div><b>{value}</b></div>)}</div>:<div className="impact-empty">Alignment data will appear as catalogue-linked activities are recorded.</div>}

export default function ImpactProgrammeCards({initialProgrammes}){
 const[programmes,setProgrammes]=useState(initialProgrammes||[]);
 const[activities,setActivities]=useState([]);
 const[selectedKey,setSelectedKey]=useState(initialProgrammes?.[0]?.programme_key||"ovc-support");
 useEffect(()=>{let active=true;fetch("/api/impact",{cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject()).then(data=>{if(!active)return;if(Array.isArray(data.programmes)&&data.programmes.length)setProgrammes(data.programmes);if(Array.isArray(data.activities))setActivities(data.activities)}).catch(()=>{});return()=>{active=false}},[]);
 const selected=programmes.find(p=>p.programme_key===selectedKey)||programmes[0];
 const detailRows=useMemo(()=>activities.filter(a=>a.programme_key===selected?.programme_key),[activities,selected]);
 const detail=useMemo(()=>{
  if(!selected)return null;
  const sum=k=>detailRows.reduce((n,r)=>n+(Number(r[k])||0),0);
  const locations={};detailRows.forEach(r=>{const key=r.province||"Location not recorded";locations[key]=(locations[key]||0)+1});
  const partners={};detailRows.forEach(r=>(r.partner||"Partner not recorded").split(/[,;|]/).map(x=>x.trim()).filter(Boolean).forEach(x=>{partners[x]=(partners[x]||0)+1}));
  const sdgs=alignmentTokens(detailRows,"sdgs",/SDG\s*\d+/gi);
  const aus=alignmentTokens(detailRows,"au_agenda_2063",/Aspiration\s*\d+/gi);
  const male=sum("male_reached"),female=sum("female_reached");\n  const maleMarketeers=sum("male_marketeers_reached"),femaleMarketeers=sum("female_marketeers_reached");
  const primary=selected.programme_key==="policy-contribution"?sum("documents_contributed"):selected.programme_key==="clean-green-healthy"?sum("marketeers_reached"):male+female;
  return{count:detailRows.length,male,female,maleMarketeers,femaleMarketeers,primary,locations:Object.entries(locations).map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value).slice(0,7),partners:Object.entries(partners).map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value).slice(0,6),sdgs,aus};
 },[detailRows,selected]);
 const overview=useMemo(()=>({activities:programmes.reduce((n,p)=>n+metricValue(p,"activities"),0),male:programmes.reduce((n,p)=>n+metricValue(p,"male"),0),female:programmes.reduce((n,p)=>n+metricValue(p,"female"),0),documents:programmes.reduce((n,p)=>n+metricValue(p,"documents"),0)}),[programmes]);
 if(!selected)return null;
 return <div className="impact-dashboard">
  <div className="impact-dashboard-heading"><div><span className="impact-dashboard-kicker">IMPACT &amp; EVIDENCE</span><h2>Impact at a glance</h2></div><span className="impact-dashboard-status"><i/> Live programme register</span></div>
  <div className="impact-kpi-grid" aria-label="Impact overview">
   <div className="impact-kpi"><span className="impact-kpi-label">Activities conducted</span><strong>{formatValue(overview.activities)}</strong><small>Across tracked programmes</small></div>
   <div className="impact-kpi"><span className="impact-kpi-label">Boys reached</span><strong>{formatValue(overview.male)}</strong><small>Reported child reach</small></div>
   <div className="impact-kpi"><span className="impact-kpi-label">Girls reached</span><strong>{formatValue(overview.female)}</strong><small>Reported child reach</small></div>
   <div className="impact-kpi impact-kpi-accent"><span className="impact-kpi-label">Policy documents</span><strong>{formatValue(overview.documents)}</strong><small>Contributions recorded</small></div>
  </div>
  <div className="impact-section-heading"><div><span>PROGRAMME PERFORMANCE</span><h3>Where the work is happening</h3></div><span>{programmes.length} programmes tracked</span></div>
  <div className="impact-dashboard-shell">
   <aside className="impact-programme-nav" aria-label="Impact programmes">
    <div className="impact-nav-heading"><span>PROGRAMMES</span><small>Select a programme</small></div>
    {programmes.map(programme=><button type="button" className={programme.programme_key===selectedKey?"is-active":""} onClick={()=>setSelectedKey(programme.programme_key)} key={programme.programme_key}><span className="impact-nav-number">{programme.number}</span><span><strong>{programme.title}</strong><small>{programme.category}</small></span><b>→</b></button>)}
   </aside>
   <section className="impact-detail-panel">
    <header className="impact-detail-header"><div><span className="impact-detail-kicker">{selected.category}</span><h3>{selected.title}</h3><p>{selected.description}</p></div><span className="impact-live-chip">{detail.count} recorded activities</span></header>
    <div className="impact-detail-kpis">
     <div><span>Activities</span><strong>{formatValue(detail.count)}</strong></div>
     {selected.programme_key==="ovc-support"||selected.programme_key==="education-support"?<><div><span>Boys reached</span><strong>{formatValue(detail.male)}</strong></div><div><span>Girls reached</span><strong>{formatValue(detail.female)}</strong></div></>:selected.programme_key==="clean-green-healthy"?<div><span>Marketeers reached</span><strong>{formatValue(detail.primary)}</strong></div>:<><div><span>Documents contributed</span><strong>{formatValue(metricValue(selected,"documents"))}</strong></div><div><span>Institutions engaged</span><strong>{formatValue(metricValue(selected,"institutions"))}</strong></div></>}
    </div>
    <div className="impact-detail-grid">
     <article className="impact-panel impact-location-panel"><div className="impact-panel-head"><div><span>GEOGRAPHIC REACH</span><h4>Performance by location</h4></div><small>{detail.locations.length} locations</small></div><BarList items={detail.locations} empty="No locations recorded yet."/></article>
     {(selected.programme_key==="ovc-support"||selected.programme_key==="education-support")?<article className="impact-panel impact-reach-panel"><div className="impact-panel-head"><div><span>REACH COMPOSITION</span><h4>Boys vs girls</h4></div></div><div className="impact-donut-wrap"><div className="impact-donut" style={shareStyle(detail.male,detail.female)}><div><strong>{formatValue(detail.male+detail.female)}</strong><small>Total reached</small></div></div><div className="impact-legend"><span><i/>Boys <b>{formatValue(detail.male)}</b></span><span><i/>Girls <b>{formatValue(detail.female)}</b></span></div></div></article>:<article className="impact-panel impact-reach-panel"><div className="impact-panel-head"><div><span>PROGRAMME OUTPUT</span><h4>{selected.programme_key==="clean-green-healthy"?"Marketeers reached":"Policy contribution"}</h4></div></div><div className="impact-output-number"><strong>{formatValue(detail.primary)}</strong><span>{selected.programme_key==="clean-green-healthy"?"Marketeers reached":"Documents contributed"}</span>{selected.programme_key==="clean-green-healthy"&&(detail.maleMarketeers||detail.femaleMarketeers)?<div className="impact-output-breakdown"><span>Men <b>{formatValue(detail.maleMarketeers)}</b></span><span>Women <b>{formatValue(detail.femaleMarketeers)}</b></span></div>:null}</div></article>}
     <article className="impact-panel"><div className="impact-panel-head"><div><span>PARTNERS</span><h4>Engagement network</h4></div><small>{detail.partners.length} named</small></div><BarList items={detail.partners} empty="Partners will appear as activities are recorded."/></article>
     <article className="impact-panel"><div className="impact-panel-head"><div><span>GLOBAL ALIGNMENT</span><h4>UN SDGs</h4></div><small>Catalogue mapped</small></div><AlignmentList items={detail.sdgs}/></article>
     <article className="impact-panel"><div className="impact-panel-head"><div><span>AFRICAN UNION</span><h4>Agenda 2063</h4></div><small>Catalogue mapped</small></div><AlignmentList items={detail.aus}/></article>
     <article className="impact-panel impact-activity-panel"><div className="impact-panel-head"><div><span>RECENT EVIDENCE</span><h4>Activity timeline</h4></div><small>Latest records</small></div>{detailRows.length?<div className="impact-timeline">{detailRows.slice(0,6).map(row=><div className="impact-timeline-item" key={row.id}><span className="impact-timeline-date">{new Date(row.activity_date+"T00:00:00").toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</span><div><strong>{row.activity_name}</strong><small>{[row.ward,row.constituency,row.district,row.province].filter(Boolean).join(" · ")||"Location not recorded"}{row.partner?" · "+row.partner:""}</small></div></div>)}</div>:<div className="impact-empty">No activity evidence has been recorded for this programme yet.</div>}</article>
    </div>
   </section>
  </div>
 </div>;
}
