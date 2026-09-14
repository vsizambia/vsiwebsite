import "../elearning.css";
import { SiteHeader, SiteFooter } from "../components/SiteChrome";

export const metadata = {
  title: "Youth Civic Engagement Programme | VSI E-Learning",
  description: "Explore the five-module Youth Civic Engagement Programme from Visionary Students Initiative.",
  alternates: { canonical: "/elearning" },
  openGraph: {
    title: "Youth Civic Engagement Programme | VSI E-Learning",
    description: "A five-module learning programme on values, service, environmental action, resilience and safe support.",
    url: "https://www.vsizambia.org/elearning",
  },
};

const modules = [
  {
    number: "01",
    title: "National Values and Principles",
    duration: "2 Hours",
    objective: "Examine constitutional values, patriotism, and good governance.",
    outcome: "Apply value-based ethical frameworks in daily decision-making.",
    method: "Plenary discussion, case study analysis, role-playing exercises.",
    sdgs: "SDG 16 — Peace, Justice and Strong Institutions",
    au: "Goals 11 & 12 — Democratic values, rule of law, and capable institutions.",
    href: "/elearning/national-values",
  },
  {
    number: "02",
    title: "Generosity, Volunteerism, and Community Service",
    duration: "2 Hours",
    objective: "Define active citizenship and explore the role of generosity, volunteerism and community service in local development.",
    outcome: "Develop practical community service plans using local people, skills and resources.",
    method: "Asset mapping, action-planning workshops, experience sharing and group activities.",
    sdgs: "SDG 11 — Sustainable Cities and Communities; SDG 17 — Partnerships for the Goals",
    au: "Goal 18 — Engaged and empowered youth and children.",
    href: "/elearning/community-service",
  },
  {
    number: "03",
    title: "Keep Zambia Clean, Green and Healthy",
    duration: "2 Hours",
    objective: "Understand the relationship between sanitation, waste management, environmental protection and community health.",
    outcome: "Apply practical approaches to waste sorting, tree planting, environmental protection and community clean-up.",
    method: "Visual demonstrations, community walk, practical clean-up activity and pledge formulation.",
    sdgs: "SDGs 3, 6, 13 & 15 — Health, sanitation, climate action and life on land",
    au: "Goals 1 & 7 — Quality of life, environmental sustainability and climate-resilient communities.",
    href: "/elearning/clean-green-healthy",
  },
  {
    number: "04",
    title: "Mental Health Resilience",
    duration: "2 Hours",
    objective: "Understand emotional well-being, common stressors, resilience and factors that may contribute to burnout.",
    outcome: "Apply healthy stress-management and emotional-regulation techniques and identify appropriate sources of support.",
    method: "Guided reflection, self-assessment worksheets, group discussions and practical exercises.",
    sdgs: "SDG 3 — Good Health and Well-being",
    au: "Goal 1 — High standard of living, quality of life and well-being.",
    href: "/elearning/mental-health-resilience",
  },
  {
    number: "05",
    title: "Suicide Prevention",
    duration: "2 Hours",
    objective: "Recognise possible warning signs of suicide risk and understand the role of a safe, responsible gatekeeper response.",
    outcome: "Demonstrate non-judgmental listening, encourage help-seeking and connect people experiencing serious distress with trusted adults or appropriate professional support.",
    method: "Role-playing, resource mapping, guided discussion and expert-led sessions.",
    sdgs: "SDGs 3 & 10 — Good Health and Well-being; Reduced Inequalities",
    au: "Goals 1 & 18 — Well-being for all citizens and engaged and empowered youth and children.",
  },
];

const learningFocus = [
  "Demonstrate responsible citizenship.",
  "Make ethical and informed decisions.",
  "Participate in community service.",
  "Identify and use local resources.",
  "Promote clean, healthy and environmentally sustainable communities.",
  "Practise healthy approaches to managing stress.",
  "Recognise when someone may need additional support.",
  "Encourage help-seeking and connect vulnerable individuals with appropriate support.",
  "Work collaboratively with others to address community challenges.",
];

export default function ElearningPage() {
  return (
    <main>
      <SiteHeader />
      <section className="elearning-hero">
        <div className="section-shell elearning-hero-inner">
          <div className="elearning-hero-copy">
            <p className="kicker">VSI E-LEARNING</p>
            <h1>Youth Civic Engagement <em>Programme.</em></h1>
            <p className="hero-lead">A five-module learning journey designed to help young people understand their responsibilities, serve their communities, protect their environment, build resilience and support others safely.</p>
            <div className="elearning-meta" aria-label="Programme overview">
              <span><strong>5</strong> Modules</span>
              <span><strong>10</strong> Learning Hours</span>
              <span><strong>Youth</strong> Civic Leadership</span>
            </div>
          </div>
          <div className="elearning-hero-panel" aria-label="Programme pathway">
            <p className="kicker light">THE LEARNING JOURNEY</p>
            <div className="journey-line">
              {modules.map((module) => (
                <a href={module.href || `#module-${module.number}`} key={module.number} className="journey-step">
                  <span>{module.number}</span>
                  <strong>{module.title}</strong>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="programme-intro section-shell">
        <div><p className="kicker">MODULE SUMMARY</p><h2>From values to <em>action.</em></h2></div>
        <div className="programme-intro-copy">
          <p>The programme progressively develops young people's ability to move from <strong>understanding values → serving their communities → protecting the environment → building personal resilience → supporting others safely.</strong></p>
          <p>Each module combines practical learning with reflection, discussion and action so that civic engagement is not only understood, but practised.</p>
        </div>
      </section>
      <section className="modules-section">
        <div className="section-shell">
          <div className="section-heading-row"><div><p className="kicker">THE FIVE MODULES</p><h2>Learn it. Discuss it. <em>Apply it.</em></h2></div><p>Each two-hour module connects learning objectives to practical outcomes, participatory teaching and Zambia's wider development priorities.</p></div>
          <div className="module-list">
            {modules.map((module) => (
              <article className="module-card" id={`module-${module.number}`} key={module.number}>
                <div className="module-number">{module.number}</div>
                <div className="module-main">
                  <div className="module-title-row"><div><p className="module-label">MODULE {module.number}</p><h3>{module.title}</h3></div><span className="duration">{module.duration}</span></div>
                  <div className="module-details"><div><span>LEARNING OBJECTIVE</span><p>{module.objective}</p></div><div><span>LEARNING OUTCOME</span><p>{module.outcome}</p></div><div><span>TEACHING METHODOLOGY</span><p>{module.method}</p></div></div>
                  <div className="alignment-row"><div><span>UN SDG ALIGNMENT</span><p>{module.sdgs}</p></div><div><span>AU AGENDA 2063</span><p>{module.au}</p></div></div>
                  {module.href ? <a className="module-open" href={module.href}>Open full module <span>→</span></a> : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="learning-focus">
        <div className="section-shell learning-focus-grid">
          <div><p className="kicker light">OVERALL LEARNING FOCUS</p><h2>What participants should be able to <em>do.</em></h2><p>By the end of the programme, participants should be better equipped to translate civic knowledge into responsible, practical and collaborative action.</p></div>
          <div className="focus-list">{learningFocus.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></div>)}</div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
