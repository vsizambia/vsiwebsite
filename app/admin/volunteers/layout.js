import Image from "next/image";

export const metadata = {
  title: "Volunteer Management | Admin",
  description: "VSI internal volunteer application management.",
  robots: { index: false, follow: false },
};

export default function VolunteerAdminLayout({ children }) {
  return (
    <div className="vsi-admin-root">
      <div className="vsi-admin-brand-mark" aria-hidden="true">
        <Image src="/images/vsi logo blue text.png" alt="" width={150} height={57} priority />
      </div>
      {children}
    </div>
  );
}
