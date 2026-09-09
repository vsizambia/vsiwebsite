import "../impact.css";
import { SiteHeader, SiteFooter } from "../components/SiteChrome";
import { pool } from "../../lib/db";

export const metadata = {
  title: "Impact & Evidence | Visionary Students Initiative",
  description: "Documented projects, results, partnerships, locations and volunteer contributions from Visionary Students Initiative in Zambia.",
  alternates: { canonical: "/impact" },
  openGraph: {
    title: "Impact & Evidence | Visionary Students Initiative",
    description: "Evidence of VSI's projects, results, partnerships, community action and volunteer contribution across Zambia.",
    url: "https://www.vsizambia.org/impact",
  },
};

async function getLiveVolunteerEvidence() {
  try {
    const [volunteers, hours, activities] = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS count FROM volunteer_applications WHERE status='approved'"),
      pool.query("SELECT COALESCE(SUM(hours),0)::numeric AS hours FROM volunteer_activity_register WHERE verified=true"),
      pool.query("SELECT COUNT(*)::int AS count FROM volunteer_activity_register WHERE verified=true"),
    ]);
    return {
      volunteers: Number(volunteers.rows[0]?.count || 0),
      hours: Number(hours.rows[0]?.hours || 0),
      activities: Number(activities.rows[0]?.count || 0),
    };
  } catch {
    return { volunteers: null, hours: null, activities: null };
  }
}

const documentedProjects = [
  {
    name: "Youth Growth Project",
    place: "Luanshya District, Copperbelt Province",
    period: "Six-month project",
    partner: "United States Embassy in Zambia, Public Affairs Section",
    result: "2,610 learners reached through workshops, school clubs, peer support and community activities.",
    metrics: ["10 school clubs", "1,870 girls", "740 boys", "350 learners at end-line workshop"],
    link: "/community",
  },
  {
    name: "Youth community service awareness",
    place: "Kabulonga Girls Secondary School, Lusaka",
    period: "24 August 2026",
    partner: "United Nations Volunteers (UNV) in Zambia",
    result: "Students engaged on community service, active volunteerism and youth-led civic action as part of International Volunteer Year 2026.",
    metrics: ["UNV partnership", "Lusaka District", "Further outreach planned"],
    link: "/news/unv-joins-visionary-students-initiative-for-youth-community-service-awareness-session-in-l",
  },
  {
    name: "Community environmental action",
    place: "Kuku Market, Misisi/Chawama, Lusaka",
    period: "30 November 2019",
    partner: "Market and youth community stakeholders",
    result: "VSI participated in the Keep Zambia Clean, Green and Healthy exercise with market leadership, youth representatives and marketeers.",
    metrics: ["Lusaka", "Community service", "Environmental health"],
    link: "https://vsizambia.org/kuku-market/",
  },
];

const documentedActivities = [
  ["Civic leadership", "Student participation, civic education and public engagement."],
  ["Youth development", "Leadership, employability, entrepreneurship, digital skills and mentorship."],
  ["Community action", "Community mobilisation, outreach, service activities and stakeholder engagement."],
  ["Wellbeing", "Mental health awareness, resilience, peer support and healthier learning environments."],
  ["Research & advocacy", "Research, evidence, policy analysis, dialogue and youth voices."],
  ["Partnerships", "Collaboration with institutions, communities, government and development partners."],
];

const documentedPartners = [
  "United States Embassy in Zambia",
  "United Nations Volunteers (UNV) in Zambia",
  "Government ministries, departments and agencies",
  "Financial Intelligence Centre",
  "Department of Registrar of NGOs",
  "Civic Advisory Hub",
  "Wisteria Learning Advisory Limited",
];

