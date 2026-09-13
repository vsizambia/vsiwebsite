"use client";

import { useEffect, useState } from "react";
import TurnstileWidget from "../../components/TurnstileWidget";

const COOKIE = "vsi_volunteer_turnstile";

export default function VolunteerApplicationTurnstile() {
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!token) return;
    document.cookie = `${COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=300; SameSite=Lax; Secure`;
  }, [token]);

  return (
    <section style={{ margin: "0 0 28px", padding: "20px", border: "1px solid rgba(15,23,42,.1)", borderRadius: 16, background: "#f8fafc" }}>
      <p className="kicker" style={{ marginBottom: 6 }}>SECURITY CHECK</p>
      <p style={{ margin: "0 0 14px", color: "#475569" }}>Please complete the quick security check before submitting your volunteer application.</p>
      <TurnstileWidget action="volunteer_application" onToken={setToken} />
    </section>
  );
}
