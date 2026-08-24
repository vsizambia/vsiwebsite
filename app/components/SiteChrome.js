import Image from "next/image";

const logo = "/images/vsi logo blue text.png";
const whiteLogo = "/images/VSI LOGO white.png";

const socialLinks = [
  ["Facebook", "https://web.facebook.com/vsizambia", "/icons/facebook.svg"],
  ["Instagram", "https://www.instagram.com/vsizambia", "/icons/instagram.svg"],
  ["YouTube", "https://www.youtube.com/@vsizambia", "/icons/youtube.svg"],
  ["LinkedIn", "https://www.linkedin.com/in/visionary-students-initiative-vsi-0a4472382/", "/icons/linkedin.svg"],
];

const navLinks = [
  ["Discover VSI", "/discover"],
  ["Our work", "/#work"],
  ["Our story", "/story"],
  ["Community", "/community"],
  ["VSI News", "/news"],
  ["Events", "/events"],
  ["Volunteer", "/volunteer"],
  ["Contact", "/#contact"],
];

const adminLinks = [
  ["Volunteer Management", "/admin/volunteers"],
  ["Activity Register", "/admin/activities"],
  ["News Publishing", "/admin/news"],
  ["Events Publishing", "/admin/events"],
  ["Performance", "/admin/performance"],
];

export function SiteHeader({ ctaLabel = "Volunteer", ctaHref = "/volunteer" }) {
  const isAdmin = ctaHref.startsWith("/admin");

  return (
    <header className="site-header">
      <nav className="vsi-top-ribbon" aria-label="VSI social links">
        <div className="vsi-top-ribbon-inner">
          <div className="vsi-top-ribbon-left" aria-hidden="true" />
          <div className="vsi-top-ribbon-right">
            {socialLinks.map(([label, href, icon]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`VSI on ${label}`}>
                <Image src={icon} alt="" width={18} height={18} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </nav>
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
          <summary aria-label="Open navigation menu"><span /></summary>
          <nav className="mobile-menu-panel" aria-label="Mobile navigation">
            {navLinks.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
          </nav>
        </details>
      </div>
      {isAdmin && (
        <nav aria-label="Admin navigation" style={{display:"flex",justifyContent:"center",gap:"8px",flexWrap:"wrap",padding:"10px 20px",background:"#f4f7fa",borderTop:"1px solid rgba(11,48,82,.08)",borderBottom:"1px solid rgba(11,48,82,.10)"}}>
          {adminLinks.map(([label, href]) => <a key={label} href={href} style={{display:"inline-flex",alignItems:"center",padding:"8px 14px",borderRadius:"999px",background:href===ctaHref?"#0B3052":"white",color:href===ctaHref?"white":"#0B3052",border:"1px solid rgba(11,48,82,.14)",fontSize:"13px",fontWeight:700,textDecoration:"none"}}>{label}</a>)}
        </nav>
      )}
    </header>
  );
}

export function SiteFooter({ includeNews = true }) {
  return (
    <footer id="contact">
      <div className="section-shell footer-grid">
        <div className="footer-brand">
          <Image src={whiteLogo} alt="Visionary Students Initiative" width={250} height={94} />
          <p>Promoting policies and initiatives that place students at the centre of national development.</p>
        </div>
        <nav aria-label="Footer navigation" style={{display:"flex",flexDirection:"column",gap:10,alignItems:"flex-start"}}>
          <p className="footer-title">Explore</p>
          <a href="/">Home</a>
          <a href="/discover">Discover VSI</a>
          <a href="/#work">Our work</a>
          <a href="/story">Our story</a>
          <a href="/community">VSI in the Community</a>
          {includeNews && <a href="/news">VSI News <span aria-hidden="true">↗</span></a>}
          <a href="/events">Events <span aria-hidden="true">↗</span></a>
          <a href="/volunteer">Volunteer</a>
        </nav>
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
