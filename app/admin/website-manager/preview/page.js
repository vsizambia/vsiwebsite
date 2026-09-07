import Link from "next/link";
import { cookies } from "next/headers";
import { pool } from "../../../../lib/db";
import { isAdminAuthenticated } from "../../../../lib/admin-auth";
import { SiteHeader, SiteFooter } from "../../../components/SiteChrome";
import WebsiteBuilderRenderer from "../../../components/WebsiteBuilderRenderer";

export const metadata = {
  title: "Website Builder Preview | VSI",
  robots: { index: false, follow: false },
};

export default async function WebsiteBuilderPreview({ searchParams }) {
  const cookieStore = cookies();
  const request = new Request("https://www.vsizambia.org/admin/website-manager/preview", {
    headers: { cookie: cookieStore.toString() },
  });

  if (!isAdminAuthenticated(request)) {
    return (
      <main style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: 40, fontFamily: "Arial, sans-serif" }}>
        <div style={{ maxWidth: 520, textAlign: "center" }}>
          <h1>Admin authentication required</h1>
          <p>Sign in to VSI Administration to view an unpublished website draft.</p>
          <Link href="/admin">← Return to Administration</Link>
        </div>
      </main>
    );
  }

  const slug = String(searchParams?.slug || "home").trim().toLowerCase();
  const result = await pool.query(
    "SELECT id, slug, title, draft_content, updated_at FROM website_pages WHERE slug = $1 LIMIT 1",
    [slug]
  );
  const page = result.rows[0];

  if (!page) {
    return (
      <main style={{ minHeight: "70vh", padding: 40, fontFamily: "Arial, sans-serif" }}>
        <Link href="/admin/website-manager">← Website Builder</Link>
        <h1>Draft not found</h1>
        <p>No saved draft exists for <strong>{slug}</strong>.</p>
      </main>
    );
  }

  const previewPage = {
    ...page,
    published_content: Array.isArray(page.draft_content) ? page.draft_content : [],
  };

  return (
    <>
      <div style={{ position: "sticky", top: 0, zIndex: 1000, background: "#003566", color: "#fff", padding: "10px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, fontFamily: "Arial, sans-serif", fontSize: 13 }}>
        <span><strong>VSI DRAFT PREVIEW</strong> · {page.title}</span>
        <span style={{ display: "flex", gap: 14 }}>
          <Link href={`/admin/website-manager?preview=1&page=${encodeURIComponent(page.slug)}`} style={{ color: "#fff" }}>← Builder</Link>
          <Link href={`/${page.slug === "home" ? "" : page.slug}`} style={{ color: "#fff" }}>View live ↗</Link>
        </span>
      </div>
      <SiteHeader />
      <WebsiteBuilderRenderer page={previewPage} />
      <SiteFooter />
    </>
  );
}
