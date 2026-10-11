"use client";

import { useMemo, useState } from "react";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import styles from "./generosity.module.css";

const categories = [
  { key: "educational_materials", number: "01", title: "Educational Materials", goal: "Help 2,000+ learners from community schools receive essential stationery packs.", items: [
    ["exercise_books","Exercise books","Books",false],["pens","Pens","Pieces",false],["pencils","Pencils","Pieces",false],["rulers","Rulers","Pieces",false],["crayon_packs","Crayon packs","Packs",false],["school_shoes","School shoes","Pairs",true],["school_bags_baby_nursery","School bags — baby class / nursery","Bags",true],["school_bags_primary","School bags — primary","Bags",true],
  ]},
  { key: "ovc_support", number: "02", title: "Orphan and Vulnerable Children (OVC) Support", goal: "Support 500+ children across 10 children's homes with pantry and hygiene supplies.", items: [
    ["sugar_2kg","Sugar — 2 kg packs","Packs",false],["cooking_oil_2l","Cooking oil — 2 L","Bottles",false],["washing_powder_500g","Washing powder — 500 g","Packs",false],["toothpaste","Toothpaste","Tubes / packs",false],["bathing_soap","Bathing soap","Bars / packs",false],["mealie_meal_20kg","Mealie meal — 20 kg bags","Bags",false],
  ]},
  { key: "maternity_mothers", title: "Mothers", goal: "Essential hygiene, sanitation and care supplies for mothers.", items: [
    ["maternity_pads","Sanitary / maternity pads","Packs",false],["mothers_hygiene_goods","Personal hygiene goods (bathing soap, petroleum jelly / lotions, toothbrushes and toothpaste)","Sets / items",false],["laundry_detergent","Washing powder and laundry detergent","Packs",false],["chitenge_2m","Chitenge material — 2 metres","Pieces",false],["covered_buckets","Covered buckets — 10 L / 15 L","Buckets",false],["basins","Basins","Pieces",false],
  ]},
  { key: "maternity_newborns", title: "Newborns", goal: "Essential care items for newborns.", items: [
    ["newborn_diapers","Newborn diapers / reusable cloth nappies","Packs / pieces",true],["baby_soap","Baby soap","Bars",false],["baby_oil_jelly","Baby oil / petroleum jelly","Bottles / tubs",false],["receiving_blankets","Baby receiving blankets","Pieces",true],["receiving_wraps","Baby receiving wraps","Pieces",true],["baby_caps","Baby caps","Pieces",true],["baby_socks","Baby socks","Pairs",true],
  ]},
  { key: "other", title: "Other", goal: "Tell us about another type of goods you would like to pledge.", items: [
    ["other_item","Other (please specify)","Items",true],
  ]},
];
const ageOptions = ["Under 18","18–24","25–34","35–44","45–54","55 and above","Prefer not to say"];
const blankContact = { firstName:"",lastName:"",gender:"",ageRange:"",email:"",phone:"",townArea:"",pickupAddress:"",phoneConsent:false,emailConsent:false,website:"" };
const itemId = (category,key) => category + ":" + key;

