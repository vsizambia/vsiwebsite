import "../../elearning.css";
import { SiteHeader, SiteFooter } from "../../components/SiteChrome";

export const metadata = {
  title: "National Values and Principles | VSI E-Learning",
  description: "Simplified teaching notes on Zambia's national values and principles for secondary school students.",
  alternates: { canonical: "/elearning/national-values" },
};

const values = [
  {
    title: "Morality and ethics",
    text: "Doing what is right, honest and responsible, even when nobody is watching.",
  },
  {
    title: "Patriotism and national unity",
    text: "Loving Zambia, protecting its interests and promoting peace and unity.",
  },
  {
    title: "Democracy and constitutionalism",
    text: "Respecting democratic participation, the Constitution and the rule of law.",
  },
  {
    title: "Human dignity, equity, social justice, equality and non-discrimination",
    text: "Respecting every person and treating people fairly, without unfair discrimination.",
  },
  {
    title: "Good governance and integrity",
    text: "Using leadership and public responsibility honestly, fairly and accountably.",
  },
  {
    title: "Sustainable development",
    text: "Meeting today's needs while protecting resources and opportunities for future generations.",
  },
];

const everydayValues = [
  ["Morality and Ethics", "Being honest and responsible. For example, do not cheat in an examination or take property that is not yours."],
  ["Patriotism and National Unity", "Caring about Zambia and working peacefully with people from different communities, cultures and backgrounds."],
  ["Democracy and Constitutionalism", "Having a voice in decisions and respecting the Constitution, laws and agreed democratic processes."],
  ["Human Dignity, Equity, Social Justice, Equality and Non-Discrimination", "Recognising the worth of every person and promoting fair treatment and inclusion."],
  ["Good Governance and Integrity", "Leading responsibly, being accountable and avoiding dishonesty or abuse of responsibility."],
  ["Sustainable Development", "Improving people's lives while protecting the environment and resources needed by future generations."],
];

const practiceTable = [
  ["A friend wants you to cheat.", "Morality and ethics", "Refuse and encourage honest work."],
  ["Students from different backgrounds disagree.", "Patriotism and national unity", "Listen respectfully and seek common ground."],
  ["A class representative is elected.", "Democracy and constitutionalism", "Allow fair participation and respect the result."],
  ["A learner is excluded because of disability.", "Dignity, equality and non-discrimination", "Promote inclusion and equal participation."],
  ["Class project money is missing.", "Good governance and integrity", "Report honestly and keep proper records."],
  ["The school grounds are full of litter.", "Sustainable development", "Practise responsible waste management."],
];

const review = [
  ["Morality & ethics", "Do what is right and responsible."],
  ["Patriotism & unity", "Love Zambia and promote peace and togetherness."],
  ["Democracy & constitutionalism", "Participate fairly and respect the Constitution and law."],
  ["Dignity, equity, justice, equality & non-discrimination", "Respect every person and promote fairness."],
  ["Good governance & integrity", "Lead and act honestly, responsibly and accountably."],
  ["Sustainable development", "Protect resources and the environment for the future."],
];

