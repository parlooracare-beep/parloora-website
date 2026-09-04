"use client"

import * as React from "react"
import Image from "next/image"
import { 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  BookOpen, Search, Filter, Loader2, Edit, Plus, Trash2, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Eye, FileText, CheckCircle2, AlertTriangle, Calendar, Settings 
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getAdminBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from "@/lib/actions/blog"
import { cn } from "@/lib/utils"

export default function AdminBlogPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts, setPosts] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedPost, setSelectedPost] = React.useState<any>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [isCreating, setIsCreating] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editData, setEditData] = React.useState<any>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [activeStatusFilter, setActiveStatusFilter] = React.useState<string>("all")

  const loadPosts = async () => {
    setLoading(true)
    const data = await getAdminBlogPosts()
    setPosts(data)
    setLoading(false)
  }

  React.useEffect(() => {
    loadPosts()
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleViewDetails = (post: any) => {
    setSelectedPost(post)
    setEditData({ ...post })
    setIsEditing(false)
    setIsCreating(false)
    setIsModalOpen(true)
  }

  const handleOpenCreate = () => {
    setSelectedPost(null)
    setEditData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      cover_image: "",
      category: "Beauty Tips",
      tags: [],
      seo_title: "",
      seo_description: "",
      status: "draft"
    })
    setIsEditing(true)
    setIsCreating(true)
    setIsModalOpen(true)
  }

  const handleSaveChanges = async () => {
    if (!editData.title) {
      alert("Please provide an article title.")
      return
    }
    setIsSaving(true)
    if (isCreating) {
      const res = await createBlogPost({
        title: editData.title,
        slug: editData.slug,
        excerpt: editData.excerpt,
        content: editData.content,
        cover_image: editData.cover_image,
        category: editData.category,
        seo_title: editData.seo_title || editData.title,
        seo_description: editData.seo_description || editData.excerpt,
        status: editData.status
      })
      if (res.success && res.data) {
        setIsModalOpen(false)
        loadPosts()
      } else {
        alert("Failed to create blog post: " + (res.error || "Please run database migrations."))
      }
    } else {
      if (!selectedPost?.id) return
      const res = await updateBlogPost(selectedPost.id, {
        title: editData.title,
        slug: editData.slug,
        excerpt: editData.excerpt,
        content: editData.content,
        cover_image: editData.cover_image,
        category: editData.category,
        seo_title: editData.seo_title,
        seo_description: editData.seo_description,
        status: editData.status
      })
      if (res.success) {
        setIsModalOpen(false)
        loadPosts()
      } else {
        alert("Failed to update blog post: " + res.error)
      }
    }
    setIsSaving(false)
  }

  const handleDeletePost = async () => {
    if (!selectedPost?.id) return
    if (!confirm("Are you sure you want to delete this blog post? This action is irreversible.")) return
    setIsSaving(true)
    const res = await deleteBlogPost(selectedPost.id)
    if (res.success) {
      setIsModalOpen(false)
      loadPosts()
    } else {
      alert("Failed to delete post: " + res.error)
    }
    setIsSaving(false)
  }

  const filteredPosts = posts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = activeStatusFilter === "all" || p.status === activeStatusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-600" />
            Blog CMS
          </h2>
          <p className="text-brand-gray-500 text-sm mt-1">Compose articles, manage search engine visibility, and share beauty updates.</p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400" />
            <Input 
              placeholder="Search articles..." 
              className="pl-9 h-10 bg-white border-brand-gray-200 focus-visible:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleOpenCreate} 
            className="bg-brand-gray-900 text-white hover:bg-brand-gray-800 h-10 rounded-xl px-4 font-bold text-xs shadow-md shrink-0 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Article</span>
          </Button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex gap-2 border-b border-brand-gray-200 pb-2">
        {["all", "published", "draft", "scheduled"].map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatusFilter(status)}
            className={cn(
              "px-4 py-2 text-xs font-bold capitalize transition-all border-b-2 -mb-[9px]",
              activeStatusFilter === status 
                ? "border-purple-600 text-purple-600" 
                : "border-transparent text-brand-gray-500 hover:text-brand-gray-800"
            )}
          >
            {status}
          </button>
        ))}
      </div>

      <Card className="border-brand-gray-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="pb-4 border-b border-brand-gray-100 flex flex-row items-center justify-between bg-white">
          <CardTitle className="text-base font-bold text-brand-gray-900">Articles</CardTitle>
          <Badge className="bg-purple-50 text-purple-700 border-purple-200 font-bold">
            Total Articles: {posts.length}
          </Badge>
        </CardHeader>
        <CardContent className="p-0 bg-white">
          {filteredPosts.length === 0 ? (
            <div className="p-12 text-center text-brand-gray-500 flex flex-col items-center bg-white">
              <FileText className="w-12 h-12 text-brand-gray-300 mb-3" />
              <p>No articles found. Click "Create Article" to write your first post.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-brand-gray-50 text-brand-gray-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Article Info</th>
                    <th className="px-6 py-4">Author</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">SEO Checklist</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gray-100 bg-white">
                  {filteredPosts.map((post) => (
                    <tr 
                      key={post.id} 
                      className="hover:bg-brand-gray-50 transition-colors bg-white cursor-pointer"
                      onClick={() => handleViewDetails(post)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-10 rounded bg-brand-gray-50 border border-brand-gray-200 overflow-hidden shrink-0 flex items-center justify-center relative">
                            {post.cover_image ? (
                              <Image src={post.cover_image} alt="" fill className="object-cover" />
                            ) : (
                              <FileText className="w-5 h-5 text-brand-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-brand-gray-900 line-clamp-1">{post.title}</p>
                            <p className="text-[10px] text-brand-gray-400 font-medium mt-0.5">slug: {post.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-brand-gray-700">{post.users?.display_name || "Admin"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="bg-brand-gray-50 text-brand-gray-600 border-brand-gray-200 py-0 h-5">
                          {post.category || "General"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {post.seo_title && post.seo_description ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Optimized
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-600" /> Incomplete
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={cn(
                          "uppercase text-[10px] font-bold border-0 px-2 py-0.5 rounded-full",
                          post.status === "published" ? 'bg-emerald-100 text-emerald-700' :
                          post.status === "scheduled" ? 'bg-blue-100 text-blue-700' : 'bg-brand-gray-100 text-brand-gray-700'
                        )}>
                          {post.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-purple-600 hover:text-purple-700"
                          onClick={() => handleViewDetails(post)}
                        >
                          <Edit className="w-4 h-4 mr-1" /> Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editor Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto border-none shadow-2xl p-6 bg-white rounded-3xl">
          <DialogHeader className="border-b border-brand-gray-100 pb-4 mb-4">
            <DialogTitle className="text-xl font-black text-brand-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              {isCreating ? "Draft New Article" : (isEditing ? "Edit Article" : "View Article")}
            </DialogTitle>
          </DialogHeader>

          {isEditing ? (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-brand-gray-400">Title</Label>
                  <Input 
                    value={editData?.title} 
                    onChange={e => setEditData({...editData, title: e.target.value})} 
                    placeholder="e.g. 5 Skincare Routines for Summer"
                    className="rounded-xl border-brand-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-brand-gray-400">Slug</Label>
                  <Input 
                    value={editData?.slug} 
                    onChange={e => setEditData({...editData, slug: e.target.value})} 
                    placeholder="e.g. 5-skincare-routines-summer"
                    className="rounded-xl border-brand-gray-200"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-brand-gray-400">Category</Label>
                  <select 
                    value={editData?.category}
                    onChange={e => setEditData({...editData, category: e.target.value})}
                    className="w-full h-10 px-3 border border-brand-gray-200 rounded-xl text-xs bg-white outline-none"
                  >
                    <option value="Beauty Tips">Beauty Tips</option>
                    <option value="Skincare Guide">Skincare Guide</option>
                    <option value="Hair Styling">Hair Styling</option>
                    <option value="Wellness & Spa">Wellness & Spa</option>
                    <option value="Product Reviews">Product Reviews</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-brand-gray-400">Status</Label>
                  <select 
                    value={editData?.status}
                    onChange={e => setEditData({...editData, status: e.target.value})}
                    className="w-full h-10 px-3 border border-brand-gray-200 rounded-xl text-xs bg-white outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-brand-gray-400">Cover Image URL</Label>
                <Input 
                  value={editData?.cover_image} 
                  onChange={e => setEditData({...editData, cover_image: e.target.value})} 
                  placeholder="https://images.unsplash.com/..."
                  className="rounded-xl border-brand-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-brand-gray-400">Excerpt / Short Description</Label>
                <Textarea 
                  value={editData?.excerpt} 
                  onChange={e => setEditData({...editData, excerpt: e.target.value})} 
                  placeholder="A compelling intro paragraph..."
                  className="rounded-xl border-brand-gray-200 min-h-[60px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-brand-gray-400">Article Content (Markdown / HTML)</Label>
                <Textarea 
                  value={editData?.content} 
                  onChange={e => setEditData({...editData, content: e.target.value})} 
                  placeholder="Write the full post here..."
                  className="rounded-xl border-brand-gray-200 min-h-[160px] font-mono text-xs"
                />
              </div>

              {/* SEO Configurations */}
              <div className="p-4 bg-brand-gray-50 rounded-2xl border border-brand-gray-200 space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-gray-700 uppercase">
                  <Settings className="w-4 h-4 text-purple-600" /> SEO Search Engine Parameters
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-brand-gray-400">SEO Custom Title</Label>
                  <Input 
                    value={editData?.seo_title} 
                    onChange={e => setEditData({...editData, seo_title: e.target.value})} 
                    placeholder="Defaults to article title if blank"
                    className="rounded-xl bg-white border-brand-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-brand-gray-400">SEO Custom Meta Description</Label>
                  <Textarea 
                    value={editData?.seo_description} 
                    onChange={e => setEditData({...editData, seo_description: e.target.value})} 
                    placeholder="Defaults to excerpt if blank"
                    className="rounded-xl bg-white border-brand-gray-200 min-h-[50px]"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {selectedPost?.cover_image && (
                <div className="w-full h-48 rounded-2xl overflow-hidden border border-brand-gray-100 relative">
                  <Image src={selectedPost.cover_image} alt="" fill className="object-cover" />
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-brand-gray-900 leading-tight">{selectedPost?.title}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="capitalize">{selectedPost?.category}</Badge>
                  <Badge variant="outline" className="capitalize bg-purple-50 text-purple-700 border-purple-100">{selectedPost?.status}</Badge>
                  {selectedPost?.published_at && (
                    <span className="text-xs text-brand-gray-400 flex items-center gap-1 font-semibold ml-auto">
                      <Calendar className="w-3.5 h-3.5" /> {new Date(selectedPost.published_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-brand-gray-400 uppercase tracking-widest mb-1">Excerpt</p>
                <p className="text-xs text-brand-gray-700 italic bg-brand-gray-50 p-3 rounded-xl border border-brand-gray-100">
                  {selectedPost?.excerpt || "No excerpt written."}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-brand-gray-400 uppercase tracking-widest mb-2">Content Draft Preview</p>
                <div className="text-xs text-brand-gray-800 prose whitespace-pre-wrap max-h-48 overflow-y-auto p-4 border border-brand-gray-150 rounded-2xl bg-brand-gray-50/50">
                  {selectedPost?.content || "No body content written."}
                </div>
              </div>

              {/* SEO Summary Card */}
              <div className="p-4 rounded-2xl bg-brand-gray-50 border border-brand-gray-150">
                <p className="text-[10px] font-bold text-brand-gray-400 uppercase tracking-widest mb-2">SEO Status Checklist</p>
                <div className="grid sm:grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    {selectedPost?.seo_title ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                    <span className="text-brand-gray-700">SEO Title Tag: {selectedPost?.seo_title ? "Configured" : "Missing"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedPost?.seo_description ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                    <span className="text-brand-gray-700">Meta Description: {selectedPost?.seo_description ? "Configured" : "Missing"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-brand-gray-100 flex flex-wrap gap-3">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-xl h-11 text-xs font-bold border-brand-gray-200" 
                  onClick={() => {
                    if (isCreating) {
                      setIsModalOpen(false)
                    } else {
                      setIsEditing(false)
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 rounded-xl h-11 text-xs font-black bg-brand-gray-900 hover:bg-brand-gray-800 text-white"
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="rounded-xl h-11 px-3 border-brand-gray-200 text-red-500 hover:bg-red-50"
                  onClick={handleDeletePost}
                  disabled={isSaving}
                  title="Delete Article"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-xl h-11 text-xs font-bold border-brand-gray-200" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </Button>
                <Button 
                  className="flex-1 rounded-xl h-11 text-xs font-black bg-brand-gray-900 hover:bg-brand-gray-800 text-white" 
                  onClick={() => setIsEditing(true)}
                >
                  Edit Article
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
