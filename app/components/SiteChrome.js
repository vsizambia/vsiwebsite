import Image from "next/image";

const logo = "/images/vsi logo blue text.png";
const whiteLogo = "/images/VSI LOGO white.png";

const socialLinks = [
  ["Facebook", "https://web.facebook.com/vsizambia"],
  ["Instagram", "https://www.instagram.com/vsizambia"],
  ["YouTube", "https://www.youtube.com/@vsizambia"],
  ["LinkedIn", "https://www.linkedin.com/in/visionary-students-initiative-vsi-0a4472382/"],
];

const navLinks = [
  ["Discover VSI", "/discover"],
  ["Our work", "/#work"],
  ["Our story", "/story"],
  ["Volunteer", "/volunteer"],
  ["Contact", "/#contact"],
];

export function SiteHeader({ ctaLabel = "Volunteer", ctaHref = "/volunteer" }) {
  return (
    <header className="site-header">
      <div className="vsi-top-ribbon" aria-label="VSI social links">
        <div className="vsi-top-ribbon-inner">
          <div className="vsi-top-ribbon-left" />
          <div className="vsi-top-ribbon-right">
            <span className="vsi-social-label">Follow us</span>
            {socialLinks.map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="nav-shell">
        <a className="brand" href="/" aria-label="Visionary Students Initiative home">
          <Image src={logo} alt="Visionary Students Initiative" width={188} height={71} priority />
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navLinks.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
        </nav>
        <a className="nav-cta" href={ctaHref}>
          {ctaLabel} <span aria-hidden="true">↗</span>
        </a>
        <details className="mobile-menu">
          <summary aria-label="Open navigation"><span /></summary>
          <div className="mobile-menu-panel">
            {navLinks.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
          </div>
        </details>
      </div>
    </header>
  );
}

export function SiteFooter({ includeNews = true }) {
  return (
    <footer>
      <div className="section-shell footer-grid">
        <div className="footer-brand">
          <Image src={whiteLogo} alt="Visionary Students Initiative" width={250} height={94} />
          <p>Promoting policies and initiatives that place students at the centre of national development.</p>
        </div>
        <div>
          <p className="footer-title">Explore</p>
          <a href="/">Home</a>
          <a href="/discover">Discover VSI</a>
          <a href="/#work">Our work</a>
          <a href="/story">Our story</a>
          {includeNews && <a href="/news">News</a>}
          <a href="/volunteer">Volunteer</a>
        </div>
        <div>
          <p className="footer-title">Contact</p>
          <a href="mailto:vsizambia@gmail.com">vsizambia@gmail.com</a>
          <a href="tel:+260968623786">+260 968 623 786</a>
          <span>Plot No. 9173, Ben Bella Road<br />Peace Embassy Building, 1st Floor<br />Lusaka, Zambia</span>
        </div>
      </div>
      <div className="section-shell footer-bottom">
        <span>© {new Date().getFullYear()} Visionary Students Initiative</span>
        <span>Made for youth-led change in Zambia.</span>
      </div>
    </footer>
  );
}
