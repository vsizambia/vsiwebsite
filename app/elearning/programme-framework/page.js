import "../programme-framework.css";
import { SiteHeader, SiteFooter } from "../../components/SiteChrome";

export const metadata = {
  title: "Programme Framework | Civic Engagement and Democratic Governance | VSI E-Learning",
  description: "The programme framework for VSI's Civic Engagement and Democratic Governance Programme.",
  alternates: { canonical: "/elearning/programme-framework" },
};

const modules = [
  { number: "01", title: "National Values and Principles", objective: "Examine constitutional values, patriotism, national unity and good governance and their importance in responsible citizenship.", outcome: "Apply value-based ethical frameworks to everyday decision-making and demonstrate responsible citizenship.", method: "Plenary discussion, case studies, role-playing and guided reflection.", nvp: "Patriotism and National Unity; Human Dignity; Democracy and Good Governance; Equality and Non-discrimination; Morality and Ethics.", sdg: "SDG 16", au: "Goals 11 & 12" },
  { number: "02", title: "Generosity, Volunteerism and Community Service", objective: "Define active citizenship and explore generosity, volunteerism and community service as ways of contributing to community development.", outcome: "Develop practical community-service plans using local people, skills, knowledge and resources.", method: "Asset mapping, action-planning workshops, experience sharing, group work and practical exercises.", nvp: "Human Dignity; Equity and Social Justice; Patriotism and National Unity; Democracy and Good Governance; Sustainable Development.", sdg: "SDGs 11 & 17", au: "Goal 18" },
  { number: "03", title: "Keep Zambia Clean, Green and Healthy", objective: "Connect sanitation, waste management, environmental protection and public health with sustainable community development.", outcome: "Practise waste sorting, responsible waste disposal, tree planting, environmental protection and community clean-up.", method: "Visual demonstrations, community walk, practical clean-up, group discussion and pledge formulation.", nvp: "Sustainable Development; Human Dignity; Equity and Social Justice; Democracy and Good Governance; Patriotism and National Unity.", sdg: "SDGs 3, 6, 13 & 15", au: "Goals 1 & 7" },
  { number: "04", title: "Mental Health Resilience", objective: "Understand emotional well-being, stressors, resilience and factors that may contribute to burnout.", outcome: "Apply healthy stress-management and emotional-regulation techniques and identify appropriate sources of support.", method: "Guided reflection, self-assessment worksheets, group discussions, scenarios and practical exercises.", nvp: "Human Dignity; Equality and Non-discrimination; Equity and Social Justice; Morality and Ethics.", sdg: "SDG 3", au: "Goal 1" },
  { number: "05", title: "Suicide Prevention", objective: "Recognise possible warning signs of suicide risk and understand safe and responsible gatekeeper intervention.", outcome: "Demonstrate non-judgmental listening, encourage help-seeking and connect people experiencing serious distress to trusted adults or appropriate professional support.", method: "Role-playing, resource mapping, guided discussion and expert-led sessions.", nvp: "Human Dignity; Equality and Non-discrimination; Equity and Social Justice; Morality and Ethics.", sdg: "SDGs 3 & 10", au: "Goals 1 & 18" },
];

const outcomes = [
  ["OUTCOME 1", "Students demonstrate improved understanding of national values, democratic principles and responsible citizenship.", "Pre/post knowledge assessments; reflections; facilitator assessments."],
  ["OUTCOME 2", "Students demonstrate increased capacity to participate constructively in their communities.", "Community-service action plans; activity reports; school/community records."],
  ["OUTCOME 3", "Students demonstrate greater awareness and practice of environmental responsibility.", "Environmental actions; observation checklists; student pledges."],
  ["OUTCOME 4", "Students demonstrate improved knowledge of healthy stress management, resilience and appropriate help-seeking.", "Pre/post assessment; worksheets; facilitator observations."],
  ["OUTCOME 5", "Students understand how to respond safely and appropriately when concerned about another person's well-being.", "Scenario exercises; role-play assessment; post-session questionnaire."],
];

const flow = [
  ["01", "VALUES", "Who am I as a responsible citizen?"],
  ["02", "SERVICE", "How can I contribute to my community?"],
  ["03", "ENVIRONMENT", "How can I protect the place where I live?"],
  ["04", "RESILIENCE", "How can I take care of my own well-being?"],
  ["05", "COMPASSION", "How can I recognise distress and safely connect someone to help?"],
];

