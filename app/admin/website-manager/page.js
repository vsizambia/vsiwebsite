"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "../../components/SiteChrome";
import styles from "./website-manager.module.css";

const layouts=[
  {id:"100",label:"Full width",cols:["100%"]},
  {id:"50-50",label:"Two columns",cols:["50%","50%"]},
  {id:"33-33-33",label:"Three columns",cols:["33%","33%","33%"]},
  {id:"25-75",label:"25 / 75",cols:["25%","75%"]},
  {id:"75-25",label:"75 / 25",cols:["75%","25%"]},
  {id:"33-66",label:"33 / 66",cols:["33%","66%"]},
  {id:"66-33",label:"66 / 33",cols:["66%","33%"]},
  {id:"25-50-25",label:"25 / 50 / 25",cols:["25%","50%","25%"]}
];

const elements=[
  ["heading","Heading"],["text","Text block"],["image","Image"],["button","Button"],
  ["cards","Cards"],["divider","Divider"],["hero","Hero"],["news","Latest news"]
];

export default function WebsiteManagerPage(){
  const [selectedPage,setSelectedPage]=useState("Home");
  const [sections,setSections]=useState([
    {id:1,type:"Hero",layout:"100",title:"Empowering young people to shape the future",text:"Visionary Students Initiative creates opportunities for young people to lead, learn and create positive change.",bg:"#003566",color:"#ffffff"},
    {id:2,type:"Introduction",layout:"50-50",title:"Discover VSI",text:"Building visionary, informed and empowered young people.",bg:"#ffffff",color:"#173b58"}
  ]);
  const [activeId,setActiveId]=useState(1);
  const [tab,setTab]=useState("structure");
  const active=sections.find(s=>s.id===activeId)||sections[0];
  const activeLayout=useMemo(()=>layouts.find(l=>l.id===active?.layout),[active]);

  function updateActive(patch){setSections(items=>items.map(item=>item.id===activeId?{...item,...patch}:item));}
  function addSection(layout="100"){const id=Date.now();setSections(items=>[...items,{id,type:"Section",layout,title:"New section heading",text:"Add your content here.",bg:"#ffffff",color:"#173b58"}]);setActiveId(id);}
  function removeActive(){if(sections.length===1)return;const next=sections.filter(s=>s.id!==activeId);setSections(next);setActiveId(next[0].id);}
  function move(id,direction){setSections(items=>{const i=items.findIndex(x=>x.id===id),j=i+direction;if(j<0||j>=items.length)return items;const copy=[...items];[copy[i],copy[j]]=[copy[j],copy[i]];return copy;});}

  return <><SiteHeader/><main className={styles.page}><div className={styles.shell}>
    <div className={styles.topline}><Link href="/admin">← VSI Administration</Link><span>WEBSITE BUILDER</span></div>
    <section className={styles.hero}><div><p>VSI WEBSITE MANAGEMENT</p><h1>Visual Page Builder</h1><span>Build and edit public pages using sections, containers, columns and reusable content elements.</span></div><div className={styles.actions}><button>Save draft</button><button className={styles.publish}>Publish</button></div></section>

    <div className={styles.toolbar}>
      <div className={styles.pages}><label>Editing page</label><select value={selectedPage} onChange={e=>setSelectedPage(e.target.value)}>{["Home","Discover VSI","Our Work","Our Story","Community","Volunteer","Contact"].map(x=><option key={x}>{x}</option>)}</select></div>
      <div className={styles.tabs}><button className={tab==="structure"?styles.active:""} onClick={()=>setTab("structure")}>Structure</button><button className={tab==="settings"?styles.active:""} onClick={()=>setTab("settings")}>Settings</button><button onClick={()=>setTab("preview")}>Preview</button></div>
    </div>

    <div className={styles.workspace}>
      <aside className={styles.left}>
        <h2>Containers</h2><p>Select a layout to add a new row.</p>
        <div className={styles.layoutGrid}>{layouts.map(l=><button key={l.id} className={styles.layoutCard} onClick={()=>addSection(l.id)}><div className={styles.layoutVisual}>{l.cols.map((c,i)=><i key={i} style={{width:c}}/>)}</div><span>{l.label}</span></button>)}</div>
        <h2>Elements</h2><div className={styles.elementGrid}>{elements.map(([id,label])=><button key={id} onClick={()=>active&&updateActive({type:label})}>＋ {label}</button>)}</div>
      </aside>

      <section className={styles.canvas}>
        <div className={styles.canvasTop}><strong>{selectedPage}</strong><span>{sections.length} sections</span></div>
        {sections.map((section,index)=>{const layout=layouts.find(l=>l.id===section.layout);return <article key={section.id} className={activeId===section.id?styles.selectedSection:styles.section} onClick={()=>setActiveId(section.id)}>
          <div className={styles.sectionControls}><span>☰ {section.type}</span><div><button onClick={e=>{e.stopPropagation();move(section.id,-1)}}>↑</button><button onClick={e=>{e.stopPropagation();move(section.id,1)}}>↓</button><button onClick={e=>{e.stopPropagation();setActiveId(section.id)}}>⚙</button></div></div>
          <div className={styles.previewSection} style={{background:section.bg,color:section.color}}><div className={styles.columns}>{layout.cols.map((c,i)=><div key={i} style={{width:c}} className={styles.column}>{i===0&&<><h3>{section.title}</h3><p>{section.text}</p>{section.type==="Hero"&&<button>Explore VSI →</button>}</>}</div>)}</div></div>
        </article>})}
        <button className={styles.addSection} onClick={()=>addSection()}>＋ Add section</button>
      </section>

      <aside className={styles.right}>
        {active&&<><h2>{tab==="settings"?"Section settings":"Inspector"}</h2><label>Section type<select value={active.type} onChange={e=>updateActive({type:e.target.value})}>{["Hero","Section","Introduction","Call to action","Cards","Latest news"].map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Container layout<select value={active.layout} onChange={e=>updateActive({layout:e.target.value})}>{layouts.map(l=><option value={l.id} key={l.id}>{l.label}</option>)}</select></label>
        <label>Heading<input value={active.title} onChange={e=>updateActive({title:e.target.value})}/></label>
        <label>Text<textarea value={active.text} onChange={e=>updateActive({text:e.target.value})}/></label>
        <div className={styles.colorRow}><label>Background<input type="color" value={active.bg} onChange={e=>updateActive({bg:e.target.value})}/></label><label>Text colour<input type="color" value={active.color} onChange={e=>updateActive({color:e.target.value})}/></label></div>
        <button className={styles.delete} onClick={removeActive}>Delete section</button></>}
      </aside>
    </div>

    <section className={styles.next}><h2>Builder foundation</h2><div><span>✓ Pages</span><span>✓ Sections</span><span>✓ Container layouts</span><span>✓ Columns</span><span>✓ Content elements</span><span>✓ Live styling controls</span><span>Next: database saving, media library, navigation and publish workflow</span></div></section>
  </div></main><SiteFooter/></>;
}