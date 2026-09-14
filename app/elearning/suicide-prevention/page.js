import "../../elearning.css";
import { SiteHeader, SiteFooter } from "../../components/SiteChrome";

export const metadata = {
  title: "Suicide Prevention | VSI E-Learning",
  description: "Module 05 teaching notes on suicide prevention, warning signs, safe gatekeeper responses, support mapping and help-seeking for secondary school students.",
  alternates: { canonical: "/elearning/suicide-prevention" },
};

const warningSigns = [
  "Talking about wanting to die or disappear.",
  "Saying that life is not worth living.",
  "Expressing feelings of hopelessness.",
  "Suddenly withdrawing from friends and activities.",
  "Giving away important personal belongings.",
  "Saying goodbye in an unusual or concerning way.",
  "Significant changes in behaviour or mood.",
  "Increasing use of alcohol or drugs.",
  "Suddenly appearing unusually calm after a period of severe distress.",
];

const gatekeepers = ["Teachers", "Parents and guardians", "School counsellors", "Health workers", "Community leaders", "Youth leaders", "Friends and classmates"];
const supportPeople = ["Parent or guardian", "Teacher", "School counsellor", "Nurse or doctor", "Mental health professional", "Another responsible adult who can help"];
const takeaways = [
  "Suicide is a serious issue that requires compassionate and responsible action.",
  "Warning signs can include significant changes in behaviour, mood or communication.",
  "Young people can play a role in prevention without becoming counsellors.",
  "Listening without judgement can help someone feel supported.",
  "Serious concerns should always be shared with a trusted adult or appropriate professional.",
  "Never promise to keep suicidal thoughts or plans secret.",
  "A person in immediate danger should not be left to manage the crisis alone.",
  "Asking for help is a sign of courage and strength.",
  "No young person should be expected to carry another person’s crisis alone.",
];

function NumberedList({ items, className = "" }) {
  return <div className={`module5-numbered-list ${className}`}>{items.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></div>)}</div>;
}

function StepFlow({ items }) {
  return <div className="module5-step-flow">{items.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong>{index < items.length - 1 ? <b aria-hidden="true">→</b> : null}</div>)}</div>;
}

