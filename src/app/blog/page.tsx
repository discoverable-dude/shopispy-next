import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { getBlogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Shopify competitor intelligence insights, product research guides, and ecommerce strategy. Learn how to track competitors and optimize your pricing.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="mb-12 space-y-4 text-center">
          <Badge variant="secondary" className="border-primary/20 bg-primary/5 px-4 py-2">
            ShopiSpy Blog
          </Badge>
          <h1 className="text-4xl font-bold sm:text-5xl">
            Competitor Intelligence{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Insights
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Guides, strategies, and data-driven insights to help you stay ahead of your Shopify
            competitors.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">
              Blog posts coming soon. Check back for competitor intelligence insights and guides.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <Card className="group border-2 transition-all hover:border-primary/20 hover:shadow-lg">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <time className="text-sm text-muted-foreground">{post.date}</time>
                        {post.tags?.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-muted-foreground">{post.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
