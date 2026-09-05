import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Metadata } from "next"
import { Sparkles, ArrowRight, Clock, CalendarDays, Search } from "lucide-react"
import { getPublishedBlogPosts } from "@/lib/actions/blog"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Beauty Blog – Parloora | Tips, Trends & Insights",
  description:
    "Expert beauty tips, skincare guides, hair care routines, and the latest wellness trends from the Parloora editorial team.",
}



const CATEGORIES = ["All", "Skincare", "Hair", "Makeup", "Wellness", "Nails", "Lifestyle"]

const CATEGORY_COLORS: Record<string, string> = {
  Skincare: "bg-rose-100 text-rose-700",
  Hair: "bg-amber-100 text-amber-700",
  Makeup: "bg-purple-100 text-purple-700",
  Wellness: "bg-emerald-100 text-emerald-700",
  Nails: "bg-pink-100 text-pink-700",
  Lifestyle: "bg-blue-100 text-blue-700",
}

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts(20)

  const featuredPost = posts[0]
  const restPosts = posts.slice(1)

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* ── Hero Header ─────────────────────────────────────────── */}
      <section className="relative bg-brand-gray-950 text-white overflow-hidden pt-32 pb-20">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 right-0 w-80 h-80 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary border border-primary/30 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Beauty Insights
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6 leading-none">
            The Parloora{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary italic">
              Beauty Blog
            </span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
            Expert tips, trend reports, and wellness guides from Bangladesh's top beauty professionals.
          </p>
        </div>
      </section>

      {/* ── Category Filter (client island could be added; keeping server-renderable) ── */}
      <section className="sticky top-[72px] z-30 bg-white/90 backdrop-blur-xl border-b border-brand-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <span
              key={cat}
              className={`flex-shrink-0 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border cursor-default transition-all ${
                cat === "All"
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                  : "bg-brand-gray-50 text-brand-gray-500 border-brand-gray-100 hover:border-primary/40 hover:text-primary"
              }`}
            >
              {cat}
            </span>
          ))}

          <div className="ml-auto flex-shrink-0 flex items-center gap-2 bg-brand-gray-50 border border-brand-gray-100 rounded-full px-4 py-2">
            <Search className="w-3.5 h-3.5 text-brand-gray-400" />
            <span className="text-xs text-brand-gray-400 font-medium">Search</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 mt-16">
        {/* ── Featured Post ───────────────────────────────────────── */}
        {featuredPost && (
          <section className="mb-20">
            <p className="text-xs font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
              <span className="w-6 h-px bg-primary inline-block" /> Featured Story
            </p>
            <Link href={`/blog/${featuredPost.slug}`} className="group block">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-brand-gray-100 shadow-2xl shadow-brand-gray-100 hover:shadow-primary/10 transition-all duration-500">
                {/* Image */}
                <div className="aspect-[4/3] lg:aspect-auto overflow-hidden relative">
                  <Image
                    src={featuredPost.cover_image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&auto=format&fit=crop&q=80"}
                    alt={featuredPost.title || "Featured Story"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                {/* Content */}
                <div className="bg-brand-gray-900 p-10 lg:p-14 flex flex-col justify-center text-white">
                  <span
                    className={`inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-6 w-fit ${
                      CATEGORY_COLORS[featuredPost.category] ??
                      "bg-primary/20 text-primary"
                    }`}
                  >
                    {featuredPost.category}
                  </span>
                  <h2 className="text-3xl lg:text-4xl font-black leading-tight mb-5 group-hover:text-primary transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-white/60 leading-relaxed mb-8">{featuredPost.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-white/40 text-xs">
                      <CalendarDays className="w-4 h-4" />
                      {formatDate(featuredPost.published_at)}
                    </span>
                    <span className="flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-3 transition-all">
                      Read Article <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}
        {/* ── Post Grid ───────────────────────────────────────────── */}
        <section>
          <p className="text-xs font-black uppercase tracking-widest text-brand-gray-400 mb-8 flex items-center gap-2">
            <span className="w-6 h-px bg-brand-gray-200 inline-block" /> Latest Articles
          </p>
          {posts.length === 0 ? (
            <div className="text-center py-16 bg-brand-gray-50 rounded-3xl border border-brand-gray-100 p-8">
              <Sparkles className="w-10 h-10 text-brand-gray-300 mx-auto mb-3" />
              <p className="text-brand-gray-500 font-medium">No blog posts published yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {restPosts.map((post: any) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                  <article className="bg-white rounded-3xl overflow-hidden border border-brand-gray-100 shadow-lg shadow-brand-gray-50 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-500 h-full flex flex-col">
                    {/* Card image */}
                    <div className="aspect-[16/9] overflow-hidden relative">
                      <Image
                        src={post.cover_image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80"}
                        alt={post.title || "Blog Post"}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>

                    <div className="p-7 flex flex-col flex-1">
                      {/* Meta row */}
                      <div className="flex items-center gap-3 mb-4">
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                            CATEGORY_COLORS[post.category] ?? "bg-primary/10 text-primary"
                          }`}
                        >
                          {post.category}
                        </span>
                        <span className="text-brand-gray-400 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" /> 5 min read
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-black text-brand-gray-900 mb-3 leading-snug group-hover:text-primary transition-colors flex-1">
                        {post.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-brand-gray-500 text-sm leading-relaxed line-clamp-2 mb-5">
                        {post.excerpt}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-brand-gray-50 mt-auto">
                        <span className="text-brand-gray-400 text-xs">
                          {formatDate(post.published_at)}
                        </span>
                        <span className="flex items-center gap-1 text-primary font-bold text-xs group-hover:gap-2 transition-all">
                          Read <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── Newsletter CTA ──────────────────────────────────────── */}
        <section className="mt-24">
          <div className="bg-gradient-to-br from-brand-gray-900 via-brand-gray-800 to-brand-gray-900 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-3xl font-black mb-3">Beauty Tips in Your Inbox</h2>
              <p className="text-white/60 mb-8 max-w-md mx-auto">
                Get our weekly curated newsletter — no spam, just the best beauty & wellness content.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 bg-white/10 rounded-xl px-5 py-3.5 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-primary/50 border border-white/10 text-sm"
                />
                <button className="bg-primary text-white font-black rounded-xl px-8 py-3.5 text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 whitespace-nowrap">
                  Subscribe Free
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
