import "../destination-hero.css";
import "./impact.css";
import { SiteHeader, SiteFooter } from "../components/SiteChrome";
import DestinationHero from "../components/DestinationHero";

const programmeImpact = [
  {
    number: "01",
    title: "OVC Support",
    category: "CHARITY WORK",
    description: "Supporting orphans and vulnerable children through community-focused charity work.",
    metrics: [
      ["—", "Activities conducted"],
      ["—", "Male reached"],
      ["—", "Female reached"],
    ],
  },
  {
    number: "02",
    title: "Keep Zambia Clean, Green and Healthy",
    category: "COMMUNITY ACTION",
    description: "Mobilising communities and marketeers to help create cleaner, greener and healthier public spaces.",
    metrics: [
      ["—", "Activities conducted"],
      ["—", "Marketeers reached"],
    ],
  },
  {
    number: "03",
    title: "Education Support",
    category: "LEARNING & OPPORTUNITY",
    description: "Helping learners access support and opportunities that can strengthen their educational journey.",
    metrics: [
      ["—", "Activities conducted"],
      ["—", "Male reached"],
      ["—", "Female reached"],
    ],
  },
  {
    number: "04",
    title: "Policy Contribution",
    category: "POLICY & ADVOCACY",
    description: "Contributing evidence, recommendations and perspectives to policies affecting young people and communities.",
    metrics: [
      ["—", "Documents contributed"],
      ["—", "Ministries & departments engaged"],
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
          <div className="impact-programme-grid">
            {programmeImpact.map((programme) => (
              <article className="impact-programme-card" key={programme.number}>
                <div className="impact-programme-topline">
                  <span className="impact-programme-number">{programme.number}</span>
                  <span className="impact-programme-category">{programme.category}</span>
                </div>
                <h3>{programme.title}</h3>
                <p className="impact-programme-description">{programme.description}</p>
                <div className="impact-metrics">
                  {programme.metrics.map(([value, label]) => (
                    <div className="impact-metric" key={label}>
                      <strong>{value}</strong>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
