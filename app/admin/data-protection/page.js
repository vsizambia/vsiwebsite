"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DataProtectionCompliancePage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [retentionReason, setRetentionReason] = useState("");
  const [form, setForm] = useState({
    incidentType: "",
    summary: "",
    personalDataAffected: false,
    containmentAction: "",
  });

  const load = async () => {
    try {
      const response = await fetch("/api/admin/data-protection", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Unable to load compliance records.");
        return;
      }
      setData(result);
    } catch {
      setError("Unable to load compliance records.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const update = async (kind, id, status) => {
    const response = await fetch("/api/admin/data-protection", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, id, status }),
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setError(result.error || "Unable to update record.");
      return;
    }

    load();
  };

  const retentionAction = async (item, action) => {
    const reason = window.prompt(`Reason for ${action} action (optional):`, retentionReason);
    if (reason === null) return;
    const response = await fetch("/api/admin/data-protection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "retention_action", recordType: item.recordType, recordId: item.recordId, action, reason }),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setError(result.error || "Unable to record retention action.");
      return;
    }
    setRetentionReason("");
    load();
  };

  const addIncident = async (event) => {
    event.preventDefault();
    setError("");

    const response = await fetch("/api/admin/data-protection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setError(result.error || "Unable to record incident.");
      return;
    }

    setForm({
      incidentType: "",
      summary: "",
      personalDataAffected: false,
      containmentAction: "",
    });
    load();
  };

  if (!data) {
    return (
      <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
        <Link href="/admin">← VSI Administration</Link>
        <h1>Data Protection Compliance Register</h1>
        <p>{error || "Loading compliance records..."}</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 20px", fontFamily: "Arial, sans-serif" }}>
      <Link href="/admin">← VSI Administration</Link>

      <h1>Data Protection Compliance Register</h1>
      <p>Manage data-subject requests, consent records, incidents and retention controls.</p>

      {error && <p>{error}</p>}

      <h2>Retention &amp; Deletion Controls</h2>
      <p>Retention rules automatically flag records that are due for review. No personal data is automatically deleted; authorised review is required before a destructive action.</p>
      <table>
        <thead><tr><th>Record type</th><th>Retention period</th><th>Default action</th><th>Total</th><th>Due for review</th></tr></thead>
        <tbody>{data.retention.map((item) => (
          <tr key={item.id}>
            <td>{item.label}</td>
            <td>{item.retention_months} months</td>
            <td>{item.action}</td>
            <td>{item.total}</td>
            <td>{item.due}</td>
          </tr>
        ))}</tbody>
      </table>
      <p><strong>{data.retention.reduce((sum,item)=>sum+Number(item.due||0),0)}</strong> records are currently due for retention review across the tracked categories.</p>

      <h2>Records due for retention review ({data.retentionQueue.length})</h2>
      <p>Review each individual record before taking action. Actions are logged for accountability; this queue does not automatically destroy personal data.</p>
      <table>
        <thead><tr><th>Record</th><th>Category</th><th>Status</th><th>Created / received</th><th>Due date</th><th>Actions</th></tr></thead>
        <tbody>
          {data.retentionQueue.length === 0 ? (
            <tr><td colSpan="6">No records are currently due for retention review.</td></tr>
          ) : data.retentionQueue.map((item) => (
            <tr key={`${item.recordType}-${item.recordId}`}>
              <td>{item.label}</td>
              <td>{item.recordType.replaceAll("_"," ")}</td>
              <td>{item.status}</td>
              <td>{new Date(item.createdAt).toLocaleDateString()}</td>
              <td>{new Date(item.dueAt).toLocaleDateString()}</td>
              <td>
                <button type="button" onClick={() => retentionAction(item, "retain")}>Retain</button>{" "}
                <button type="button" onClick={() => retentionAction(item, "review")}>Review</button>{" "}
                <button type="button" onClick={() => retentionAction(item, "archive")}>Archive</button>{" "}
                <button type="button" onClick={() => retentionAction(item, "anonymise")}>Anonymise</button>{" "}
                <button type="button" onClick={() => retentionAction(item, "delete")}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Recent retention actions</h2>
      <table>
        <thead><tr><th>Record type</th><th>Record ID</th><th>Action</th><th>Reason</th><th>Performed</th></tr></thead>
        <tbody>{data.recentActions.length === 0 ? <tr><td colSpan="5">No retention actions recorded yet.</td></tr> : data.recentActions.map((item) => (
          <tr key={item.id}><td>{item.record_type.replaceAll("_"," ")}</td><td>{item.record_id}</td><td>{item.action}</td><td>{item.reason || "—"}</td><td>{new Date(item.performed_at).toLocaleString()}</td></tr>
        ))}</tbody>
      </table>

      <h2>Data-subject requests ({data.requests.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Requester</th>
            <th>Email</th>
            <th>Received</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.requests.map((item) => (
            <tr key={item.id}>
              <td>{item.request_type}</td>
              <td>{item.requester_name}</td>
              <td>{item.requester_email}</td>
              <td>{new Date(item.received_at).toLocaleString()}</td>
              <td>{item.status}</td>
              <td>
                <select value={item.status} onChange={(event) => update("request", item.id, event.target.value)}>
                  <option value="received">Received</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                  <option value="closed">Closed</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Consent records</h2>
      <table>
        <thead>
          <tr>
            <th>Consent type</th>
            <th>Granted</th>
            <th>Total records</th>
          </tr>
        </thead>
        <tbody>
          {data.consents.map((item) => (
            <tr key={item.consent_type}>
              <td>{item.consent_type}</td>
              <td>{item.granted}</td>
              <td>{item.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Record data-protection incident</h2>
      <form onSubmit={addIncident}>
        <input
          required
          placeholder="Incident type"
          value={form.incidentType}
          onChange={(event) => setForm({ ...form, incidentType: event.target.value })}
        />
        <br />
        <textarea
          required
          placeholder="Summary"
          value={form.summary}
          onChange={(event) => setForm({ ...form, summary: event.target.value })}
        />
        <br />
        <label>
          <input
            type="checkbox"
            checked={form.personalDataAffected}
            onChange={(event) => setForm({ ...form, personalDataAffected: event.target.checked })}
          />
          Personal data affected
        </label>
        <br />
        <textarea
          placeholder="Immediate containment action"
          value={form.containmentAction}
          onChange={(event) => setForm({ ...form, containmentAction: event.target.value })}
        />
        <br />
        <button type="submit">Record incident</button>
      </form>

      <h2>Incident register ({data.incidents.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Reported</th>
            <th>Type</th>
            <th>Summary</th>
            <th>Personal data</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.incidents.map((item) => (
            <tr key={item.id}>
              <td>{new Date(item.reported_at).toLocaleString()}</td>
              <td>{item.incident_type}</td>
              <td>{item.summary}</td>
              <td>{item.personal_data_affected ? "Yes" : "No"}</td>
              <td>{item.status}</td>
              <td>
                <select value={item.status} onChange={(event) => update("incident", item.id, event.target.value)}>
                  <option value="open">Open</option>
                  <option value="contained">Contained</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
