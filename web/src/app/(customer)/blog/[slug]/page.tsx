import * as React from "react"
import Image from "next/image"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Metadata } from "next"
import { CalendarDays, Clock, User, Tag, ChevronLeft, ArrowRight, BookOpen } from "lucide-react"
import { getBlogPostBySlug, getRelatedBlogPosts } from "@/lib/actions/blog"
import { formatDate } from "@/lib/utils"

interface Props {
  params: Promise<{ slug: string }>
}

// ─── Dynamic Metadata ──────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) return { title: "Post Not Found – Parloora Blog" }

  return {
    title: `${post.title} – Parloora Beauty Blog`,
    description: post.excerpt || `Read "${post.title}" on the Parloora Beauty Blog.`,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.cover_image ? [{ url: post.cover_image }] : [],
      type: "article",
      publishedTime: post.published_at,
    },
  }
}

// ─── Estimate reading time ─────────────────────────────────────────────────────
function readingTime(content: string) {
  const words = content?.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length ?? 0
  return Math.max(1, Math.ceil(words / 200))
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const post: any = await getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const related: any[] = await getRelatedBlogPosts(slug, post.category, 3)
  const minutes = readingTime(post.content || "")
  const authorName = post.users?.display_name || (post.users?.email?.split("@")[0] ?? "Parloora Editorial")

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            image: post.cover_image,
            datePublished: post.published_at,
            author: { "@type": "Person", name: authorName },
            publisher: { "@type": "Organization", name: "Parloora" },
          }),
        }}
      />

      <div className="min-h-screen bg-white pb-24">
        {/* Hero */}
        <div className="relative overflow-hidden bg-brand-gray-900 text-white">
          {post.cover_image && (
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="absolute inset-0 object-cover opacity-20"
              priority
            />
          )}
          <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-20">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium mb-8 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Blog
            </Link>

            {post.category && (
              <span className="inline-block bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
                {post.category}
              </span>
            )}

            <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight mb-6">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-2xl">{post.excerpt}</p>
            )}

            <div className="flex flex-wrap items-center gap-5 text-white/50 text-sm">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" /> {authorName}
              </span>
              {post.published_at && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4" /> {formatDate(post.published_at)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {minutes} min read
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> Beauty & Wellness
              </span>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {post.cover_image && (
          <div className="max-w-5xl mx-auto px-6 -mt-12 mb-12">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-brand-gray-200 aspect-[16/7]">
              <Image
                src={post.cover_image}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Article body */}
            <article className="lg:col-span-8">
              {post.content ? (
                <div
                  className="prose prose-lg prose-brand max-w-none
                    prose-headings:font-black prose-headings:text-brand-gray-900
                    prose-p:text-brand-gray-600 prose-p:leading-relaxed
                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-brand-gray-900
                    prose-img:rounded-2xl prose-img:shadow-lg
                    prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-2xl prose-blockquote:py-1"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              ) : (
                <p className="text-brand-gray-500 italic">Content coming soon…</p>
              )}

              {/* Tags */}
              {post.tags?.length > 0 && (
                <div className="mt-12 pt-8 border-t border-brand-gray-100">
                  <div className="flex flex-wrap gap-2 items-center">
                    <Tag className="w-4 h-4 text-brand-gray-400" />
                    {post.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="bg-brand-gray-50 text-brand-gray-600 text-xs font-bold px-3 py-1.5 rounded-full border border-brand-gray-100"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Author card */}
              <div className="mt-12 bg-brand-gray-50 rounded-3xl p-8 flex gap-6 items-start border border-brand-gray-100">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-2xl font-black text-primary">
                  {authorName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-brand-gray-400 mb-1">Written by</p>
                  <h4 className="text-lg font-black text-brand-gray-900 mb-2">{authorName}</h4>
                  <p className="text-brand-gray-500 text-sm leading-relaxed">
                    Beauty & wellness expert contributing to the Parloora editorial team. Passionate about connecting people with
                    the best self-care experiences in Bangladesh.
                  </p>
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              <div className="sticky top-28 space-y-8">
                {/* Related posts */}
                {related.length > 0 && (
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-brand-gray-400 mb-5">Related Articles</h3>
                    <div className="space-y-4">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {related.map((r: any) => (
                        <Link
                          key={r.id}
                          href={`/blog/${r.slug}`}
                          className="group flex gap-4 items-start bg-white rounded-2xl p-4 border border-brand-gray-100 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                        >
                          {r.cover_image && (
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                              <Image src={r.cover_image} alt={r.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{r.category}</span>
                            <h4 className="text-sm font-bold text-brand-gray-900 mt-0.5 line-clamp-2 group-hover:text-primary transition-colors">{r.title}</h4>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Parlour CTA */}
                <div className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-6 text-white">
                  <h3 className="text-xl font-black mb-2">Book Your Glow-Up</h3>
                  <p className="text-white/80 text-sm leading-relaxed mb-5">
                    Ready to put these tips into practice? Find top-rated beauty parlours near you.
                  </p>
                  <Link
                    href="/parlours"
                    className="flex items-center justify-center gap-2 bg-white text-primary rounded-xl py-3 font-black text-sm hover:bg-white/90 transition-colors"
                  >
                    Explore Parlours <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Newsletter */}
                <div className="bg-brand-gray-900 rounded-3xl p-6 text-white">
                  <h3 className="text-lg font-black mb-2">Stay in the Know</h3>
                  <p className="text-white/60 text-sm mb-4">Get weekly beauty tips delivered to your inbox.</p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Your email"
                      className="flex-1 bg-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-primary/50 border border-white/10"
                    />
                    <button className="bg-primary text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-primary/90 transition-colors">
                      Go
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Back CTA */}
        <div className="max-w-4xl mx-auto px-6 mt-20 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all"
          >
            <ChevronLeft className="w-5 h-5" /> Back to all articles
          </Link>
        </div>
      </div>
    </>
  )
}
