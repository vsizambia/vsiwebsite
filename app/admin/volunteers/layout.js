import "./admin-brand.css";
import "./activity-register.css";

export const metadata = {
  title: "Volunteer Management | Admin",
  description: "VSI internal volunteer application management.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  openGraph: { title: "Volunteer Management | Admin", description: "VSI internal volunteer application management.", url: null, images: [] },
  twitter: { card: "summary", title: "Volunteer Management | Admin", description: "VSI internal volunteer application management.", images: [] },
};

export default function VolunteerAdminLayout({ children }) { return <div className="vsi-admin-root">{children}</div>; }
