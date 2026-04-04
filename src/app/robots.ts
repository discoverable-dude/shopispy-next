import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/account/", "/api/", "/admin/"],
      },
    ],
    sitemap: "https://www.shopi-spy.com/sitemap.xml",
  };
}
