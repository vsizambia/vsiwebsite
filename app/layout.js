import "./globals.css";
import "./ribbon.css";
import "./vsi-enhancements.css";
import "./volunteer-enhancements.css";
import "./polish.css";
import "./mobile.css";
import "./accessibility.css";

export const metadata = {
  metadataBase: new URL("https://www.vsizambia.org"),
  title: {
    default: "Visionary Students Initiative | Zambia",
    template: "%s | Visionary Students Initiative",
  },
  description: "Promoting policies and initiatives that place students at the centre of national development.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Visionary Students Initiative",
    title: "Visionary Students Initiative | Zambia",
    description: "Promoting policies and initiatives that place students at the centre of national development.",
    url: "https://www.vsizambia.org/",
    images: [
      {
        url: "/images/vsi-parliament.jpg",
        width: 1600,
        height: 900,
        alt: "Students participating in a civic engagement activity",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Visionary Students Initiative | Zambia",
    description: "Promoting policies and initiatives that place students at the centre of national development.",
    images: ["/images/vsi-parliament.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
