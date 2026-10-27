"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SafeguardingSignInPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/safeguarding-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, code })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to sign in.");
      router.replace("/admin/safeguarding");
      router.refresh();
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }
  return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f4f7f9" }}>
    <section style={{ width: "100%", maxWidth: 460, boxSizing: "border-box", background: "#fff", padding: 36, borderTop: "6px solid #174D4B", boxShadow: "0 18px 50px rgba(0,53,102,.12)" }}>
      <p style={{ color: "#174D4B", fontWeight: 800, letterSpacing: ".08em", fontSize: ".8rem" }}>VISIONARY STUDENTS INITIATIVE</p>
      <h1 style={{ color: "#173b58", lineHeight: 1.15 }}>Safeguarding staff sign-in</h1>
      <p style={{ color: "#5b6872", lineHeight: 1.6 }}>Use your individual safeguarding account and current authenticator code. Access is limited by your assigned role.</p>
      <form onSubmit={submit}>
        <label htmlFor="safeguarding-username" style={{ display: "block", fontWeight: 700, margin: "16px 0 6px" }}>Username</label>
        <input id="safeguarding-username" autoComplete="username" value={username} onChange={event => setUsername(event.target.value)} required style={{ width: "100%", boxSizing: "border-box", padding: 13, border: "1px solid #cbd5dc" }} />
        <label htmlFor="safeguarding-password" style={{ display: "block", fontWeight: 700, margin: "16px 0 6px" }}>Password</label>
        <input id="safeguarding-password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required style={{ width: "100%", boxSizing: "border-box", padding: 13, border: "1px solid #cbd5dc" }} />
        <label htmlFor="safeguarding-code" style={{ display: "block", fontWeight: 700, margin: "16px 0 6px" }}>Authenticator code</label>
        <input id="safeguarding-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={event => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} required style={{ width: "100%", boxSizing: "border-box", padding: 13, border: "1px solid #cbd5dc" }} />
        {error && <p role="alert" style={{ color: "#9b1c1c", background: "#fff1f1", padding: 12 }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ width: "100%", border: 0, padding: 15, marginTop: 20, background: "#174D4B", color: "#fff", fontWeight: 800, cursor: "pointer" }}>{loading ? "Verifying…" : "Sign in to safeguarding"}</button>
      </form>
      <p style={{ marginTop: 22 }}><a href="/auth/admin" style={{ color: "#174D4B" }}>← Return to VSI Admin sign-in</a></p>
    </section>
  </main>;
}
