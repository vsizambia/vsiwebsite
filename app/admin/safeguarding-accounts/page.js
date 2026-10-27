"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
const roles = [{value:"safeguarding_lead",label:"Safeguarding Lead"},{value:"case_officer",label:"Case Officer"},{value:"read_only",label:"Read-only Reviewer"}];
export default function SafeguardingAccountsPage(){
 const [users,setUsers]=useState([]),[username,setUsername]=useState(""),[displayName,setDisplayName]=useState(""),[role,setRole]=useState("case_officer"),[credentials,setCredentials]=useState(null),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 async function load(){try{const r=await fetch("/api/admin/safeguarding-users",{cache:"no-store"});const d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to load accounts.");setUsers(d.users||[])}catch(e){setError(e.message)}}
 useEffect(()=>{load()},[]);
 async function create(e){e.preventDefault();setError("");setCredentials(null);setBusy(true);try{const r=await fetch("/api/admin/safeguarding-users",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username,displayName,role})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to create account.");setCredentials({username:d.user.username,...d.credentials});setUsername("");setDisplayName("");await load()}catch(e){setError(e.message)}finally{setBusy(false)}}
 async function toggle(user){setError("");try{const r=await fetch("/api/admin/safeguarding-users",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:user.id,active:!user.active})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to update account.");await load()}catch(e){setError(e.message)}}
 const panel={background:"#fff",padding:22,border:"1px solid #dce4e9",marginBottom:20};
 const field={display:"grid",gap:6};
 const input={padding:12,border:"1px solid #cbd5dc",width:"100%",boxSizing:"border-box"};
 return <main style={{minHeight:"100vh",background:"#f4f7f9",padding:"28px 18px",color:"#173b58"}}><div style={{maxWidth:1000,margin:"0 auto"}}>
 <p><Link href="/admin">← VSI Administration</Link></p><h1>Safeguarding staff accounts</h1><p>Create individual accounts with role-based permissions. This page requires the existing VSI Admin login.</p>
 <section style={panel}><h2>Create account</h2><p>The system generates a initial password and authenticator secret. Save them immediately and share only through a trusted channel.</p>
 <form onSubmit={create} style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,alignItems:"end"}}>
 <label style={field}>Username<input style={input} required minLength={3} maxLength={80} pattern="[a-zA-Z0-9][a-zA-Z0-9._-]{2,79}" value={username} onChange={e=>setUsername(e.target.value.toLowerCase())}/></label>
 <label style={field}>Staff name<input style={input} required minLength={2} maxLength={120} value={displayName} onChange={e=>setDisplayName(e.target.value)}/></label>
 <label style={field}>Role<select style={input} value={role} onChange={e=>setRole(e.target.value)}>{roles.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}</select></label>
 <button disabled={busy} style={{padding:13,background:"#174D4B",color:"#fff",border:0,fontWeight:800}}>{busy?"Creating…":"Create account"}</button></form></section>
 {error&&<p role="alert" style={{background:"#fff1f1",color:"#9b1c1c",padding:14}}>{error}</p>}
 {credentials&&<section style={{...panel,background:"#fff8e6",borderColor:"#e6c76a"}}><h2>Save setup details now</h2><p>These details are shown only in this response. Store them securely.</p><p><b>Username:</b> <code>{credentials.username}</code></p><p><b>Initial password:</b> <code>{credentials.initialPassword}</code></p><p><b>Authenticator secret:</b> <code style={{overflowWrap:"anywhere"}}>{credentials.authenticatorSecret}</code></p><p><b>Authenticator URI:</b> <code style={{overflowWrap:"anywhere"}}>{credentials.authenticatorUri}</code></p><button onClick={()=>setCredentials(null)}>Hide setup details</button></section>}
 <section style={panel}><h2>Current accounts</h2>{users.length===0?<p>No individual accounts have been created yet.</p>:<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}><thead><tr>{["Username","Name","Role","Status","Action"].map(x=><th key={x} style={{textAlign:"left",padding:10,borderBottom:"1px solid #dce4e9"}}>{x}</th>)}</tr></thead><tbody>{users.map(u=><tr key={u.id}><td style={{padding:10}}>{u.username}</td><td style={{padding:10}}>{u.display_name}</td><td style={{padding:10}}>{u.roleLabel}</td><td style={{padding:10}}>{u.active?"Active":"Disabled"}</td><td style={{padding:10}}><button onClick={()=>toggle(u)}>{u.active?"Disable":"Enable"}</button></td></tr>)}</tbody></table></div>}</section>
 <p>Safeguarding Lead: full case management. Case Officer: read and update case records. Read-only Reviewer: view records only. The shared VSI Admin login remains separate.</p>
 </div></main>;
}
