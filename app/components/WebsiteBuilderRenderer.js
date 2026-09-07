import Image from "next/image";
import "./website-builder-renderer.css";
import { pool } from "../../lib/db";

export async function getPublishedBuilderPage(slug) {
  try {
    const result = await pool.query(
      "SELECT title, published_content FROM website_pages WHERE slug = $1 AND status = 'published' LIMIT 1",
      [slug]
    );
    const row = result.rows[0];
    if (!row || !Array.isArray(row.published_content) || row.published_content.length === 0) return null;
    return row;
  } catch (error) {
    console.error("Website builder fallback:", error?.message || error);
    return null;
  }
}

const layoutColumns = {
  "100": ["100%"],
  "50-50": ["50%", "50%"],
  "33-33-33": ["33.333%", "33.333%", "33.333%"],
  "25-75": ["25%", "75%"],
  "75-25": ["75%", "25%"],
  "33-66": ["33.333%", "66.667%"],
  "66-33": ["66.667%", "33.333%"],
  "25-50-25": ["25%", "50%", "25%"],
};

function ElementContent({ section }) {
  const type = String(section.type || "Section").toLowerCase();
  const title = section.title || "";
  const text = section.text || "";
  if (type === "hero") return <><p className="builder-kicker">VISIONARY STUDENTS INITIATIVE</p>{title && <h1>{title}</h1>}{text && <p className="builder-lead">{text}</p>}<div className="builder-actions"><a href={section.buttonHref || "/discover"} className="builder-button builder-button-primary">{section.buttonLabel || "Discover VSI"} <span aria-hidden="true">↗</span></a></div></>;
  if (type === "heading") return title ? <h2>{title}</h2> : null;
  if (type === "text block" || type === "text") return text ? <p>{text}</p> : null;
  if (type === "image") return section.image ? <div className="builder-image"><Image src={section.image} alt={section.imageAlt || title || "VSI"} fill sizes="(max-width: 900px) 100vw, 50vw" /></div> : null;
  if (type === "button" || type === "call to action") return <div className="builder-actions"><a href={section.buttonHref || "/contact"} className="builder-button builder-button-primary">{section.buttonLabel || title || "Learn more"} <span aria-hidden="true">↗</span></a></div>;
  if (type === "divider") return <hr className="builder-divider" />;
  if (type === "cards") return <div className="builder-card"><h3>{title}</h3><p>{text}</p></div>;
  if (type === "latest news" || type === "news") return <><h2>{title || "Latest news"}</h2><p>{text || "Latest VSI stories and updates."}</p><a href="/news" className="builder-text-link">View latest news →</a></>;
  return <>{title && <h2>{title}</h2>}{text && <p>{text}</p>}</>;
}

export default function WebsiteBuilderRenderer({ page }) {
  return <main className="website-builder-page">
    {page.published_content.map((section, index) => {
      const columns = layoutColumns[section.layout] || layoutColumns["100"];
      const style = {
        "--builder-bg": section.bg || "#ffffff",
        "--builder-color": section.color || "#173b58",
      };
      return <section className={`builder-section ${String(section.type || "Section").toLowerCase().replace(/\s+/g, "-")}`} style={style} key={section.id || index}>
        <div className="builder-shell"><div className="builder-columns">
          {columns.map((width, columnIndex) => <div className="builder-column" style={{ width }} key={columnIndex}>{columnIndex === 0 ? <ElementContent section={section} /> : null}</div>)}
        </div></div>
      </section>;
    })}
  </main>;
}
