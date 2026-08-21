import { SiteFooter, SiteHeader } from "../../components/SiteChrome";

export default function VolunteerApplicationLayout({ children }) {
  return (
    <>
      <SiteHeader ctaLabel="Volunteer" ctaHref="/volunteer/apply" />
      {children}
      <SiteFooter />
    </>
  );
}
