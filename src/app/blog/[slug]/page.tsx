import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getBlogPost, getBlogPosts } from "@/lib/blog";
import { articleJsonLd } from "@/lib/jsonLd";

export async function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              articleJsonLd({
                title: post.title,
                description: post.description,
                url: `https://www.shopi-spy.com/blog/${slug}`,
                datePublished: post.date,
              })
            ),
          }}
        />

        <Link href="/blog">
          <Button variant="ghost" size="sm" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>

        <article className="space-y-8">
          <header className="space-y-4">
            <div className="flex items-center gap-2">
              <time className="text-sm text-muted-foreground">{post.date}</time>
              {post.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-4xl font-bold leading-tight">{post.title}</h1>
            <p className="text-xl text-muted-foreground">{post.description}</p>
          </header>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        </article>

        <div className="mt-16 rounded-lg border bg-gradient-to-r from-primary/5 to-accent/5 p-8 text-center">
          <h3 className="mb-2 text-xl font-semibold">Ready to spy on your competitors?</h3>
          <p className="mb-4 text-muted-foreground">
            Try ShopiSpy free and start tracking competitor prices today.
          </p>
          <Link href="/scraper">
            <Button className="bg-gradient-to-r from-primary to-accent">Try It Free</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
