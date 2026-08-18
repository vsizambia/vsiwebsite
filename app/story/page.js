import Image from "next/image";

const logo = "/images/VSI LOGO white and  blue.png";

export default function StoryPage() {
  return (
    <main>
      <header className="site-header"><div className="nav-shell">
        <a className="brand" href="/"><Image src={logo} alt="Visionary Students Initiative" width={188} height={71} priority /></a>
        <nav className="desktop-nav"><a href="/#about">About</a><a href="/#work">Our work</a><a href="/story">Our story</a><a href="/volunteer">Volunteer</a><a href="/#contact">Contact</a></nav>
        <a className="nav-cta" href="/volunteer">Volunteer <span>↗</span></a>
      </div></header>

      <section className="story-page-hero"><div className="section-shell story-page-hero-grid"><div><p className="kicker">THE #VSI STORY</p><h1>From a student idea to a growing movement for <em>national development.</em></h1><p>It started with a bold belief: students should not simply prepare for the future — they should have a meaningful role in shaping it.</p></div><div className="story-page-image"><Image src="/images/vsi-parliament.jpg" alt="VSI civic engagement at Parliament" fill priority sizes="(max-width: 900px) 100vw, 50vw" /></div></div></section>

      <section className="story-timeline section-shell">
        <div className="story-year"><span>16 AUGUST 2018</span><div><p className="kicker">THE BEGINNING</p><h2>It all started at Cavendish University Zambia.</h2><p>It all started on August 16th, 2018, at Cavendish University Zambia. That's when #VSI was born, with a bold mission to redefine student participation in national development through community service.</p></div></div>
        <div className="story-year"><span>THE LAUNCH</span><div><p className="kicker">A ROOM FULL OF IDEAS</p><h2>A launch shaped by people who believed in possibility.</h2><p>Our launch event brought together inspiring voices. Br. Erasto Chanda from CUZ management emphasised academic excellence and market-relevant courses. Mrs. Tiwonge Zyambo of Velcro HR Consultancy and Madam Lusungu Ndlovu shared insights on human resources and the need for students to develop innovative skills. Public policy specialist Mr. Stephen Nyoni, poet George Samuel Phiri, and Beatrice Phiri — who spoke passionately about climate change and environmental protection — also contributed to the conversation.</p></div></div>
        <div className="story-photo-band"><div><Image src="/images/Youth development.jpg" alt="VSI youth development activity" fill sizes="(max-width: 900px) 100vw, 50vw" /></div><div><Image src="/images/vsi outreach (1).jpg" alt="VSI outreach activity" fill sizes="(max-width: 900px) 100vw, 50vw" /></div></div>
        <div className="story-year"><span>THE JOURNEY</span><div><p className="kicker">FROM CLUB TO NGO</p><h2>What began as a small club has grown into a thriving NGO.</h2><p>Fast forward to today, what began as a small club at CUZ has grown into a thriving NGO. We've made significant contribution to national development through public policy advocacy and service provision, partnering with government ministries, departments, and agencies.</p><p>Our community work has also advanced the United Nations' Sustainable Development Goals (SDGs) 1, 2, 3, 4, 6, 11, 13, and 17.</p></div></div>
        <div className="story-highlight"><p className="kicker">SEVEN YEARS AND BEYOND</p><h2>Community service. Volunteerism. Humanitarian aid. And another seven years of dedication ahead.</h2><p>As we celebrate 7 years of community service, volunteerism, and humanitarian aid, we're excited to embark on another 7 years of dedication to strengthening student participation in national development and stability.</p></div>
      </section>

      <section className="story-next"><div className="section-shell"><p className="kicker light">KEEP THE STORY MOVING</p><h2>There is more to build — and more young people to bring to the table.</h2><a className="button button-yellow" href="/volunteer">Be part of VSI <span>↗</span></a></div></section>

      <footer><div className="section-shell footer-grid"><div className="footer-brand"><Image src={logo} alt="Visionary Students Initiative" width={250} height={94} /><p>Promoting policies and initiatives that place students at the centre of national development.</p></div><div><p className="footer-title">Explore</p><a href="/">Home</a><a href="/#work">Our work</a><a href="/story">Our story</a><a href="/volunteer">Volunteer</a></div><div><p className="footer-title">Contact</p><a href="mailto:vsizambia@gmail.com">vsizambia@gmail.com</a><a href="tel:+260968623786">+260 968 623 786</a><span>Plot No. 9173, Ben Bella Road<br/>Peace Embassy Building, 1st Floor<br/>Lusaka, Zambia</span></div></div><div className="section-shell footer-bottom"><span>© {new Date().getFullYear()} Visionary Students Initiative</span><span>Made for youth-led change in Zambia.</span></div></footer>
    </main>
  );
}