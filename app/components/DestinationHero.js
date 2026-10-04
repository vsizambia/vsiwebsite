import Image from "next/image";

export default function DestinationHero({
  eyebrow,
  title,
  description,
  image,
  alt,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}) {
  return (
    <section className="destination-hero">
      <div className="destination-hero-image">
        <Image src={image} alt={alt} fill priority sizes="100vw" />
      </div>
      <div className="destination-hero-overlay" />
      <div className="section-shell destination-hero-content">
        <p className="kicker light">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="destination-hero-description">{description}</p>
        {(primaryLabel || secondaryLabel) && (
          <div className="hero-actions destination-hero-actions">
            {primaryLabel && (
              <a className="button button-yellow" href={primaryHref}>
                {primaryLabel} <span aria-hidden="true">↗</span>
              </a>
            )}
            {secondaryLabel && (
              <a className="button button-primary" href={secondaryHref}>
                {secondaryLabel} <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
