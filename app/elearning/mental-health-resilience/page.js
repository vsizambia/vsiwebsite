import "../../elearning.css";
import { SiteHeader, SiteFooter } from "../../components/SiteChrome";

export const metadata = {
  title: "Mental Health Resilience | VSI E-Learning",
  description: "Module 04 teaching notes on mental health, emotional well-being, stress, resilience, burnout and healthy support-seeking for secondary school students.",
  alternates: { canonical: "/elearning/mental-health-resilience" },
};

const emotions = ["Happiness", "Sadness", "Anger", "Fear", "Excitement", "Worry", "Disappointment", "Frustration"];
const stressors = ["Schoolwork and examinations", "Pressure from friends", "Family difficulties", "Bullying", "Financial challenges", "Relationship problems", "Fear about the future", "Conflict at home or school", "Trying to meet other people's expectations"];
const physicalSigns = ["Headaches", "Tiredness", "Muscle tension", "Changes in sleep", "Changes in appetite"];
const emotionalSigns = ["Irritability", "Worry", "Sadness", "Feeling overwhelmed", "Difficulty relaxing"];
const behaviouralSigns = ["Avoiding people", "Losing interest in activities", "Difficulty concentrating", "Becoming unusually quiet or angry", "Changes in school performance"];
const burnoutTools = ["Plan schoolwork realistically", "Take appropriate breaks", "Get enough sleep", "Eat regularly and healthily", "Stay physically active", "Spend time with supportive people", "Make time for enjoyable activities", "Ask for help when schoolwork becomes overwhelming"];
const supportPeople = ["Parent or guardian", "Teacher", "School counsellor", "Older family member", "Community or youth leader", "Health professional"];
const toolkit = ["Talk to someone I trust", "Take a short break", "Practise slow breathing", "Exercise or take a walk", "Listen to music", "Pray or reflect, if this is part of my personal practice", "Organise my schoolwork", "Get enough sleep", "Spend time with supportive friends or family", "Ask a teacher for help"];
const healthyChanges = ["I will organise my study time better.", "I will talk to someone when I am struggling.", "I will make time for adequate rest.", "I will stop keeping every problem to myself.", "I will support a friend who may be going through a difficult time."];
const takeaways = ["Mental health is an important part of overall health.", "Everyone experiences difficult emotions and stressful situations.", "Resilience means learning to cope with challenges and recover from setbacks.", "Stress should be recognised and managed in healthy ways.", "Rest, healthy routines, supportive relationships and asking for help are important.", "We should not shame or judge people who are experiencing emotional difficulties.", "Young people can support one another while also seeking help from trusted adults and professionals.", "Asking for help is a strength, not a weakness."];

function NumberedList({ items, className = "" }) {
  return <div className={`module4-numbered-list ${className}`}>{items.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></div>)}</div>;
}

