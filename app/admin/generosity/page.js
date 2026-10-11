"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "../../components/SiteChrome";
import styles from "./generosity.module.css";

const statusOptions = [
  ["offer_received","Offer received"],
  ["contact_in_progress","Contact in progress"],
  ["collection_arranged","Collection arranged"],
  ["partially_collected","Partially collected"],
  ["fully_collected","Fully collected"],
  ["withdrawn","Withdrawn"],
  ["closed","Closed"],
];
const statusLabels = Object.fromEntries(statusOptions);
const categoryLabels = {
  educational_materials:"Educational Materials",
  ovc_support:"OVC Support",
  maternity_mothers:"Maternity Ward — Mothers",
  maternity_newborns:"Maternity Ward — Newborns",
};
const formatDate = value => value ? new Date(value).toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",timeZone:"Africa/Lusaka"}) : "—";
const asNumber = value => Number(value||0).toLocaleString();

export default function GenerosityAdminDashboard() {
  const [authenticated,setAuthenticated] = useState(false);
  const [checking,setChecking] = useState(true);
  const [authStep,setAuthStep] = useState("password");
  const [password,setPassword] = useState("");
  const [authCode,setAuthCode] = useState("");
  const [authError,setAuthError] = useState("");
  const [summary,setSummary] = useState({});
  const [offers,setOffers] = useState([]);
  const [drafts,setDrafts] = useState({});
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");
  const [notice,setNotice] = useState("");
  const [query,setQuery] = useState("");
  const [statusFilter,setStatusFilter] = useState("all");
  const [categoryFilter,setCategoryFilter] = useState("all");
  const [expanded,setExpanded] = useState(null);
  const [saving,setSaving] = useState(null);

  useEffect(()=>{fetch("/api/admin/volunteers",{cache:"no-store"}).then(r=>setAuthenticated(r.ok)).catch(()=>setAuthenticated(false)).finally(()=>setChecking(false));},[]);
  async function login(event) {
    event.preventDefault();setAuthError("");
    try {
      const payload=authStep==="code"?{code:authCode}:{password};
      const response=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"Unable to sign in.");
      if(data.requiresAuthenticator){setAuthStep("code");setAuthCode("");return;}
      setPassword("");setAuthCode("");setAuthenticated(true);
    } catch(e) { setAuthError(e.message); }
  }
  async function load() {
    setLoading(true);setError("");setNotice("");
    try {
      const response=await fetch("/api/admin/generosity",{cache:"no-store"});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"Unable to load generosity records.");
      const nextOffers=(data.offers||[]).map(offer=>({...offer,items:Array.isArray(offer.items)?offer.items:[]}));
      setSummary(data.summary||{});setOffers(nextOffers);
      setDrafts(Object.fromEntries(nextOffers.map(offer=>[offer.id,{status:offer.status,staffNotes:offer.staff_notes||"",closureReason:offer.closure_reason||"",items:offer.items.map(item=>({...item,quantityCollected:String(item.quantityCollected??0)}))}])));
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(()=>{if(authenticated)load();},[authenticated]);
  const filtered = useMemo(()=>offers.filter(offer=>{
    const hay=[offer.reference,offer.first_name,offer.last_name,offer.email,offer.phone,offer.town_area,...offer.items.map(item=>item.itemLabel),...offer.items.map(item=>item.item_label)].join(" ").toLowerCase();
    const matchesQuery=!query||hay.includes(query.toLowerCase());
    const matchesStatus=statusFilter==="all"||offer.status===statusFilter;
    const matchesCategory=categoryFilter==="all"||offer.items.some(item=>item.category===categoryFilter);
    return matchesQuery&&matchesStatus&&matchesCategory;
  }),[offers,query,statusFilter,categoryFilter]);
  function updateDraft(id,field,value) { setDrafts(current=>({...current,[id]:{...current[id],[field]:value}})); }
  function updateItem(id,itemId,value) {
    setDrafts(current=>({...current,[id]:{...current[id],items:current[id].items.map(item=>item.id===itemId?{...item,quantityCollected:value}:item)}}));
  }
  async function saveOffer(offer) {
    const draft=drafts[offer.id];if(!draft)return;
    setSaving(offer.id);setError("");setNotice("");
    try {
      const response=await fetch("/api/admin/generosity",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        id:offer.id,status:draft.status,staffNotes:draft.staffNotes,closureReason:draft.closureReason,
        items:draft.items.map(item=>({id:item.id,quantityCollected:Number(item.quantityCollected)}))
      })});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"Unable to save changes.");
      setNotice("Saved "+data.offer.reference+" — "+(statusLabels[data.offer.status]||data.offer.status.replaceAll("_"," "))+".");
      await load();
    } catch(e) { setError(e.message); }
    finally { setSaving(null); }
  }
  if(checking)return <main className={styles.center}>Checking VSI administrator access…</main>;
  if(!authenticated)return <main className={styles.loginPage}><form className={styles.loginCard} onSubmit={login}><span className={styles.logo}>VSI</span><p className={styles.kicker}>ADMIN ACCESS</p><h1>VSI Generosity Dashboard</h1><p>Sign in with your VSI administrator credentials to manage generosity offers and collections.</p><label>{authStep==="code"?"Authenticator code":"Admin password"}{authStep==="code"?<input autoFocus inputMode="numeric" maxLength={6} value={authCode} onChange={e=>setAuthCode(e.target.value.replace(/\D/g,"").slice(0,6))} required/>:<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/>}</label>{authError&&<div className={styles.error}>{authError}</div>}<button className={styles.primary} type="submit">{authStep==="code"?"Verify code":"Sign in"} →</button></form></main>;
  return <><SiteHeader ctaLabel="VSI Administration" ctaHref="/admin"/><main className={styles.page}><div className={styles.shell}>
    <div className={styles.topline}><Link href="/admin">VSI Administration</Link><span>/</span><strong>Generosity Dashboard</strong><div className={styles.topActions}><span className={styles.connected}>● Connected</span><button onClick={load} disabled={loading}>{loading?"Refreshing…":"Refresh ↻"}</button></div></div>
    <header className={styles.hero}><div><p className={styles.kicker}>COMMUNITY GIVING · GOODS ONLY</p><h1>VSI Generosity Dashboard</h1><p>Review offers, coordinate pickups and verify the goods received. Pledged quantities are tracked separately from collected quantities.</p></div><div className={styles.heroMark}>G</div></header>
    <section className={styles.metrics}>
      {[
        ["offers_total","OFFERS RECEIVED"],["contributors","CONTRIBUTORS"],["quantities_pledged","UNITS PLEDGED"],["quantities_collected","UNITS COLLECTED"],["awaiting_collection","AWAITING COLLECTION"],["fully_collected","FULLY COLLECTED"]
      ].map(([key,label])=><div className={styles.metric} key={key}><span>{label}</span><strong>{asNumber(summary[key])}</strong></div>)}
    </section>
    <section className={styles.register}>
      <div className={styles.registerHeader}><div><p className={styles.kicker}>OFFER REGISTER</p><h2>Generosity offers</h2><p>{filtered.length} of {offers.length} offers shown</p></div><div className={styles.filters}><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search reference, name, item, area…"/><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="all">All statuses</option>{statusOptions.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}><option value="all">All categories</option>{Object.entries(categoryLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div></div>
      {error&&<div role="alert" className={styles.error}>{error}</div>}{notice&&<div role="status" className={styles.notice}>{notice}</div>}
      {loading&&!offers.length?<div className={styles.empty}>Loading generosity offers…</div>:!filtered.length?<div className={styles.empty}>{offers.length?"No offers match the selected filters.":"No generosity offers have been received yet."}</div>:<div className={styles.offerList}>{filtered.map(offer=>{
        const draft=drafts[offer.id]||{items:[]};
        const pledged=offer.items.reduce((sum,item)=>sum+Number(item.quantityPledged??item.quantity_pledged??0),0);
        const collected=offer.items.reduce((sum,item)=>sum+Number(item.quantityCollected??item.quantity_collected??0),0);
        return <article className={styles.offerCard} key={offer.id}>
          <button className={styles.offerSummary} onClick={()=>setExpanded(expanded===offer.id?null:offer.id)} aria-expanded={expanded===offer.id}>
            <span className={styles.offerBadge}>{offer.reference}</span><span className={styles.offerPerson}><strong>{offer.first_name} {offer.last_name}</strong><small>{offer.email} · {offer.phone}</small><small>{offer.town_area}{offer.pickup_address?" · "+offer.pickup_address:""}</small></span><span className={styles.offerQuantities}><strong>{asNumber(collected)} / {asNumber(pledged)}</strong><small>units collected / pledged</small></span><span className={styles.status} data-status={offer.status}>{statusLabels[offer.status]||offer.status.replaceAll("_"," ")}</span><span className={styles.chevron}>{expanded===offer.id?"−":"+"}</span>
          </button>
          <div className={styles.offerMeta}><span>Received {formatDate(offer.created_at)}</span><span>Items: {offer.items.length}</span><span>Phone updates: {offer.phone_consent?"Yes":"No"}</span><span>Email updates: {offer.email_consent?"Yes":"No"}</span></div>
          {expanded===offer.id&&<div className={styles.offerDetails}>
            <div className={styles.itemsHeader}><h3>Items and collection quantities</h3><p>Enter the number physically received for each line. Collected cannot exceed pledged.</p></div>
            <div className={styles.itemsTableWrap}><table className={styles.itemsTable}><thead><tr><th>Category / item</th><th>Pledged</th><th>Collected</th><th>Sizes / age details</th></tr></thead><tbody>{(draft.items||[]).map(item=><tr key={item.id}><td><small>{categoryLabels[item.category]||item.category}</small><strong>{item.itemLabel||item.item_label}</strong></td><td>{asNumber(item.quantityPledged??item.quantity_pledged)} {item.unit}</td><td><input aria-label={"Collected quantity for "+(item.itemLabel||item.item_label)} type="number" min="0" max={item.quantityPledged??item.quantity_pledged} step="1" value={item.quantityCollected} onChange={e=>updateItem(offer.id,item.id,e.target.value)}/></td><td>{item.sizeDetails||"—"}</td></tr>)}</tbody></table></div>
            <div className={styles.editGrid}><label>Collection status<select value={draft.status} onChange={e=>updateDraft(offer.id,"status",e.target.value)}>{statusOptions.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label>Closure / withdrawal reason{(draft.status==="closed"||draft.status==="withdrawn")&&<span> (required)</span>}<input value={draft.closureReason} onChange={e=>updateDraft(offer.id,"closureReason",e.target.value)} maxLength={1000} placeholder="Reason, if closing or withdrawing"/></label><label className={styles.full}>Internal staff notes<textarea rows="3" value={draft.staffNotes} onChange={e=>updateDraft(offer.id,"staffNotes",e.target.value)} maxLength={4000} placeholder="Contact attempts, agreed pickup details, follow-up…"/></label></div>
            <div className={styles.detailFooter}><span>Last updated {formatDate(offer.updated_at)}{offer.collection_arranged_at?" · Collection arranged "+formatDate(offer.collection_arranged_at):""}</span><button className={styles.primary} onClick={()=>saveOffer(offer)} disabled={saving===offer.id}>{saving===offer.id?"Saving…":"Save offer updates →"}</button></div>
          </div>}
        </article>;
      })}</div>}
    </section>
  </div></main><SiteFooter/></>;
}
