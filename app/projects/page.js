import Image from "next/image";
import "../destination-hero.css";
import "./projects.css";
import { SiteHeader, SiteFooter } from "../components/SiteChrome";
import DestinationHero from "../components/DestinationHero";

export const metadata = {
  title: "Projects & Programmes",
  description: "Explore the programmes, community activities and youth-led work of Visionary Students Initiative.",
  alternates: { canonical: "/projects" },
};

const focusAreas = [
  ["01", "Youth development", "Creating practical opportunities for students and young people to learn, lead, build skills and participate."],
  ["02", "Civic participation", "Supporting informed youth participation, dialogue, leadership and community engagement."],
  ["03", "Community action", "Turning ideas into practical service, awareness and locally relevant action."],
  ["04", "Research & advocacy", "Generating learning and evidence that can strengthen policy, programmes and public conversations."],
  ["05", "Partnerships", "Working with schools, communities, institutions and development partners around shared goals."],
  ["06", "Leadership", "Building confidence, responsibility and the ability of young people to contribute meaningfully."],
];

const programmeStreams = [
  {
    title: "Learning & leadership",
    description: "Activities that help students and young people develop knowledge, confidence, practical skills and leadership capacity.",
    image: "/images/research.JPG",
  },
  {
    title: "Community engagement",
    description: "Community-facing initiatives that connect youth participation with service, awareness, collaboration and local priorities.",
    image: "/images/cleaning programme.jpg",
  },
  {
    title: "Research & policy",
    description: "Research, dialogue and advocacy that bring youth perspectives into conversations about development and public policy.",
    image: "/images/vsi-parliament.jpg",
  },
];

export default function ProjectsPage() {
  return (
    <main>
      <SiteHeader />
      <DestinationHero
        eyebrow="VSI IN ACTION"
        title={<>Young people turning ideas into <em>meaningful action.</em></>}
        description="Explore the programmes, partnerships and community activities through which Visionary Students Initiative creates opportunities for young people to learn, lead, serve and contribute."
        image="/images/cleaning programme.jpg"
        alt="VSI volunteers taking part in a community activity"
        primaryLabel="Volunteer with VSI"
        primaryHref="/volunteer"
        secondaryLabel="Discover VSI"
        secondaryHref="/discover"
      />

      <section className="projects-intro section-shell">
        <div>
          <p className="kicker">OUR APPROACH</p>
          <h2>Programmes designed around participation, learning and action.</h2>
        </div>
        <p>
          VSI works through practical programmes and partnerships that place students and young people at the centre of development. Our work can bring together learning, leadership, civic participation, research, community service and dialogue depending on the needs of the programme and the communities involved.
        </p>
      </section>

      <section className="programme-streams section-shell">
        <div className="section-heading-row">
          <div>
            <p className="kicker">PROGRAMME STREAMS</p>
            <h2>Different pathways. One shared purpose.</h2>
          </div>
        </div>
        <div className="programme-stream-grid">
          {programmeStreams.map((item) => (
            <article className="programme-stream-card" key={item.title}>
              <div className="programme-stream-image">
                <Image src={item.image} alt={item.title} fill sizes="(max-width: 800px) 100vw, 33vw" />
              </div>
              <div className="programme-stream-copy">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="projects-focus">
        <div className="section-shell">
          <div className="section-heading-row">
            <div>
              <p className="kicker light">WHERE OUR WORK CONNECTS</p>
              <h2>Six focus areas help turn the mission into practice.</h2>
            </div>
            <p>Individual projects may connect several of these areas at once, depending on their purpose, partners and community context.</p>
          </div>
          <div className="projects-focus-grid">
            {focusAreas.map(([number, title, description]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="projects-learning section-shell">
        <div className="projects-learning-image">
          <Image src="/images/vsi-community-action.jpg" alt="Young people participating in community action" fill sizes="(max-width: 900px) 100vw, 50vw" />
        </div>
        <div className="projects-learning-copy">
          <p className="kicker">LEARNING FROM ACTION</p>
          <h2>Good programmes keep learning as they go.</h2>
          <p>VSI uses reflection, participant feedback, documentation and evidence to understand what is working and where programmes can improve. This helps us strengthen implementation while keeping the experiences and perspectives of young people visible.</p>
          <a className="button button-primary" href="/impact">Explore impact &amp; evidence <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <section className="projects-next">
        <div className="section-shell">
          <p className="kicker light">BE PART OF THE WORK</p>
          <h2>There is more to youth participation than being invited into the room.</h2>
          <p>It is about creating meaningful opportunities to learn, contribute, lead and shape the work itself.</p>
          <div className="hero-actions">
            <a className="button button-yellow" href="/volunteer">Volunteer with VSI <span aria-hidden="true">↗</span></a>
            <a className="button button-primary" href="/news">See VSI News <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
