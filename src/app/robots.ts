import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.NODE_ENV === "production";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const isSandbox = siteUrl.includes("sandbox.promptcue.com");

  return {
    rules: {
      userAgent: "*",
      allow: isProduction && !isSandbox ? "/" : "",
      disallow: isProduction && !isSandbox ? "" : "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
