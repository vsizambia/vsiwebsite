"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SiteHeader, SiteFooter } from "../../components/SiteChrome";
import styles from "./media-library.module.css";

export default function MediaLibraryPage() {
  const [blobs, setBlobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/website-media", { cache: "no-store" });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Unable to load media library.");
      setBlobs(data.blobs || []);
    } catch (error) {
      setNotice(error.message || "Unable to load media library.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setNotice("");
    try {
      const form = new FormData();
      form.append("file", file);
      const r = await fetch("/api/admin/website-media", { method: "POST", body: form });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Upload failed.");
      setNotice("Image uploaded successfully.");
      await load();
    } catch (error) {
      setNotice(error.message || "Unable to upload image.");
    } finally {
      setUploading(false);
    }
  }

  return <><SiteHeader /><main className={styles.page}><div className={styles.shell}>
    <div className={styles.topline}><Link href="/admin/website-manager">← Website Manager</Link><span>MEDIA LIBRARY</span></div>
    <section className={styles.hero}><div><p>VSI WEBSITE MANAGEMENT</p><h1>Media Library</h1><span>Upload and manage images used by the visual website builder.</span></div>
      <label className={styles.upload}>{uploading ? "Uploading…" : "＋ Upload image"}<input type="file" accept="image/*" onChange={upload} disabled={uploading} /></label>
    </section>
    {notice && <p className={styles.notice}>{notice}</p>}
    <section className={styles.library}>
      {loading ? <p>Loading media…</p> : blobs.length === 0 ? <div className={styles.empty}><h2>No images yet</h2><p>Upload your first website image to begin building the media library.</p></div> : <div className={styles.grid}>{blobs.map(blob => <article className={styles.card} key={blob.url}><div className={styles.image}><Image src={blob.url} alt={blob.pathname.split("/").pop() || "Website image"} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 33vw, 25vw" /></div><div className={styles.info}><strong>{blob.pathname.split("/").pop()}</strong><button onClick={() => navigator.clipboard?.writeText(blob.url).then(() => setNotice("Image URL copied."))}>Copy image URL</button></div></article>)}</div>}
    </section>
    <div className={styles.help}><strong>Next builder step:</strong> images from this library will be selectable directly from the Image element inspector instead of pasting URLs.</div>
  </div></main><SiteFooter /></>;
}