export default function GenerosityPage() {
  const [step,setStep] = useState(1);
  const [selected,setSelected] = useState({});
  const [form,setForm] = useState(blankContact);
  const [error,setError] = useState("");
  const [saving,setSaving] = useState(false);
  const [confirmation,setConfirmation] = useState(null);
  const items = useMemo(() => categories.flatMap(category => category.items.flatMap(([key,label,unit,needsSize]) => {
    const value = selected[itemId(category.key,key)];
    return value?.checked ? [{category:category.key,itemKey:key,label:category.key==="other"&&key==="other_item"&&value.sizeDetails.trim()?"Other: "+value.sizeDetails.trim():label,unit,needsSize,quantity:value.quantity,sizeDetails:value.sizeDetails||""}] : [];
  })),[selected]);
  const totalUnits = items.reduce((sum,item)=>sum+(Number(item.quantity)||0),0);
  const updateContact = (key,value) => setForm(current=>({...current,[key]:value}));
  function toggleItem(category,key,checked) {
    const id = itemId(category,key);
    setSelected(current => {
      const next = {...current};
      if (!checked) delete next[id];
      else next[id] = {checked:true,quantity:"1",sizeDetails:""};
      return next;
    });
  }
  function updateItem(category,key,field,value) {
    const id = itemId(category,key);
    setSelected(current=>({...current,[id]:{...current[id],[field]:value,checked:true}}));
  }
  function goToReview() {
    setError("");
    if (!items.length) { setError("Please select at least one item you would like to pledge."); return; }
    if (selected[itemId("other","other_item")]?.checked && !selected[itemId("other","other_item")]?.sizeDetails?.trim()) { setError("Please describe the item you would like to pledge under Other."); return; }
    if (items.some(item=>!Number.isInteger(Number(item.quantity))||Number(item.quantity)<1)) { setError("Please enter a whole-number quantity of at least 1 for every selected item."); return; }
    setStep(2);
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function goToSummary(e) {
    e.preventDefault();
    setError("");
    if (!form.firstName.trim()||!form.lastName.trim()||!form.email.trim()||!form.phone.trim()||!form.townArea.trim()) {
      setError("Please complete your name, email, phone number and town / area.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { setError("Please enter a valid email address so we can send your reference."); return; }
    setStep(3);
    window.scrollTo({top:0,behavior:"smooth"});
  }
  async function submitOffer() {
    setSaving(true);setError("");
    try {
      const phoneDigits = form.phone.replace(/[^\d]/g,"").replace(/^260/,"").replace(/^0/,"");
      const payload = {...form,phone:"+260"+phoneDigits,items:items.map(item=>({category:item.category,itemKey:item.itemKey,quantity:Number(item.quantity),sizeDetails:item.sizeDetails}))};
      const response = await fetch("/api/generosity",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const data = await response.json();
      if(!response.ok) throw new Error(data.error||"We could not submit your pledge. Please try again.");
      setConfirmation(data);
      window.scrollTo({top:0,behavior:"smooth"});
    } catch (e) { setError(e.message||"Unable to submit your pledge."); }
    finally { setSaving(false); }
  }
  const renderItem = (category,[key,label,unit,needsSize]) => {
    const id = itemId(category.key,key);
    const value = selected[id];
    return <div className={styles.itemRow} key={id}>
      <label className={styles.itemCheck}><input type="checkbox" checked={!!value} onChange={e=>toggleItem(category.key,key,e.target.checked)}/><span>{label}<small>{unit}</small></span></label>
      {value&&<div className={styles.itemFields}>
        <label>Quantity <span>({unit})</span><input type="number" min="1" max="1000000" step="1" value={value.quantity} onChange={e=>updateItem(category.key,key,"quantity",e.target.value)} required/></label>
        {needsSize&&<label>Sizes / age details <span>(optional)</span><input value={value.sizeDetails||""} onChange={e=>updateItem(category.key,key,"sizeDetails",e.target.value)} maxLength={160} placeholder={key==="school_shoes"?"e.g. 10 pairs size 1, 8 pairs size 2":key==="newborn_diapers"?"e.g. newborn size, reusable cloth": "e.g. newborn / 0–3 months"} /></label>}
      </div>}
    </div>;
  };
  return <><SiteHeader ctaLabel="Volunteer" ctaHref="/volunteer"/><main className={styles.page}><div className={styles.shell}>
    {confirmation ? <section className={styles.successCard}><div className={styles.successIcon}>✓</div><p className="kicker">PLEDGE RECEIVED</p><h1>Thank you for your generosity, {form.firstName}.</h1><p>{confirmation.message}</p>{confirmation.reference&&<div className={styles.reference}><span>Your reference number</span><strong>{confirmation.reference}</strong></div>}<p>Please purchase only the goods you have pledged. VSI will contact you to arrange pickup. VSI does not accept monetary contributions through this initiative.</p><a href="/" className={styles.primaryButton}>Return to VSI website →</a></section> :
    <>
      <header className={styles.hero}><span className={styles.eyebrow}>VISIONARY STUDENTS INITIATIVE</span><h1>VSI <em>Generosity</em></h1><p className={styles.tagline}>Give goods. Change lives.</p><p>Your generosity can help learners, children in care, mothers and newborns access essential supplies. Choose what you can contribute and tell us how much you can provide.</p><div className={styles.notice}><strong>Goods and essential supplies only</strong><span>You purchase the items you offer. VSI arranges pickup with you. We do not accept monetary contributions through this form.</span></div></header>
      <div className={styles.progress}><span className={step>=1?styles.activeStep:""}>01 <b>Select items</b></span><i/><span className={step>=2?styles.activeStep:""}>02 <b>Your details</b></span><i/><span className={step>=3?styles.activeStep:""}>03 <b>Review & submit</b></span></div>
      {step===1&&<section className={styles.panel}><div className={styles.panelIntro}><p className="kicker">SECTION 01</p><h2>What would you like to give?</h2><p>Choose one or more items. All selections are optional. Enter the quantity you can provide for each item.</p></div><div className={styles.categories}>{categories.filter(category=>!["maternity_mothers","maternity_newborns"].includes(category.key)).map((category,index)=><details className={styles.categoryCard} key={category.key}><summary className={styles.categorySummary}><div className={styles.categoryHeading}><span>{String(index+1).padStart(2,"0")}</span><div><h3>{category.title}</h3><p>{category.goal}</p></div><span className={styles.collapseIcon} aria-hidden="true">+</span></div></summary><div className={styles.itemList}>{category.items.map(item=>renderItem(category,item))}</div></details>)}<details className={styles.categoryCard} key="maternity"><summary className={styles.categorySummary}><div className={styles.categoryHeading}><span>03</span><div><h3>Maternity Ward Care</h3><p>Essential supplies for mothers and newborns.</p></div><span className={styles.collapseIcon} aria-hidden="true">+</span></div></summary><div className={styles.maternitySubsections}>{categories.filter(category=>["maternity_mothers","maternity_newborns"].includes(category.key)).map(category=><details className={styles.subCategory} key={category.key}><summary><span>{category.title}</span><span className={styles.collapseIcon} aria-hidden="true">+</span></summary><p className={styles.subCategoryGoal}>{category.goal}</p><div className={styles.itemList}>{category.items.map(item=>renderItem(category,item))}</div></details>)}</div></details></div><div className={styles.stickyActions}><span>{items.length} item type{items.length===1?"":"s"} selected</span><button type="button" className={styles.primaryButton} onClick={goToReview}>Continue to your details →</button></div></section>}
      {step===2&&<section className={styles.panel}><div className={styles.panelIntro}><p className="kicker">SECTION 02</p><h2>May we know who is giving?</h2><p>We use these details to confirm your offer and coordinate pickup. Fields marked optional can be left blank.</p></div><form className={styles.form} onSubmit={goToSummary}>
        <div className={styles.formGrid}><label>First name *<input value={form.firstName} onChange={e=>updateContact("firstName",e.target.value)} maxLength={80} autoComplete="given-name" required/></label><label>Last name *<input value={form.lastName} onChange={e=>updateContact("lastName",e.target.value)} maxLength={80} autoComplete="family-name" required/></label>
        <label>Gender (optional)<select value={form.gender} onChange={e=>updateContact("gender",e.target.value)}><option value="">Prefer not to say</option><option>Female</option><option>Male</option><option>Other</option></select></label><label>Age range (optional)<select value={form.ageRange} onChange={e=>updateContact("ageRange",e.target.value)}><option value="">Select age range</option>{ageOptions.map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Email address *<input type="email" value={form.email} onChange={e=>updateContact("email",e.target.value)} maxLength={254} autoComplete="email" required/></label><label>Phone number *<div className={styles.phoneInput}><span>+260</span><input type="tel" value={form.phone} onChange={e=>updateContact("phone",e.target.value.replace(/\D/g,"").replace(/^260/,"").replace(/^0/,""))} maxLength={9} autoComplete="tel-national" placeholder="97 123 4567" required/></div></label>
        <label>Town / area *<input value={form.townArea} onChange={e=>updateContact("townArea",e.target.value)} maxLength={120} autoComplete="address-level2" placeholder="e.g. Lusaka, Chilenje" required/></label><label>Pickup address (optional)<input value={form.pickupAddress} onChange={e=>updateContact("pickupAddress",e.target.value)} maxLength={300} autoComplete="street-address" placeholder="Street, landmark or collection instructions"/></label></div>
        <div className={styles.consentGroup}><h3>Stay connected with VSI</h3><label className={styles.consent}><input type="checkbox" checked={form.phoneConsent} onChange={e=>updateContact("phoneConsent",e.target.checked)}/><span>Yes, I would like to receive communications from Visionary Students Initiative (VSI) on my phone.</span></label><label className={styles.consent}><input type="checkbox" checked={form.emailConsent} onChange={e=>updateContact("emailConsent",e.target.checked)}/><span>Yes, I would like to receive communications from VSI by email.</span></label><p>These preferences are optional. We will use the contact details you provide to respond to this offer and coordinate collection.</p></div>
        <label className={styles.honeypot} aria-hidden="true">Leave this field empty<input tabIndex="-1" autoComplete="off" value={form.website} onChange={e=>updateContact("website",e.target.value)}/></label>
        <div className={styles.actionRow}><button type="button" className={styles.secondaryButton} onClick={()=>{setStep(1);setError("");window.scrollTo({top:0,behavior:"smooth"})}}>← Back to items</button><button type="submit" className={styles.primaryButton}>Review my pledge →</button></div>
      </form></section>}
      {step===3&&<section className={styles.panel}><div className={styles.panelIntro}><p className="kicker">SECTION 03</p><h2>Review your generosity pledge</h2><p>Check your selections and contact details before submitting.</p></div><div className={styles.summaryCard}><div className={styles.summaryHead}><div><h3>Your selected items</h3><p>{items.length} item types</p><div className={styles.totalPledge}><span>Total units pledged</span><strong>{totalUnits.toLocaleString()}</strong></div></div><button type="button" className={styles.textButton} onClick={()=>{setStep(1);setError("")}}>Edit items</button></div>{categories.map(category=>{const rows=items.filter(item=>item.category===category.key);return rows.length?<div className={styles.summaryCategory} key={category.key}><h4>{category.title}</h4>{rows.map(item=><div className={styles.summaryItem} key={itemId(item.category,item.itemKey)}><span>{item.label}{item.sizeDetails&&item.category!=="other"&&<small>{item.sizeDetails}</small>}</span><strong>{Number(item.quantity).toLocaleString()} {item.unit}</strong></div>)}</div>:null})}</div><div className={styles.summaryCard}><div className={styles.summaryHead}><h3>Your details</h3><button type="button" className={styles.textButton} onClick={()=>{setStep(2);setError("")}}>Edit details</button></div><div className={styles.detailsGrid}><div><small>Name</small><strong>{form.firstName} {form.lastName}</strong></div><div><small>Email</small><strong>{form.email}</strong></div><div><small>Phone</small><strong>+260 {form.phone}</strong></div><div><small>Pickup area</small><strong>{form.townArea}</strong></div>{form.pickupAddress&&<div><small>Pickup address</small><strong>{form.pickupAddress}</strong></div>}</div></div><div className={styles.notice}><strong>No money is requested or processed.</strong><span>You purchase the goods you have pledged. VSI will contact you to arrange collection. Your pledge is recorded until items are actually received.</span></div><div className={styles.actionRow}><button type="button" className={styles.secondaryButton} onClick={()=>{setStep(2);setError("")}}>← Back to details</button><button type="button" className={styles.primaryButton} onClick={submitOffer} disabled={saving}>{saving?"Submitting pledge…":"Submit pledge →"}</button></div></section>}
      {error&&<div role="alert" className={styles.error}>{error}</div>}
    </>}
  </div></main><SiteFooter/></>;
}
