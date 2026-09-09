"use client";

import {useEffect,useMemo,useState} from "react";
import {SiteHeader,SiteFooter} from "../components/SiteChrome";
import "./projects.css";

const evidenceProjects=[
  {name:"Youth Growth Project",category:"Youth development",location:"Luanshya District, Copperbelt Province",partner:"United States Embassy in Zambia, Public Affairs Section",period:"Six months",summary:"Worked with learners around mental health awareness, community service and volunteerism through workshops, school clubs, peer support and practical community activities.",results:["2,610 learners reached","10 school clubs","1,870 girls reached","740 boys reached","350 learners at end-line workshop"],href:"/community"},
  {name:"Youth Community Service Awareness",category:"Volunteerism & civic participation",location:"Kabulonga Girls Secondary School, Lusaka District",partner:"United Nations Volunteers (UNV) in Zambia",period:"24 August 2026",summary:"Interactive awareness session on community service and active volunteerism, connecting youth-led civic action with the 2026 International Volunteer Year.",results:["UNV partnership","Lusaka District","Student engagement","Further outreach planned"],href:"/news/unv-joins-visionary-students-initiative-for-youth-community-service-awareness-session-in-l"},
  {name:"Campaign Against Streetism — Phase Two",category:"Research & advocacy",location:"Kanyama Constituency, Lusaka",partner:"Kanyama Constituency leadership and community structures",period:"Documented campaign phase",summary:"A VSI campaign focused on investigating factors that push children to the streets, engaging civic leaders, community structures and families. Findings were intended to contribute to the National Street Children Strategy under development.",results:["Constituency engagement","Community structures","Evidence gathering","National strategy linkage"],href:"https://vsizambia.org/kanyama-mp-welcomes-vsi-to-the-constituency/"},
  {name:"Keep Zambia Clean, Green and Healthy — Kuku Market",category:"Community action",location:"Kuku Market, Misisi/Chawama, Lusaka",partner:"Market leadership, youth representatives and marketeers",period:"30 November 2019",summary:"VSI participated in a community environmental action exercise with market leadership, youth representatives and marketeers, connecting volunteerism with public health and cleaner communities.",results:["Lusaka","Community service","Environmental action","Market stakeholder engagement"],href:"https://vsizambia.org/kuku-market/"},
];

