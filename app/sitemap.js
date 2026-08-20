export default function sitemap() {
  const baseUrl = "https://www.vsizambia.org";
  const routes = ["/", "/discover", "/story", "/community", "/volunteer", "/news"];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: route === "/news" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/community" ? 0.9 : 0.8,
  }));
}
