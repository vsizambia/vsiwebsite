import "../impact.css";
import { SiteHeader, SiteFooter } from "../components/SiteChrome";
import ImpactSlider from "../components/ImpactSlider";
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
    link: "https://web.facebook.com/share/p/1DTBZj5Wdo/",
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
  const proofCards = [
    ["2,610","learners reached","Youth Growth Project"],
    ["10","school clubs","Youth Growth Project"],
    ["1,870","girls reached","Youth Growth Project"],
    ["740","boys reached","Youth Growth Project"],
    ["8","years of documented journey","Founded 16 August 2018"],
    [live.hours === null ? "—" : live.hours.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}),"verified volunteer hours","Live system total"],
  ];
  return (
    <main>
      <SiteHeader />
      <section className="impact-hero">
        <div className="section-shell impact-hero-layout">
          <div className="impact-hero-copy">
            <p className="kicker light">IMPACT & EVIDENCE</p>
            <h1>Show the work.<br /><em>Show the evidence.</em></h1>
            <p className="impact-lead">A growing public record of VSI projects, results, places, partners, activities and volunteer contribution — built around what can be documented, measured and verified.</p>
          </div>
          <div className="impact-hero-projects">
            <ImpactSlider label="Featured projects and results">
              {documentedProjects.map((project) => (
                <article className="project-card hero-project-slide" key={project.name}>
                  <div className="project-top"><span>{project.period}</span><span>{project.place}</span></div>
                  <h3>{project.name}</h3>
                  <p className="project-partner"><b>Partner:</b> {project.partner}</p>
                  <p>{project.result}</p>
                  <div className="metric-tags">{project.metrics.map((metric) => <span key={metric}>{metric}</span>)}</div>
                  <a href={project.link}>View evidence ↗</a>
                </article>
              ))}
            </ImpactSlider>
          </div>
        </div>
      </section>

      <section className="impact-proof section-shell">
        <div className="section-heading-row">
          <div><p className="kicker">THE EVIDENCE BASE</p><h2>What VSI can demonstrate today.</h2></div>
          <p className="impact-note">Project figures are reported from documented VSI project records. Volunteer figures are aggregated from the live volunteer management system and exclude unverified service.</p>
        </div>
        <ImpactSlider label="Evidence highlights">
          {proofCards.map(([number,label,source]) => <article className="evidence-slide" key={label}><strong>{number}</strong><span>{label}</span><small>{source}</small></article>)}
        </ImpactSlider>
      </section>

      <section className="impact-live">
        <div className="section-shell">
          <p className="kicker light">VOLUNTEER CONTRIBUTION</p>
          <h2>Service should be measurable.</h2>
          <p>VSI now records volunteer service separately from professional development. The public evidence layer counts only verified service activity, helping distinguish contribution to VSI's work from learning undertaken for a volunteer's own development.</p>
          <ImpactSlider label="Volunteer contribution">
            <div className="live-slide"><strong>{live.volunteers === null ? "—" : live.volunteers.toLocaleString()}</strong><span>approved volunteers</span></div>
            <div className="live-slide"><strong>{live.activities === null ? "—" : live.activities.toLocaleString()}</strong><span>verified service activities</span></div>
            <div className="live-slide"><strong>{live.hours === null ? "—" : live.hours.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</strong><span>verified service hours</span></div>
          </ImpactSlider>
        </div>
      </section>

      <section className="impact-activities section-shell">
        <div className="section-heading-row"><div><p className="kicker">ACTIVITY RECORD</p><h2>What the work covers.</h2></div></div>
        <ImpactSlider label="Activity record">
          {documentedActivities.map(([title,text]) => <article className="activity-slide" key={title}><h3>{title}</h3><p>{text}</p></article>)}
        </ImpactSlider>
      </section>

      <section className="impact-partners section-shell">
        <div className="section-heading-row"><div><p className="kicker">PARTNERS & INSTITUTIONS</p><h2>Evidence is stronger when the record is connected.</h2></div></div>
        <ImpactSlider label="Partners and institutions">
          {documentedPartners.map((partner,index) => <article className="partner-slide" key={partner}><span>Institution {String(index+1).padStart(2,"0")}</span><strong>{partner}</strong></article>)}
        </ImpactSlider>
      </section>

      <section className="impact-next">
        <div className="section-shell"><p className="kicker light">THE NEXT LAYER</p><h2>Build the institutional record.</h2><p>As VSI records more projects, activities, locations, publications, partners and verified volunteer service, this page can become a continuously growing evidence base — not just a showcase.</p><div className="impact-next-links"><a className="button button-yellow" href="/community">Explore community work ↗</a><a className="button button-primary" href="/volunteer">Volunteer with VSI ↗</a></div></div>
      </section>
      <SiteFooter />
    </main>
  );
}