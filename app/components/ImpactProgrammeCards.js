"use client";

import { useEffect, useMemo, useState } from "react";

const PALETTE=["#094074","#3c6997","#003566","#ffc300","#ffd60a"];
const metricValue=(programme,key)=>{const metric=(programme?.metrics||[]).find(item=>item.key===key);return metric?.value==null||metric.value===""?0:Number(metric.value)||0};
const formatValue=value=>Number(value||0).toLocaleString();
const genderLabels=key=>key==="ovc-support"||key==="education-support"?["Boys","Girls"]:["Male","Female"];
const PROGRAMME_COPY={
 "ovc-support":{title:"Community Service & Humanitarian Action",category:"COMMUNITY IMPACT",description:"Supporting vulnerable communities through community-led service, humanitarian assistance, donations and social support."},
 "clean-green-healthy":{title:"Keep Zambia Clean, Green and Healthy",category:"COMMUNITY ACTION",description:"Advancing cleaner, greener and healthier communities through environmental action, education, waste management and restoration."},
 "education-support":{title:"Education, Schools & Youth Development",category:"LEARNING & OPPORTUNITY",description:"Strengthening learners and young people through school outreach, mentorship, educational support and youth development."},
 "civic-voter":{title:"Civic & Voter Education",category:"CIVIC LEADERSHIP",description:"Supporting informed, peaceful and non-partisan civic and voter participation through community education and democratic awareness."},
 "youth-policy":{title:"Youth Policy Dialogue & Participation",category:"YOUTH VOICE",description:"Creating meaningful spaces for young people to contribute to policy dialogue, governance discussions and public decision-making."},
 "policy-contribution":{title:"Policy Advocacy, Research & Governance",category:"POLICY & ADVOCACY",description:"Generating evidence and contributing to policy, research, governance and constructive institutional engagement."},
 "community-health":{title:"Community Health & Wellbeing",category:"HEALTH & WELLBEING",description:"Improving community health and wellbeing through outreach, health education, prevention, referral and supportive services."},
 "youth-skills":{title:"Youth Skills, Innovation & Economic Empowerment",category:"YOUTH DEVELOPMENT",description:"Equipping young people with practical skills, innovation, entrepreneurship and economic opportunities."}
};
const normalizeProgrammes=rows=>(rows||[]).map(row=>PROGRAMME_COPY[row.programme_key]?{...row,...PROGRAMME_COPY[row.programme_key]}:row);
const alignmentTokens=(rows,field,pattern)=>{const counts={};rows.forEach(row=>{(row[field]||"").match(pattern)?.forEach(token=>{const key=token.trim();if(key)counts[key]=(counts[key]||0)+1})});return Object.entries(counts).sort((a,b)=>b[1]-a[1])};
const SDG_NAMES={"1":"No Poverty","2":"Zero Hunger","3":"Good Health and Well-being","4":"Quality Education","5":"Gender Equality","6":"Clean Water and Sanitation","7":"Affordable and Clean Energy","8":"Decent Work and Economic Growth","9":"Industry, Innovation and Infrastructure","10":"Reduced Inequalities","11":"Sustainable Cities and Communities","12":"Responsible Consumption and Production","13":"Climate Action","14":"Life Below Water","15":"Life on Land","16":"Peace, Justice and Strong Institutions","17":"Partnerships for the Goals"};
const AU_ASPIRATION_NAMES={"1":"A prosperous Africa based on inclusive growth and sustainable development","2":"An integrated continent, politically united and based on the ideals of Pan-Africanism","3":"An Africa of good governance, democracy, respect for human rights, justice and the rule of law","4":"A peaceful and secure Africa","5":"An Africa with a strong cultural identity, common heritage, shared values and ethics","6":"An Africa whose development is people-driven, relying on the potential of African people, especially its women and youth","7":"Africa as a strong, united, resilient and influential global player and partner"};
const shareStyle=(male,female)=>{const total=male+female;if(!total)return {background:"#e8eef3"};const split=male/total*100;return {background:"conic-gradient(#094074 0 "+split+"%, #ffd60a "+split+"% 100%)"}};

