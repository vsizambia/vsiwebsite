export default function robots() {
  const baseUrl = "https://www.vsizambia.org";

  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
