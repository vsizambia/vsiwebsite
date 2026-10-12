"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SiteFooter, SiteHeader } from "../../../components/SiteChrome";
import styles from "./category.module.css";

const categories = {
  "educational-materials": {
    title: "Educational Materials", shortTitle: "Education", target: 50000,
    description: "Campaign target: stationery for vulnerable school children across 10 malls.",
    groups: ["educational_materials"],
    items: [
      ["educational_materials","exercise_books","Exercise books","Books",10000],
      ["educational_materials","pens","Pens","Pieces",10000],
      ["educational_materials","pencils","Pencils","Pieces",10000],
      ["educational_materials","rulers","Rulers","Pieces",10000],
      ["educational_materials","crayon_packs","Crayon / color pencil packs","Packs",10000],
      ["educational_materials","school_shoes","School shoes","Pairs",null],
      ["educational_materials","school_bags_baby_nursery","School bags — baby class / nursery","Bags",null],
      ["educational_materials","school_bags_primary","School bags — primary","Bags",null],
    ],
  },
  "ovc-support": {
    title: "OVC Support", shortTitle: "OVC", target: 1100,
    description: "Campaign target: pantry and hygiene supplies for orphanages and children's homes across 10 malls.",
    groups: ["ovc_support"],
    items: [
      ["ovc_support","sugar_2kg","Sugar — 2 kg packs","Packs",200],
      ["ovc_support","cooking_oil_2l","Cooking oil — 2 L","Bottles",200],
      ["ovc_support","washing_powder_500g","Washing powder — 500 g","Packs",200],
      ["ovc_support","toothpaste","Toothpaste","Tubes / packs",200],
      ["ovc_support","bathing_soap","Bathing soap bars / packs","Bars / packs",200],
      ["ovc_support","basin_buckets","Basin buckets — 5 L to 10 L","Buckets",100],
      ["ovc_support","mealie_meal_20kg","Mealie meal — 20 kg bags","Bags",null],
    ],
  },
  "maternity-care": {
    title: "Maternity Ward Care", shortTitle: "Maternity", target: 2750,
    description: "Campaign target: essential care supplies for mothers and newborns across 10 malls.",
    groups: ["maternity_mothers","maternity_newborns"],
    items: [
      ["maternity_mothers","maternity_pads","Maternity / sanitary pad packs","Packs",500],
      ["maternity_newborns","newborn_diapers","Newborn diaper packs","Packs / pieces",500],
      ["maternity_newborns","baby_oil_jelly","Baby petroleum jelly / oil","Bottles / tubs",500],
      ["maternity_mothers","chitenge_2m","Chitenge material — 2 metres","Pieces",500],
      ["maternity_mothers","mothers_bathing_soap","Bathing soap bars","Bars",500],
      ["maternity_mothers","covered_buckets","10 L covered buckets","Buckets",250],
      ["maternity_mothers","mothers_hygiene_goods","Personal hygiene goods","Sets / items",null],
      ["maternity_mothers","laundry_detergent","Washing powder and laundry detergent","Packs",null],
      ["maternity_mothers","basins","Basins","Pieces",null],
      ["maternity_newborns","baby_soap","Baby soap","Bars",null],
      ["maternity_newborns","receiving_blankets","Baby receiving blankets","Pieces",null],
      ["maternity_newborns","receiving_wraps","Baby receiving wraps","Pieces",null],
      ["maternity_newborns","baby_caps","Baby caps","Pieces",null],
      ["maternity_newborns","baby_socks","Baby socks","Pairs",null],
    ],
  },
};
const statuses = {
  offer_received: "Pledge received", contact_in_progress: "Contact in progress",
  collection_arranged: "Collection arranged", partially_collected: "Partially collected",
  fully_collected: "Fully collected", withdrawn: "Withdrawn", closed: "Closed",
};
const number = value => Number(value || 0).toLocaleString();
const percent = (value, target) => target ? Math.min(100, Math.round(value / target * 100)) : 0;

