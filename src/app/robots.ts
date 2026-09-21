import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private trees: nothing here is useful to a crawler.
      disallow: ["/admin", "/account", "/checkout", "/book", "/api"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
