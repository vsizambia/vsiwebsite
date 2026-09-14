import "../../elearning.css";
import { SiteHeader, SiteFooter } from "../../components/SiteChrome";

export const metadata = {
  title: "Keep Zambia Clean, Green and Healthy | VSI E-Learning",
  description: "Module 03 teaching notes on sanitation, waste management, trees, pollution and practical environmental action for secondary school students.",
  alternates: { canonical: "/elearning/clean-green-healthy" },
};

const cleanGreenActions = [
  ["PROPER WASTE DISPOSAL", "Dispose of waste responsibly and avoid littering."],
  ["CLEAN SURROUNDINGS", "Keep homes, schools, public places and communities clean."],
  ["PROTECT WATER", "Keep water sources safe from waste and pollution."],
  ["PLANT & PROTECT TREES", "Plant trees and care for them so they can survive and grow."],
  ["REDUCE POLLUTION", "Avoid unnecessary pollution, including unnecessary burning of waste."],
  ["PRACTISE HYGIENE", "Use good personal and environmental hygiene every day."],
];

const sanitationRisks = ["Diarrhoea and other diseases", "Contaminated water", "Bad smells", "Flies and other disease-carrying insects", "Blocked drainage", "Unhealthy living conditions"];
const wasteGroups = [
  ["ORGANIC WASTE", "Food remains, vegetable peels, leaves and grass.", "Some organic waste can be used to make compost."],
  ["RECYCLABLE WASTE", "Paper, cardboard, some plastics, metal cans and glass.", "These materials may be collected for recycling."],
  ["OTHER WASTE", "Materials that cannot easily be reused or recycled.", "Use appropriate disposal methods for the local setting."]
];
const treeBenefits = ["Produce oxygen", "Absorb carbon dioxide", "Provide shade", "Help protect soil", "Support birds and other animals", "Help protect water sources", "Improve the appearance of communities", "Help reduce the effects of climate change"];
const pollutionTypes = [
  ["AIR POLLUTION", "Smoke from burning waste and other sources can affect air quality."],
  ["WATER POLLUTION", "Dumping waste into rivers, streams and other water sources can contaminate water."],
  ["LAND POLLUTION", "Improper disposal of waste can make land dirty and unsafe."]
];
const observationGood = ["Clean areas", "Proper waste bins", "Trees and vegetation", "Clean water points", "Well-maintained facilities"];
const observationNeeds = ["Litter", "Blocked drains", "Poor waste disposal", "Damaged or missing bins", "Unprotected water sources", "Areas affected by unnecessary burning", "Lack of trees or vegetation"];
const cleanUpBefore = ["Where will we work?", "What equipment is needed?", "Who will participate?", "How will waste be sorted?", "Where will collected waste go?", "What safety precautions are required?"];
const cleanUpDuring = ["Work in groups.", "Wear appropriate protective equipment.", "Avoid dangerous objects.", "Sort waste where facilities allow.", "Follow instructions from teachers or supervisors.", "Never handle hazardous materials."];
const pledge = ["I pledge to keep my school, home and community clean.", "I will dispose of waste responsibly and avoid littering.", "I will protect trees and other plants.", "I will save water and help protect water sources.", "I will encourage others to care for our environment.", "I will do my part to make Zambia clean, green and healthy."];
const challenge = ["I will stop littering.", "I will separate waste where possible.", "I will plant and care for a tree.", "I will keep my surroundings clean.", "I will avoid unnecessary burning of waste.", "I will protect water sources.", "I will encourage my friends to care for the environment."];
const takeaways = ["A clean environment supports good health.", "Waste should be managed responsibly.", "Waste sorting can help reduce pollution and support recycling.", "Trees are important for people, animals and the climate.", "Water sources must be protected from pollution.", "Young people can take practical action in their schools and communities.", "Cleaning an environment is important, but preventing pollution is even better.", "Keeping Zambia clean, green and healthy is everyone's responsibility."];

