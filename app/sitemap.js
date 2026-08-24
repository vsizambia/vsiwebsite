export default function sitemap() {
  const baseUrl = "https://www.vsizambia.org";
  const routes = ["/", "/discover", "/story", "/community", "/volunteer", "/news", "/events"];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: route === "/news" || route === "/events" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/community" ? 0.9 : route === "/events" || route === "/news" ? 0.9 : 0.8,
  }));
}
