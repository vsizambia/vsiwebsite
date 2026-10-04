import Image from "next/image";
import "../destination-hero.css";
import "./impact.css";
import { SiteHeader, SiteFooter } from "../components/SiteChrome";
import DestinationHero from "../components/DestinationHero";

const evidencePrinciples = [
  ["01", "Listen", "Keep the experiences and perspectives of young people and communities visible."],
  ["02", "Document", "Capture activities, learning, feedback and relevant programme information consistently."],
  ["03", "Reflect", "Ask what worked, what changed and what could be strengthened."],
  ["04", "Learn", "Use evidence and experience to improve future programmes and decisions."],
];

export const metadata = {
  title: "Impact & Evidence",
  description: "Explore how VSI documents learning, reflects on its work and shares evidence of youth-led change.",
  alternates: { canonical: "/impact" },
};

export default function ImpactPage() {
  return (
    <main>
      <SiteHeader />
      <DestinationHero
        eyebrow="IMPACT & EVIDENCE"
        title={<>Real work. Shared learning. <em>Lasting impact.</em></>}
        description="Explore how VSI learns from programmes, community action and youth participation — and how evidence helps strengthen the work."
        image="/images/research.JPG"
        alt="VSI research and advocacy work"
        primaryLabel="Explore projects"
        primaryHref="/projects"
        secondaryLabel="See VSI News"
        secondaryHref="/news"
      />

      <section className="impact-intro section-shell">
        <div>
          <p className="kicker">WHY EVIDENCE MATTERS</p>
          <h2>Impact is more than a number on a report.</h2>
        </div>
        <p>For VSI, evidence also means understanding experiences, documenting what happened, listening to participants, recognising lessons and using those lessons to improve future work.</p>
      </section>

      <section className="impact-feature section-shell">
        <div className="impact-feature-image">
          <Image src="/images/research.JPG" alt="VSI research and advocacy work" fill sizes="(max-width:900px) 100vw, 50vw" />
        </div>
        <div className="impact-feature-copy">
          <p className="kicker">FROM ACTIVITY TO LEARNING</p>
          <h2>Good evidence helps good work become better work.</h2>
          <p>VSI seeks to connect programme implementation with reflection and learning. Depending on the work, this can include participant feedback, activity documentation, research, discussions with partners and structured review of what was achieved.</p>
          <p>The aim is not simply to report activity. It is to understand meaning, identify lessons and strengthen accountability to the people and partners who make the work possible.</p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
