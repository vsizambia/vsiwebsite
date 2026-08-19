import Image from "next/image";
import "./ribbon.css";
import { SiteHeader, SiteFooter } from "./components/SiteChrome";

export const metadata = {
  title: "Home",
  description: "Visionary Students Initiative promotes policies and initiatives that place students and young people at the centre of national development in Zambia.",
};

const focusAreas = [
  ["01", "Civic leadership", "Creating space for students to understand, practise and shape civic life.", "/images/Civic leadership.jpg"],
  ["02", "Youth development", "Building confidence, skills, leadership and pathways for young people.", "/images/Youth development 2.webp"],
  ["03", "Community action", "Turning student energy into practical service and community participation.", "/images/cleaning programme.jpg"],
  ["04", "Wellbeing", "Supporting healthier, more resilient and inclusive learning environments.", "/images/vsi mental health.jpg"],
  ["05", "Research & advocacy", "Using evidence, dialogue and youth voices to inform better decisions.", "/images/research.JPG"],
  ["06", "Partnerships", "Working with institutions, communities and partners around shared priorities.", "/images/Partnerships.jpg"],
];

const partners = [
  ["GRZ", "/images/vsi partner grz.jpg"],
  ["IAYSP", "/images/vsi partner iaysp.jpg"],
  ["VicTalk", "/images/vsi partner victalk.jpg"],
  ["ZYDF", "/images/vsi partner zydf.jpg"],
];

export default function Home() {
  const carouselPartners = [...partners, ...partners];
  return (
    <main>
      <SiteHeader />
      <section className="hero"><div className="hero-image"><Image src="/images/vsi-parliament.jpg" alt="Students participating in a civic engagement activity" fill priority sizes="100vw" /></div><div className="hero-overlay" /><div className="section-shell hero-content"><p className="kicker light">VISIONARY STUDENTS INITIATIVE</p><h1><span className="hero-title-desktop">Students at the centre of <em>national development.</em></span><span className="hero-title-mobile">Students at the<br/>centre of <em>national</em><br/><em>development.</em></span></h1><p>We promote policies and initiatives that give young people the knowledge, voice, skills and opportunities to participate meaningfully in Zambia's future.</p><div className="hero-actions"><a className="button button-yellow" href="/discover">Discover VSI <span aria-hidden="true">↗</span></a><a className="button button-primary" href="/story">Our story <span aria-hidden="true">↗</span></a></div></div></section>
      <section className="work" id="work"><div className="work-intro-band"><div className="section-shell intro"><div><h2>Work that helps young people lead, serve and shape change.</h2><p>Our work connects learning with action — creating spaces where young people can develop skills, engage communities, and contribute to national conversations. There is a place for your voice. Volunteer, partner, learn with us or connect with VSI about work that matters to young people.</p><a className="button button-primary" href="/volunteer">Volunteer with VSI <span aria-hidden="true">↗</span></a></div><div className="story-image" style={{minHeight:500}}><Image src="/images/vsi what we stand on 1.jpg" alt="VSI members taking part in community action" fill sizes="(max-width: 900px) 100vw, 50vw" /></div></div></div><div className="section-shell"><div className="focus-grid">{focusAreas.map(([n,t,d,img])=><article className="programme-card" key={t}><div className="programme-image"><Image src={img} alt={`${t} programme`} fill sizes="(max-width: 900px) 100vw, 33vw" /></div><div className="programme-content"><span>{n}</span><h3>{t}</h3><p>{d}</p></div></article>)}</div><div style={{display:"flex",justifyContent:"flex-end",marginTop:38}}><a className="text-link" href="https://web.facebook.com/vsizambia" target="_blank" rel="noopener noreferrer">View all news on Facebook <span aria-hidden="true">↗</span></a></div></div></section>
      <section className="values"><div className="section-shell values-grid"><div><p className="kicker light">OUR APPROACH</p><h2>Young people deserve a seat at the table.</h2></div><div><p>We value integrity, inclusion, service, learning, accountability and meaningful participation. Our approach is collaborative and grounded in the realities of students and communities.</p><a className="button button-yellow" href="/volunteer">Join the movement <span aria-hidden="true">↗</span></a></div></div></section>
      <section className="partners section-shell" id="contact"><div className="section-heading-row partners-heading"><div><p className="kicker">OUR PARTNERS</p><h2>Working together for young people and Zambia's future.</h2></div></div><div className="partners-carousel" aria-label="VSI partners"><div className="partners-track">{carouselPartners.map(([name, src], index) => <div className="partner-logo" key={`${name}-${index}`}><Image src={src} alt={`${name} partner logo`} width={280} height={130} /></div>)}</div></div></section>
      <SiteFooter />
    </main>
  );
}
