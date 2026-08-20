import Image from "next/image";
import { SiteHeader, SiteFooter } from "../components/SiteChrome";
import { ScrollStory } from "../components/ScrollStory";

export const metadata = {
  title: "VSI in the Community | Youth Growth Project",
  description: "A story from the Youth Growth Project in Luanshya, supporting learners through mental health awareness, community service and volunteerism.",
  alternates: { canonical: "/community" },
  openGraph: { title: "VSI in the Community | Youth Growth Project", description: "A story from the Youth Growth Project in Luanshya, supporting learners through mental health awareness, community service and volunteerism.", url: "https://www.vsizambia.org/community", images: [{ url: "/images/IMG_0090.JPG", alt: "Learners taking part in the Youth Growth Project" }] },
  twitter: { card: "summary_large_image", title: "VSI in the Community | Youth Growth Project", description: "A story from the Youth Growth Project in Luanshya, supporting learners through mental health awareness, community service and volunteerism.", images: ["/images/IMG_0090.JPG"] },
};

const photos = [
  ["/images/IMG_0090.JPG", "Learners taking part in the Youth Growth Project"],
  ["/images/IMG_0319.JPG", "Young people participating in project activities"],
  ["/images/IMG_0361.JPG", "Learners engaged through the project"],
  ["/images/IMG_1632.JPG", "Youth participation in Luanshya"],
  ["/images/IMG_1886.JPG", "Community-focused learning and action"],
  ["/images/IMG_1958.JPG", "Learners and community participants"],
];

const communityPanels = [
  { number: "01", title: "Learning together", text: "Learners engaged through workshops, school clubs and peer-support spaces focused on mental health awareness, community service and volunteerism.", image: photos[0][0], alt: photos[0][1] },
  { number: "02", title: "Community action", text: "Community cleaning activities in Roan Market, Luanshya CBD and Mpatamatu Market turned learning about service into visible participation.", image: photos[1][0], alt: photos[1][1] },
  { number: "03", title: "Wellbeing & confidence", text: "The project created spaces for learners to discuss mental health with peers, guidance teachers and family members while building confidence to participate.", image: photos[2][0], alt: photos[2][1] },
  { number: "04", title: "Young voices", text: "At the end-line workshop, 350 learners from 10 schools shared experiences and expressed their learning through creative work including poetry and a substance-abuse awareness sketch.", image: photos[3][0], alt: photos[3][1] },
];

export default function CommunityPage() {
  return <main><SiteHeader />
    <section className="community-hero"><div className="community-hero-image"><Image src={photos[0][0]} alt={photos[0][1]} fill priority sizes="100vw" /></div><div className="community-hero-overlay"/><div className="section-shell community-hero-content"><p className="kicker light">VSI IN THE COMMUNITY</p><h1>Turning knowledge into <em>action.</em></h1><p>Youth Growth Project · Luanshya, Copperbelt Province</p></div></section>
    <section className="community-intro section-shell"><div><p className="kicker">YOUTH GROWTH PROJECT</p><h2>Creating space for young people to learn, connect, serve and lead.</h2></div><div><p>Through the Youth Growth Project, Visionary Students Initiative worked with learners in Luanshya District around mental health awareness, community service and volunteerism. The project engaged learners through workshops, school clubs, peer support and practical community activities.</p><p>The six-month project was supported by the United States Embassy in Zambia, Public Affairs Section.</p></div></section>
    <section className="community-stats"><div className="section-shell community-stats-grid"><article><strong>2,610</strong><span>learners reached</span></article><article><strong>10</strong><span>school clubs</span></article><article><strong>1,870</strong><span>girls reached</span></article><article><strong>740</strong><span>boys reached</span></article></div></section>
    <ScrollStory eyebrow="THE PROJECT JOURNEY" title="From learning to action." intro="Scroll through how the Youth Growth Project created space for learners to learn, connect, serve and share their voices in Luanshya." panels={communityPanels} className="community-scroll" />
    <section className="community-gallery section-shell"><div className="section-heading-row"><div><p className="kicker">THE PROJECT IN PICTURES</p><h2>People, participation and community action.</h2></div></div><div className="community-gallery-grid">{photos.map(([src,alt])=><figure key={src}><Image src={src} alt={alt} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" /></figure>)}</div></section>
    <section className="community-cta"><div className="section-shell"><p className="kicker light">KEEP THE WORK MOVING</p><h2>Young people are already creating change.</h2><a className="button button-yellow" href="/volunteer">Get involved <span aria-hidden="true">↗</span></a></div></section>
    <SiteFooter /></main>;
}