export default function MentalHealthResiliencePage() {
  return (
    <main>
      <SiteHeader />
      <section className="lesson-hero module4-hero">
        <div className="section-shell">
          <a className="lesson-back" href="/elearning">← Back to E-Learning</a>
          <p className="kicker light">MODULE 04 · VSI E-LEARNING</p>
          <h1>Mental Health <em>Resilience.</em></h1>
          <p className="lesson-subtitle">Simplified Teaching Notes for Secondary School Students</p>
          <div className="lesson-meta">
            <span><strong>2 Hours</strong> Duration</span>
            <span><strong>SDG 3</strong> Good Health and Well-being</span>
            <span><strong>AU Goal 1</strong> Quality of life and well-being</span>
          </div>
        </div>
      </section>

      <article className="lesson-content section-shell module4-content">
        <section className="lesson-section module4-section">
          <p className="kicker">01 · UNDERSTANDING MENTAL HEALTH AND EMOTIONAL WELL-BEING</p>
          <h2>What Is <em>Mental Health?</em></h2>
          <p>Mental health is about how we think, feel and cope with everyday life. Just as we take care of our physical health, we also need to take care of our mental and emotional well-being.</p>
          <div className="module4-benefit-grid">
            {["Understand and manage our emotions", "Handle everyday challenges", "Build healthy relationships", "Make responsible decisions", "Concentrate on schoolwork", "Ask for help when we need it", "Recover from difficult experiences"].map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></div>)}
          </div>
          <div className="module4-remember"><span className="module-label">REMEMBER</span><h3>Having a difficult day does not mean that something is wrong with you.</h3><p>Everyone experiences different emotions and challenges.</p></div>
        </section>

        <section className="lesson-section module4-section">
          <p className="kicker">02 · UNDERSTANDING EMOTIONS</p>
          <h2>Recognise What You <em>Feel.</em></h2>
          <p>Emotions are feelings that we experience in response to different situations.</p>
          <div className="module4-emotion-grid">{emotions.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong></div>)}</div>
          <div className="lesson-note emphasis"><strong>There are no “bad” emotions.</strong><p>What matters is learning to recognise our emotions and respond to them in healthy ways.</p></div>
          <div className="module4-example"><span className="module-label">EXAMPLE · BEFORE AN EXAMINATION</span><div className="module4-example-grid"><div><small>INSTEAD OF THINKING</small><strong>“I cannot do this.”</strong></div><div><small>TRY</small><strong>“I am nervous because this is important to me. I can prepare, take a breath and do my best.”</strong></div></div></div>
        </section>

        <section className="lesson-section module4-section">
          <p className="kicker">03 · STRESS</p>
          <h2>Understand <em>Stress.</em></h2>
          <p>Stress is the body's response to situations that feel difficult, demanding or overwhelming. Some stress can motivate us to prepare and take action. However, too much stress for too long can affect our concentration, sleep, mood, relationships, school performance and physical well-being.</p>
          <div className="module4-stress-effects"><div><span className="module-label">TOO MUCH STRESS CAN AFFECT</span><div className="module4-pill-grid">{["Concentration", "Sleep", "Mood", "Relationships", "School performance", "Physical well-being"].map(item => <span key={item}>{item}</span>)}</div></div><div><span className="module-label">COMMON STRESSORS FOR YOUNG PEOPLE</span><NumberedList items={stressors} className="compact" /></div></div>
        </section>

        <section className="lesson-section module4-section">
          <p className="kicker">04 · BUILDING RESILIENCE</p>
          <h2>What Is <em>Resilience?</em></h2>
          <p>Resilience is the ability to cope with difficulties, adapt to challenges and continue moving forward. Being resilient does not mean that you never feel sad, worried or disappointed. It means learning healthy ways to deal with difficult situations and seeking support when necessary.</p>
          <div className="module4-resilience-example"><span className="module-label">EXAMPLE · A SETBACK CAN BECOME AN OPPORTUNITY TO LEARN</span><h3>A student fails an examination.</h3><div className="module4-step-row">{["Accept the disappointment", "Identify what went wrong", "Ask the teacher for guidance", "Develop a better study plan", "Practise more", "Try again"].map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></div>)}</div><strong className="module4-callout">A setback can become an opportunity to learn.</strong></div>
        </section>

        <section className="lesson-section module4-section">
          <p className="kicker">05 · RECOGNISING STRESS SIGNALS</p>
          <h2>Listen to the Signs From Your <em>Body and Mind.</em></h2>
          <p>Our bodies and minds can give us signs when we are under stress.</p>
          <div className="module4-sign-grid">
            <div className="module4-sign-card"><span className="module-label">PHYSICAL SIGNS</span><NumberedList items={physicalSigns} /></div>
            <div className="module4-sign-card"><span className="module-label">EMOTIONAL SIGNS</span><NumberedList items={emotionalSigns} /></div>
            <div className="module4-sign-card"><span className="module-label">BEHAVIOURAL SIGNS</span><NumberedList items={behaviouralSigns} /></div>
          </div>
          <div className="module4-important"><span className="module-label">IMPORTANT</span><p>If these experiences are persistent, severe or interfering with everyday life, it is important to <strong>talk to a trusted adult or qualified health professional.</strong></p></div>
        </section>

        <section className="lesson-section module4-section">
          <p className="kicker">06 · UNDERSTANDING BURNOUT</p>
          <h2>Rest Is Part of <em>Recovery.</em></h2>
          <p>Burnout can happen when a person experiences prolonged stress without enough rest, recovery or support.</p>
          <div className="module4-burnout-card"><div className="module4-quote">“I am tired all the time, I cannot concentrate, and I don't feel motivated to do anything.”</div><div><span className="module-label">WAYS TO REDUCE THE RISK OF BURNOUT</span><NumberedList items={burnoutTools} /></div></div>
          <div className="module4-remember"><span className="module-label">REMEMBER</span><h3>Rest is not laziness.</h3><p>Rest helps us recover and function better.</p></div>
        </section>

        <section className="lesson-section module4-section">
          <p className="kicker">07 · SIMPLE STRESS-MANAGEMENT TOOLS</p>
          <h2>Small Tools Can Make a <em>Difference.</em></h2>
          <div className="module4-tools-grid">
            <div><span className="module-label">A · SLOW BREATHING</span><h3>Breathe in slowly → pause briefly → breathe out slowly.</h3><p>Repeat several times while focusing on the breathing.</p></div>
            <div><span className="module-label">B · TAKE A SHORT BREAK</span><h3>Step away from the stressful activity.</h3><p>Stretch, walk, drink some water or sit somewhere quiet.</p></div>
            <div><span className="module-label">C · BREAK BIG TASKS INTO SMALL TASKS</span><h3>Ask: “What is the first small thing I can complete?”</h3><p>Turning one large problem into a manageable first step can make action easier.</p></div>
            <div><span className="module-label">D · TALK TO SOMEONE</span><h3>Asking for help is a sign of strength, not weakness.</h3><div className="module4-support-list">{supportPeople.map(item => <span key={item}>{item}</span>)}</div></div>
          </div>
        </section>

        <section className="lesson-section module4-section">
          <p className="kicker">08 · EMOTIONAL REGULATION</p>
          <h2>Recognise. Pause. <em>Choose.</em></h2>
          <p>Emotional regulation means recognising our feelings and choosing healthy ways to respond to them. It does not mean pretending that we do not have emotions.</p>
          <div className="module4-regulation"><div className="module4-regulation-chain"><strong>STOP</strong><span>→</span><strong>BREATHE</strong><span>→</span><strong>THINK</strong><span>→</span><strong>CHOOSE</strong><span>→</span><strong>ACT</strong></div><div className="module4-reflection-questions">{["What am I feeling?", "Why am I feeling this way?", "What might happen if I react immediately?", "What is a healthier response?"].map((item, index) => <p key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</p>)}</div></div>
        </section>

        <section className="lesson-section module4-section module4-reflection">
          <p className="kicker">09 · GUIDED REFLECTION ACTIVITY</p>
          <h2>“How Am I <em>Doing?”</em></h2>
          <p>Give students a few quiet minutes to complete the prompts below. Students do not have to share personal answers with the class.</p>
          <div className="module4-journal-grid">{["Something that makes me happy", "Something that sometimes stresses me", "How does my body feel when I am stressed?", "Something that helps me calm down", "Someone I can talk to when I need support", "One healthy habit I want to develop"].map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}:</strong><div className="journal-line" /></div>)}</div>
        </section>

        <section className="lesson-section module4-section">
          <p className="kicker">10 · MY PERSONAL RESILIENCE TOOLKIT</p>
          <h2>Build Your Own <em>Toolkit.</em></h2>
          <p>Identify at least <strong>five healthy strategies</strong> you can use when facing challenges.</p>
          <div className="module4-check-grid">{toolkit.map((item, index) => <div key={item}><span>☐</span><p>{item}</p><small>{String(index + 1).padStart(2, "0")}</small></div>)}</div>
        </section>

        <section className="lesson-section module4-section">
          <p className="kicker">11 · BUILDING A SUPPORT SYSTEM</p>
          <h2>You Do Not Have to Face Every Challenge <em>Alone.</em></h2>
          <p>Everyone needs people they can turn to. Students should identify trusted people who can provide support.</p>
          <div className="module4-support-network">{[["AT HOME", "A parent, guardian or family member"], ["AT SCHOOL", "A teacher, counsellor or other trusted adult"], ["IN MY COMMUNITY", "A community or youth leader or another trusted person"], ["PROFESSIONAL SUPPORT IF NEEDED", "A qualified health professional"]].map(([title, text]) => <div key={title}><span className="module-label">{title}</span><p>{text}</p><div className="network-line" /></div>)}</div>
          <div className="module4-safety"><span className="module-label">IMPORTANT SAFETY MESSAGE</span><p>If a student feels unsafe, feels unable to cope, or thinks they may hurt themselves or someone else, they should <strong>tell a trusted adult immediately and seek professional help or emergency assistance.</strong></p><p>They should not be expected to handle a serious crisis alone.</p></div>
        </section>

        <section className="lesson-section module4-section">
          <p className="kicker">12 · GROUP DISCUSSION</p>
          <h2>Support Someone Who May Be <em>Struggling.</em></h2>
          <div className="module4-scenario"><span className="module-label">SCENARIO</span><p>A student has several examinations coming up. They are sleeping poorly, constantly worried, becoming irritable and have stopped talking to friends.</p></div>
          <div className="module4-discussion-grid">{["What signs of stress can you identify?", "What might be causing the stress?", "What healthy steps could the student take?", "Who could the student talk to?", "How could friends support the student?"].map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></div>)}</div>
          <div className="lesson-note emphasis"><strong>Key lesson</strong><p>We should support one another rather than judging someone who is struggling.</p></div>
        </section>

        <section className="lesson-section module4-section module4-alignment">
          <p className="kicker">13 · DEVELOPMENT ALIGNMENT</p>
          <h2>Well-being Is Part of <em>Development.</em></h2>
          <div className="module4-alignment-grid">
            <div><span className="module-label">SDG 3 · GOOD HEALTH AND WELL-BEING</span><p>Mental health is an important part of overall health and well-being.</p><ul><li>Take care of emotional well-being.</li><li>Support friends.</li><li>Reduce stigma around mental health.</li><li>Seek help when needed.</li><li>Encourage healthy lifestyles.</li></ul></div>
            <div><span className="module-label">AU AGENDA 2063 · GOAL 1</span><h3>A High Standard of Living, Quality of Life and Well-being</h3><p>Healthy citizens are better able to learn, work, participate in their communities and contribute to national development. Supporting young people's mental and emotional well-being is therefore an important part of building a healthy and productive Zambia.</p></div>
          </div>
        </section>

        <section className="lesson-section module4-section module4-final">
          <p className="kicker">14 · FINAL CLASS ACTIVITY</p>
          <h2>One <em>Healthy Change.</em></h2>
          <p>Each student identifies one healthy change they will make this week.</p>
          <div className="module4-change-list">{healthyChanges.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></div>)}</div>
        </section>

        <section className="lesson-section lesson-takeaways module4-takeaways">
          <p className="kicker">15 · KEY TAKEAWAYS</p>
          <h2>Take Care of Your <em>Mind.</em></h2>
          <div className="focus-list">{takeaways.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></div>)}</div>
          <div className="module4-closing"><p>“Taking care of your mind is just as important as taking care of your body. You do not have to face every challenge alone.”</p></div>
        </section>
      </article>

      <SiteFooter />
    </main>
  );
}
