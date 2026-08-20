import Image from "next/image";
import "../scroll-story.css";

export function ScrollStory({ eyebrow, title, intro, panels, className = "" }) {
  return (
    <section className={`scroll-story ${className}`} aria-label={title}>
      <div className="section-shell scroll-story-grid">
        <div className="scroll-story-heading">
          <p className="kicker">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{intro}</p>
        </div>
        <div className="scroll-story-panels">
          {panels.map(({ number, title: panelTitle, text, image, alt }) => (
            <article className="scroll-story-panel" key={panelTitle}>
              <div className="scroll-story-image">
                <Image src={image} alt={alt} fill sizes="(min-width: 901px) 55vw, 100vw" />
              </div>
              <div className="scroll-story-content">
                <span>{number}</span>
                <h3>{panelTitle}</h3>
                <p>{text}</p>
                <span className="scroll-story-hint">SCROLL TO EXPLORE ↓</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
