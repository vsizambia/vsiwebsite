import Image from "next/image";
import { SiteHeader, SiteFooter } from "../components/SiteChrome";

export const metadata = {
  title: "News & Updates",
  description: "Stories, updates and highlights from Visionary Students Initiative's work with young people and communities.",
};

const updates = [["OUR STORY", "From a student idea to a growing movement for national development.", "VSI began at Cavendish University Zambia in 2018 and has grown into a youth-led organisation focused on participation, service and public policy advocacy.", "/images/From Club to NGO.jpg"],["SEVEN YEARS AND BEYOND", "Community service, volunteerism and humanitarian aid.", "VSI is building on years of service while strengthening student participation in national development and stability.", "/images/vsi story Room full of ideas.jpg"],["COMMUNITY ACTION", "Ideas become meaningful when they reach the community.", "From community action to civic learning, VSI brings young people together around practical experiences that build responsibility, confidence and leadership.", "/images/vsi-community-action.jpg"],["VOLUNTEERING", "Discover how your unique skills can drive change.", "VSI volunteers contribute through programme support, school-based activities, community engagement, research, communications and professional skills.", "/images/vsi volunteers charity work.jpg"]];

export default function NewsPage() {
  return (
    <main>
      <SiteHeader />
      <section className="news-hero"><div className="section-shell"><p className="kicker">VSI NEWS &amp; UPDATES</p><h1>Stories from the work, people and ideas shaping VSI.</h1><p>Explore highlights from our journey, community work and opportunities for young people to participate.</p></div></section>
      <section className="news-list section-shell">{updates.map(([label, title, description, img], index) => <article className={`news-feature ${index % 2 ? "reverse" : ""}`} key={title}><div className="news-feature-image"><Image src={img} alt={title} fill sizes="(max-width: 900px) 100vw, 50vw" /></div><div className="news-feature-copy"><span className="update-label">{label}</span><h2>{title}</h2><p>{description}</p><a className="text-link" href="/story">Explore VSI <span aria-hidden="true">→</span></a></div></article>)}</section>
      <section className="news-cta"><div className="section-shell"><p className="kicker light">KEEP CONNECTED</p><h2>Follow the work. Join the movement.</h2><a className="button button-yellow" href="/volunteer">Volunteer with VSI <span aria-hidden="true">↗</span></a></div></section>
      <SiteFooter />
    </main>
  );
}
