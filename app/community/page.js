import Image from "next/image";
import "../community.css";
import { SiteHeader, SiteFooter } from "../components/SiteChrome";

export const metadata = {
  title: "VSI in the Community | Visionary Students Initiative",
  description: "Visionary Students Initiative in the community.",
  alternates: { canonical: "/community" },
  openGraph: {
    title: "VSI in the Community | Visionary Students Initiative",
    description: "Visionary Students Initiative in the community.",
    url: "https://www.vsizambia.org/community",
    images: [{ url: "/images/IMG_0090.JPG", alt: "Visionary Students Initiative in the community" }],
  },
};

export default function CommunityPage() {
  return (
    <main>
      <SiteHeader />

      <section className="community-hero">
        <div className="community-hero-image">
          <Image
            src="/images/IMG_0090.JPG"
            alt="Visionary Students Initiative in the community"
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="community-hero-overlay" />
        <div className="section-shell community-hero-content">
          <p className="kicker light">VSI IN THE COMMUNITY</p>
          <h1>Young people. <em>Community.</em> Action.</h1>
          <p>Working with young people and communities to turn ideas into participation and change.</p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
