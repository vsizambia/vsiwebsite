import "../destination-hero.css";
import "./impact.css";
import { SiteHeader, SiteFooter } from "../components/SiteChrome";
import DestinationHero from "../components/DestinationHero";
import ImpactProgrammeCards from "../components/ImpactProgrammeCards";

const programmeImpact = [
  {
    programme_key: "ovc-support",
    number: "01",
    title: "OVC Support",
    category: "CHARITY WORK",
    description: "Supporting orphans and vulnerable children through community-focused charity work.",
    metrics: [
      { key: "activities", value: null, label: "Activities conducted" },
      { key: "male", value: null, label: "Boys reached" },
      { key: "female", value: null, label: "Girls reached" },
    ],
  },
  {
    programme_key: "clean-green-healthy",
    number: "02",
    title: "Keep Zambia Clean, Green and Healthy",
    category: "COMMUNITY ACTION",
    description: "Mobilising communities and marketeers to help create cleaner, greener and healthier public spaces.",
    metrics: [
      { key: "activities", value: null, label: "Activities conducted" },
      { key: "marketeers", value: null, label: "Marketeers reached" },
    ],
  },
  {
    programme_key: "education-support",
    number: "03",
    title: "VSI On-Campus Mentorship Programme",
    category: "LEARNING & OPPORTUNITY",
    description: "Helping learners access support and opportunities that can strengthen their educational journey.",
    metrics: [
      { key: "activities", value: null, label: "Activities conducted" },
      { key: "male", value: null, label: "Boys reached" },
      { key: "female", value: null, label: "Girls reached" },
    ],
  },
  {
    programme_key: "policy-contribution",
    number: "04",
    title: "Policy Contribution",
    category: "POLICY & ADVOCACY",
    description: "Contributing evidence, recommendations and perspectives to policies affecting young people and communities.",
    metrics: [
      { key: "documents", value: null, label: "Documents contributed" },
      { key: "institutions", value: null, label: "Ministries & departments engaged" },
    ],
  },
];

export const metadata = {
  title: "Impact & Evidence",
  description: "Explore VSI programmes and the people, communities and policy processes they reach.",
  alternates: { canonical: "/impact" },
};

export default function ImpactPage() {
  return (
    <main>
      <SiteHeader />
      <DestinationHero
        eyebrow="IMPACT & EVIDENCE"
        title={<>Real work. Shared learning. <em>Lasting impact.</em></>}
        description="Explore VSI’s programmes and the people, communities and institutions they connect with across charity work, education, community action and policy contribution."
        image="/images/research.JPG"
        alt="VSI research and advocacy work"
        primaryLabel="Explore projects"
        primaryHref="/projects"
        secondaryLabel="See VSI News"
        secondaryHref="/news"
      />

      <section className="impact-programmes">
        <div className="section-shell">
          <ImpactProgrammeCards initialProgrammes={programmeImpact} />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