export default function CleanGreenHealthyPage() {
  return (
    <main>
      <SiteHeader />
      <section className="lesson-hero">
        <div className="section-shell">
          <a className="lesson-back" href="/elearning">← Back to E-Learning</a>
          <p className="kicker light">MODULE 03 · VSI E-LEARNING</p>
          <h1>Keep Zambia Clean, <em>Green and Healthy.</em></h1>
          <p className="lesson-subtitle">Simplified Teaching Notes for Secondary School Students</p>
          <div className="lesson-meta">
            <span><strong>2 Hours</strong> Duration</span>
            <span><strong>SDGs 3, 6, 13 &amp; 15</strong> Health, sanitation, climate action &amp; life on land</span>
            <span><strong>AU Goals 1 &amp; 7</strong> Quality of life &amp; environmental sustainability</span>
          </div>
        </div>
      </section>

      <article className="lesson-content section-shell module3-content">
        <section className="lesson-section module3-foundations">
          <p className="kicker">01 · KEEPING OUR COMMUNITIES CLEAN AND HEALTHY</p>
          <h2>What Does “Keep Zambia Clean, Green and Healthy” <em>Mean?</em></h2>
          <p>Keeping Zambia clean, green and healthy means taking responsibility for the places where we live, learn, work and play.</p>
          <div className="module3-action-grid">
            {cleanGreenActions.map(([title, text]) => <div className="module3-action-card" key={title}><span className="module-label">{title}</span><p>{text}</p></div>)}
          </div>
          <div className="lesson-note emphasis"><strong>Why it matters</strong><p>A clean environment is not only beautiful. <strong>It helps protect our health and improve our quality of life.</strong></p></div>
        </section>

        <section className="lesson-section module3-sanitation">
          <p className="kicker">02 · SANITATION</p>
          <h2>What Is <em>Sanitation?</em></h2>
          <p>Sanitation means having clean and safe conditions for living, including proper management of human waste, wastewater and general cleanliness.</p>
          <div className="module3-split-grid">
            <div className="lesson-row-card"><span className="module-label">GOOD SANITATION INCLUDES</span><div className="bullet-grid compact"><p>Using toilets properly.</p><p>Keeping toilets clean.</p><p>Washing hands with soap.</p><p>Keeping surroundings clean.</p><p>Proper disposal of rubbish.</p><p>Keeping drainage systems free from waste.</p></div></div>
            <div className="lesson-row-card"><span className="module-label">POOR SANITATION CAN CONTRIBUTE TO</span><div className="bullet-grid compact">{sanitationRisks.map(item => <p key={item}>{item}</p>)}</div></div>
          </div>
          <div className="module3-think"><span className="module-label">THINK ABOUT IT</span><h3>What happens when rubbish is thrown into a drainage channel?</h3><div className="module3-chain"><span>Blocked drainage</span><span>→</span><span>Water collects</span><span>→</span><span>Flooding can occur</span><span>→</span><span>Insects may increase</span><span>→</span><span>Community health risk</span></div></div>
        </section>

        <section className="lesson-section">
          <p className="kicker">03 · UNDERSTANDING WASTE</p>
          <h2>Waste Is Not All <em>the Same.</em></h2>
          <p>Waste is anything that people throw away because they no longer need it. Examples include food remains, plastic bottles, paper, cardboard, cans, glass, old clothes, leaves and grass.</p>
          <div className="module3-three-grid">
            <div className="lesson-row-card"><span className="module-label">REDUCE</span><h3>Use fewer unnecessary materials.</h3><p>Think before buying or using something that will quickly become waste.</p></div>
            <div className="lesson-row-card"><span className="module-label">REUSE</span><h3>Use an item again.</h3><p>Reuse suitable items instead of throwing them away after one use.</p></div>
            <div className="lesson-row-card"><span className="module-label">RECYCLE</span><h3>Turn materials into new products.</h3><p>Collect suitable materials for recycling where facilities are available.</p></div>
          </div>
          <div className="lesson-note"><strong>Example</strong><p>Instead of throwing away a plastic bottle after using it once, it may be reused where appropriate or collected for recycling.</p></div>
        </section>

        <section className="lesson-section">
          <p className="kicker">04 · WASTE SORTING</p>
          <h2>Separate Waste <em>Before Disposal.</em></h2>
          <p>Waste sorting means separating different types of waste before disposal. The class can identify and group suitable demonstration items into <strong>Organic · Recyclable · Other Waste.</strong></p>
          <div className="module3-waste-grid">{wasteGroups.map(([title, items, note]) => <div className="module3-waste-card" key={title}><span className="module-label">{title}</span><h3>{items}</h3><p>{note}</p></div>)}</div>
          <div className="module3-demo"><span className="module-label">CLASSROOM DEMONSTRATION</span><h3>Sort it. Explain it. Discuss it.</h3><p>The teacher places different waste items on a table. Students identify and group them, then discuss why each item belongs in that group.</p></div>
        </section>

        <section className="lesson-section module3-trees">
          <p className="kicker">05 · TREES AND A HEALTHY ENVIRONMENT</p>
          <h2>Why Should We <em>Plant Trees?</em></h2>
          <div className="module3-benefit-grid">{treeBenefits.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></div>)}</div>
          <div className="module3-tree-care"><span className="module-label">TREE PLANTING ACTIVITY</span><h3>Planting a tree is only the beginning.</h3><div className="tree-sequence"><strong>Plant</strong><span>→</span><strong>Water</strong><span>→</span><strong>Protect</strong><span>→</span><strong>Monitor</strong><span>→</span><strong>Replace when necessary</strong></div><p>A tree that is planted but not cared for may not survive. Students can participate at schools, community spaces, appropriate public areas, homes and other approved locations.</p></div>
        </section>

        <section className="lesson-section">
          <p className="kicker">06 · POLLUTION AND OUR HEALTH</p>
          <h2>What We Do to the Environment Can <em>Affect Our Health.</em></h2>
          <p>Pollution occurs when harmful substances enter the environment.</p>
          <div className="module3-pollution-grid">{pollutionTypes.map(([title, text]) => <div className="lesson-row-card" key={title}><span className="module-label">{title}</span><p>{text}</p></div>)}</div>
          <div className="lesson-note emphasis"><strong>Remember</strong><p><strong>What we do to the environment can eventually affect our health.</strong></p></div>
        </section>

        <section className="lesson-section module3-community-walk">
          <p className="kicker">07 · COMMUNITY ACTION</p>
          <h2>Community <em>Walk.</em></h2>
          <p>The class can conduct a short supervised walk around the school or community. Students should <strong>observe and record</strong>, rather than disturb or remove anything unsafe.</p>
          <div className="module3-observation-grid">
            <div className="observation-card good"><span className="module-label">WHAT IS WORKING WELL?</span>{observationGood.map((item, index) => <p key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</p>)}</div>
            <div className="observation-card needs"><span className="module-label">WHAT NEEDS IMPROVEMENT?</span>{observationNeeds.map((item, index) => <p key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</p>)}</div>
          </div>
        </section>

        <section className="lesson-section module3-cleanup">
          <p className="kicker">08 · COMMUNITY CLEAN-UP</p>
          <h2>From Observation to <em>Action.</em></h2>
          <div className="module3-cleanup-stage"><div className="cleanup-panel"><span className="module-label">BEFORE THE CLEAN-UP</span>{cleanUpBefore.map((item, index) => <p key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</p>)}</div><div className="cleanup-panel"><span className="module-label">DURING THE CLEAN-UP</span>{cleanUpDuring.map((item, index) => <p key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</p>)}</div></div>
          <div className="module3-after"><span className="module-label">AFTER THE CLEAN-UP</span><div><strong>What changed?</strong><strong>What did we learn?</strong><strong>How can we prevent the problem from returning?</strong></div></div>
        </section>

        <section className="lesson-section module3-pledge">
          <p className="kicker">09 · MY CLEAN, GREEN AND HEALTHY ZAMBIA PLEDGE</p>
          <h2>Make It <em>Personal.</em></h2>
          <p>Students can sign their pledges and display them in the classroom.</p>
          <div className="pledge-card"><div className="pledge-mark">✓</div><div>{pledge.map(item => <p key={item}>{item}</p>)}</div></div>
        </section>

        <section className="lesson-section module3-alignment">
          <p className="kicker">10 · DEVELOPMENT ALIGNMENT</p>
          <h2>Local Action, <em>Global Goals.</em></h2>
          <div className="module3-alignment-grid">
            <div className="alignment-card"><span className="module-label">SDG 3</span><h3>Good Health and Well-being</h3><p>A clean environment and good sanitation help reduce health risks and contribute to healthier communities.</p></div>
            <div className="alignment-card"><span className="module-label">SDG 6</span><h3>Clean Water and Sanitation</h3><p>Proper sanitation and responsible waste management help protect water sources and improve access to safe water.</p></div>
            <div className="alignment-card"><span className="module-label">SDG 13</span><h3>Climate Action</h3><p>Tree planting, reducing pollution and protecting natural resources can contribute to climate action.</p></div>
            <div className="alignment-card"><span className="module-label">SDG 15</span><h3>Life on Land</h3><p>Protecting trees, vegetation, soil and biodiversity helps conserve life on land.</p></div>
          </div>
          <div className="module3-au"><span className="module-label">AU AGENDA 2063 · GOALS 1 &amp; 7</span><h3>Quality of life, environmental sustainability and climate resilience.</h3><p>Clean surroundings, good sanitation and healthy communities contribute to a better quality of life. Young people can contribute by planting trees, protecting natural resources, reducing waste, preventing pollution and supporting environmental conservation.</p></div>
        </section>

        <section className="lesson-section module3-challenge">
          <p className="kicker">11 · FINAL CLASS CHALLENGE</p>
          <h2>One Student — <em>One Environmental Action.</em></h2>
          <p>Each student chooses one action they will practise regularly.</p>
          <div className="challenge-list">{challenge.map((item, index) => <div key={item}><span>☐</span><strong>{item}</strong><small>{String(index + 1).padStart(2, "0")}</small></div>)}</div>
        </section>

        <section className="lesson-section lesson-takeaways module3-takeaways">
          <p className="kicker">12 · KEY TAKEAWAYS</p>
          <h2>Remember the <em>essentials.</em></h2>
          <div className="focus-list mini-focus">{takeaways.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></div>)}</div>
        </section>

        <section className="lesson-closing module3-closing">
          <p className="kicker">CLOSING MESSAGE</p>
          <blockquote>“A clean Zambia begins with me, starts where I live, and grows through what we do together.”</blockquote>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
