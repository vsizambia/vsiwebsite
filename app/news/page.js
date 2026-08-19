import Image from "next/image";

const updates = [
  ["OUR STORY", "From a student idea to a growing movement for national development.", "VSI began at Cavendish University Zambia in 2018 and has grown into a youth-led organisation focused on participation, service and public policy advocacy.", "/images/From Club to NGO.jpg"],
  ["SEVEN YEARS AND BEYOND", "Community service, volunteerism and humanitarian aid.", "VSI is building on years of service while strengthening student participation in national development and stability.", "/images/vsi story Room full of ideas.jpg"],
  ["COMMUNITY ACTION", "Ideas become meaningful when they reach the community.", "From community action to civic learning, VSI brings young people together around practical experiences that build responsibility, confidence and leadership.", "/images/vsi-community-action.jpg"],
  ["VOLUNTEERING", "Discover how your unique skills can drive change.", "VSI volunteers contribute through programme support, school-based activities, community engagement, research, communications and professional skills.", "/images/vsi volunteers charity work.jpg"],
];

const logo = "/images/vsi logo blue text.png";
const whiteLogo = "/images/VSI LOGO white.png";

export default function NewsPage() {
  return (
    <main>
      <header className="site-header">
        <div className="vsi-top-ribbon" aria-label="VSI social links">
          <div className="vsi-top-ribbon-inner">
            <div className="vsi-top-ribbon-left" />
            <div className="vsi-top-ribbon-right">
              <span className="vsi-social-label">Follow us</span>
              <a href="https://web.facebook.com/vsizambia" target="_blank" rel="noreferrer" aria-label="Facebook">Facebook</a>
              <a href="https://www.instagram.com/vsizambia" target="_blank" rel="noreferrer" aria-label="Instagram">Instagram</a>
              <a href="https://www.youtube.com/@vsizambia" target="_blank" rel="noreferrer" aria-label="YouTube">YouTube</a>
              <a href="https://www.linkedin.com/in/visionary-students-initiative-vsi-0a4472382/" target="_blank" rel="noreferrer" aria-label="LinkedIn">LinkedIn</a>
            </div>
          </div>
        </div>
        <div className="nav-shell">
          <a className="brand" href="/"><Image src={logo} alt="Visionary Students Initiative" width={188} height={71} priority /></a>
          <nav className="desktop-nav"><a href="/discover">Discover VSI</a><a href="/#work">Our work</a><a href="/story">Our story</a><a href="/volunteer">Volunteer</a><a href="/#contact">Contact</a></nav>
          <a className="nav-cta" href="/volunteer">Volunteer <span>↗</span></a>
          <details className="mobile-menu">
            <summary aria-label="Open navigation"><span /></summary>
            <div className="mobile-menu-panel"><a href="/discover">Discover VSI</a><a href="/#work">Our work</a><a href="/story">Our story</a><a href="/volunteer">Volunteer</a><a href="/#contact">Contact</a></div>
          </details>
        </div>
      </header>

      <section className="news-hero"><div className="section-shell"><p className="kicker">VSI NEWS &amp; UPDATES</p><h1>Stories from the work, people and ideas shaping VSI.</h1><p>Explore highlights from our journey, community work and opportunities for young people to participate.</p></div></section>

      <section className="news-list section-shell">
        {updates.map(([label, title, description, img], index) => (
          <article className={`news-feature ${index % 2 ? "reverse" : ""}`} key={title}>
            <div className="news-feature-image"><Image src={img} alt={title} fill sizes="(max-width: 900px) 100vw, 50vw" /></div>
            <div className="news-feature-copy"><span className="update-label">{label}</span><h2>{title}</h2><p>{description}</p><a className="text-link" href="/story">Explore VSI <span>→</span></a></div>
          </article>
        ))}
      </section>

      <section className="news-cta"><div className="section-shell"><p className="kicker light">KEEP CONNECTED</p><h2>Follow the work. Join the movement.</h2><a className="button button-yellow" href="/volunteer">Volunteer with VSI <span>↗</span></a></div></section>

      <footer><div className="section-shell footer-grid"><div className="footer-brand"><Image src={whiteLogo} alt="Visionary Students Initiative" width={250} height={94}/><p>Promoting policies and initiatives that place students at the centre of national development.</p></div><div><p className="footer-title">Explore</p><a href="/">Home</a><a href="/#work">Our work</a><a href="/story">Our story</a><a href="/news">News</a><a href="/volunteer">Volunteer</a></div><div><p className="footer-title">Contact</p><a href="mailto:vsizambia@gmail.com">vsizambia@gmail.com</a><a href="tel:+260968623786">+260 968 623 786</a><span>Plot No. 9173, Ben Bella Road<br/>Peace Embassy Building, 1st Floor<br/>Lusaka, Zambia</span></div></div><div className="section-shell footer-bottom"><span>© {new Date().getFullYear()} Visionary Students Initiative</span><span>Made for youth-led change in Zambia.</span></div></footer>
    </main>
  );
}
