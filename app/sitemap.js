export default function sitemap() {
  const baseUrl = "https://vsizambia.org";
  const routes = ["/", "/discover", "/story", "/volunteer", "/news"];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: route === "/news" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.8,
  }));
}
