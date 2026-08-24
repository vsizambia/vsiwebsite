"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "../components/SiteChrome";
import styles from "./news.module.css";

const dateValue = (v) => v ? new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";

export default function NewsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setArticles(Array.isArray(d.articles) ? d.articles : []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <SiteHeader />
      <section className={styles.hero}>
        <div className="section-shell">
          <p className="kicker light">VSI NEWS &amp; UPDATES</p>
          <h1>Stories from the work, people and ideas shaping VSI.</h1>
          <p>Explore the latest highlights, community stories, programme updates and announcements from Visionary Students Initiative.</p>
        </div>
      </section>

      <section className={`${styles.list} section-shell`}>
        {loading ? (
          <div className={styles.empty}>Loading the latest VSI stories...</div>
        ) : articles.length === 0 ? (
          <div className={styles.empty}>
            <h2>VSI News is coming soon.</h2>
            <p>New stories will appear here as they are published by the VSI team.</p>
          </div>
        ) : (
          <>
            <div className={styles.cards}>
              {articles.map((a) => (
                <article className={styles.card} key={a.id}>
                  <a href={`/news/${a.slug}`}>
                    <div className={styles.image}>
                      {a.featured_image && (
                        <Image src={a.featured_image} alt={a.title} fill sizes="(max-width: 850px) 100vw, 33vw" />
                      )}
                    </div>
                  </a>
                  <div className={styles.copy}>
                    <span className={styles.label}>{a.category}</span>
                    <h2><a href={`/news/${a.slug}`}>{a.title}</a></h2>
                    <p className={styles.date}>{dateValue(a.published_at)}</p>
                    <p>{a.excerpt}</p>
                    <a className={styles.link} href={`/news/${a.slug}`}>Read story →</a>
                  </div>
                </article>
              ))}
            </div>
            <p className={styles.archiveNote}>Showing all published VSI News stories.</p>
          </>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
