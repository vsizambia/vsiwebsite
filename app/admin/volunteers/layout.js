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

const stickyHeaderCss = `
  .vsi-admin-root{padding-top:116px}
  .vsi-admin-root .site-header{position:fixed!important;top:0!important;left:0!important;right:0!important;width:100%!important;z-index:1000!important;will-change:transform;box-shadow:0 10px 30px rgba(0,53,102,.16)!important}
  @media(max-width:600px){.vsi-admin-root{padding-top:106px}}
`;

export default function VolunteerAdminLayout({ children }) {
  return <div className="vsi-admin-root"><style dangerouslySetInnerHTML={{__html:stickyHeaderCss}} />{children}</div>;
}