export default function ProjectsRegister(){
 const[q,setQ]=useState("");
 const[category,setCategory]=useState("all");
 const[location,setLocation]=useState("all");
 const[catalogue,setCatalogue]=useState([]);
 const[catalogueLoading,setCatalogueLoading]=useState(true);
 const[catalogueError,setCatalogueError]=useState("");

 useEffect(()=>{
   let active=true;
   fetch("/api/projects",{cache:"no-store"})
     .then(async response=>{
       const data=await response.json();
       if(!response.ok)throw new Error(data.error||"Unable to load project classifications.");
       if(active)setCatalogue(data.projects||[]);
     })
     .catch(error=>{if(active)setCatalogueError(error.message)})
     .finally(()=>{if(active)setCatalogueLoading(false)});
   return()=>{active=false};
 },[]);

 const projects=useMemo(()=>evidenceProjects.map(project=>{
   const classification=catalogue.find(x=>x.name.toLowerCase()===project.name.toLowerCase());
   return {...project,classification};
 }),[catalogue]);
 const categories=[...new Set(projects.map(x=>x.category))].sort();
 const locations=[...new Set(projects.map(x=>x.location.split(",").slice(-1)[0].trim()))].sort();
 const filtered=useMemo(()=>projects.filter(p=>{
   const classificationText=p.classification?`${p.classification.directorates.join(" ")} ${p.classification.programmes.join(" ")} ${p.classification.activities.map(a=>`${a.code} ${a.name}`).join(" ")} ${p.classification.sdgs.join(" ")} ${p.classification.auAgenda2063.join(" ")}`:"";
   const hay=`${p.name} ${p.category} ${p.location} ${p.partner} ${p.summary} ${p.results.join(" ")} ${classificationText}`.toLowerCase();
   return(!q||hay.includes(q.toLowerCase()))&&(category==="all"||p.category===category)&&(location==="all"||p.location.endsWith(location));
 }),[projects,q,category,location]);

 return <main><SiteHeader/><section className="projects-hero"><div className="section-shell"><p className="kicker light">PROJECTS &amp; IMPACT REGISTER</p><h1>The work behind the <em>mission.</em></h1><p>Explore documented VSI projects, community actions and youth initiatives by place, theme, partner, reported result and the organisation's approved programme classification.</p></div></section><section className="projects-controls section-shell"><div><p className="kicker">PUBLIC EVIDENCE REGISTER</p><h2>Search the work.</h2></div><div className="register-toolbar"><input aria-label="Search projects" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search projects, partners, places, results, activities…"/><select aria-label="Filter by category" value={category} onChange={e=>setCategory(e.target.value)}><option value="all">All themes</option>{categories.map(x=><option key={x}>{x}</option>)}</select><select aria-label="Filter by location" value={location} onChange={e=>setLocation(e.target.value)}><option value="all">All locations</option>{locations.map(x=><option key={x}>{x}</option>)}</select><button onClick={()=>{setQ("");setCategory("all");setLocation("all")}}>Clear</button></div><p className="register-count">Showing <strong>{filtered.length}</strong> of {projects.length} documented records</p></section><section className="projects-list section-shell">{filtered.map(project=><article className="project-record" key={project.name}><div className="project-record-meta"><span>{project.category}</span><span>{project.period}</span></div><h3>{project.name}</h3><p className="project-location">{project.location}</p><p>{project.summary}</p><div className="project-detail-grid"><div><small>PARTNER / STAKEHOLDER</small><strong>{project.partner}</strong></div><div><small>DOCUMENTED RESULTS</small><ul>{project.results.map(r=><li key={r}>{r}</li>)}</ul></div></div>{project.classification&&<div className="project-classification"><div><small>MASTER CATALOGUE</small><strong>{project.classification.directorates.join(" · ")||"Approved project classification"}</strong></div>{project.classification.programmes.length>0&&<div><small>PROGRAMME</small><strong>{project.classification.programmes.join(" · ")}</strong></div>}<div><small>ACTIVITIES</small><strong>{project.classification.activities.length} approved master activities</strong>{project.classification.activities.length>0&&<span>{project.classification.activities.slice(0,4).map(a=>`${a.code} — ${a.name}`).join(" · ")}{project.classification.activities.length>4?" · …":""}</span>}</div>{project.classification.sdgs.length>0&&<div><small>SDGs</small><strong>{project.classification.sdgs.join(" · ")}</strong></div>}{project.classification.auAgenda2063.length>0&&<div><small>AU AGENDA 2063</small><strong>{project.classification.auAgenda2063.join(" · ")}</strong></div>}</div>}{catalogueError&&<p className="project-catalogue-note">Programme classification is temporarily unavailable; the documented evidence record remains available.</p>}{!catalogueLoading&&!project.classification&&<p className="project-catalogue-note">No matching approved master activity classification is currently recorded for this project.</p>}<a href={project.href} className="project-evidence-link">Open supporting evidence ↗</a></article>)}{filtered.length===0&&<div className="projects-empty"><h3>No matching project record</h3><p>Try another search term or clear the filters.</p></div>}</section><section className="projects-principle"><div className="section-shell"><p className="kicker light">HOW THIS REGISTER GROWS</p><h2>Evidence first. Claims second.</h2><p>The public evidence record now reads project classifications from VSI's approved Master Activity Catalogue. New public records should still be supported by a project page, report, news article, activity record, publication, event record or other verifiable source. Internal volunteer records remain private and are not exposed here.</p><div className="principle-grid"><div><strong>PROJECT</strong><span>What was done</span></div><div><strong>PLACE</strong><span>Where it happened</span></div><div><strong>PARTNERS</strong><span>Who worked with VSI</span></div><div><strong>RESULTS</strong><span>What can be measured</span></div><div><strong>CLASSIFICATION</strong><span>How the work fits VSI's approved catalogue</span></div><div><strong>EVIDENCE</strong><span>Where the record can be checked</span></div></div></div></section><SiteFooter/></main>;
}
