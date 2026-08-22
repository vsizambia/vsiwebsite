import "./globals.css";
import "./ribbon.css";
import "./vsi-enhancements.css";
import "./volunteer-enhancements.css";
import "./polish.css";
import "./mobile.css";
import "./accessibility.css";
import "./qa.css";
import "./admin-dob.css";

const siteUrl = "https://www.vsizambia.org";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Visionary Students Initiative | Zambia",
    template: "%s | Visionary Students Initiative",
  },
  description: "Promoting policies and initiatives that place students at the centre of national development.",
  alternates: { canonical: "/" },
  icons: {
    icon: "/images/vsi logo blue text.png",
    shortcut: "/images/vsi logo blue text.png",
    apple: "/images/vsi logo blue text.png",
  },
  openGraph: {
    type: "website",
    siteName: "Visionary Students Initiative",
    title: "Visionary Students Initiative | Zambia",
    description: "Promoting policies and initiatives that place students at the centre of national development.",
    url: siteUrl,
    images: [{ url: "/images/vsi-parliament.jpg", width: 1600, height: 900, alt: "Students participating in a civic engagement activity" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Visionary Students Initiative | Zambia",
    description: "Promoting policies and initiatives that place students at the centre of national development.",
    images: ["/images/vsi-parliament.jpg"],
  },
  robots: { index: true, follow: true },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Visionary Students Initiative",
  alternateName: "VSI",
  url: siteUrl,
  logo: `${siteUrl}/images/vsi logo blue text.png`,
  description: "A Zambian youth-led organisation working to promote policies and initiatives that place students and young people at the centre of national development.",
  email: "vsizambia@gmail.com",
  telephone: "+260968623786",
  sameAs: [
    "https://web.facebook.com/vsizambia",
    "https://www.instagram.com/vsizambia",
    "https://www.youtube.com/@vsizambia",
    "https://www.linkedin.com/in/visionary-students-initiative-vsi-0a4472382/",
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Plot No. 9173, Ben Bella Road, Peace Embassy Building, 1st Floor",
    addressLocality: "Lusaka",
    addressCountry: "ZM",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <div id="main-content">{children}</div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      </body>
    </html>
  );
}
