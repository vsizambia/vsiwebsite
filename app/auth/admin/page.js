"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const styles={
  page:{minHeight:"100vh",display:"grid",placeItems:"center",padding:"24px",background:"#f4f7f9"},
  card:{width:"100%",maxWidth:"460px",background:"#fff",padding:"40px",boxShadow:"0 18px 50px rgba(0,53,102,.12)",borderTop:"6px solid #003566",boxSizing:"border-box"},
  logoWrap:{display:"flex",justifyContent:"center",alignItems:"center",marginBottom:"28px"},
  logo:{display:"block",width:"190px",height:"auto",maxWidth:"80%"},
  title:{fontSize:"2rem",lineHeight:1.1,color:"#173b58",margin:"0 0 12px",textAlign:"center"},
  intro:{color:"#5b6872",lineHeight:1.6,margin:"0 auto 28px",textAlign:"center",maxWidth:"360px"},
  label:{display:"block",fontWeight:700,color:"#173b58",marginBottom:"8px"},
  input:{width:"100%",boxSizing:"border-box",padding:"14px",border:"1px solid #cbd5dc",fontSize:"1rem",marginBottom:"14px"},
  button:{width:"100%",border:0,padding:"15px 18px",background:"#003566",color:"#fff",fontWeight:800,fontSize:"1rem",cursor:"pointer"},
  back:{width:"100%",border:"1px solid #cbd5dc",padding:"13px 18px",background:"#fff",color:"#173b58",fontWeight:700,fontSize:".95rem",cursor:"pointer",marginTop:"10px"},
  error:{background:"#fff1f1",color:"#9b1c1c",padding:"12px 14px",marginBottom:"14px",fontSize:".92rem",textAlign:"center"},
  help:{display:"block",color:"#64748b",marginBottom:"14px",fontSize:".85rem"}
};

export default function AdminAuthPage(){
  const router=useRouter();
  const [authStep,setAuthStep]=useState("password");
  const [password,setPassword]=useState("");
  const [authCode,setAuthCode]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  async function login(e){
    e.preventDefault();setError("");setLoading(true);
    try{
      const payload=authStep==="code"?{code:authCode}:{password};
      const r=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const d=await r.json();
      if(!r.ok)throw new Error(d.error||"Unable to sign in.");
      if(d.requiresAuthenticator){setAuthStep("code");setAuthCode("");return}
      const next=new URLSearchParams(window.location.search).get("next");
      router.replace(next&&next.startsWith("/admin")?next:"/admin");
      router.refresh();
    }catch(e){setError(e.message)}finally{setLoading(false)}
  }

  return <main style={styles.page}><section style={styles.card}>
    <div style={styles.logoWrap}>
      <img src="/images/VSI%20LOGO%20white%20and%20%20blue.png" alt="Visionary Students Initiative" style={styles.logo}/>
    </div>
    <h1 style={styles.title}>VSI Administration</h1>
    <p style={styles.intro}>{authStep==="code"?"Enter the 6-digit code from your Authenticator app to continue.":"Sign in to access the VSI Administration Control Centre."}</p>
    <form onSubmit={login}>
      {authStep==="password"?<><label style={styles.label} htmlFor="admin-password">Admin password</label><input style={styles.input} id="admin-password" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required autoFocus/></>:<><label style={styles.label} htmlFor="admin-auth-code">Authenticator code</label><input style={styles.input} id="admin-auth-code" type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" value={authCode} onChange={e=>setAuthCode(e.target.value.replace(/\D/g,"").slice(0,6))} required autoFocus/><small style={styles.help}>Enter the current 6-digit code from your Authenticator app.</small></>}
      {error&&<div style={styles.error}>{error}</div>}
      <button style={styles.button} type="submit" disabled={loading}>{loading?"Please wait...":authStep==="code"?"Verify code":"Continue"}</button>
      {authStep==="code"&&<button style={styles.back} type="button" onClick={()=>{setAuthStep("password");setAuthCode("");setError("")}}>← Back to password</button>}
    </form>
  </section></main>;
}