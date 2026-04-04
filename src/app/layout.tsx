import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { organizationJsonLd, softwareJsonLd } from "@/lib/jsonLd";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.shopi-spy.com"),
  title: {
    default: "ShopiSpy - Shopify Competitor Intelligence Tool",
    template: "%s | ShopiSpy",
  },
  description:
    "Track your competitors on Shopify. Get alerted when they add new products, change prices, or go out of stock.",
  keywords: [
    "shopify spy tool",
    "shopify competitor analysis",
    "shopify price tracker",
    "shopify product monitor",
    "ecommerce competitor intelligence",
  ],
  authors: [{ name: "ShopiSpy" }],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://www.shopi-spy.com",
    siteName: "ShopiSpy",
    title: "ShopiSpy - Shopify Competitor Intelligence Tool",
    description:
      "Track your competitors on Shopify. Get alerted when they add new products, change prices, or go out of stock.",
    images: [
      {
        url: "/images/og-default.png",
        width: 1200,
        height: 630,
        alt: "ShopiSpy - Shopify Competitor Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@shopispy",
    title: "ShopiSpy - Shopify Competitor Intelligence Tool",
    description:
      "Track your competitors on Shopify. Get alerted when they add new products, change prices, or go out of stock.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareJsonLd()),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <TooltipProvider>
                {children}
                <Toaster />
              </TooltipProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17979059851"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17979059851');
          `}
        </Script>
      </body>
    </html>
  );
}
