"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "../../components/SiteChrome";
import styles from "./website-manager.module.css";

const layouts = [
  { id: "100", label: "Full width", cols: ["100%"] },
  { id: "50-50", label: "Two columns", cols: ["50%", "50%"] },
  { id: "33-33-33", label: "Three columns", cols: ["33%", "33%", "33%"] },
  { id: "25-75", label: "25 / 75", cols: ["25%", "75%"] },
  { id: "75-25", label: "75 / 25", cols: ["75%", "25%"] },
  { id: "33-66", label: "33 / 66", cols: ["33%", "66%"] },
  { id: "66-33", label: "66 / 33", cols: ["66%", "33%"] },
  { id: "25-50-25", label: "25 / 50 / 25", cols: ["25%", "50%", "25%"] },
];

const elements = [
  ["heading", "Heading"],
  ["text", "Text block"],
  ["image", "Image"],
  ["button", "Button"],
  ["cards", "Cards"],
  ["divider", "Divider"],
  ["hero", "Hero"],
  ["news", "Latest news"],
];

const names = ["Home", "Discover VSI", "Our Work", "Our Story", "Community", "Volunteer", "Contact"];

const defaults = {
  paddingTop: 0,
  paddingRight: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  marginTop: 0,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,
  fontSize: "",
  lineHeight: "",
  textAlign: "left",
  borderWidth: 0,
  borderRadius: 0,
  borderStyle: "solid",
  borderColor: "#dce5eb",
  showDesktop: true,
  showTablet: true,
  showMobile: true,
};

const slugify = (value) =>
  value === "Home"
    ? "home"
    : value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const numberValue = (value, fallback = 0) =>
  Number.isFinite(Number(value)) ? Number(value) : fallback;

