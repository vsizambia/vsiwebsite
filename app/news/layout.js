import "./news.module.css";

export const metadata = {
  title: "News & Updates",
  description: "Stories, updates and highlights from Visionary Students Initiative's work with students, communities and partners.",
  alternates: { canonical: "/news" },
};

export default function NewsLayout({ children }) {
  return children;
}
