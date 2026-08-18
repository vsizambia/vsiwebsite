import Image from "next/image";

const types = [
  ["01", "Programme volunteers", "Support approved VSI programmes and activities with clear roles, outputs and supervision.", "/images/vsi volunteers 2.jpg"],
  ["02", "School-based volunteers", "Support learner-focused activities in schools, with appropriate safeguarding and professional boundaries.", "/images/vsi volunteers 3.jpg"],
  ["03", "Community volunteers", "Help with community awareness, mobilisation, outreach and feedback activities.", "/images/vsi volunteers 4.jpg"],
  ["04", "Youth volunteers", "Build practical experience, confidence, leadership and civic participation through service.", "/images/vsi volunteers 5.jpg"],
  ["05", "Technical & professional", "Contribute skills in research, communications, ICT, governance, facilitation and organisational development.", "/images/vsi volunteers 6.jpg"],
  ["06", "Short-term & event", "Support conferences, campaigns, awareness events, research and public engagement activities.", "/images/vsi volunteers 7.jpg"],
];

const areas = [
  ["01", "Civic leadership", "Facilitation, democratic participation, youth engagement and civic education."],
  ["02", "Mental resilience", "Awareness, resilience-building, peer support and healthy learning environments."],
  ["03", "Youth development", "Leadership, employability, entrepreneurship, digital skills and mentorship."],
  ["04", "Community engagement", "Community mobilisation, outreach, service activities and stakeholder engagement."],
  ["05", "Research & advocacy", "Research, data collection, policy analysis, evidence and advocacy."],
  ["06", "Communications & media", "Website content, social media, photography, videography, design and digital campaigns."],
];

const process = [
  ["01", "Apply", "Tell VSI about yourself, your skills, motivation, availability and areas where you would like to contribute."],
  ["02", "Review", "Applications are reviewed against the needs and selection criteria of the relevant opportunity."],
  ["03", "Prepare", "Selected volunteers receive role information, induction and relevant preparation before deployment."],
  ["04", "Contribute", "Volunteers work within approved assignments, with supervision, support, safeguarding and feedback."],
];

const logo = "/images/vsi logo blue text.png";
const whiteLogo = "/images/VSI LOGO white.png";

