"use client";
export default function OtherPaymentEditor({value,saving,onChange,onSave,onCancel}){
 return <form onSubmit={onSave} style={{marginTop:18,padding:20,border:"1px solid #dfe6ed",borderRadius:14,background:"#f8fafc"}}>
  <h3 style={{marginTop:0}}>Edit other payment</h3>
  <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:12}}>
   <label>Description<input value={value.description||""} onChange={e=>onChange({...value,description:e.target.value})}/></label>
   <label>Amount<input type="number" step="0.01" value={value.amount||""} onChange={e=>onChange({...value,amount:e.target.value})}/></label>
   <label>Payment date<input type="date" value={value.paymentDate||""} onChange={e=>onChange({...value,paymentDate:e.target.value})}/></label>
   <label>Payment method<input value={value.paymentMethod||""} onChange={e=>onChange({...value,paymentMethod:e.target.value})}/></label>
   <label>Reference<input value={value.reference||""} onChange={e=>onChange({...value,reference:e.target.value})}/></label>
   <label>Notes<input value={value.notes||""} onChange={e=>onChange({...value,notes:e.target.value})}/></label>
  </div>
  <div style={{display:"flex",gap:10,marginTop:16}}><button type="submit" disabled={saving}>{saving?"Saving…":"Save changes"}</button><button type="button" onClick={onCancel} disabled={saving}>Cancel</button></div>
 </form>
}