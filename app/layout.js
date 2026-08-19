import "./globals.css";
import "./ribbon.css";
import "./vsi-enhancements.css";
import "./volunteer-enhancements.css";
import "./polish.css";
import "./mobile.css";

export const metadata = {
  title: "Visionary Students Initiative | Zambia",
  description: "Promoting policies and initiatives that place students at the centre of national development.",
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
