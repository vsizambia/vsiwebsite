import Image from "next/image";

const focusAreas = [
  ["01", "Civic leadership", "Creating space for students to understand, practise and shape civic life."],
  ["02", "Youth development", "Building confidence, skills, leadership and pathways for young people."],
  ["03", "Community action", "Turning student energy into practical service and community participation."],
  ["04", "Wellbeing", "Supporting healthier, more resilient and inclusive learning environments."],
  ["05", "Research & advocacy", "Using evidence, dialogue and youth voices to inform better decisions."],
  ["06", "Partnerships", "Working with institutions, communities and partners around shared priorities."],
];

export default function Home() {
  return (
    <main>
      <header className="site-header"><div className="nav-shell">
        <a className="brand" href="/"><Image src="/images/vsi-logo.webp" alt="Visionary Students Initiative" width={188} height={71} priority /></a>
        <nav className="desktop-nav"><a href="#about">About</a><a href="#work">Our work</a><a href="#stories">Stories</a><a href="/volunteer">Volunteer</a><a href="#contact">Contact</a></nav>
        <a className="nav-cta" href="/volunteer">Volunteer <span>↗</span></a>
      </div></header>

      <section className="hero"><div className="hero-image"><Image src="/images/vsi-parliament.webp" alt="Students participating in a civic engagement activity" fill priority sizes="100vw" /></div><div className="hero-overlay" />
        <div className="section-shell hero-content"><p className="kicker light">VISIONARY STUDENTS INITIATIVE</p><h1>Students at the centre of <em>national development.</em></h1><p>We promote policies and initiatives that give young people the knowledge, voice, skills and opportunities to participate meaningfully in Zambia's future.</p><div className="hero-actions"><a className="button button-yellow" href="#about">Discover VSI <span>↓</span></a><a className="text-link light-link" href="/volunteer">Volunteer with us <span>↗</span></a></div></div>
      </section>

      <section className="intro section-shell" id="about"><div><p className="kicker">WHO WE ARE</p><h2>A youth-led initiative rooted in participation, service and possibility.</h2></div><div><p>Visionary Students Initiative (VSI) is a Zambian youth-led organisation working to promote policies and initiatives that place students and young people at the centre of national development.</p><p>We create opportunities for learning, leadership, civic participation, community action, research, dialogue and collaboration.</p></div></section>

      <section className="image-story section-shell" id="stories"><div className="story-image"><Image src="/images/vsi-community-action.webp" alt="VSI volunteers taking part in community clean-up action" fill sizes="(max-width: 900px) 100vw, 55vw" /></div><div className="story-copy"><p className="kicker">REAL PEOPLE. REAL COMMUNITIES.</p><h2>Ideas become meaningful when they reach the community.</h2><p>From community action to civic learning, VSI brings young people together around practical experiences that build responsibility, confidence and leadership.</p><a className="text-link" href="#work">Explore our work <span>→</span></a></div></section>

      <section className="work section-shell" id="work"><div className="section-heading-row"><div><p className="kicker">WHAT WE DO</p><h2>Work that helps young people lead, serve and shape change.</h2></div><p>Our work connects learning with action — creating spaces where young people can develop skills, engage communities and contribute to national conversations.</p></div><div className="focus-grid">{focusAreas.map(([n,t,d])=><article key={t}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}</div></section>

      <section className="photo-grid section-shell"><div className="photo-large"><Image src="/images/vsi-conference.webp" alt="VSI conference and public dialogue" fill sizes="(max-width: 900px) 100vw, 50vw" /></div><div className="photo-stack"><div><Image src="/images/vsi-school-programme.webp" alt="VSI school engagement programme" fill sizes="(max-width: 900px) 100vw, 50vw" /></div><div><Image src="/images/vsi-community-dialogue.webp" alt="VSI community dialogue" fill sizes="(max-width: 900px) 100vw, 50vw" /></div></div></section>

      <section className="values"><div className="section-shell values-grid"><div><p className="kicker light">OUR APPROACH</p><h2>Young people deserve a seat at the table.</h2></div><div><p>We value integrity, inclusion, service, learning, accountability and meaningful participation. Our approach is collaborative and grounded in the realities of students and communities.</p><a className="button button-yellow" href="/volunteer">Join the movement <span>↗</span></a></div></div></section>

      <section className="get-involved section-shell" id="contact"><div><p className="kicker">GET INVOLVED</p><h2>There is a place for your voice.</h2><p>Volunteer, partner, learn with us or connect with VSI about work that matters to young people.</p></div><a className="button button-primary" href="/volunteer">Volunteer with VSI <span>↗</span></a></section>

      <footer><div className="section-shell footer-grid"><div className="footer-brand"><Image src="/images/vsi-logo-white.webp" alt="Visionary Students Initiative" width={250} height={94} /><p>Promoting policies and initiatives that place students at the centre of national development.</p></div><div><p className="footer-title">Explore</p><a href="#about">About</a><a href="#work">Our work</a><a href="#stories">Stories</a><a href="/volunteer">Volunteer</a></div><div><p className="footer-title">Contact</p><a href="mailto:vsizambia@gmail.com">vsizambia@gmail.com</a><a href="tel:+260968623786">+260 968 623 786</a><span>Plot No. 9173, Ben Bella Road<br/>Peace Embassy Building, 1st Floor<br/>Lusaka, Zambia</span></div></div><div className="section-shell footer-bottom"><span>© {new Date().getFullYear()} Visionary Students Initiative</span><span>Made for youth-led change in Zambia.</span></div></footer>
    </main>
  );
}