export default function NationalValuesPage() {
  return (
    <main>
      <SiteHeader />

      <section className="lesson-hero">
        <div className="section-shell">
          <a className="lesson-back" href="/elearning">← Back to E-Learning</a>
          <p className="kicker light">MODULE 01 · VSI E-LEARNING</p>
          <h1>National Values <em>and Principles.</em></h1>
          <p className="lesson-subtitle">Simplified Teaching Notes for Secondary School Students</p>
          <div className="lesson-meta">
            <span><strong>2 Hours</strong> Duration</span>
            <span><strong>SDG 16</strong> Peace, Justice and Strong Institutions</span>
            <span><strong>AU Goals 11 &amp; 12</strong> Democratic values and capable institutions</span>
          </div>
        </div>
      </section>

      <article className="lesson-content section-shell">
        <section className="lesson-section">
          <p className="kicker">01 · FOUNDATIONS</p>
          <h2>What Are <em>National Values?</em></h2>
          <p>National values are principles that help people live together peacefully, make responsible choices and build a better country. They guide how we treat others, use power and resources, and participate in our communities.</p>
          <p>Article 8 of the Constitution of Zambia (Amendment) Act No. 2 of 2016 lists six national values and principles:</p>

          <div className="value-grid">
            {values.map((value) => (
              <div className="value-card" key={value.title}>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </div>
            ))}
          </div>

          <div className="lesson-note">
            <strong>Article 9</strong>
            <p>Article 9 further provides that the national values and principles apply to the interpretation of the Constitution, the enactment and interpretation of law, and the development and implementation of State policy.</p>
          </div>
        </section>

        <section className="lesson-section">
          <p className="kicker">02 · EVERYDAY LIFE</p>
          <h2>Understanding the Values in <em>Everyday Life.</em></h2>
          <div className="lesson-card-list">
            {everydayValues.map(([title, text]) => (
              <div className="lesson-row-card" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="lesson-section">
          <p className="kicker">03 · WHY THEY MATTER</p>
          <h2>Why Do These Values <em>Matter?</em></h2>
          <div className="bullet-grid">
            <p>They help us make responsible decisions.</p>
            <p>They promote peace, respect and cooperation.</p>
            <p>They help prevent corruption, discrimination and abuse of power.</p>
            <p>They encourage responsible citizenship and participation.</p>
            <p>They support trustworthy institutions and good leadership.</p>
            <p>They help protect Zambia's future.</p>
          </div>
        </section>

        <section className="lesson-section">
          <p className="kicker">04 · PRACTICAL APPLICATION</p>
          <h2>Putting National Values into <em>Practice.</em></h2>
          <p>National values are not only ideas written in a Constitution. They should be visible in our daily choices.</p>
          <div className="lesson-table-wrap">
            <table className="lesson-table">
              <thead><tr><th>Situation</th><th>Value</th><th>Responsible action</th></tr></thead>
              <tbody>
                {practiceTable.map(([situation, value, action]) => (
                  <tr key={situation}><td>{situation}</td><td>{value}</td><td>{action}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="lesson-section">
          <p className="kicker">05 · DISCUSSION</p>
          <h2>Case Study Discussion: <em>What Would You Do?</em></h2>
          <div className="case-grid">
            <div><span>01</span><h3>The Lost Wallet</h3><p>You find a wallet containing money. Nobody saw you. What should you do? Which value guides you?</p></div>
            <div><span>02</span><h3>The Class Election</h3><p>Your friend loses an election and says the result should be ignored. What would you say?</p></div>
            <div><span>03</span><h3>The Group Assignment</h3><p>A group member is being excluded because of a disability. What can the group do?</p></div>
            <div><span>04</span><h3>The School Environment</h3><p>Students keep throwing plastic bottles around the school. What practical action can students take?</p></div>
            <div><span>05</span><h3>The Student Leader</h3><p>A student leader uses club money for personal expenses. Which values are involved?</p></div>
            <div><span>06</span><h3>Different Opinions</h3><p>Two students disagree strongly. How can they disagree without creating conflict?</p></div>
          </div>
        </section>

        <section className="lesson-section">
          <p className="kicker">06 · QUICK REVIEW</p>
          <h2>Remember the <em>Six Values.</em></h2>
          <div className="lesson-table-wrap">
            <table className="lesson-table review-table">
              <thead><tr><th>National value</th><th>Simple meaning</th></tr></thead>
              <tbody>
                {review.map(([value, meaning]) => (
                  <tr key={value}><td>{value}</td><td>{meaning}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="lesson-closing">
          <p className="kicker">07 · LEARNING ACTIVITY &amp; CLOSING</p>
          <h2>Turn a value into <em>action.</em></h2>
          <p>Teaching methods: plenary discussion, case-study analysis and role-playing exercises. Ask learners to choose one national value and describe one action they can take at school, at home or in their community.</p>
          <blockquote>“Good citizenship begins with everyday choices.”</blockquote>
          <p className="alignment-note"><strong>Alignment:</strong> UN Sustainable Development Goal 16 – Peace, Justice and Strong Institutions. AU Agenda 2063 Goal 11 – Democratic values, practices, universal principles of human rights and justice entrenched; Goal 12 – Capable institutions and transformative leadership in place.</p>
          <p className="source-note"><strong>Source:</strong> Constitution of Zambia (Amendment), 2016 – Act No. 2, Article 8.</p>
        </section>
      </article>

      <SiteFooter />
    </main>
  );
}
