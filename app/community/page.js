import Image from "next/image";
import Link from "next/link";
import "../community.css";
import { SiteHeader, SiteFooter } from "../components/SiteChrome";

export const metadata = {
  title: "VSI in the Community | Visionary Students Initiative",
  description:
    "Discover how Visionary Students Initiative connects young people, schools and communities through learning, participation, service and leadership.",
  alternates: { canonical: "/community" },
  openGraph: {
    title: "VSI in the Community | Visionary Students Initiative",
    description:
      "Discover how Visionary Students Initiative connects young people, schools and communities through learning, participation, service and leadership.",
    url: "https://www.vsizambia.org/community",
    images: [
      {
        url: "/images/IMG_0090.JPG",
        alt: "Young people and community members engaged with VSI",
      },
    ],
  },
};

const engagementAreas = [
  {
    number: "01",
    title: "Learn & discuss",
    text: "Creating spaces where young people can learn, ask questions, exchange ideas and understand the issues that shape their communities.",
  },
  {
    number: "02",
    title: "Take part",
    text: "Supporting young people to move from interest to meaningful participation in schools, communities, civic spaces and public life.",
  },
  {
    number: "03",
    title: "Serve",
    text: "Turning shared concerns into practical action through volunteering, community activities and initiatives led with young people.",
  },
  {
    number: "04",
    title: "Lead",
    text: "Building confidence, responsibility and leadership so young people can contribute to positive change around them.",
  },
];

const communitySpaces = [
  {
    title: "Schools & learning spaces",
    image: "/images/vsi-school-programme.jpg",
  },
  {
    title: "Community action",
    image: "/images/vsi-community-action.jpg",
  },
  {
    title: "Dialogue & civic spaces",
    image: "/images/vsi-community-dialogue.jpg",
  },
  {
    title: "Youth & volunteer networks",
    image: "/images/vsi volunteers 5.jpg",
  },
];

export default function CommunityPage() {
  return (
    <main>
      <SiteHeader />

      <section className="community-hero">
        <div className="community-hero-image">
          <Image
            src="/images/IMG_0090.JPG"
            alt="Young people and community members engaged with VSI"
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="community-hero-overlay" />
        <div className="section-shell community-hero-content">
          <p className="kicker light">VSI IN THE COMMUNITY</p>
          <h1>
            Young people. <em>Community.</em> Action.
          </h1>
          <p>
            Working with young people and communities to turn ideas into
            participation and change.
          </p>
        </div>
      </section>

      <section className="community-intro section-shell">
        <div>
          <p className="kicker">COMMUNITY AT A GLANCE</p>
          <h2>Change is built with people, not for them.</h2>
        </div>
        <div className="community-intro-copy">
          <p>
            Community is where VSI&apos;s work becomes real: in classrooms,
            conversations, volunteer activities, civic spaces and everyday
            places where young people live, learn and contribute.
          </p>
          <p>
            We work alongside young people and the people and institutions
            around them, creating practical opportunities to learn, connect,
            participate and lead.
          </p>
        </div>
      </section>

      <section className="community-spaces">
        <div className="section-shell">
          <div className="community-section-heading">
            <p className="kicker">WHERE COMMUNITY HAPPENS</p>
            <h2>Meet people where they already are.</h2>
            <p>
              Our community work moves across different spaces rather than
              sitting in one programme or one place.
            </p>
          </div>

          <div className="community-space-grid">
            {communitySpaces.map((space) => (
              <article className="community-space-card" key={space.title}>
                <div className="community-space-image">
                  <Image src={space.image} alt={space.title} fill sizes="(max-width: 700px) 100vw, 50vw" />
                </div>
                <h3>{space.title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="community-ways">
        <div className="section-shell">
          <div className="community-section-heading">
            <p className="kicker light">WHAT COMMUNITY ENGAGEMENT LOOKS LIKE</p>
            <h2>From participation to action.</h2>
          </div>

          <div className="community-ways-grid">
            {engagementAreas.map((area) => (
              <article key={area.number}>
                <span>{area.number}</span>
                <h3>{area.title}</h3>
                <p>{area.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="community-feature">
        <div className="section-shell community-feature-grid">
          <div className="community-feature-image">
            <Image
              src="/images/vsi-community-action.jpg"
              alt="Young people taking part in community action"
              fill
              sizes="(max-width: 900px) 100vw, 55vw"
            />
          </div>
          <div>
            <p className="kicker">YOUNG PEOPLE IN ACTION</p>
            <h2>Participation becomes powerful when young people can act.</h2>
            <p>
              VSI creates opportunities for young people to bring their
              knowledge, energy and ideas into the community. The aim is not
              simply to involve young people, but to help them become active
              contributors to the places and communities they call home.
            </p>
          </div>
        </div>
      </section>

      <section className="community-gallery">
        <div className="section-shell">
          <p className="kicker">FROM THE COMMUNITY</p>
          <h2>A closer look at the people and moments behind the work.</h2>

          <div className="community-gallery-grid">
            <figure>
              <Image src="/images/vsi-school-programme.jpg" alt="VSI work in a school setting" fill sizes="(max-width: 700px) 100vw, 33vw" />
            </figure>
            <figure>
              <Image src="/images/vsi-community-dialogue.jpg" alt="Community dialogue with young people" fill sizes="(max-width: 700px) 100vw, 33vw" />
            </figure>
            <figure>
              <Image src="/images/vsi volunteers charity work.jpg" alt="VSI volunteers serving in the community" fill sizes="(max-width: 700px) 100vw, 33vw" />
            </figure>
            <figure>
              <Image src="/images/IMG_0319.JPG" alt="Young people connected through VSI activities" fill sizes="(max-width: 700px) 100vw, 33vw" />
            </figure>
            <figure>
              <Image src="/images/vsi-conference.jpg" alt="Young people and partners in a shared learning space" fill sizes="(max-width: 700px) 100vw, 33vw" />
            </figure>
            <figure>
              <Image src="/images/vsi-parliament.jpg" alt="Young people engaging in civic spaces" fill sizes="(max-width: 700px) 100vw, 33vw" />
            </figure>
          </div>
        </div>
      </section>

      <section className="community-stories">
        <div className="section-shell community-stories-grid">
          <div>
            <p className="kicker">STORIES FROM THE FIELD</p>
            <h2>The work keeps moving — and the stories keep growing.</h2>
          </div>
          <div>
            <p>
              Follow the latest activities, conversations, events and
              developments from Visionary Students Initiative.
            </p>
            <Link href="/news" className="button button-yellow">
              Explore VSI News ↗
            </Link>
          </div>
        </div>
      </section>

      <section className="community-cta">
        <div className="section-shell">
          <p className="kicker light">GET INVOLVED</p>
          <h2>There is a place for you in this work.</h2>
          <div className="community-cta-actions">
            <Link href="/volunteer/apply" className="button button-yellow">
              Volunteer with VSI
            </Link>
            <Link href="/contact" className="community-text-link">
              Connect with VSI →
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