export default function SuicidePreventionPage() {
  return (
    <main>
      <SiteHeader />
      <section className="lesson-hero module5-hero">
        <div className="section-shell">
          <a className="lesson-back" href="/elearning">← Back to E-Learning</a>
          <p className="kicker light">MODULE 05 · VSI E-LEARNING</p>
          <h1>Suicide <em>Prevention.</em></h1>
          <p className="lesson-subtitle">Simplified Teaching Notes for Secondary School Students</p>
          <div className="lesson-meta">
            <span><strong>2 Hours</strong> Duration</span>
            <span><strong>SDGs 3 &amp; 10</strong> Health &amp; Reduced Inequalities</span>
            <span><strong>AU Goals 1 &amp; 18</strong> Well-being &amp; youth</span>
          </div>
        </div>
      </section>

      <article className="lesson-content section-shell module5-content">
        <section className="lesson-section module5-section">
          <p className="kicker">01 · UNDERSTANDING SUICIDE PREVENTION</p>
          <h2>What Is <em>Suicide Prevention?</em></h2>
          <p>Suicide prevention means taking steps to protect people who may be experiencing serious emotional distress or thoughts of suicide and helping them connect with appropriate support.</p>
          <p>Suicide is a serious issue that can affect people of different ages and backgrounds.</p>
          <div className="module5-role-grid">{["Notice when someone may be struggling.", "Listen without judging.", "Take warning signs seriously.", "Encourage the person to seek help.", "Tell a trusted adult when there is a concern.", "Stay supportive and caring."].map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "02")}</span><p>{item}</p></div>)}</div>
          <div className="module5-important"><span className="module-label">IMPORTANT</span><h3>A student should never be expected to handle a suicide crisis alone.</h3><p>The role of a young person is to <strong>notice, listen, support and connect the person with help.</strong></p></div>
        </section>

        <section className="lesson-section module5-section">
          <p className="kicker">02 · UNDERSTANDING WARNING SIGNS</p>
          <h2>Notice Concerning <em>Changes.</em></h2>
          <p>There is no single sign that can tell us that someone is suicidal. However, changes in behaviour, emotions or communication can sometimes indicate that someone is experiencing serious distress.</p>
          <NumberedList items={warningSigns} />
          <div className="module5-remember"><span className="module-label">REMEMBER</span><p><strong>One sign does not automatically mean that someone is suicidal.</strong> But concerning changes should not simply be ignored.</p></div>
        </section>

        <section className="lesson-section module5-section">
          <p className="kicker">03 · MYTHS AND FACTS</p>
          <h2>Challenge Myths. <em>Take Concerns Seriously.</em></h2>
          <div className="module5-myth-grid">
            {[
              ["Talking about suicide will put the idea into someone’s head.", "Asking someone directly and calmly about whether they are thinking about suicide can open an important conversation and help them receive support."],
              ["Someone who talks about suicide is only looking for attention.", "Any statement about suicide should be taken seriously."],
              ["Young people cannot help.", "Young people can help by noticing changes, listening without judgement and connecting a friend to a trusted adult or professional."],
            ].map(([myth, fact], index) => <article key={myth}><div><span>MYTH {String(index + 1).padStart(2, "0")}</span><p>“{myth}”</p></div><div><span>FACT</span><p>{fact}</p></div></article>)}
          </div>
        </section>

        <section className="lesson-section module5-section module5-gatekeeper-section">
          <p className="kicker">04 · HOW TO RESPOND WHEN SOMEONE IS STRUGGLING</p>
          <h2>The <em>Gatekeeper</em> Role.</h2>
          <p>A <strong>gatekeeper</strong> is someone who may notice that another person is struggling and can help connect them to appropriate support.</p>
          <div className="module5-gatekeeper-grid">{gatekeepers.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "02")}</span><strong>{item}</strong></div>)}</div>
          <div className="module5-note"><strong>A student does not need to become a counsellor to be a helpful gatekeeper.</strong></div>
          <StepFlow items={["NOTICE", "ASK", "LISTEN", "CONNECT", "FOLLOW UP"]} />
        </section>

        <section className="lesson-section module5-section">
          <p className="kicker">05 · NOTICE</p>
          <h2>Show That You <em>Care.</em></h2>
          <p>Pay attention when someone’s behaviour or mood changes significantly.</p>
          <div className="module5-example"><span className="module-label">EXAMPLE</span><blockquote>“I’ve noticed that you haven’t been yourself recently and you’ve been spending a lot of time alone.”</blockquote><p>The goal is not to diagnose the person. The goal is to show that <strong>you have noticed and care.</strong></p></div>
        </section>

        <section className="lesson-section module5-section">
          <p className="kicker">06 · ASK</p>
          <h2>Ask Calmly and <em>Directly.</em></h2>
          <p>Choose a quiet and appropriate place and ask calmly.</p>
          <div className="module5-example"><span className="module-label">EXAMPLE</span><blockquote>“You seem to be going through a difficult time. How are you feeling?”</blockquote><p>If you are seriously concerned, it is appropriate to ask directly whether they are thinking about suicide.</p></div>
          <div className="module5-do-not"><span className="module-label">DO NOT</span><p>Laugh, threaten, shame or challenge the person.</p></div>
        </section>

        <section className="lesson-section module5-section">
          <p className="kicker">07 · LISTEN</p>
          <h2>Listen Without <em>Judging.</em></h2>
          <p>If someone begins talking about their struggles, give them your attention and allow them to speak.</p>
          <div className="module5-do-dont-grid">
            <div><span className="module-label">DO</span><ul>{["Listen calmly.", "Give them your attention.", "Allow them to speak.", "Take their feelings seriously.", "Show compassion.", "Avoid blaming them.", "Encourage them to seek help."].map(item => <li key={item}>{item}</li>)}</ul></div>
            <div><span className="module-label">DON’T</span><ul>{["Tell them to “just be strong.”", "Tell them that their problems are not important.", "Make fun of them.", "Judge them.", "Promise to keep a suicide risk secret.", "Try to solve everything yourself."].map(item => <li key={item}>{item}</li>)}</ul></div>
          </div>
          <div className="module5-remember"><span className="module-label">REMEMBER</span><p><strong>You do not have to have all the answers.</strong> Sometimes the most helpful thing is simply to listen and help the person reach someone who can provide appropriate support.</p></div>
        </section>

        <section className="lesson-section module5-section">
          <p className="kicker">08 · CONNECT</p>
          <h2>Connect the Person to <em>Help.</em></h2>
          <p>This is one of the most important steps. If someone may be at risk, <strong>tell a trusted adult or appropriate professional immediately.</strong></p>
          <div className="module5-support-grid">{supportPeople.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "02")}</span><p>{item}</p></div>)}</div>
          <div className="module5-emergency"><span className="module-label">IMMEDIATE DANGER</span><p>Do not leave the person alone. Get urgent help from a responsible adult or emergency/health service.</p></div>
          <div className="module5-important compact"><span className="module-label">IMPORTANT</span><p><strong>Never promise to keep suicidal thoughts or plans secret.</strong> Protecting someone’s safety is more important than keeping a dangerous secret.</p></div>
        </section>

        <section className="lesson-section module5-section">
          <p className="kicker">09 · PRACTICAL SKILLS AND COMMUNITY SUPPORT</p>
          <h2>Practise a Safe <em>Response.</em></h2>
          <div className="module5-scenario"><span className="module-label">ROLE-PLAYING ACTIVITY</span><p>Divide students into small groups. A student has become withdrawn and has stopped participating in activities. A friend notices the change and decides to check on them.</p><div className="module5-roles"><span>Person who is struggling</span><span>Friend</span><span>Observer</span></div></div>
          <div className="module5-practice-grid">{[["NOTICE", "I’ve noticed that you’ve been very quiet lately."], ["ASK", "How are you doing?"], ["LISTEN", "Allow the person to speak without interrupting or judging."], ["CONNECT", "I think we should talk to someone who can help us with this."]].map(([title, text], index) => <div key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><small>{title}</small><p>{text}</p></div></div>)}</div>
          <div className="module5-discussion"><span className="module-label">DISCUSSION</span><NumberedList items={["Did the student listen without judging?", "Did they take the concern seriously?", "Did they try to handle everything themselves?", "Did they connect the person to appropriate support?", "What could they have done differently?"]} /></div>
        </section>

        <section className="lesson-section module5-section">
          <p className="kicker">10 · RESOURCE MAPPING</p>
          <h2>Know Where <em>Help Is.</em></h2>
          <p>Students should identify safe sources of support available in their school and community.</p>
          <div className="module5-support-map">
            <div className="module5-map-head"><span>SUPPORT PERSON / SERVICE</span><span>WHERE TO FIND THEM</span></div>
            {["Trusted teacher", "School counsellor", "Parent/Guardian", "Health facility", "Community health worker", "Trusted community leader", "Emergency support"].map(item => <div key={item}><strong>{item}</strong><span /></div>)}
          </div>
          <div className="module5-facilitator"><span className="module-label">FACILITATOR NOTE</span><p>The teacher or facilitator should ensure that the class has <strong>accurate, locally relevant contact information</strong> for emergency and professional mental-health services.</p></div>
        </section>

        <section className="lesson-section module5-section">
          <p className="kicker">11 · HOW TO SUPPORT A FRIEND</p>
          <h2>Care Without Carrying the <em>Crisis Alone.</em></h2>
          <div className="module5-support-friend-grid">
            <div><span className="module-label">YOU CAN</span>{[["LISTEN", "I’m here to listen."], ["SHOW CARE", "I’m concerned about you."], ["ENCOURAGE HELP", "Let’s talk to someone who can help."], ["STAY CONNECTED", "Check on them appropriately after they have been connected to support."]].map(([title, text]) => <div key={title}><strong>{title}</strong><p>{text}</p></div>)}</div>
            <div><span className="module-label">YOU SHOULD NOT</span><ul>{["Take responsibility for fixing their problems.", "Keep a dangerous secret.", "Leave someone alone when there is immediate danger.", "Try to provide professional treatment yourself.", "Blame or shame them."].map(item => <li key={item}>{item}</li>)}</ul></div>
          </div>
        </section>

        <section className="lesson-section module5-section module5-emergency-section">
          <p className="kicker">12 · WHEN IT IS AN EMERGENCY</p>
          <h2>When There Is Immediate <em>Danger.</em></h2>
          <p>If someone says they intend to kill themselves, has made a suicide attempt, or appears to be in immediate danger:</p>
          <div className="module5-take-action"><span className="module-label">TAKE ACTION</span><NumberedList items={["Stay calm.", "Stay with the person if it is safe to do so.", "Immediately involve a trusted adult or responsible professional.", "Contact appropriate emergency or health services.", "Do not leave the person to deal with the crisis alone."]} /></div>
          <div className="module5-safety"><span className="module-label">SAFETY</span><p>Students should <strong>never physically intervene in a dangerous situation or put themselves at risk.</strong></p></div>
        </section>

        <section className="lesson-section module5-section">
          <p className="kicker">13 · EXPERT-GUIDED DISCUSSION</p>
          <h2>Learn With <em>Qualified Support.</em></h2>
          <p>A qualified health professional, counsellor or other appropriately trained facilitator can lead a discussion on:</p>
          <div className="module5-expert-grid">{["Suicide prevention", "Mental health stigma", "How to recognise distress", "How to respond safely", "Where young people can get professional help", "Local referral and emergency pathways"].map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "02")}</span><p>{item}</p></div>)}</div>
          <div className="module5-note"><strong>Students should be encouraged to ask questions without fear of ridicule or judgement.</strong></div>
        </section>

        <section className="lesson-section module5-section">
          <p className="kicker">14 · DEVELOPMENT ALIGNMENT</p>
          <h2>Connection to the <em>Sustainable Development Goals.</em></h2>
          <div className="module5-alignment-grid">
            <div><span className="module-label">SDG 3 · GOOD HEALTH AND WELL-BEING</span><p>Suicide prevention contributes to healthier communities by promoting mental health awareness, early support, access to appropriate care, compassion and social support.</p></div>
            <div><span className="module-label">SDG 10 · REDUCED INEQUALITIES</span><p>Everyone should have an opportunity to access support regardless of their background or circumstances. Reducing stigma and encouraging people to seek help can make mental-health support more accessible.</p></div>
          </div>
          <div className="module5-alignment-grid au">
            <div><span className="module-label">AU AGENDA 2063 · GOAL 1</span><h3>A High Standard of Living, Quality of Life and Well-being</h3><p>Preventing suicide and supporting people experiencing serious emotional distress contributes to healthier communities and improved quality of life.</p></div>
            <div><span className="module-label">AU AGENDA 2063 · GOAL 18</span><h3>Engaged and Empowered Youth and Children</h3><p>Young people can contribute by looking out for one another, challenging harmful stigma, promoting kindness, encouraging people to seek help, participating in positive community activities and learning how to connect people to appropriate support.</p></div>
          </div>
        </section>

        <section className="lesson-section module5-section module5-final">
          <p className="kicker">15 · FINAL CLASS ACTIVITY</p>
          <h2><em>“NOTICE. LISTEN. CONNECT.”</em></h2>
          <p>Ask students to remember three words:</p>
          <div className="module5-final-flow">
            <div><span>01</span><strong>NOTICE</strong><p>Pay attention when someone appears to be struggling.</p></div>
            <div><span>02</span><strong>LISTEN</strong><p>Listen calmly and without judgement.</p></div>
            <div><span>03</span><strong>CONNECT</strong><p>Help the person reach a trusted adult or qualified professional.</p></div>
          </div>
        </section>

        <section className="lesson-section module5-section module5-takeaways">
          <p className="kicker">16 · KEY TAKEAWAYS</p>
          <h2>Remember What <em>Matters.</em></h2>
          <div className="module5-takeaway-list">{takeaways.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></div>)}</div>
          <div className="module5-closing">“Notice when someone is struggling. Listen with compassion. Connect them to help. A caring response can make a difference.”</div>
        </section>
      </article>

      <SiteFooter />
    </main>
  );
}
