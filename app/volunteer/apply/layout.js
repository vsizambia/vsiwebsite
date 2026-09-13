import { SiteFooter, SiteHeader } from "../../components/SiteChrome";
import VolunteerApplicationTurnstile from "./VolunteerApplicationTurnstile";

export default function VolunteerApplicationLayout({ children }) {
  return (
    <>
      <SiteHeader ctaLabel="Volunteer" ctaHref="/volunteer/apply" />
      {children}
      <VolunteerApplicationTurnstile />
      <SiteFooter />
    </>
  );
}