export default function Volunteer() {
  return (
    <main>
      <header className="site-header">
        <div className="nav-shell">
          <a className="brand" href="/"><Image src={logo} alt="Visionary Students Initiative" width={188} height={71} priority /></a>
          <nav className="desktop-nav"><a href="/#about">About</a><a href="/#work">Our work</a><a href="/story">Our story</a><a href="/volunteer">Volunteer</a><a href="/#contact">Contact</a></nav>
          <a className="nav-cta" href="#apply">Apply <span>↗</span></a>
        </div>
      </header>

      <section className="volunteer-hero">
        <div className="section-shell volunteer-hero-grid">
          <div className="volunteer-hero-copy">
            <p className="kicker">VOLUNTEER WITH VSI</p>
            <h1>Give your time.<br /><em>Grow your voice.</em></h1>
            <p>Volunteering with VSI is an opportunity to learn, serve, build practical skills and contribute to meaningful work with students, communities and partners across Zambia.</p>
            <div className="hero-actions"><a className="button button-yellow" href="#apply">Start your application <span>→</span></a><a className="text-link" href="#how">How it works</a></div>
          </div>
          <div className="volunteer-hero-image">
            <Image src="/images/vsi volunteers 1.jpg" alt="VSI volunteers working together in the community" fill priority sizes="(max-width:900px) 100vw,48vw" />
            <div className="image-caption"><span>VSI VOLUNTEERS</span><strong>People powering service.</strong></div>
          </div>
        </div>
      </section>

      <section className="volunteer-intro section-shell">
        <div><p className="kicker">A STRUCTURED EXPERIENCE</p><h2>Volunteers are partners in the work — not just extra hands.</h2></div>
        <p>VSI's volunteer approach provides for transparent recruitment, appropriate placement, induction, training, supervision, safeguarding, feedback and recognition. Volunteer engagement is shaped around programme needs and the skills, availability and interests of each volunteer.</p>
      </section>

      <section className="volunteer-action-story section-shell">
        <div className="volunteer-action-image"><Image src="/images/vsi volunteers charity work.jpg" alt="VSI volunteers taking part in community service" fill sizes="(max-width:900px) 100vw,55vw" /></div>
        <div className="volunteer-action-copy"><p className="kicker">VOLUNTEERING IN ACTION</p><h2>From showing up to making a difference.</h2><p>VSI volunteers bring energy, skills and a spirit of service to practical activities. Whether supporting a programme, working with a school, helping a community initiative or contributing professional expertise, every role connects back to meaningful youth participation.</p><a className="text-link" href="#opportunities">Explore programme opportunities <span>→</span></a></div>
      </section>

      <section className="volunteer-types section-shell">
        <div className="section-heading-row"><div><p className="kicker">WAYS TO SERVE</p><h2>Find a way to contribute that fits you.</h2></div><p>Different forms of volunteering can support VSI depending on programme needs, skills, availability and assignment duration.</p></div>
        <div className="volunteer-type-grid">
          {types.map(([n, t, d, img]) => (
            <article className="volunteer-type-card volunteer-photo-card" key={t}>
              <div className="volunteer-type-image"><Image src={img} alt={`${t} with VSI`} fill sizes="(max-width:600px) 100vw, (max-width:900px) 50vw, 33vw" /></div>
              <div className="volunteer-type-content"><span>{n}</span><h3>{t}</h3><p>{d}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="opportunity-section" id="opportunities">
        <div className="section-shell">
          <div className="section-heading-row"><div><p className="kicker light">PROGRAMME OPPORTUNITIES</p><h2>Choose the kind of work you want to grow through.</h2></div><p>Explore areas where volunteer interests can connect with VSI's programme work.</p></div>
          <div className="opportunity-grid">{areas.map(([n, t, d]) => <article key={t}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}</div>
        </div>
      </section>

      <section className="volunteer-process section-shell" id="how">
        <div className="section-heading-row"><div><p className="kicker">HOW IT WORKS</p><h2>A clear path from interest to contribution.</h2></div></div>
        <div className="process-grid">{process.map(([n, t, d]) => <article key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}</div>
      </section>

      <section className="volunteer-standard"><div className="section-shell standard-grid"><div><p className="kicker">WHAT YOU CAN EXPECT</p><h2>Safe. Respectful. Supportive.</h2><p>VSI's volunteer framework emphasises clear information, training and support, fair treatment, appropriate supervision and recognition. Volunteers are also expected to uphold conduct, confidentiality, safeguarding and responsible service.</p></div><div className="standard-list"><div><strong>Training & induction</strong><span>Orientation, safeguarding, safety, communication and reporting.</span></div><div><strong>Supervision</strong><span>Volunteer assignments have clear supervision and reporting arrangements.</span></div><div><strong>Development</strong><span>Mentorship, coaching, feedback, learning and leadership opportunities.</span></div><div><strong>Recognition</strong><span>Appropriate acknowledgement can include certificates and appreciation.</span></div></div></div></section>

      <section className="application-section section-shell" id="apply"><div className="application-card"><div className="application-copy"><p className="kicker">VOLUNTEER WITH VSI</p><h2>Ready to contribute?</h2><p>If you are passionate about youth leadership, community service, civic participation, wellbeing, research, communications or other areas of VSI's work, we would love to hear from you.</p><p>Complete the official VSI volunteer form with your details, interests, skills and availability. The VSI team will review your information and contact you about suitable opportunities.</p><div className="application-note"><strong>Before you apply</strong><span>Volunteer roles may require induction, training, supervision and additional safeguarding or screening depending on the assignment.</span></div></div><div className="form-cta-panel"><div className="form-cta-icon">↗</div><p className="kicker">OFFICIAL VSI FORM</p><h3>Tell us where you can make a difference.</h3><p>Your application is handled through VSI's official Google Form.</p><a className="button button-yellow" href="https://docs.google.com/forms/d/e/1FAIpQLSc_ht3xWqborbPsbkYOR9xFEgOS7nIBJAkascnx0KAtyXbJYQ/viewform" target="_blank" rel="noopener noreferrer">Apply to volunteer <span>↗</span></a><small>The form opens in a new tab.</small></div></div></section>

      <section className="volunteer-cta section-shell"><div><p className="kicker">QUESTIONS?</p><h2>Not sure where you fit yet?</h2><p>Reach out to VSI and the team can guide you toward the right opportunity.</p></div><a className="button button-yellow" href="mailto:vsizambia@gmail.com">Talk to VSI <span>↗</span></a></section>

      <footer><div className="section-shell footer-grid"><div className="footer-brand"><Image src={whiteLogo} alt="Visionary Students Initiative" width={250} height={94}/><p>Promoting policies and initiatives that place students at the centre of national development.</p></div><div><p className="footer-title">Explore</p><a href="/">Home</a><a href="/#work">Our work</a><a href="/story">Our story</a><a href="/volunteer">Volunteer</a></div><div><p className="footer-title">Contact</p><a href="mailto:vsizambia@gmail.com">vsizambia@gmail.com</a><a href="tel:+260968623786">+260 968 623 786</a><span>Plot No. 9173, Ben Bella Road<br/>Peace Embassy Building, 1st Floor<br/>Lusaka, Zambia</span></div></div><div className="section-shell footer-bottom"><span>© {new Date().getFullYear()} Visionary Students Initiative</span><span>Made for youth-led change in Zambia.</span></div></footer>
    </main>
  );
}
