import "../../elearning.css";
import { SiteHeader, SiteFooter } from "../../components/SiteChrome";

export const metadata = {
  title: "Generosity, Volunteerism and Community Service | VSI E-Learning",
  description: "Module 02 teaching notes on generosity, volunteerism, active citizenship and community service for secondary school students.",
  alternates: { canonical: "/elearning/community-service" },
};

const communityAssets = [
  ["Young people", "Provide labour, ideas and energy."],
  ["Teachers", "Provide guidance and learning support."],
  ["Traditional leaders", "Mobilise and encourage the community."],
  ["Local council", "Provide technical support and local coordination."],
  ["Churches and mosques", "Mobilise volunteers and community support."],
  ["Businesses", "Provide materials, services or sponsorship."],
  ["Health workers", "Provide health information and technical advice."],
  ["Schools", "Provide meeting spaces and organised groups."],
  ["Community groups", "Organise local activities and participation."],
];

const actionSteps = [
  ["01", "Meet with market leaders", "Build agreement and local ownership before starting."],
  ["02", "Identify the areas with the most waste", "Focus effort where the need is greatest."],
  ["03", "Mobilise volunteers", "Invite students, traders and community members to participate."],
  ["04", "Organise a clean-up", "Put the plan into practical action."],
  ["05", "Conduct an awareness campaign", "Explain responsible waste disposal and why it matters."],
  ["06", "Encourage proper waste disposal", "Support behaviour change beyond the clean-up day."],
  ["07", "Follow up", "Check progress and improve the approach over time."],
];

const projectSteps = [
  ["01", "Identify the problem", "Our school surroundings have too much litter."],
  ["02", "Identify people affected", "Students, teachers, workers and visitors."],
  ["03", "Identify available resources", "Students, teachers, cleaning equipment, school grounds and local community members."],
  ["04", "Develop the solution", "Organise a monthly school clean-up and waste-awareness campaign."],
  ["05", "Assign responsibilities", "Team leader, mobilisation officer, communications officer, materials coordinator and monitoring officer."],
  ["06", "Measure success", "Look for less litter, better use of bins, stronger participation and improved cleanliness."],
];

const successIndicators = [
  "Less litter around the school.",
  "More students using waste bins.",
  "More students participating in clean-up activities.",
  "Improved cleanliness of the school environment.",
];

const takeaways = [
  "Generosity means giving and helping others.",
  "Volunteerism is freely giving your time, skills or effort.",
  "Community service helps address local problems.",
  "Active citizens take responsibility for their communities.",
  "Communities have local resources and skills that can be used to solve problems.",
  "Young people can lead and participate in community development.",
  "Partnerships make community action more effective.",
  "Small acts of service can contribute to bigger development goals.",
];

