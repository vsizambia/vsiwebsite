import Image from "next/image";
import "../community.css";
import "../focus-story.css";
import { SiteHeader, SiteFooter } from "../components/SiteChrome";
import StoryScroll from "../components/StoryScroll";

export const metadata = {
  title: "VSI in the Community | Youth Growth Project",
  description: "A story from the Youth Growth Project in Luanshya, supporting learners through mental health awareness, community service and volunteerism.",
  alternates: { canonical: "/community" },
  openGraph: {
    title: "VSI in the Community | Youth Growth Project",
    description: "A story from the Youth Growth Project in Luanshya, supporting learners through mental health awareness, community service and volunteerism.",
    url: "https://www.vsizambia.org/community",
    images: [{ url: "/images/IMG_0090.JPG", alt: "Learners taking part in the Youth Growth Project" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VSI in the Community | Youth Growth Project",
    description: "A story from the Youth Growth Project in Luanshya, supporting learners through mental health awareness, community service and volunteerism.",
    images: ["/images/IMG_0090.JPG"],
  },
};

const photos = [
  ["/images/IMG_0090.JPG", "Learners taking part in the Youth Growth Project"],
  ["/images/IMG_0319.JPG", "Young people participating in project activities"],
  ["/images/IMG_0361.JPG", "Learners engaged through the project"],
  ["/images/IMG_1632.JPG", "Youth participation in Luanshya"],
  ["/images/IMG_1886.JPG", "Community-focused learning and action"],
  ["/images/IMG_1958.JPG", "Learners and community participants"],
];

const communityScroll = [
  ["01", "Learning & mentorship", "The Youth Growth Project engaged learners through workshops, school clubs, peer support and practical activities around mental health awareness, community service and volunteerism.", photos[0][0], photos[0][1]],
  ["02", "Community action", "Learners connected classroom learning with practical community participation. Community cleaning activities were conducted in Roan Market, Luanshya CBD and Mpatamatu Market.", photos[1][0], photos[1][1]],
  ["03", "Wellbeing & participation", "The project created spaces where learners could discuss mental health with peers, guidance teachers and family members while developing practical experience through community service and volunteerism.", photos[2][0], photos[2][1]],
  ["04", "Sharing what they learned", "The project culminated in an end-line workshop attended by 350 learners from 10 participating schools. Learners shared experiences and presented creative work including poetry and a sketch addressing substance abuse.", photos[3][0], photos[3][1]],
];

export default function CommunityPage() {
  return <main><SiteHeader />
    <section className="community-hero"><div className="community-hero-image"><Image src={photos[0][0]} alt={photos[0][1]} fill priority sizes="100vw" /></div><div className="community-hero-overlay"/><div className="section-shell community-hero-content"><p className="kicker light">VSI IN THE COMMUNITY</p><h1>Turning knowledge into <em>action.</em></h1><p>Youth Growth Project · Luanshya, Copperbelt Province</p></div></section>

    <section className="community-intro section-shell"><div><p className="kicker">YOUTH GROWTH PROJECT</p><h2>Creating space for young people to learn, connect, serve and lead.</h2></div><div><p>Through the Youth Growth Project, Visionary Students Initiative worked with learners in Luanshya District around mental health awareness, community service and volunteerism. The project engaged learners through workshops, school clubs, peer support and practical community activities.</p><p>The six-month project was supported by the United States Embassy in Zambia, Public Affairs Section.</p></div></section>

    <section className="community-stats"><div className="section-shell community-stats-grid"><article><strong>2,610</strong><span>learners reached</span></article><article><strong>10</strong><span>school clubs</span></article><article><strong>1,870</strong><span>girls reached</span></article><article><strong>740</strong><span>boys reached</span></article></div></section>

    <div className="section-shell"><StoryScroll eyebrow="THE PROJECT JOURNEY" title="From learning to action." intro="Scroll through the moments where the Youth Growth Project created space for learners to learn, connect, serve and share what they had learned." items={communityScroll} ariaLabel="Youth Growth Project journey" /></div>

    <div className="community-mobile-story"><section className="community-story community-story-mobile section-shell"><div className="community-story-copy"><p className="kicker">FROM LEARNING TO ACTION</p><h2>Young people putting learning into practice.</h2><p>Project activities connected classroom learning with practical community participation. Learners took part in community service activities and discussions designed to strengthen understanding of mental health, volunteerism and responsible citizenship.</p><p>Community cleaning activities were conducted in Roan Market, Luanshya CBD and Mpatamatu Market, turning service into a visible expression of participation.</p></div><div className="community-story-image"><Image src={photos[1][0]} alt={photos[1][1]} fill sizes="(max-width: 900px) 100vw, 55vw" /></div></section>
    <section className="community-feature community-feature-mobile"><div className="section-shell community-feature-grid"><div className="community-feature-image"><Image src={photos[2][0]} alt={photos[2][1]} fill sizes="(max-width: 900px) 100vw, 55vw" /></div><div><p className="kicker light">COMMUNITY & WELLBEING</p><h2>Building confidence to talk, support and participate.</h2><p>The project created spaces where learners could discuss mental health with peers, guidance teachers and family members, while developing practical experience through community service and volunteerism.</p></div></div></section></div>

    <section className="community-gallery section-shell"><div className="section-heading-row"><div><p className="kicker">THE PROJECT IN PICTURES</p><h2>People, participation and community action.</h2></div></div><div className="community-gallery-grid">{photos.map(([src,alt])=><figure key={src}><Image src={src} alt={alt} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" /></figure>)}</div></section>

    <section className="community-endline"><div className="section-shell community-endline-grid"><div><p className="kicker">THE JOURNEY TOGETHER</p><h2>350 learners came together to share what they had learned.</h2></div><div><p>The project culminated in an end-line workshop attended by 350 learners from 10 participating primary and secondary schools. Learners shared experiences and presented their understanding through creative work including poetry and a sketch addressing substance abuse.</p><p>The workshop also brought together education, health, youth-development and school stakeholders.</p></div></div></section>

    <section className="community-cta"><div className="section-shell"><p className="kicker light">KEEP THE WORK MOVING</p><h2>Young people are already creating change.</h2><a className="button button-yellow" href="/volunteer">Get involved <span aria-hidden="true">↗</span></a></div></section>
    <SiteFooter /></main>;
}