export default function ProgrammeFrameworkPage() {
  return <main>
    <SiteHeader />
    <section className="framework-hero">
      <div className="section-shell framework-hero-inner">
        <a className="framework-back" href="/elearning">← Back to e-learning</a>
        <p className="kicker light">PROGRAMME FRAMEWORK</p>
        <h1>Civic Engagement and Democratic Governance <em>Programme.</em></h1>
        <p className="framework-hero-lead">A 10-hour, five-module learning programme designed to equip students with the values, knowledge, practical skills and attitudes needed to become responsible, active and resilient citizens.</p>
        <div className="framework-stats"><span><strong>5</strong> Modules</span><span><strong>10</strong> Learning Hours</span><span><strong>2</strong> Hours per module</span><span>Participatory & learner-centred</span></div>
      </div>
    </section>

    <section className="framework-content">
      <div className="section-shell">
        <section className="framework-section framework-overview">
          <div className="framework-section-heading"><p className="kicker">01 / PROGRAMME OVERVIEW</p><h2>From values to <em>responsible action.</em></h2></div>
          <div className="framework-overview-grid">
            <div><p>The programme connects Zambia's National Values and Principles with practical learning on citizenship, community service, environmental responsibility, personal well-being and care for others.</p><p>It uses participatory approaches that encourage students to understand their rights and responsibilities, engage constructively with their communities and contribute to positive social change.</p></div>
            <div className="framework-glance"><span>PROGRAMME AT A GLANCE</span><div><b>Target group</b><p>Students, particularly secondary school learners</p></div><div><b>Core focus</b><p>Democratic citizenship, community service, environmental responsibility, resilience and care for others</p></div><div><b>Alignment</b><p>NVP · SDGs 3, 6, 10, 11, 13, 15, 16 & 17 · AU Agenda 2063 Goals 1, 7, 11, 12 & 18</p></div></div>
          </div>
        </section>

        <section className="framework-section">
          <div className="framework-section-heading"><p className="kicker">02 / THEORY OF CHANGE</p><h2>Learning that moves from <em>knowledge to contribution.</em></h2></div>
          <div className="change-path"><div><span>IF</span><p>Students receive practical knowledge of national values, democratic governance, citizenship, service, environmental responsibility, mental health and peer support.</p></div><i>↓</i><div><span>AND IF</span><p>Learning is delivered through participatory discussion, practical activities, reflection, role-play, community exercises and action planning.</p></div><i>↓</i><div><span>THEN</span><p>Students develop stronger civic knowledge, ethical decision-making, confidence, resilience, collaboration and problem-solving skills.</p></div><i>↓</i><div className="change-result"><span>LEADING TO</span><p>Greater participation in constructive community activities, responsible citizenship, environmental stewardship and positive support for others.</p></div></div>
        </section>

        <section className="framework-section">
          <div className="framework-section-heading"><p className="kicker">03 / RESULTS FRAMEWORK</p><h2>What the programme is designed to <em>change.</em></h2></div>
          <div className="outcome-list">{outcomes.map(([label, result, verification]) => <article key={label}><span>{label}</span><div><h3>{result}</h3><p><b>Evidence:</b> {verification}</p></div></article>)}</div>
        </section>

        <section className="framework-section">
          <div className="framework-section-heading"><p className="kicker">04 / CONSOLIDATED MODULE FRAMEWORK</p><h2>Five modules. One <em>learning journey.</em></h2></div>
          <div className="framework-module-list">{modules.map((module) => <article key={module.number} className="framework-module"><div className="framework-module-number">{module.number}</div><div className="framework-module-body"><div className="framework-module-title"><div><span>MODULE {module.number}</span><h3>{module.title}</h3></div><b>2 HOURS</b></div><div className="framework-module-grid"><div><label>LEARNING OBJECTIVE</label><p>{module.objective}</p></div><div><label>LEARNING OUTCOME</label><p>{module.outcome}</p></div><div><label>TEACHING METHODOLOGY</label><p>{module.method}</p></div><div><label>NVP ALIGNMENT</label><p>{module.nvp}</p></div><div><label>UN SDG</label><p>{module.sdg}</p></div><div><label>AU AGENDA 2063</label><p>{module.au}</p></div></div><a href={`/elearning/${module.number === "01" ? "national-values" : module.number === "02" ? "community-service" : module.number === "03" ? "clean-green-healthy" : module.number === "04" ? "mental-health-resilience" : "suicide-prevention"}`} className="framework-module-link">Open module <span>→</span></a></div></article>)}</div>
        </section>

        <section className="framework-section framework-safeguarding">
          <div className="framework-section-heading"><p className="kicker">05 / SAFEGUARDING</p><h2>Safety is part of the <em>programme design.</em></h2></div>
          <div className="framework-safety-grid"><div><p>Safeguarding applies throughout the programme, with additional safeguards required for Modules 4 and 5. The programme provides education and awareness; it is not a substitute for counselling, psychotherapy, medical treatment or crisis intervention.</p></div><div><ul><li>Create a respectful, safe and non-judgmental learning environment.</li><li>Do not force personal disclosure or promise secrecy around serious safety concerns.</li><li>Know safeguarding and referral procedures before sensitive sessions.</li><li>Do not diagnose students or conduct group counselling.</li><li>Use age-appropriate, non-graphic content and connect concerns to appropriate support.</li></ul><a href="/elearning/safeguarding-guidance" className="framework-module-link">Open safeguarding guidance <span>→</span></a></div></div>
        </section>

        <section className="framework-section framework-flow">
          <div className="framework-section-heading"><p className="kicker">06 / OVERALL PROGRAMME FLOW</p><h2><em>Values → Service → Environment → Resilience → Compassion.</em></h2></div>
          <div className="flow-list">{flow.map(([number, word, question], index) => <div key={number}><span>{number}</span><strong>{word}</strong><p>{question}</p>{index < flow.length - 1 && <i>↓</i>}</div>)}</div>
          <blockquote>Values shape responsible citizens. Responsible citizens participate in democratic life, serve their communities, protect their environment, care for their well-being and support others safely.</blockquote>
        </section>
      </div>
    </section>
    <SiteFooter />
  </main>;
}
