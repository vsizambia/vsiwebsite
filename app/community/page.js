import Image from "next/image";
import "../community.css";
import { SiteHeader, SiteFooter } from "../components/SiteChrome";

export const metadata = {
  title: "VSI in the Community | Visionary Students Initiative",
  description: "See how Visionary Students Initiative works alongside young people, schools and communities to turn participation into meaningful action.",
  alternates: { canonical: "/community" },
  openGraph: {
    title: "VSI in the Community | Visionary Students Initiative",
    description: "See how Visionary Students Initiative works alongside young people, schools and communities to turn participation into meaningful action.",
    url: "https://www.vsizambia.org/community",
    images: [{ url: "/images/IMG_0090.JPG", alt: "Young people participating in a VSI community activity" }],
  },
};

const images = [
  ["/images/IMG_0090.JPG", "Young people participating in a VSI community activity"],
  ["/images/IMG_0319.JPG", "Young people learning and connecting"],
  ["/images/IMG_0361.JPG", "Young people taking part in community activities"],
  ["/images/IMG_1632.JPG", "Youth participation in the community"],
  ["/images/IMG_1886.JPG", "Community participation and action"],
  ["/images/IMG_1958.JPG", "Young people and community participants"],
];

const ways = [
  {
    number: "01",
    title: "Learn together",
    text: "We create spaces where young people can learn, ask questions, exchange ideas and build the confidence to participate.",
  },
  {
    number: "02",
    title: "Connect with community",
    text: "We encourage young people to look beyond the classroom and connect learning with the needs, experiences and strengths of their communities.",
  },
  {
    number: "03",
    title: "Serve and participate",
    text: "Community participation gives young people practical opportunities to contribute, collaborate and experience the value of service.",
  },
  {
    number: "04",
    title: "Lead with purpose",
    text: "We support young people to turn their experiences into leadership, responsible citizenship and action that can make a difference.",
  },
];

export default function CommunityPage() {
  return (
    <main>
      <SiteHeader />

      <section className="community-hero">
        <div className="community-hero-image">
          <Image src={images[0][0]} alt={images[0][1]} fill priority sizes="100vw" />
        </div>
        <div className="community-hero-overlay" />
        <div className="section-shell community-hero-content">
          <p className="kicker light">VSI IN THE COMMUNITY</p>
          <h1>Young people. <em>Community.</em> Action.</h1>
          <p>Working with young people and communities to turn ideas into participation and change.</p>
        </div>
      </section>

      <section className="community-intro section-shell">
        <div>
          <p className="kicker">WHY COMMUNITY MATTERS</p>
          <h2>Change is stronger when young people are part of it.</h2>
        </div>
        <div>
          <p>
            At Visionary Students Initiative, we believe young people should have meaningful
            opportunities to learn, connect, serve and lead.
          </p>
          <p>
            Our community work brings these opportunities closer to where young people live,
            learn and participate — creating practical spaces for dialogue, service, leadership
            and shared action.
          </p>
        </div>
      </section>

      <section className="community-ways">
        <div className="section-shell">
          <div className="community-section-heading">
            <p className="kicker light">HOW WE ENGAGE</p>
            <h2>From participation to action.</h2>
            <p>
              We work with young people, schools and community stakeholders in ways that connect
              learning with real experiences.
            </p>
          </div>

          <div className="community-ways-grid">
            {ways.map((item) => (
              <article key={item.number}>
                <span>{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="community-feature">
        <div className="section-shell community-feature-grid">
          <div className="community-feature-image">
            <Image src={images[1][0]} alt={images[1][1]} fill sizes="(max-width: 900px) 100vw, 55vw" />
          </div>
          <div>
            <p className="kicker light">LEARNING IN COMMUNITY</p>
            <h2>Spaces where young people can be heard, supported and involved.</h2>
            <p>
              Community engagement is not simply about reaching young people. It is about creating
              opportunities for them to contribute, learn from others and take an active role in
              the issues that affect their lives.
            </p>
          </div>
        </div>
      </section>

      <section className="community-gallery section-shell">
        <div className="section-heading-row">
          <div>
            <p className="kicker">IN THE COMMUNITY</p>
            <h2>People, participation and shared action.</h2>
          </div>
        </div>
        <div className="community-gallery-grid">
          {images.map(([src, alt]) => (
            <figure key={src}>
              <Image src={src} alt={alt} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" />
            </figure>
          ))}
        </div>
      </section>

      <section className="community-closing">
        <div className="section-shell community-closing-grid">
          <div>
            <p className="kicker">OUR APPROACH</p>
            <h2>Listen. Connect. Participate. Lead.</h2>
          </div>
          <div>
            <p>
              We value partnerships that put young people at the centre and recognise communities
              as partners in creating lasting change.
            </p>
            <p>
              Whether through learning, dialogue, service or leadership, every opportunity to
              participate can become a step towards a more engaged generation.
            </p>
          </div>
        </div>
      </section>

      <section className="community-cta">
        <div className="section-shell">
          <p className="kicker light">BE PART OF THE WORK</p>
          <h2>There is always a way to contribute.</h2>
          <div className="community-cta-actions">
            <a className="button button-yellow" href="/volunteer">Volunteer <span aria-hidden="true">↗</span></a>
            <a className="community-text-link" href="/contact">Connect with VSI <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