function BarList({items,empty}){
 const max=Math.max(1,...items.map(item=>item.value));
 if(!items.length)return <div className="impact-empty">{empty}</div>;
 return <div className="impact-bar-list">{items.map((item,index)=><div className="impact-bar-row" key={item.label}><div className="impact-bar-label"><span>{item.label}</span><strong>{formatValue(item.value)}</strong></div><div className="impact-bar-track"><i style={{width:Math.max(3,item.value/max*100)+"%",background:PALETTE[index%PALETTE.length]}}/></div></div>)}</div>;
}

function AlignmentList({items,type}){
 const names=type==="sdg"?SDG_NAMES:AU_ASPIRATION_NAMES;
 if(!items.length)return <div className="impact-empty">Alignment data will appear as catalogue-linked activities are recorded.</div>;
 return <div className="impact-alignment-list">
  {items.map(([label,value],index)=>{
   const match=String(label).match(/([0-9]+)/);
   const number=match?.[1];
   const name=number?`${type==="sdg"?"SDG":"Aspiration"} ${number} — ${names[number]||label}`:label;
   return <div className="impact-alignment-item" key={label}>
    <span className="impact-alignment-dot" style={{background:PALETTE[index%PALETTE.length]}}/>
    <div><strong>{name}</strong><small>{value} catalogue {value===1?"activity":"activities"}</small></div>
    <b>{value}</b>
   </div>;
  })}
 </div>;
}


function DetailKpis({selected,detail}){
 const key=selected.programme_key;
 if(key==="ovc-support"||key==="education-support"){
  return <><div><span>Boys reached</span><strong>{formatValue(detail.male)}</strong></div><div><span>Girls reached</span><strong>{formatValue(detail.female)}</strong></div></>;
 }
 if(key==="clean-green-healthy"){
  return <div><span>Marketeers reached</span><strong>{formatValue(detail.primary)}</strong></div>;
 }
 return <><div><span>Documents contributed</span><strong>{formatValue(metricValue(selected,"documents"))}</strong></div><div><span>Institutions engaged</span><strong>{formatValue(metricValue(selected,"institutions"))}</strong></div></>;
}

function DetailOutputPanel({selected,detail}){
 const key=selected.programme_key;
 const isGender=key==="ovc-support"||key==="education-support"||key==="civic-voter"||key==="community-health"||key==="youth-skills"||key==="youth-policy";

 if(isGender){
  const title=key==="youth-policy"?"Participation by gender":"Reach by gender";
  const [maleLabel,femaleLabel]=genderLabels(key);
  return <article className="impact-panel impact-reach-panel"><div className="impact-panel-head"><div><span>REACH COMPOSITION</span><h4>{title}</h4></div></div><div className="impact-donut-wrap"><div className="impact-donut" style={shareStyle(detail.male,detail.female)}><div><strong>{formatValue(detail.male+detail.female)}</strong><small>Total recorded</small></div></div><div className="impact-legend"><span><i/>{maleLabel} <b>{formatValue(detail.male)}</b></span><span><i/>{femaleLabel} <b>{formatValue(detail.female)}</b></span></div></div></article>;
 }
 const isMarketeers=key==="clean-green-healthy";
 const title=isMarketeers?"Marketeers reached":"Policy contribution";
 const label=isMarketeers?"Marketeers reached":"Documents contributed";
 return <article className="impact-panel impact-reach-panel"><div className="impact-panel-head"><div><span>PROGRAMME OUTPUT</span><h4>{title}</h4></div></div><div className="impact-output-number"><strong>{formatValue(detail.primary)}</strong><span>{label}</span>{isMarketeers&&(detail.maleMarketeers||detail.femaleMarketeers)?<div className="impact-output-breakdown"><span>Men <b>{formatValue(detail.maleMarketeers)}</b></span><span>Women <b>{formatValue(detail.femaleMarketeers)}</b></span></div>:null}</div></article>;
}