export default async function ImpactPage() {
  const live = await getLiveVolunteerEvidence();
  return (
    <main>
      <SiteHeader />
      <section className="impact-hero">
        <div className="section-shell">
          <p className="kicker light">IMPACT & EVIDENCE</p>
          <h1>Show the work.<br /><em>Show the evidence.</em></h1>
          <p className="impact-lead">A growing public record of VSI projects, results, places, partners, activities and volunteer contribution — built around what can be documented, measured and verified.</p>
        </div>
      </section>

      <section className="impact-proof section-shell">
        <div className="section-heading-row">
          <div><p className="kicker">THE EVIDENCE BASE</p><h2>What VSI can demonstrate today.</h2></div>
          <p className="impact-note">Project figures are reported from documented VSI project records. Volunteer figures are aggregated from the live volunteer management system and exclude unverified service.</p>
        </div>
        <div className="evidence-grid">
          <article><strong>2,610</strong><span>learners reached</span><small>Youth Growth Project</small></article>
          <article><strong>10</strong><span>school clubs</span><small>Youth Growth Project</small></article>
          <article><strong>1,870</strong><span>girls reached</span><small>Youth Growth Project</small></article>
          <article><strong>740</strong><span>boys reached</span><small>Youth Growth Project</small></article>
          <article><strong>8</strong><span>years of documented journey</span><small>Founded 16 August 2018</small></article>
          <article><strong>{live.hours === null ? "—" : live.hours.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</strong><span>verified volunteer hours</span><small>Live system total</small></article>
        </div>
      </section>

      <section className="impact-projects section-shell">
        <div className="section-heading-row"><div><p className="kicker">PROJECTS & RESULTS</p><h2>From activity to documented outcome.</h2></div></div>
        <div className="project-grid">
          {documentedProjects.map((project) => (
            <article className="project-card" key={project.name}>
              <div className="project-top"><span>{project.period}</span><span>{project.place}</span></div>
              <h3>{project.name}</h3>
              <p className="project-partner"><b>Partner:</b> {project.partner}</p>
              <p>{project.result}</p>
              <div className="metric-tags">{project.metrics.map((metric) => <span key={metric}>{metric}</span>)}</div>
              <a href={project.link}>View evidence ↗</a>
            </article>
          ))}
        </div>
      </section>

      <section className="impact-live">
        <div className="section-shell">
          <p className="kicker light">VOLUNTEER CONTRIBUTION</p>
          <h2>Service should be measurable.</h2>
          <p>VSI now records volunteer service separately from professional development. The public evidence layer counts only verified service activity, helping distinguish contribution to VSI's work from learning undertaken for a volunteer's own development.</p>
          <div className="live-grid">
            <div><strong>{live.volunteers === null ? "—" : live.volunteers.toLocaleString()}</strong><span>approved volunteers</span></div>
            <div><strong>{live.activities === null ? "—" : live.activities.toLocaleString()}</strong><span>verified service activities</span></div>
            <div><strong>{live.hours === null ? "—" : live.hours.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</strong><span>verified service hours</span></div>
          </div>
        </div>
      </section>

      <section className="impact-activities section-shell">
        <div className="section-heading-row"><div><p className="kicker">ACTIVITY RECORD</p><h2>What the work covers.</h2></div></div>
        <div className="activity-grid">{documentedActivities.map(([title,text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="impact-partners section-shell">
        <div className="section-heading-row"><div><p className="kicker">PARTNERS & INSTITUTIONS</p><h2>Evidence is stronger when the record is connected.</h2></div></div>
        <div className="partner-list">{documentedPartners.map((partner) => <span key={partner}>{partner}</span>)}</div>
      </section>

      <section className="impact-next">
        <div className="section-shell"><p className="kicker light">THE NEXT LAYER</p><h2>Build the institutional record.</h2><p>As VSI records more projects, activities, locations, publications, partners and verified volunteer service, this page can become a continuously growing evidence base — not just a showcase.</p><div className="impact-next-links"><a className="button button-yellow" href="/community">Explore community work ↗</a><a className="button button-primary" href="/volunteer">Volunteer with VSI ↗</a></div></div>
      </section>
      <SiteFooter />
    </main>
  );
}
