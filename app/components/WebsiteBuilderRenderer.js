import Image from "next/image";
import "./website-builder-renderer.css";
import { pool } from "../../lib/db";

export async function getPublishedBuilderPage(slug) {
  try {
    const result = await pool.query("SELECT title, published_content FROM website_pages WHERE slug = $1 AND status = 'published' LIMIT 1", [slug]);
    const row = result.rows[0];
    if (!row || !Array.isArray(row.published_content) || row.published_content.length === 0) return null;
    return row;
  } catch (error) {
    console.error("Website builder fallback:", error?.message || error);
    return null;
  }
}

const layoutColumns={"100":["100%"],"50-50":["50%","50%"],"33-33-33":["33.333%","33.333%","33.333%"],"25-75":["25%","75%"],"75-25":["75%","25%"],"33-66":["33.333%","66.667%"],"66-33":["66.667%","33.333%"],"25-50-25":["25%","50%","25%"]};
const px=(v)=>Number.isFinite(Number(v))?`${Number(v)}px`:undefined;
const builderStyle=(x)=>({paddingTop:px(x.paddingTop),paddingRight:px(x.paddingRight),paddingBottom:px(x.paddingBottom),paddingLeft:px(x.paddingLeft),marginTop:px(x.marginTop),marginRight:px(x.marginRight),marginBottom:px(x.marginBottom),marginLeft:px(x.marginLeft),fontSize:px(x.fontSize),lineHeight:x.lineHeight||undefined,textAlign:x.textAlign||"left",borderWidth:px(x.borderWidth),borderRadius:px(x.borderRadius),borderStyle:x.borderStyle||"solid",borderColor:x.borderColor||"transparent"});
const visibilityClass=(x)=>`${x.showDesktop===false?" hide-desktop":""}${x.showTablet===false?" hide-tablet":""}${x.showMobile===false?" hide-mobile":""}`;

function ElementContent({element}) {
  const type=String(element.type||"Section").toLowerCase();const title=element.title||"";const text=element.text||"";
  if(type==="hero") return <><p className="builder-kicker">VISIONARY STUDENTS INITIATIVE</p>{title&&<h1>{title}</h1>}{text&&<p className="builder-lead">{text}</p>}<div className="builder-actions"><a href={element.buttonHref||"/discover"} className="builder-button builder-button-primary">{element.buttonLabel||"Discover VSI"} <span aria-hidden="true">↗</span></a></div></>;
  if(type==="heading") return title?<h2>{title}</h2>:null;
  if(type==="text block"||type==="text") return text?<p>{text}</p>:null;
  if(type==="image") return (element.imageUrl||element.image)?<div className="builder-image"><Image src={element.imageUrl||element.image} alt={element.imageAlt||title||"VSI"} fill sizes="(max-width: 900px) 100vw, 50vw" /></div>:null;
  if(type==="button"||type==="call to action") return <div className="builder-actions"><a href={element.buttonHref||"/contact"} className="builder-button builder-button-primary">{element.buttonLabel||title||"Learn more"} <span aria-hidden="true">↗</span></a></div>;
  if(type==="divider") return <hr className="builder-divider" />;
  if(type==="cards") return <div className="builder-card"><h3>{title}</h3><p>{text}</p></div>;
  if(type==="latest news"||type==="news") return <><h2>{title||"Latest news"}</h2><p>{text||"Latest VSI stories and updates."}</p><a href="/news" className="builder-text-link">View latest news →</a></>;
  return <>{title&&<h2>{title}</h2>}{text&&<p>{text}</p>}</>;
}

export default function WebsiteBuilderRenderer({page}) {
 return <main className="website-builder-page">{page.published_content.map((section,index)=>{const widths=layoutColumns[section.layout]||layoutColumns["100"];const style={"--builder-bg":section.bg||"#ffffff","--builder-color":section.color||"#173b58",...builderStyle(section)};const columns=Array.isArray(section.columns)?section.columns:[{elements:[section]}];return <section className={`builder-section ${String(section.type||"Section").toLowerCase().replace(/\s+/g,"-")}${visibilityClass(section)}`} style={style} key={section.id||index}><div className="builder-shell"><div className="builder-columns">{columns.map((column,columnIndex)=><div className={`builder-column${visibilityClass(column)}`} style={{width:widths[columnIndex]||`${100/columns.length}%`}} key={column.id||columnIndex}>{(Array.isArray(column.elements)?column.elements:[]).map((element,elementIndex)=><div className={`builder-element${visibilityClass(element)}`} style={builderStyle(element)} key={element.id||elementIndex}><ElementContent element={element}/></div>)}</div>)}</div></div></section>;})}</main>;
}