function makeElement(type) {
  const id = `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return {
    id,
    type,
    title: type === "heading" ? "New heading" : "",
    text: type === "text" ? "Add your content here." : "",
    buttonLabel: type === "button" ? "Learn more" : "",
    buttonHref: type === "button" ? "/contact" : "",
    imageUrl: "",
    ...defaults,
  };
}

function normalizeSection(section) {
  const layout = layouts.find((item) => item.id === section.layout) || layouts[0];
  const base = {
    ...defaults,
    ...section,
    bg: section.bg || "#ffffff",
    color: section.color || "#173b58",
  };

  if (Array.isArray(section.columns)) {
    return {
      ...base,
      columns: layout.cols.map((_, index) => {
        const oldColumn = section.columns[index] || {};
        return {
          ...oldColumn,
          id: oldColumn.id || `col-${section.id}-${index}`,
          elements: Array.isArray(oldColumn.elements)
            ? oldColumn.elements.map((element) => ({ ...defaults, ...element }))
            : [],
        };
      }),
    };
  }

  return {
    ...base,
    columns: layout.cols.map((_, index) => ({
      id: `col-${section.id}-${index}`,
      elements:
        index === 0
          ? [
              {
                ...defaults,
                id: `el-${section.id}`,
                type: section.type || "Section",
                title: section.title || "",
                text: section.text || "",
                imageUrl: "",
              },
            ]
          : [],
    })),
  };
}

const starter = [
  {
    id: 1,
    type: "Hero",
    layout: "100",
    title: "Empowering young people to shape the future",
    text: "Visionary Students Initiative creates opportunities for young people to lead, learn and create positive change.",
    bg: "#003566",
    color: "#ffffff",
  },
  {
    id: 2,
    type: "Introduction",
    layout: "50-50",
    title: "Discover VSI",
    text: "Building visionary, informed and empowered young people.",
    bg: "#ffffff",
    color: "#173b58",
  },
].map(normalizeSection);

export default function WebsiteManagerPage() {
  const [selectedPage, setSelectedPage] = useState("Home");
  const [sections, setSections] = useState(starter);
  const [activeId, setActiveId] = useState(1);
  const [activeColumn, setActiveColumn] = useState(0);
  const [activeElement, setActiveElement] = useState(null);
  const [tab, setTab] = useState("structure");
  const [pages, setPages] = useState([]);
  const [media, setMedia] = useState([]);
  const [versions, setVersions] = useState([]);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [versionsLoading, setVersionsLoading] = useState(false);

  const active = sections.find((section) => section.id === activeId) || sections[0];
  const column = active?.columns?.[activeColumn] || active?.columns?.[0];
  const selectedEl = column?.elements?.find((element) => element.id === activeElement) || column?.elements?.[0];
  const currentPage = pages.find((page) => page.slug === slugify(selectedPage));

  useEffect(() => {
    fetch("/api/admin/website-manager", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setPages(data?.pages || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setMediaLoading(true);
    fetch("/api/admin/website-media?prefix=website-media/", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setMedia(data?.blobs || []))
      .catch(() => {})
      .finally(() => setMediaLoading(false));
  }, []);

  useEffect(() => {
    if (currentPage?.draft_content?.length) {
      const nextSections = currentPage.draft_content.map(normalizeSection);
      setSections(nextSections);
      setActiveId(nextSections[0]?.id || null);
      setActiveColumn(0);
      setActiveElement(nextSections[0]?.columns?.[0]?.elements?.[0]?.id || null);
    } else {
      setSections(starter);
      setActiveId(1);
      setActiveColumn(0);
      setActiveElement(starter[0]?.columns?.[0]?.elements?.[0]?.id || null);
    }
    setNotice("");
  }, [selectedPage, currentPage]);

  useEffect(() => {
    if (!currentPage?.id) {
      setVersions([]);
      return;
    }

    setVersionsLoading(true);
    fetch(`/api/admin/website-manager?pageId=${currentPage.id}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setVersions(data?.versions || []))
      .catch(() => {})
      .finally(() => setVersionsLoading(false));
  }, [currentPage?.id]);

  function updateSection(patch) {
    setSections((items) => items.map((section) => (section.id === activeId ? { ...section, ...patch } : section)));
  }

  function updateElement(patch) {
    if (!selectedEl) return;
    setSections((items) =>
      items.map((section) => {
        if (section.id !== activeId) return section;
        return {
          ...section,
          columns: section.columns.map((item, index) => {
            if (index !== activeColumn) return item;
            return {
              ...item,
              elements: item.elements.map((element) =>
                element.id === selectedEl.id ? { ...element, ...patch } : element
              ),
            };
          }),
        };
      })
    );
  }

  function setStyle(target, key, value) {
    if (target === "section") updateSection({ [key]: value });
    else updateElement({ [key]: value });
  }

  function setNumber(target, key, value, max = 200) {
    const numeric = Math.max(0, Math.min(max, Number(value) || 0));
    setStyle(target, key, numeric);
  }

  function addSection(layoutId = "100") {
    const id = Date.now();
    const layout = layouts.find((item) => item.id === layoutId) || layouts[0];
    const section = {
      id,
      type: "Section",
      layout: layout.id,
      title: "New section",
      text: "",
      bg: "#ffffff",
      color: "#173b58",
      ...defaults,
      columns: layout.cols.map((_, index) => ({ id: `col-${id}-${index}`, elements: [] })),
    };
    setSections((items) => [...items, section]);
    setActiveId(id);
    setActiveColumn(0);
    setActiveElement(null);
  }

  function addElement(type) {
    if (!active) return;
    const element = makeElement(type);
    setSections((items) =>
      items.map((section) =>
        section.id !== activeId
          ? section
          : {
              ...section,
              columns: section.columns.map((item, index) =>
                index === activeColumn ? { ...item, elements: [...item.elements, element] } : item
              ),
            }
      )
    );
    setActiveElement(element.id);
    setTab("structure");
  }

  function removeElement() {
    if (!selectedEl) return;
    setSections((items) =>
      items.map((section) =>
        section.id !== activeId
          ? section
          : {
              ...section,
              columns: section.columns.map((item, index) =>
                index === activeColumn
                  ? { ...item, elements: item.elements.filter((element) => element.id !== selectedEl.id) }
                  : item
              ),
            }
      )
    );
    setActiveElement(null);
  }

  function removeActive() {
    if (sections.length < 2) return;
    const next = sections.filter((section) => section.id !== activeId);
    setSections(next);
    setActiveId(next[0]?.id || null);
    setActiveColumn(0);
    setActiveElement(null);
  }

  function move(id, direction) {
    setSections((items) => {
      const index = items.findIndex((section) => section.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= items.length) return items;
      const next = [...items];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  function changeLayout(value) {
    const layout = layouts.find((item) => item.id === value);
    if (!layout || !active) return;
    const oldColumns = active.columns || [];
    updateSection({
      layout: value,
      columns: layout.cols.map((_, index) => oldColumns[index] || { id: `col-${active.id}-${index}`, elements: [] }),
    });
    setActiveColumn(0);
    setActiveElement(null);
  }

  async function save() {
    setSaving(true);
    setNotice("");
    try {
      const response = await fetch("/api/admin/website-manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slugify(selectedPage), title: selectedPage, content: sections }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setPages((items) => [...items.filter((page) => page.slug !== data.page.slug), data.page]);
      setNotice("Draft saved.");
      return data.page;
    } catch (error) {
      setNotice(error.message || "Unable to save draft.");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    const saved = await save();
    if (!saved?.id) {
      setNotice("Unable to publish because the draft could not be saved.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/website-manager", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: saved.id, action: "publish" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setPages((items) => items.map((page) => (page.id === data.page.id ? data.page : page)));
      setNotice("Page published.");
    } catch (error) {
      setNotice(error.message || "Unable to publish page.");
    } finally {
      setSaving(false);
    }
  }

  async function restoreVersion(version) {
    if (!currentPage?.id) return;
    setSaving(true);
    setNotice("");
    try {
      const response = await fetch("/api/admin/website-manager", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: currentPage.id, action: "restore", versionId: version.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setPages((items) => items.map((page) => (page.id === data.page.id ? data.page : page)));
      setTab("structure");
      setNotice("Version restored to draft. Review it before publishing.");
    } catch (error) {
      setNotice(error.message || "Unable to restore version.");
    } finally {
      setSaving(false);
    }
  }

  const styleOf = (item, fallback = 0) => ({
    paddingTop: numberValue(item.paddingTop, fallback),
    paddingRight: numberValue(item.paddingRight, fallback),
    paddingBottom: numberValue(item.paddingBottom, fallback),
    paddingLeft: numberValue(item.paddingLeft, fallback),
    marginTop: numberValue(item.marginTop),
    marginRight: numberValue(item.marginRight),
    marginBottom: numberValue(item.marginBottom),
    marginLeft: numberValue(item.marginLeft),
    fontSize: item.fontSize ? `${item.fontSize}px` : undefined,
    lineHeight: item.lineHeight || undefined,
    textAlign: item.textAlign || "left",
    borderWidth: numberValue(item.borderWidth),
    borderRadius: numberValue(item.borderRadius),
    borderStyle: item.borderStyle || "solid",
    borderColor: item.borderColor || "#dce5eb",
  });

  const visibilityClass = (item) => {
    const classes = [];
    if (item.showDesktop === false) classes.push(styles.hideDesktop);
    if (item.showTablet === false) classes.push(styles.hideTablet);
    if (item.showMobile === false) classes.push(styles.hideMobile);
    return classes.join(" ");
  };

  const spacingControls = (target, item) => (
    <>
      <div className={styles.controlTitle}>Padding (px)</div>
      <div className={styles.fourGrid}>
        {[
          ["Top", "paddingTop"],
          ["Right", "paddingRight"],
          ["Bottom", "paddingBottom"],
          ["Left", "paddingLeft"],
        ].map(([label, key]) => (
          <label key={key}>
            {label}
            <input
              type="number"
              min="0"
              max="200"
              value={numberValue(item[key])}
              onChange={(event) => setNumber(target, key, event.target.value)}
            />
          </label>
        ))}
      </div>
      <div className={styles.controlTitle}>Margin (px)</div>
      <div className={styles.fourGrid}>
        {[
          ["Top", "marginTop"],
          ["Right", "marginRight"],
          ["Bottom", "marginBottom"],
          ["Left", "marginLeft"],
        ].map(([label, key]) => (
          <label key={key}>
            {label}
            <input
              type="number"
              min="0"
              max="200"
              value={numberValue(item[key])}
              onChange={(event) => setNumber(target, key, event.target.value)}
            />
          </label>
        ))}
      </div>
    </>
  );

  const typography = (target, item) => (
    <>
      <div className={styles.controlTitle}>Typography</div>
      <div className={styles.twoGrid}>
        <label>
          Font size
          <input
            type="number"
            min="8"
            max="120"
            placeholder="Auto"
            value={item.fontSize || ""}
            onChange={(event) => setStyle(target, "fontSize", event.target.value ? Number(event.target.value) : "")}
          />
        </label>
        <label>
          Line height
          <input
            type="number"
            min="0.8"
            max="3"
            step="0.1"
            placeholder="Normal"
            value={item.lineHeight || ""}
            onChange={(event) => setStyle(target, "lineHeight", event.target.value ? Number(event.target.value) : "")}
          />
        </label>
      </div>
      <label>
        Text alignment
        <select value={item.textAlign || "left"} onChange={(event) => setStyle(target, "textAlign", event.target.value)}>
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="justify">Justify</option>
        </select>
      </label>
    </>
  );

  const borders = (target, item) => (
    <>
      <div className={styles.controlTitle}>Border</div>
      <div className={styles.twoGrid}>
        <label>
          Width
          <input type="number" min="0" max="20" value={numberValue(item.borderWidth)} onChange={(event) => setNumber(target, "borderWidth", event.target.value, 20)} />
        </label>
        <label>
          Radius
          <input type="number" min="0" max="100" value={numberValue(item.borderRadius)} onChange={(event) => setNumber(target, "borderRadius", event.target.value, 100)} />
        </label>
      </div>
      <div className={styles.twoGrid}>
        <label>
          Style
          <select value={item.borderStyle || "solid"} onChange={(event) => setStyle(target, "borderStyle", event.target.value)}>
            <option value="solid">solid</option>
            <option value="dashed">dashed</option>
            <option value="dotted">dotted</option>
            <option value="double">double</option>
          </select>
        </label>
        <label>
          Colour
          <input type="color" value={item.borderColor || "#dce5eb"} onChange={(event) => setStyle(target, "borderColor", event.target.value)} />
        </label>
      </div>
    </>
  );

  const visibilityControls = (target, item) => (
    <>
      <div className={styles.controlTitle}>Responsive visibility</div>
      <div className={styles.visibilityGrid}>
        {[
          ["Desktop", "showDesktop"],
          ["Tablet", "showTablet"],
          ["Mobile", "showMobile"],
        ].map(([label, key]) => (
          <label key={key} className={styles.checkLabel}>
            <input type="checkbox" checked={item[key] !== false} onChange={(event) => setStyle(target, key, event.target.checked)} />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </>
  );

  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <div className={styles.shell}>
          <div className={styles.topline}>
            <Link href="/admin">← VSI Administration</Link>
            <span>WEBSITE BUILDER</span>
          </div>

          <section className={styles.hero}>
            <div>
              <p>VSI WEBSITE MANAGEMENT</p>
              <h1>Visual Page Builder</h1>
              <span>Build pages using sections, containers, columns and reusable content elements.</span>
            </div>
            <div className={styles.actions}>
              <button onClick={save} disabled={saving}>Save draft</button>
              <button className={styles.publish} onClick={publish} disabled={saving}>Publish</button>
            </div>
          </section>

          {notice && <p className={styles.notice}>{notice}</p>}

          <div className={styles.toolbar}>
            <div className={styles.pages}>
              <label>Editing page</label>
              <select value={selectedPage} onChange={(event) => setSelectedPage(event.target.value)}>
                {names.map((name) => <option key={name}>{name}</option>)}
              </select>
            </div>
            <div className={styles.tabs}>
              {[["structure", "Structure"], ["settings", "Settings"], ["preview", "Preview"], ["versions", "Versions"]].map(([key, label]) => (
                <button key={key} className={tab === key ? styles.active : ""} onClick={() => setTab(key)}>{label}</button>
              ))}
            </div>
          </div>

          <div className={styles.workspace}>
            <aside className={styles.left}>
              <h2>Containers</h2>
              <p>Select a layout to add a new row.</p>
              <div className={styles.layoutGrid}>
                {layouts.map((layout) => (
                  <button key={layout.id} className={styles.layoutCard} onClick={() => addSection(layout.id)}>
                    <div className={styles.layoutVisual}>
                      {layout.cols.map((width, index) => <i key={index} style={{ width }} />)}
                    </div>
                    <span>{layout.label}</span>
                  </button>
                ))}
              </div>

              <h2>Elements</h2>
              <p>Add elements to the selected column.</p>
              <div className={styles.elementGrid}>
                {elements.map(([key, label]) => (
                  <button key={key} onClick={() => addElement(key)} disabled={!active}>＋ {label}</button>
                ))}
              </div>

              <div className={styles.mediaLink}>
                <Link href="/admin/media-library">Open Media Library →</Link>
              </div>
            </aside>

            <section className={styles.canvas}>
              <div className={styles.canvasTop}>
                <strong>{selectedPage}</strong>
                <span>{sections.length} sections</span>
              </div>

              {sections.map((section) => {
                const layout = layouts.find((item) => item.id === section.layout) || layouts[0];
                return (
                  <article
                    key={section.id}
                    className={`${activeId === section.id ? styles.selectedSection : styles.section} ${visibilityClass(section)}`}
                    onClick={() => { setActiveId(section.id); setActiveColumn(0); setActiveElement(null); }}
                  >
                    <div className={styles.sectionControls}>
                      <span>☰ {section.type}</span>
                      <div>
                        <button onClick={(event) => { event.stopPropagation(); move(section.id, -1); }}>↑</button>
                        <button onClick={(event) => { event.stopPropagation(); move(section.id, 1); }}>↓</button>
                        <button onClick={(event) => { event.stopPropagation(); setActiveId(section.id); setActiveColumn(0); setActiveElement(null); }}>⚙</button>
                      </div>
                    </div>

                    <div className={styles.previewSection} style={{ background: section.bg, color: section.color, ...styleOf(section, 26) }}>
                      <div className={styles.columns}>
                        {layout.cols.map((width, index) => {
                          const item = section.columns?.[index] || { elements: [] };
                          return (
                            <div
                              key={item.id || index}
                              style={{ width }}
                              className={`${styles.column} ${activeId === section.id && activeColumn === index ? styles.activeColumn : ""} ${visibilityClass(item)}`}
                              onClick={(event) => { event.stopPropagation(); setActiveId(section.id); setActiveColumn(index); setActiveElement(item.elements?.[0]?.id || null); }}
                            >
                              <div className={styles.columnLabel}>Column {index + 1}</div>
                              {item.elements?.length ? item.elements.map((element) => (
                                <div
                                  key={element.id}
                                  className={`${activeElement === element.id && activeId === section.id ? styles.elementSelected : styles.elementItem} ${visibilityClass(element)}`}
                                  style={styleOf(element, 9)}
                                  onClick={(event) => { event.stopPropagation(); setActiveId(section.id); setActiveColumn(index); setActiveElement(element.id); }}
                                >
                                  <strong>{element.type}</strong>
                                  {element.imageUrl && <img className={styles.elementThumb} src={element.imageUrl} alt="" />}
                                  {element.title && <h3>{element.title}</h3>}
                                  {element.text && <p>{element.text}</p>}
                                </div>
                              )) : <span className={styles.emptyColumn}>Drop or add an element here</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </article>
                );
              })}

              <button className={styles.addSection} onClick={() => addSection()}>＋ Add section</button>
            </section>

            <aside className={styles.right}>
              {tab === "versions" ? (
                <div className={styles.versionPanel}>
                  <div className={styles.previewBadge}>VERSION HISTORY</div>
                  <h2>{selectedPage}</h2>
                  <p>Restore an earlier saved draft. Restoring never publishes automatically.</p>
                  {versionsLoading ? <p>Loading versions…</p> : versions.length ? (
                    <div className={styles.versionList}>
                      {versions.map((version) => (
                        <div className={styles.versionItem} key={version.id}>
                          <div>
                            <strong>Version #{version.id}</strong>
                            <small>{new Date(version.created_at).toLocaleString()} · {version.status}</small>
                          </div>
                          <button onClick={() => restoreVersion(version)} disabled={saving}>Restore</button>
                        </div>
                      ))}
                    </div>
                  ) : <p>No saved versions yet.</p>}
                </div>
              ) : active ? (
                tab === "preview" ? (
                  <div className={styles.previewMode}>
                    <div className={styles.previewBadge}>PREVIEW</div>
                    <h2>{selectedPage}</h2>
                    <p>This preview uses the current draft canvas. Save the draft when you are happy, then publish it to make it public.</p>
                    <div className={styles.previewStats}>
                      <span>{sections.length} sections</span>
                      <span>{sections.reduce((total, section) => total + section.columns.reduce((count, item) => count + (item.elements?.length || 0), 0), 0)} elements</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2>{tab === "settings" ? "Section settings" : selectedEl ? "Element inspector" : "Section inspector"}</h2>
                    <label>
                      Section type
                      <select value={active.type} onChange={(event) => updateSection({ type: event.target.value })}>
                        {["Hero", "Section", "Introduction", "Call to action", "Cards", "Latest news"].map((type) => <option key={type}>{type}</option>)}
                      </select>
                    </label>
                    <label>
                      Container layout
                      <select value={active.layout} onChange={(event) => changeLayout(event.target.value)}>
                        {layouts.map((layout) => <option value={layout.id} key={layout.id}>{layout.label}</option>)}
                      </select>
                    </label>

                    {selectedEl && tab !== "settings" ? (
                      <>
                        <label>
                          Element type
                          <select value={selectedEl.type} onChange={(event) => updateElement({ type: event.target.value })}>
                            {elements.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                          </select>
                        </label>
                        <label>
                          Heading
                          <input value={selectedEl.title || ""} onChange={(event) => updateElement({ title: event.target.value })} />
                        </label>
                        <label>
                          Text
                          <textarea value={selectedEl.text || ""} onChange={(event) => updateElement({ text: event.target.value })} />
                        </label>

                        {selectedEl.type === "image" && (
                          <>
                            <label>
                              Image from Media Library
                              <select value={selectedEl.imageUrl || ""} onChange={(event) => updateElement({ imageUrl: event.target.value })}>
                                <option value="">Select an image…</option>
                                {media.map((blob) => <option key={blob.url} value={blob.url}>{blob.pathname.split("/").pop()}</option>)}
                              </select>
                            </label>
                            {selectedEl.imageUrl && <img className={styles.inspectorImage} src={selectedEl.imageUrl} alt="Selected media" />}
                            <Link className={styles.mediaButton} href="/admin/media-library">Manage media library →</Link>
                            {mediaLoading && <small>Loading media library…</small>}
                            {!mediaLoading && !media.length && <small>No images uploaded yet. Add one in the Media Library.</small>}
                          </>
                        )}

                        {(selectedEl.type === "button" || selectedEl.type === "hero" || selectedEl.type === "Call to action") && (
                          <>
                            <label>
                              Button label
                              <input value={selectedEl.buttonLabel || ""} onChange={(event) => updateElement({ buttonLabel: event.target.value })} />
                            </label>
                            <label>
                              Button link
                              <input value={selectedEl.buttonHref || ""} onChange={(event) => updateElement({ buttonHref: event.target.value })} />
                            </label>
                          </>
                        )}

                        <div className={styles.inspectorPanel}>
                          {typography("element", selectedEl)}
                          {spacingControls("element", selectedEl)}
                          {borders("element", selectedEl)}
                          {visibilityControls("element", selectedEl)}
                        </div>
                        <button className={styles.delete} onClick={removeElement}>Delete element</button>
                      </>
                    ) : (
                      <>
                        <label>
                          Heading
                          <input value={active.title || ""} onChange={(event) => updateSection({ title: event.target.value })} />
                        </label>
                        <label>
                          Text
                          <textarea value={active.text || ""} onChange={(event) => updateSection({ text: event.target.value })} />
                        </label>
                        <div className={styles.colorRow}>
                          <label>Background<input type="color" value={active.bg || "#ffffff"} onChange={(event) => updateSection({ bg: event.target.value })} /></label>
                          <label>Text colour<input type="color" value={active.color || "#173b58"} onChange={(event) => updateSection({ color: event.target.value })} /></label>
                        </div>
                        <div className={styles.inspectorPanel}>
                          {typography("section", active)}
                          {spacingControls("section", active)}
                          {borders("section", active)}
                          {visibilityControls("section", active)}
                        </div>
                        <button className={styles.delete} onClick={removeActive}>Delete section</button>
                      </>
                    )}
                  </>
                )
              ) : null}
            </aside>
          </div>

          <section className={styles.next}>
            <h2>Builder foundation</h2>
            <div>
              <span>✓ Draft saving</span>
              <span>✓ Publishing</span>
              <span>✓ Page versions + restore</span>
              <span>✓ Independent column content</span>
              <span>✓ Media library selection</span>
              <span>✓ Rich spacing, typography and borders</span>
              <span>✓ Desktop / tablet / mobile visibility</span>
              <span>Next: menu and footer builders + richer VSI content blocks</span>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