export default function GenerosityCategoryPage() {
  const params = useParams();
  const slug = params?.category;
  const category = categories[slug];
  const [offers, setOffers] = useState([]);
  const [collectedDrafts, setCollectedDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/generosity", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load campaign pledges.");
      const nextOffers = (data.offers || []).map(offer => ({ ...offer, items: Array.isArray(offer.items) ? offer.items : [] }));
      setOffers(nextOffers);
      setCollectedDrafts(Object.fromEntries(nextOffers.flatMap(offer => offer.items.map(item => [item.id, String(item.quantityCollected ?? item.quantity_collected ?? 0)]).map(([id,value]) => [id,value]))));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { if (category) load(); else setLoading(false); }, [slug]);

  const itemRows = useMemo(() => {
    if (!category) return [];
    return category.items.map(([itemCategory, itemKey, label, unit, target]) => {
      const pledges = offers.flatMap(offer => offer.items.filter(item => item.category === itemCategory && (item.itemKey || item.item_key) === itemKey).map(item => ({ offer, item })));
      const pledged = pledges.reduce((sum, row) => sum + Number(row.item.quantityPledged ?? row.item.quantity_pledged ?? 0), 0);
      const collected = pledges.reduce((sum, row) => sum + Number(row.item.quantityCollected ?? row.item.quantity_collected ?? 0), 0);
      return { itemCategory, itemKey, label, unit, target, pledges, pledged, collected };
    });
  }, [offers, category]);

  const totals = useMemo(() => {
    const targetItems = itemRows.filter(item => item.target !== null);
    return {
      pledged: targetItems.reduce((sum, item) => sum + item.pledged, 0),
      collected: targetItems.reduce((sum, item) => sum + item.collected, 0),
      pledgeCount: new Set(targetItems.flatMap(item => item.pledges.map(row => row.offer.id))).size,
      target: category?.target || 0,
    };
  }, [itemRows, category]);

  async function saveCollected(offer, item) {
    const raw = collectedDrafts[item.id];
    const quantity = Number(raw);
    const pledged = Number(item.quantityPledged ?? item.quantity_pledged ?? 0);
    if (!Number.isSafeInteger(quantity) || quantity < 0 || quantity > pledged) {
      setError("Collected quantity must be a whole number from zero to the pledged quantity (" + pledged + ").");
      return;
    }
    setSaving(item.id); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/generosity", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: offer.id, items: [{ id: item.id, quantityCollected: quantity }] }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save collection quantity.");
      setNotice("Updated " + (item.itemLabel || item.item_label) + " for " + offer.reference + ".");
      await load();
    } catch (e) { setError(e.message); }
    finally { setSaving(null); }
  }

  if (!category) return <><SiteHeader ctaLabel="VSI Administration" ctaHref="/admin" /><main className={styles.page}><div className={styles.shell}><h1>Campaign category not found</h1><Link href="/admin/generosity">← Back to Generosity Dashboard</Link></div></main><SiteFooter /></>;
  return <><SiteHeader ctaLabel="VSI Administration" ctaHref="/admin" /><main className={styles.page}><div className={styles.shell}>
    <nav className={styles.breadcrumb}><Link href="/admin">VSI Administration</Link><span>/</span><Link href="/admin/generosity">Generosity Dashboard</Link><span>/</span><strong>{category.title}</strong></nav>
    <header className={styles.hero}><div><p className={styles.kicker}>10-MALL GENEROSITY CAMPAIGN</p><h1>{category.title}</h1><p>{category.description}</p></div><Link className={styles.backLink} href="/admin/generosity">← Dashboard</Link></header>
    {error && <div role="alert" className={styles.error}>{error}</div>}
    {notice && <div role="status" className={styles.notice}>{notice}</div>}
    <section className={styles.stats}>
      <article><span>CAMPAIGN TARGET</span><strong>{number(totals.target)}</strong><small>units across 10 malls</small></article>
      <article><span>UNITS PLEDGED</span><strong>{number(totals.pledged)}</strong><small>{percent(totals.pledged, totals.target)}% of target</small><div className={styles.track}><i style={{width: percent(totals.pledged, totals.target) + "%"}} /></div></article>
      <article><span>UNITS COLLECTED</span><strong>{number(totals.collected)}</strong><small>{percent(totals.collected, totals.target)}% of target</small><div className={styles.track}><i style={{width: percent(totals.collected, totals.target) + "%"}} /></div></article>
      <article><span>PLEDGES RECEIVED</span><strong>{number(totals.pledgeCount)}</strong><small>contributors pledging target items</small></article>
    </section>
    <section className={styles.catalogue}><div className={styles.sectionHeader}><div><p className={styles.kicker}>ITEM-BY-ITEM TRACKING</p><h2>Campaign items and pledges</h2><p>Record goods only after they have physically arrived. Saved collection quantities update the main dashboard and category totals.</p></div><button onClick={load} disabled={loading}>{loading ? "Refreshing…" : "Refresh ↻"}</button></div>
      {loading ? <div className={styles.empty}>Loading campaign pledges…</div> : <div className={styles.itemsList}>{itemRows.map(row => <article className={styles.itemCard} key={row.itemCategory + ":" + row.itemKey}>
        <div className={styles.itemHeading}><div><h3>{row.label}</h3><p>{row.target === null ? "Additional item · no campaign target assigned" : "Target: " + number(row.target) + " " + row.unit.toLowerCase()}</p></div><div className={styles.itemTotals}><strong>{number(row.pledged)} <small>pledged</small></strong><strong>{number(row.collected)} <small>collected</small></strong></div></div>
        {row.target !== null && <div className={styles.itemProgress}><div className={styles.track}><i style={{width: percent(row.pledged, row.target) + "%"}} /></div><span>{percent(row.pledged, row.target)}% of target pledged · {number(Math.max(0,row.target-row.pledged))} still needed</span></div>}
        {!row.pledges.length ? <p className={styles.noPledges}>No pledges received for this item yet.</p> : <div className={styles.pledgeTableWrap}><table className={styles.pledgeTable}><thead><tr><th>Pledge reference / contributor</th><th>Pledged</th><th>Collected</th><th>Status</th><th>Action</th></tr></thead><tbody>{row.pledges.map(({offer,item}) => <tr key={item.id}><td><strong>{offer.reference}</strong><small>{offer.first_name} {offer.last_name} · {offer.town_area}</small></td><td>{number(item.quantityPledged ?? item.quantity_pledged)} {item.unit}</td><td><label className={styles.quantityInput}><input type="number" min="0" max={item.quantityPledged ?? item.quantity_pledged} step="1" value={collectedDrafts[item.id] ?? String(item.quantityCollected ?? item.quantity_collected ?? 0)} onChange={e => setCollectedDrafts(current => ({...current,[item.id]:e.target.value}))} aria-label={"Collected quantity for " + row.label + " in " + offer.reference} /><span>/ {number(item.quantityPledged ?? item.quantity_pledged)}</span></label></td><td><span className={styles.status}>{statuses[offer.status] || offer.status}</span></td><td><button className={styles.saveButton} onClick={() => saveCollected(offer,item)} disabled={saving===item.id}>{saving===item.id ? "Saving…" : "Save collection"}</button></td></tr>)}</tbody></table></div>}
      </article>)}</div>}
    </section>
  </div></main><SiteFooter /></>;
}