export default function CommunityServicePage() {
  return (
    <main>
      <SiteHeader />

      <section className="lesson-hero">
        <div className="section-shell">
          <a className="lesson-back" href="/elearning">← Back to E-Learning</a>
          <p className="kicker light">MODULE 02 · VSI E-LEARNING</p>
          <h1>Generosity, Volunteerism <em>and Community Service.</em></h1>
          <p className="lesson-subtitle">Simplified Teaching Notes for Secondary School Students</p>
          <div className="lesson-meta">
            <span><strong>2 Hours</strong> Duration</span>
            <span><strong>SDG 11 &amp; 17</strong> Sustainable Communities &amp; Partnerships</span>
            <span><strong>AU Goal 18</strong> Engaged and empowered youth and children</span>
          </div>
        </div>
      </section>

      <article className="lesson-content section-shell">
        <section className="lesson-section">
          <p className="kicker">01 · FOUNDATIONS</p>
          <h2>Understanding Generosity, Volunteerism <em>and Community Service.</em></h2>
          <div className="lesson-card-list">
            <div className="lesson-row-card">
              <span className="module-label">GENEROSITY</span>
              <h3>Giving without expecting something in return.</h3>
              <p>Generosity means being willing to give, share or help others without expecting something in return. It is not only about money. We can give our time, skills, knowledge, food or clothing, ideas, encouragement and support to people in need.</p>
              <div className="lesson-note"><strong>Example</strong><p>A student who shares learning materials with a classmate who cannot afford them is showing generosity.</p></div>
            </div>
            <div className="lesson-row-card">
              <span className="module-label">VOLUNTEERISM</span>
              <h3>Freely offering time, skills or effort.</h3>
              <p>Volunteerism means freely offering your time, skills or effort to help other people or improve your community. A volunteer does not necessarily expect payment.</p>
              <div className="bullet-grid compact">
                <p>Cleaning a community market.</p><p>Helping elderly people with household tasks.</p><p>Planting trees.</p><p>Supporting a school club.</p><p>Helping during a community health campaign.</p><p>Helping younger pupils with reading or mathematics.</p>
              </div>
            </div>
            <div className="lesson-row-card">
              <span className="module-label">COMMUNITY SERVICE</span>
              <h3>Turning concern into practical local action.</h3>
              <p>Community service is work done by individuals or groups to improve the lives of people in their community. It can involve identifying a problem and working together to find a practical solution.</p>
              <div className="lesson-note"><strong>Example</strong><p>Young people notice that a nearby stream is full of litter. They organise a clean-up, encourage households not to dump waste into the stream and plant trees along its banks.</p></div>
            </div>
          </div>
        </section>

        <section className="lesson-section">
          <p className="kicker">02 · ACTIVE CITIZENSHIP</p>
          <h2>Be an <em>Active Citizen.</em></h2>
          <p>An active citizen is a person who takes responsibility for making their community a better place.</p>
          <div className="bullet-grid">
            <p>Care about what happens in their community.</p>
            <p>Respect other people.</p>
            <p>Follow rules and laws.</p>
            <p>Protect public property.</p>
            <p>Participate in community activities.</p>
            <p>Speak up about problems in a respectful way.</p>
            <p>Work with others to find solutions.</p>
          </div>
          <div className="lesson-note emphasis">
            <strong>Remember</strong>
            <p>Being an active citizen is not about waiting for government or someone else to solve every problem. Young people can also contribute to positive change.</p>
          </div>
          <div className="lesson-activity">
            <span className="module-label">DISCUSSION ACTIVITY</span>
            <h3>What problems can young people help solve?</h3>
            <p>Invite learners to identify problems in their school or community and discuss where young people can make a practical contribution.</p>
            <div className="focus-list mini-focus">
              {[
                "Littering", "Poor sanitation", "Bullying", "Environmental destruction", "Lack of reading materials", "Unsafe public spaces", "Poor care of public facilities", "Lack of support for vulnerable people",
              ].map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></div>)}
            </div>
          </div>
        </section>

        <section className="lesson-section">
          <p className="kicker">03 · FROM IDEA TO ACTION</p>
          <h2>Understand the Problem <em>Before Acting.</em></h2>
          <p>Before starting a community service project, young people should first understand the problem.</p>
          <div className="case-grid four-up">
            <div><span>01</span><h3>What is the problem?</h3><p>Describe the issue clearly and specifically.</p></div>
            <div><span>02</span><h3>Who is affected?</h3><p>Identify the people, places or groups experiencing the problem.</p></div>
            <div><span>03</span><h3>Why does it exist?</h3><p>Look at possible causes rather than only the visible symptoms.</p></div>
            <div><span>04</span><h3>What can we do?</h3><p>Choose an action that is realistic with the resources available.</p></div>
          </div>
          <div className="lesson-card-list single-card">
            <div className="lesson-row-card">
              <span className="module-label">WORKED EXAMPLE · LOCAL MARKET</span>
              <h3>Too much litter around the community market.</h3>
              <p><strong>People affected:</strong> Traders, customers, children and nearby residents.</p>
              <p><strong>Possible causes:</strong> Inadequate waste disposal, lack of awareness, poor enforcement of waste-management rules and insufficient waste collection.</p>
              <p><strong>Possible action:</strong> Organise a clean-up campaign and awareness activity with traders and the local community.</p>
            </div>
          </div>
        </section>

        <section className="lesson-section">
          <p className="kicker">04 · ASSET MAPPING</p>
          <h2>Use What the Community <em>Already Has.</em></h2>
          <p>Asset mapping means identifying the people, organisations, skills, facilities and resources available in a community. A community may already have many resources that can help solve a problem.</p>
          <div className="lesson-table-wrap">
            <table className="lesson-table">
              <thead><tr><th>Community asset</th><th>How it can help</th></tr></thead>
              <tbody>{communityAssets.map(([asset, help]) => <tr key={asset}><td>{asset}</td><td>{help}</td></tr>)}</tbody>
            </table>
          </div>
          <div className="lesson-note emphasis"><strong>Important lesson</strong><p>A community does not have to wait for outside organisations before taking action. Local people often have knowledge, skills and resources that can be used to address local problems.</p></div>
        </section>

        <section className="lesson-section">
          <p className="kicker">05 · ACTION PLANNING</p>
          <h2>Turn a Community Problem into an <em>Action Plan.</em></h2>
          <div className="lesson-row-card action-plan-card">
            <span className="module-label">PROBLEM</span>
            <h3>Litter around the community market.</h3>
            <p><strong>Goal:</strong> Improve cleanliness and encourage responsible waste disposal.</p>
            <div className="action-plan-list">
              {actionSteps.map(([number, title, text]) => <div key={number}><span>{number}</span><div><strong>{title}</strong><p>{text}</p></div></div>)}
            </div>
          </div>
          <div className="lesson-card-list two-column">
            <div className="lesson-row-card"><span className="module-label">RESOURCES NEEDED</span><p>Gloves · Rubbish bags · Brooms · Posters · Transport · Water · Volunteers</p></div>
            <div className="lesson-row-card"><span className="module-label">PEOPLE TO INVOLVE</span><p>Students · Teachers · Market committees · Local leaders · Council representatives · Traders · Community members</p></div>
          </div>
        </section>

        <section className="lesson-section">
          <p className="kicker">06 · WORKING TOGETHER</p>
          <h2>Experience, Plan, <em>Participate.</em></h2>
          <div className="lesson-activity">
            <span className="module-label">EXPERIENCE SHARING</span>
            <h3>Share what you have learned through helping others.</h3>
            <div className="bullet-grid compact"><p>Have you ever volunteered to help someone?</p><p>What did you do?</p><p>Why did you decide to help?</p><p>What did you learn?</p><p>How did the person or community benefit?</p><p>What would you do differently next time?</p></div>
          </div>
          <div className="lesson-card-list single-card">
            <div className="lesson-row-card">
              <span className="module-label">GROUP ACTIVITY · DESIGN A COMMUNITY SERVICE PROJECT</span>
              <h3>My Community, Our Action</h3>
              <p>Divide students into small groups. Each group should identify one problem in their school or community and develop a simple community service project.</p>
              <div className="action-plan-list project-steps">
                {projectSteps.map(([number, title, text]) => <div key={number}><span>{number}</span><div><strong>{title}</strong><p>{text}</p></div></div>)}
              </div>
            </div>
          </div>
        </section>

        <section className="lesson-section">
          <p className="kicker">07 · MEASURING CHANGE</p>
          <h2>How Will We Know the Project <em>Worked?</em></h2>
          <p>Community action becomes stronger when groups decide in advance what success should look like.</p>
          <div className="bullet-grid">{successIndicators.map((item) => <p key={item}>{item}</p>)}</div>
          <div className="lesson-note emphasis"><strong>Key lesson</strong><p>Small actions can create meaningful change. A young person does not need to have a lot of money to serve their community.</p><p><strong>TIME + SKILLS + IDEAS + TEAMWORK = COMMUNITY ACTION</strong></p><p>When young people work together, they can help create cleaner, safer and stronger communities.</p></div>
        </section>

        <section className="lesson-section">
          <p className="kicker">08 · DEVELOPMENT ALIGNMENT</p>
          <h2>Community Service Supports <em>Development Goals.</em></h2>
          <div className="lesson-card-list two-column">
            <div className="lesson-row-card">
              <span className="module-label">SDG 11</span>
              <h3>Sustainable Cities and Communities</h3>
              <p>Volunteerism and community service can help create communities that are cleaner, safer, more inclusive, environmentally responsible and better organised.</p>
              <div className="lesson-note"><strong>Example</strong><p>Young people participating in waste management, tree planting and community clean-up activities contribute to sustainable communities.</p></div>
            </div>
            <div className="lesson-row-card">
              <span className="module-label">SDG 17</span>
              <h3>Partnerships for the Goals</h3>
              <p>Community problems are easier to solve when people work together. Young people can partner with schools, local councils, community organisations, businesses, civil society organisations and traditional or community leaders.</p>
              <div className="lesson-note"><strong>Key message</strong><p>Partnership makes community action stronger.</p></div>
            </div>
          </div>
          <div className="lesson-row-card au-card">
            <span className="module-label">AU AGENDA 2063 · GOAL 18</span>
            <h3>Engaged and empowered youth and children.</h3>
            <p>Young people should not only be viewed as beneficiaries of development. They are also <strong>participants and contributors to development.</strong></p>
            <div className="bullet-grid compact"><p>Develop leadership skills.</p><p>Gain practical experience.</p><p>Build confidence.</p><p>Solve community problems.</p><p>Work with different groups.</p><p>Become responsible citizens.</p></div>
          </div>
        </section>

        <section className="lesson-closing">
          <p className="kicker">09 · FINAL CLASS ACTIVITY</p>
          <h2>My Community, <em>My Responsibility.</em></h2>
          <div className="reflection-grid">
            <div><span>01</span><h3>One problem I see</h3><p>Write down one problem you see in your community.</p><div className="writing-line" /></div>
            <div><span>02</span><h3>One thing young people can do</h3><p>Describe one practical contribution.</p><div className="writing-line" /></div>
            <div><span>03</span><h3>One person or organisation</h3><p>Identify someone you can work with.</p><div className="writing-line" /></div>
            <div><span>04</span><h3>One action I will take</h3><p>Choose one action you are willing to take.</p><div className="writing-line" /></div>
          </div>
          <blockquote>You do not have to wait until you are older to make a difference. Start where you are, use what you have, work with others, and serve your community.</blockquote>
          <div className="lesson-takeaways">
            <p className="kicker">KEY TAKEAWAYS</p>
            <div className="takeaway-grid">{takeaways.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></div>)}</div>
          </div>
        </section>
      </article>

      <SiteFooter />
    </main>
  );
}
