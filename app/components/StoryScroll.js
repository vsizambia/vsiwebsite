import Image from "next/image";

export default function StoryScroll({ eyebrow, title, intro, items, ariaLabel }) {
  return <section className="focus-story-desktop story-scroll-section" aria-label={ariaLabel || title}>
    <div className="focus-story-heading">
      <p className="kicker">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{intro}</p>
    </div>
    <div className="focus-story-panels">
      {items.map(([n, t, d, img, alt]) => <article className="focus-story-panel" key={`${n}-${t}`}>
        <div className="focus-story-image"><Image src={img} alt={alt || t} fill sizes="(min-width: 901px) 55vw" /></div>
        <div className="focus-story-content"><span>{n}</span><h3>{t}</h3><p>{d}</p><span className="focus-story-scroll">SCROLL TO EXPLORE ↓</span></div>
      </article>)}
    </div>
  </section>;
}
