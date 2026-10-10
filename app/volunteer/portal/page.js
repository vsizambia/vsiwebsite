import VolunteerPortalClient from "./portal-client";
export const metadata = {
  title: "Volunteer Self-Service Portal | VSI",
  description: "Securely view your VSI volunteer profile and monthly membership contribution statement.",
  robots: { index: false, follow: false },
};
export default function VolunteerPortalPage() {
  return <VolunteerPortalClient />;
}
