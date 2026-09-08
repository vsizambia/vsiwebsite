"use client";

import {useEffect,useState} from "react";
import {useRouter,useSearchParams} from "next/navigation";
import styles from "../../admin/dashboard.module.css";

export default function AdminAuthPage(){
  const router=useRouter();
  const searchParams=useSearchParams();
  const [authenticated,setAuthenticated]=useState(false);
  const [checking,setChecking]=useState(true);
  const [authStep,setAuthStep]=useState("password");
  const [password,setPassword]=useState("");
  const [authCode,setAuthCode]=useState("");
  const [error,setError]=useState("");

  useEffect(()=>{(async()=>{try{const r=await fetch("/api/admin/volunteers",{cache:"no-store"});setAuthenticated(r.ok);}catch{setAuthenticated(false)}finally{setChecking(false)}})()},[]);
  useEffect(()=>{if(authenticated){const next=searchParams.get("next");router.replace(next&&next.startsWith("/admin")?next:"/admin")}},[authenticated,router,searchParams]);

  async function login(e){
    e.preventDefault();setError("");
    try{
      const payload=authStep==="code"?{code:authCode}:{password};
      const r=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const d=await r.json();
      if(!r.ok)throw new Error(d.error||"Unable to sign in.");
      if(d.requiresAuthenticator){setAuthStep("code");setAuthCode("");return}
      setAuthenticated(true);
    }catch(e){setError(e.message)}
  }

  if(checking)return <main className={styles.center}><div className={styles.loading}>Checking secure access...</div></main>;
  if(authenticated)return <main className={styles.center}><div className={styles.loading}>Opening VSI Administration...</div></main>;

  return <main className={styles.loginPage}><div className={styles.loginShell}>
    <div className={styles.logo}>VSI</div>
    <p className="kicker">SECURE ADMIN ACCESS</p>
    <h1>VSI Administration</h1>
    <p className={styles.loginIntro}>{authStep==="code"?"Enter the 6-digit code from your Authenticator app to continue.":"Sign in to access the VSI Administration Control Centre."}</p>
    <form onSubmit={login} className={styles.form}>
      {authStep==="password"?<><label htmlFor="admin-password">Admin password</label><input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required autoFocus/></>:<><label htmlFor="admin-auth-code">Authenticator code</label><input id="admin-auth-code" type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" value={authCode} onChange={e=>setAuthCode(e.target.value.replace(/\D/g,"").slice(0,6))} required autoFocus/><small>Enter the current 6-digit code from your Authenticator app.</small></>}
      {error&&<div className={styles.error}>{error}</div>}
      <button type="submit">{authStep==="code"?"Verify code":"Continue"} <span>↗</span></button>
      {authStep==="code"&&<button type="button" className={styles.back} onClick={()=>{setAuthStep("password");setAuthCode("");setError("")}}>← Back to password</button>}
    </form>
  </div></main>;
}