export default function ImpactProgrammeCards({initialProgrammes}){
 const[programmes,setProgrammes]=useState(normalizeProgrammes(initialProgrammes||[]));
 const[activities,setActivities]=useState([]);
 const[selectedKey,setSelectedKey]=useState(initialProgrammes?.[0]?.programme_key||"ovc-support");
 useEffect(()=>{let active=true;fetch("/api/impact",{cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject()).then(data=>{if(!active)return;if(Array.isArray(data.programmes)&&data.programmes.length)setProgrammes(normalizeProgrammes(data.programmes));if(Array.isArray(data.activities))setActivities(data.activities)}).catch(()=>{});return()=>{active=false}},[]);
 const selected=programmes.find(p=>p.programme_key===selectedKey)||programmes[0];
 const detailRows=useMemo(()=>activities.filter(a=>a.programme_key===selected?.programme_key),[activities,selected]);
 const detail=useMemo(()=>{
  if(!selected)return null;
  const sum=k=>detailRows.reduce((n,r)=>n+(Number(r[k])||0),0);
  const locations={};detailRows.forEach(r=>{const key=r.province||"Location not recorded";locations[key]=(locations[key]||0)+1});
  const partners={};detailRows.forEach(r=>(r.partner||"Partner not recorded").split(/[,;|]/).map(x=>x.trim()).filter(Boolean).forEach(x=>{partners[x]=(partners[x]||0)+1}));
  const sdgs=alignmentTokens(detailRows,"sdgs",/SDG\s*[0-9]+/gi);
  const aus=alignmentTokens(detailRows,"au_agenda_2063",/Aspiration\s*[0-9]+/gi);
  const male=sum("male_reached"),female=sum("female_reached");
  const maleMarketeers=sum("male_marketeers_reached"),femaleMarketeers=sum("female_marketeers_reached");
  const peopleRecorded=sum("people_reached"),people=peopleRecorded||male+female;
  const items=sum("items_donated"),schools=sum("schools_supported"),youth=sum("youth_participants"),trees=sum("trees_planted");
  const primary=selected.programme_key==="policy-contribution"?sum("documents_contributed"):selected.programme_key==="clean-green-healthy"?sum("marketeers_reached"):selected.programme_key==="youth-policy"?male+female:people;
  return{count:detailRows.length,male,female,maleMarketeers,femaleMarketeers,people,items,schools,youth,trees,primary,locations:Object.entries(locations).map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value).slice(0,7),partners:Object.entries(partners).map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value).slice(0,6),sdgs,aus};
 },[detailRows,selected]);
 const overview=useMemo(()=>{const people=activities.reduce((n,row)=>{const direct=Number(row.people_reached)||0;const gender=(Number(row.male_reached)||0)+(Number(row.female_reached)||0);const marketeers=Number(row.marketeers_reached)||0;return n+(direct||gender||marketeers)},0);const institutionKeys=new Set();let unlabelledInstitutions=0;activities.forEach(row=>{const count=Math.max(Number(row.institutions_engaged)||0,Number(row.schools_supported)||0);if(!count)return;const partners=String(row.partner||"").split(/[,;|]/).map(value=>value.trim().toLowerCase()).filter(Boolean);if(partners.length)partners.forEach(value=>institutionKeys.add(value));else unlabelledInstitutions+=count});const institutions=institutionKeys.size+unlabelledInstitutions;return{activities:activities.length,people,institutions,documents:activities.reduce((n,row)=>n+(Number(row.documents_contributed)||0),0)}},[activities]);
 if(!selected)return null;
 return <div className="impact-dashboard">
  <div className="impact-dashboard-heading"><div><span className="impact-dashboard-kicker">IMPACT &amp; EVIDENCE</span><h2>Impact at a glance</h2></div><span className="impact-dashboard-status"><i/> Live programme register</span></div>
  <div className="impact-kpi-grid" aria-label="Impact overview">
   <div className="impact-kpi"><span className="impact-kpi-label">Activities conducted</span><strong>{formatValue(overview.activities)}</strong><small>Across tracked programmes</small></div>
   <div className="impact-kpi"><span className="impact-kpi-label">People reached</span><strong>{formatValue(overview.people)}</strong><small>Reported people reached</small></div>
   <div className="impact-kpi"><span className="impact-kpi-label">Institutions &amp; facilities engaged</span><strong>{formatValue(overview.institutions)}</strong><small>Schools, health facilities &amp; organisations</small></div>
   <div className="impact-kpi impact-kpi-accent"><span className="impact-kpi-label">Policy &amp; research outputs</span><strong>{formatValue(overview.documents)}</strong><small>Contributions recorded</small></div>
  </div>
  <div className="impact-section-heading"><div><span>PROGRAMME PERFORMANCE</span><h3>Where the work is happening</h3></div><span>{programmes.length} programmes tracked</span></div>
  <div className="impact-dashboard-shell">
   <aside className="impact-programme-nav" aria-label="Impact programmes">
    <div className="impact-nav-heading"><span>PROGRAMMES</span><small>Select a programme</small></div>
    {programmes.map(programme=><button type="button" className={programme.programme_key===selectedKey?"is-active":""} onClick={()=>setSelectedKey(programme.programme_key)} key={programme.programme_key}><span className="impact-nav-number">{programme.number}</span><span><strong>{programme.title}</strong><small>{programme.category}</small></span><b>→</b></button>)}
   </aside>
   <section className="impact-detail-panel">
    <header className="impact-detail-header"><div><span className="impact-detail-kicker">{selected.category}</span><h3>{selected.title}</h3><p>{selected.description}</p></div><span className="impact-live-chip">{detail.count} recorded {detail.count===1?"activity":"activities"}</span></header>
    <div className="impact-detail-kpis">
     <div><span>Activities</span><strong>{formatValue(detail.count)}</strong></div>
     <DetailKpis selected={selected} detail={detail}/>
    </div>
    <div className="impact-detail-grid">
     <article className="impact-panel impact-location-panel"><div className="impact-panel-head"><div><span>GEOGRAPHIC REACH</span><h4>Performance by location</h4></div><small>{detail.locations.length} locations</small></div><BarList items={detail.locations} empty="No locations recorded yet."/></article>
     {(selected.programme_key==="ovc-support"||selected.programme_key==="education-support"||selected.programme_key==="civic-voter"||selected.programme_key==="community-health"||selected.programme_key==="youth-skills"||selected.programme_key==="youth-policy")?<article className="impact-panel impact-reach-panel"><div className="impact-panel-head"><div><span>REACH COMPOSITION</span><h4>{selected.programme_key==="youth-policy"?"Participation by gender":"Reach by gender"}</h4></div></div><div className="impact-donut-wrap"><div className="impact-donut" style={shareStyle(detail.male,detail.female)}><div><strong>{formatValue(detail.male+detail.female)}</strong><small>Total recorded</small></div></div><div className="impact-legend"><span><i/>{genderLabels(selected.programme_key)[0]} <b>{formatValue(detail.male)}</b></span><span><i/>{genderLabels(selected.programme_key)[1]} <b>{formatValue(detail.female)}</b></span></div></div></article>:<article className="impact-panel impact-reach-panel"><div className="impact-panel-head"><div><span>PROGRAMME OUTPUT</span><h4>{selected.programme_key==="clean-green-healthy"?"Marketeers reached":"Policy contribution"}</h4></div></div><div className="impact-output-number"><strong>{formatValue(detail.primary)}</strong><span>{selected.programme_key==="clean-green-healthy"?"Marketeers reached":"Documents contributed"}</span>{selected.programme_key==="clean-green-healthy"&&(detail.maleMarketeers||detail.femaleMarketeers)?<div className="impact-output-breakdown"><span>Men <b>{formatValue(detail.maleMarketeers)}</b></span><span>Women <b>{formatValue(detail.femaleMarketeers)}</b></span></div>:null}</div></article>}
     <article className="impact-panel"><div className="impact-panel-head"><div><span>PARTNERS</span><h4>Engagement network</h4></div><small>{detail.partners.length} named</small></div><BarList items={detail.partners} empty="Partners will appear as activities are recorded."/></article>
     <article className="impact-panel"><div className="impact-panel-head"><div><span>GLOBAL ALIGNMENT</span><h4>UN SDGs</h4></div></div><AlignmentList items={detail.sdgs} type="sdg"/></article>
     <article className="impact-panel"><div className="impact-panel-head"><div><span>AFRICAN UNION</span><h4>Agenda 2063</h4></div></div><AlignmentList items={detail.aus} type="au"/></article>
    </div>
   </section>
  </div>
 </div>;
}
