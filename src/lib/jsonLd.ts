export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ShopiSpy",
    url: "https://www.shopi-spy.com",
    logo: "https://www.shopi-spy.com/images/shopispy-logo-dark.png",
    description:
      "Shopify competitor intelligence tool. Track competitor prices, get alerts on changes, and make data-driven pricing decisions.",
    sameAs: ["https://twitter.com/shopispy"],
  };
}

export function softwareJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ShopiSpy",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "AggregateOffer",
      lowPrice: "0",
      highPrice: "99",
      priceCurrency: "GBP",
      offerCount: 5,
    },
    description:
      "Track your competitors on Shopify. Get alerted when they add new products, change prices, or go out of stock.",
  };
}

export function faqJsonLd(
  items: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function articleJsonLd({
  title,
  description,
  url,
  datePublished,
  dateModified,
  image,
}: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    datePublished,
    dateModified: dateModified || datePublished,
    image: image || "https://www.shopi-spy.com/images/og-default.png",
    author: {
      "@type": "Organization",
      name: "ShopiSpy",
    },
    publisher: {
      "@type": "Organization",
      name: "ShopiSpy",
      logo: {
        "@type": "ImageObject",
        url: "https://www.shopi-spy.com/images/shopispy-logo-dark.png",
      },
    },
  };
}
