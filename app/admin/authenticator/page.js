"use client";
import { useState } from "react";
import { SiteFooter, SiteHeader } from "../../components/SiteChrome";

export default function AdminAuthenticatorSetup() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function revealSetup(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/authenticator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ password, code }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to verify your identity.");
      setData(result);
      setPassword("");
      setCode("");
    } catch (err) {
      setError(err.message || "Unable to load authenticator setup.");
      setCode("");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!data) return;
    await navigator.clipboard.writeText(data.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <>
      <SiteHeader ctaLabel="Admin" ctaHref="/admin/volunteers" />
      <main style={{ minHeight: "70vh", padding: "80px 20px", background: "#f6f9fc" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", background: "#fff", borderRadius: 20, padding: 32, boxShadow: "0 16px 45px rgba(11,48,82,.10)" }}>
          <p className="kicker">ADMIN SECURITY</p>
          <h1 style={{ marginBottom: 10 }}>Authenticator setup</h1>
          <p style={{ color: "#52606d", lineHeight: 1.6 }}>
            For security, viewing the VSI Admin authenticator setup key requires you to confirm your password and current 6-digit authenticator code, even when you are already signed in.
          </p>
          {error && <div role="alert" style={{ marginTop: 20, padding: 14, borderRadius: 10, background: "#fff0f0", color: "#a12b2b" }}>{error}</div>}
          {!data ? (
            <form onSubmit={revealSetup} style={{ marginTop: 24, display: "grid", gap: 14 }}>
              <label style={{ display: "grid", gap: 7, fontWeight: 700 }}>
                Admin password
                <input type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} style={{ padding: 12, border: "1px solid #cbd5e1", borderRadius: 9, font: "inherit" }} />
              </label>
              <label style={{ display: "grid", gap: 7, fontWeight: 700 }}>
                Current 6-digit authenticator code
                <input type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={event => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} style={{ padding: 12, border: "1px solid #cbd5e1", borderRadius: 9, font: "inherit", letterSpacing: 3 }} />
              </label>
              <button type="submit" disabled={loading} style={{ marginTop: 4, border: 0, borderRadius: 10, padding: "13px 16px", background: "#07365f", color: "#fff", fontWeight: 800, cursor: loading ? "wait" : "pointer", opacity: loading ? .7 : 1 }}>
                {loading ? "Verifying…" : "Verify and reveal setup key"}
              </button>
            </form>
          ) : (
            <>
              <div style={{ marginTop: 24, padding: 20, borderRadius: 14, background: "#f4f8fc", border: "1px solid #dce7f1" }}>
                <b>Account</b><div style={{ marginTop: 5 }}>{data.account}</div>
                <b style={{ display: "block", marginTop: 16 }}>Issuer</b><div style={{ marginTop: 5 }}>{data.issuer}</div>
                <b style={{ display: "block", marginTop: 16 }}>Manual setup key</b>
                <div style={{ marginTop: 8, fontFamily: "monospace", fontSize: 18, letterSpacing: 1.5, wordBreak: "break-all" }}>{data.secret}</div>
                <button type="button" onClick={copy} style={{ marginTop: 12, border: 0, borderRadius: 10, padding: "10px 14px", fontWeight: 800, cursor: "pointer" }}>{copied ? "Copied ✓" : "Copy setup key"}</button>
              </div>
              <div style={{ marginTop: 22, lineHeight: 1.7, color: "#52606d" }}>
                <b>In your Authenticator app:</b>
                <ol>
                  <li>Choose <b>Add account</b> or <b>+</b>.</li>
                  <li>Choose <b>Enter setup key manually</b>.</li>
                  <li>Account name: <b>VSI Admin</b>.</li>
                  <li>Paste the setup key above.</li>
                  <li>Use <b>Time-based (TOTP)</b> and save.</li>
                </ol>
                <p>After this, the VSI Admin login will require the 6-digit code from the app after the password is accepted.</p>
                <button type="button" onClick={() => setData(null)} style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: "10px 14px", background: "#fff", fontWeight: 700, cursor: "pointer" }}>Hide setup key</button>
              </div>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
