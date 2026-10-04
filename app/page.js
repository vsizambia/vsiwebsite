import "./ribbon.css";
import "./home-experience.css";
import { SiteHeader, SiteFooter } from "./components/SiteChrome";
import HomeExperience from "./components/HomeExperience";

export const metadata = {
  title: "Visionary Students Initiative | Zambia",
  description: "Visionary Students Initiative promotes policies and initiatives that place students and young people at the centre of national development in Zambia.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Visionary Students Initiative | Zambia",
    description: "Promoting policies and initiatives that place students at the centre of national development.",
    url: "https://www.vsizambia.org",
  },
};

export default function Home() {
  return (
    <main className="vsi-home">
      <SiteHeader />
      <HomeExperience />
      <SiteFooter />
    </main>
  );
}
