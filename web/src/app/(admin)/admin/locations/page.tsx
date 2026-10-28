"use client"

import * as React from "react"
import Link from "next/link"
import {
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  Edit,
  Save,
  Loader2,
  Globe,
  Sparkles,
  ExternalLink,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  Building,
  RefreshCw,
  FileText,
  Smartphone,
  Monitor,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import {
  getAllDistrictArticlesAdmin,
  updateDistrictArticle,
  AdminDistrictListItem,
  DistrictAdminMetrics,
} from "@/lib/actions/district-seo"
import { cn } from "@/lib/utils"

export default function AdminLocationsSEOPage() {
  const [articles, setArticles] = React.useState<AdminDistrictListItem[]>([])
  const [metrics, setMetrics] = React.useState<DistrictAdminMetrics | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedDivision, setSelectedDivision] = React.useState<string>("all")
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all")

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [editingArticle, setEditingArticle] = React.useState<AdminDistrictListItem | null>(null)
  const [editFormData, setEditFormData] = React.useState<any>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<"meta" | "content" | "faqs" | "serp">("meta")
  const [serpDevice, setSerpDevice] = React.useState<"desktop" | "mobile">("desktop")

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getAllDistrictArticlesAdmin()
      setArticles(res.articles)
      setMetrics(res.metrics)
    } catch (err) {
      console.error("Error loading district SEO articles:", err)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadData()
  }, [])

  const handleOpenEdit = (art: AdminDistrictListItem) => {
    setEditingArticle(art)
    setEditFormData({
      ...art,
      secondaryKeywordsStr: art.secondaryKeywords.join(", "),
      longTailKeywordsStr: art.longTailKeywords.join(", "),
    })
    setActiveTab("meta")
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!editFormData || !editingArticle) return

    setIsSaving(true)
    const secondaryKeywords = editFormData.secondaryKeywordsStr
      ? editFormData.secondaryKeywordsStr.split(",").map((s: string) => s.trim()).filter(Boolean)
      : editingArticle.secondaryKeywords

    const longTailKeywords = editFormData.longTailKeywordsStr
      ? editFormData.longTailKeywordsStr.split(",").map((s: string) => s.trim()).filter(Boolean)
      : editingArticle.longTailKeywords

    const updates = {
      seoTitle: editFormData.seoTitle,
      metaDescription: editFormData.metaDescription,
      primaryKeyword: editFormData.primaryKeyword,
      secondaryKeywords,
      longTailKeywords,
      featuredImageAlt: editFormData.featuredImageAlt,
      status: editFormData.status,
      h1: editFormData.h1,
      section1_intro: editFormData.section1_intro,
      section2_discovery: editFormData.section2_discovery,
      section3_types: editFormData.section3_types,
      section4_howToChoose: editFormData.section4_howToChoose,
      section5_booking: editFormData.section5_booking,
      section6_localDiscovery: editFormData.section6_localDiscovery,
      section7_tips: editFormData.section7_tips,
      section8_faqs: editFormData.section8_faqs,
      section9_cta: editFormData.section9_cta,
    }

    const res = await updateDistrictArticle(editingArticle.slug, updates)
    setIsSaving(false)

    if (res.success) {
      setIsModalOpen(false)
      loadData()
    } else {
      alert("Failed to save changes: " + res.error)
    }
  }

  // Filter articles
  const filteredArticles = articles.filter((art) => {
    const matchSearch =
      art.districtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.bnName.includes(searchTerm) ||
      art.primaryKeyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.slug.toLowerCase().includes(searchTerm.toLowerCase())

    const matchDivision = selectedDivision === "all" || art.divisionId === selectedDivision
    const matchStatus = selectedStatus === "all" || art.status === selectedStatus

    return matchSearch && matchDivision && matchStatus
  })

  // Calculate live word count for form
  const formWordCount = React.useMemo(() => {
    if (!editFormData) return 0
    const textBlocks = [
      editFormData.h1,
      editFormData.section1_intro,
      editFormData.section2_discovery,
      editFormData.section3_types,
      editFormData.section4_howToChoose,
      editFormData.section5_booking,
      editFormData.section6_localDiscovery,
      editFormData.section7_tips,
      editFormData.section9_cta,
      ...(editFormData.section8_faqs || []).flatMap((f: any) => [f.q, f.a]),
    ].filter(Boolean)
    return textBlocks.join(" ").trim().split(/\s+/).filter(Boolean).length
  }, [editFormData])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm font-semibold text-brand-gray-500">
          Loading 64 District SEO Profiles...
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-16">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary">
              <Globe className="w-3.5 h-3.5" />
              <span>Nationwide Coverage</span>
            </span>
            <Badge variant="outline" className="border-brand-gray-200 text-brand-gray-600">
              64 Districts • 8 Divisions
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-gray-900 tracking-tight">
            District Local SEO CMS
          </h1>
          <p className="text-xs sm:text-sm text-brand-gray-500 font-medium">
            Manage, edit, preview, and track search indexation for all 64 district landing pages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="rounded-xl border-brand-gray-200 hover:bg-brand-gray-50 gap-1.5 text-xs font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>

          <Link
            href="/locations"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-all shadow-sm"
          >
            <span>Public Directory</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── KPI Metric Cards ── */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <Card className="rounded-2xl border-brand-gray-100 shadow-2xs">
            <CardContent className="p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-gray-400 mb-1">
                Total Pages
              </div>
              <div className="text-2xl font-black text-brand-gray-900">{metrics.totalDistricts}</div>
              <div className="text-[11px] text-brand-gray-500 font-medium mt-0.5">All 64 districts</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-brand-gray-100 shadow-2xs">
            <CardContent className="p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
                Published
              </div>
              <div className="text-2xl font-black text-emerald-700">{metrics.publishedCount}</div>
              <div className="text-[11px] text-emerald-600/80 font-medium mt-0.5">Indexed by Google</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-brand-gray-100 shadow-2xs">
            <CardContent className="p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
                Review Ready
              </div>
              <div className="text-2xl font-black text-amber-700">{metrics.reviewReadyCount}</div>
              <div className="text-[11px] text-amber-600/80 font-medium mt-0.5">Ready for rollout</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-brand-gray-100 shadow-2xs">
            <CardContent className="p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-gray-500 mb-1">
                Noindex / Withheld
              </div>
              <div className="text-2xl font-black text-brand-gray-700">{metrics.noindexCount}</div>
              <div className="text-[11px] text-brand-gray-400 font-medium mt-0.5">Preserving domain quality</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-brand-gray-100 shadow-2xs">
            <CardContent className="p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                Total Words
              </div>
              <div className="text-2xl font-black text-primary">
                {metrics.totalWordCount.toLocaleString()}
              </div>
              <div className="text-[11px] text-primary/80 font-medium mt-0.5">
                Avg: {metrics.averageWordCount} w/page
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-brand-gray-100 shadow-2xs">
            <CardContent className="p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
                Health Score
              </div>
              <div className="text-2xl font-black text-blue-700">{metrics.healthScore}%</div>
              <div className="text-[11px] text-blue-600/80 font-medium mt-0.5">Unique & complete meta</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Filters & Search Bar ── */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-brand-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by district name (e.g. Dhaka, Moulvibazar, sylhet), Bangla script, or keyword..."
              className="pl-10 rounded-2xl border-brand-gray-200 text-xs sm:text-sm h-11"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl border border-brand-gray-200 text-xs font-bold text-brand-gray-700 bg-white hover:border-primary focus:outline-hidden"
            >
              <option value="all">All Divisions (8)</option>
              <option value="dhaka">Dhaka Division (13)</option>
              <option value="chattogram">Chattogram Division (11)</option>
              <option value="rajshahi">Rajshahi Division (8)</option>
              <option value="khulna">Khulna Division (10)</option>
              <option value="sylhet">Sylhet Division (4)</option>
              <option value="rangpur">Rangpur Division (8)</option>
              <option value="mymensingh">Mymensingh Division (4)</option>
              <option value="barishal">Barishal Division (6)</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl border border-brand-gray-200 text-xs font-bold text-brand-gray-700 bg-white hover:border-primary focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published (Indexed)</option>
              <option value="review-ready">Review Ready</option>
              <option value="draft">Draft</option>
              <option value="noindex">Noindex</option>
            </select>
          </div>
        </div>

        {/* Status Quick Count Summary */}
        <div className="flex flex-wrap items-center justify-between text-xs text-brand-gray-500 pt-2 border-t border-brand-gray-100">
          <span>
            Showing <strong className="text-brand-gray-900">{filteredArticles.length}</strong> of 64 districts
          </span>
          <span className="text-[11px] text-brand-gray-400">
            Click &apos;Edit&apos; to modify full 9 sections, keywords, or meta tags
          </span>
        </div>
      </div>

      {/* ── All 64 Districts Table ── */}
      <div className="bg-white rounded-3xl border border-brand-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-gray-50/80 border-b border-brand-gray-100 text-brand-gray-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-4 px-4 sm:px-6">District & Division</th>
                <th className="py-4 px-4">Primary Target Keyword</th>
                <th className="py-4 px-3 text-center">Word Count</th>
                <th className="py-4 px-3 text-center">Publication Status</th>
                <th className="py-4 px-3 text-center">Index Directive</th>
                <th className="py-4 px-4 text-center">Health Audit</th>
                <th className="py-4 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gray-100">
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-brand-gray-400 font-medium">
                    No districts found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredArticles.map((art) => {
                  const isPublished = art.status === "published"
                  const isReviewReady = art.status === "review-ready"

                  return (
                    <tr
                      key={art.slug}
                      className="hover:bg-brand-gray-50/60 transition-colors group"
                    >
                      {/* District & Division */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-bold text-sm text-brand-gray-900 group-hover:text-primary transition-colors flex items-center gap-1.5">
                          <span>{art.districtName}</span>
                          <span className="text-xs font-normal text-brand-gray-400">({art.bnName})</span>
                        </div>
                        <div className="text-[11px] text-brand-gray-500 font-medium mt-0.5">
                          {art.divisionName} Division • <span className="font-mono text-brand-gray-400">/locations/{art.slug}</span>
                        </div>
                      </td>

                      {/* Primary Keyword */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-brand-gray-100 font-semibold text-brand-gray-800 text-xs">
                          {art.primaryKeyword}
                        </span>
                        <div className="text-[10px] text-brand-gray-400 mt-1 line-clamp-1">
                          {art.secondaryKeywords.length} secondary keywords
                        </div>
                      </td>

                      {/* Word Count */}
                      <td className="py-4 px-3 text-center">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-bold",
                            art.wordCount >= 950
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          )}
                        >
                          {art.wordCount} words
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-3 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider",
                            isPublished
                              ? "bg-emerald-100 text-emerald-800"
                              : isReviewReady
                              ? "bg-amber-100 text-amber-800"
                              : "bg-brand-gray-100 text-brand-gray-600"
                          )}
                        >
                          {isPublished && <CheckCircle2 className="w-3 h-3" />}
                          {isReviewReady && <Clock className="w-3 h-3" />}
                          <span>{art.status}</span>
                        </span>
                      </td>

                      {/* Index Directive */}
                      <td className="py-4 px-3 text-center">
                        {art.status === "published" ? (
                          <span className="text-[11px] font-bold text-emerald-600 flex items-center justify-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>index, follow</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-brand-gray-400 flex items-center justify-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            <span>noindex, follow</span>
                          </span>
                        )}
                      </td>

                      {/* Health Audit */}
                      <td className="py-4 px-4 text-center">
                        {art.hasMissingMetadata ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Missing Meta</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Complete</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/locations/${art.slug}`}
                            target="_blank"
                            className="p-2 rounded-xl text-brand-gray-400 hover:text-primary hover:bg-primary/5 transition-all"
                            title="Preview Public Page"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEdit(art)}
                            className="rounded-xl border-brand-gray-200 hover:bg-brand-gray-100 text-xs font-bold h-8 px-3 gap-1"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Edit Article Drawer / Modal ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
          <DialogHeader className="border-b border-brand-gray-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  {editingArticle?.divisionName} Division • {editingArticle?.bnName}
                </span>
                <DialogTitle className="text-xl sm:text-2xl font-black text-brand-gray-900 mt-0.5">
                  Edit SEO Profile — {editingArticle?.districtName}
                </DialogTitle>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 bg-brand-gray-100 rounded-full text-brand-gray-700">
                  {formWordCount} words
                </span>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex gap-2 mt-4 pt-2">
              {[
                { id: "meta", label: "Metadata & Keywords" },
                { id: "content", label: "Article Content (Sections 1-7, 9)" },
                { id: "faqs", label: "FAQs (Section 8)" },
                { id: "serp", label: "Google SERP Preview" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-2xs"
                      : "bg-brand-gray-50 text-brand-gray-600 hover:bg-brand-gray-100"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </DialogHeader>

          {editFormData && (
            <div className="space-y-6 pt-2">
              {/* TAB 1: METADATA & KEYWORDS */}
              {activeTab === "meta" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-bold text-brand-gray-700">Publication Status</Label>
                      <select
                        value={editFormData.status}
                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                        className="w-full mt-1.5 px-3 py-2 rounded-xl border border-brand-gray-200 text-xs font-bold bg-white focus:outline-hidden"
                      >
                        <option value="published">Published (Index in Google)</option>
                        <option value="review-ready">Review Ready (Draft with noindex)</option>
                        <option value="draft">Draft (Work in progress)</option>
                        <option value="noindex">Noindex (Keep private)</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs font-bold text-brand-gray-700">Canonical Path</Label>
                      <Input
                        value={editFormData.canonicalUrl}
                        disabled
                        className="mt-1.5 rounded-xl border-brand-gray-200 bg-brand-gray-50 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-brand-gray-700">SEO Title (Target: 50–60 chars)</Label>
                      <span className="text-[11px] font-semibold text-brand-gray-400">
                        {editFormData.seoTitle?.length || 0} characters
                      </span>
                    </div>
                    <Input
                      value={editFormData.seoTitle}
                      onChange={(e) => setEditFormData({ ...editFormData, seoTitle: e.target.value })}
                      placeholder="e.g. Beauty Parlours & Salons in Sylhet | Parloora"
                      className="mt-1.5 rounded-xl border-brand-gray-200 text-xs sm:text-sm font-medium"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-brand-gray-700">Meta Description (Target: 140–160 chars)</Label>
                      <span className="text-[11px] font-semibold text-brand-gray-400">
                        {editFormData.metaDescription?.length || 0} characters
                      </span>
                    </div>
                    <Textarea
                      rows={3}
                      value={editFormData.metaDescription}
                      onChange={(e) => setEditFormData({ ...editFormData, metaDescription: e.target.value })}
                      placeholder="Write natural, compelling snippet for search results..."
                      className="mt-1.5 rounded-xl border-brand-gray-200 text-xs sm:text-sm leading-relaxed"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-brand-gray-700">Primary Target Keyword</Label>
                    <Input
                      value={editFormData.primaryKeyword}
                      onChange={(e) => setEditFormData({ ...editFormData, primaryKeyword: e.target.value })}
                      placeholder="e.g. beauty parlour in Sylhet"
                      className="mt-1.5 rounded-xl border-brand-gray-200 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-brand-gray-700">
                      Secondary Keywords (comma separated)
                    </Label>
                    <Textarea
                      rows={2}
                      value={editFormData.secondaryKeywordsStr}
                      onChange={(e) => setEditFormData({ ...editFormData, secondaryKeywordsStr: e.target.value })}
                      placeholder="e.g. salon in Sylhet, bridal makeup artist Sylhet, men's salon Sylhet..."
                      className="mt-1.5 rounded-xl border-brand-gray-200 text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-brand-gray-700">
                      Long-Tail Keyword Variations (comma separated)
                    </Label>
                    <Textarea
                      rows={2}
                      value={editFormData.longTailKeywordsStr}
                      onChange={(e) => setEditFormData({ ...editFormData, longTailKeywordsStr: e.target.value })}
                      placeholder="e.g. book bridal makeup artist in Sylhet online, ladies beauty parlour near Zindabazar..."
                      className="mt-1.5 rounded-xl border-brand-gray-200 text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-brand-gray-700">Featured Image Alt Text</Label>
                    <Input
                      value={editFormData.featuredImageAlt}
                      onChange={(e) => setEditFormData({ ...editFormData, featuredImageAlt: e.target.value })}
                      placeholder="Descriptive alt text for local parlour image..."
                      className="mt-1.5 rounded-xl border-brand-gray-200 text-xs font-medium"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: ARTICLE SECTIONS 1-7, 9 */}
              {activeTab === "content" && (
                <div className="space-y-5">
                  <div>
                    <Label className="text-xs font-bold text-brand-gray-700">H1 Headline</Label>
                    <Input
                      value={editFormData.h1}
                      onChange={(e) => setEditFormData({ ...editFormData, h1: e.target.value })}
                      className="mt-1 rounded-xl text-xs sm:text-sm font-bold"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-brand-gray-700">
                      Section 1 — Introduction (100–120 words)
                    </Label>
                    <Textarea
                      rows={4}
                      value={editFormData.section1_intro}
                      onChange={(e) => setEditFormData({ ...editFormData, section1_intro: e.target.value })}
                      className="mt-1 rounded-xl text-xs sm:text-sm leading-relaxed"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-brand-gray-700">
                      Section 2 — Discover Beauty and Self-Care Services (120–150 words)
                    </Label>
                    <Textarea
                      rows={5}
                      value={editFormData.section2_discovery}
                      onChange={(e) => setEditFormData({ ...editFormData, section2_discovery: e.target.value })}
                      className="mt-1 rounded-xl text-xs sm:text-sm leading-relaxed"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-brand-gray-700">
                      Section 3 — Types of Providers and Services (130–150 words)
                    </Label>
                    <Textarea
                      rows={5}
                      value={editFormData.section3_types}
                      onChange={(e) => setEditFormData({ ...editFormData, section3_types: e.target.value })}
                      className="mt-1 rounded-xl text-xs sm:text-sm leading-relaxed"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-brand-gray-700">
                      Section 4 — How to Choose a Suitable Provider (120–140 words)
                    </Label>
                    <Textarea
                      rows={5}
                      value={editFormData.section4_howToChoose}
                      onChange={(e) => setEditFormData({ ...editFormData, section4_howToChoose: e.target.value })}
                      className="mt-1 rounded-xl text-xs sm:text-sm leading-relaxed"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-brand-gray-700">
                      Section 5 — Booking Journey through Parloora (100–130 words)
                    </Label>
                    <Textarea
                      rows={4}
                      value={editFormData.section5_booking}
                      onChange={(e) => setEditFormData({ ...editFormData, section5_booking: e.target.value })}
                      className="mt-1 rounded-xl text-xs sm:text-sm leading-relaxed"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-brand-gray-700">
                      Section 6 — Local Discovery in Upazilas (100–130 words)
                    </Label>
                    <Textarea
                      rows={4}
                      value={editFormData.section6_localDiscovery}
                      onChange={(e) => setEditFormData({ ...editFormData, section6_localDiscovery: e.target.value })}
                      className="mt-1 rounded-xl text-xs sm:text-sm leading-relaxed"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-brand-gray-700">
                      Section 7 — Tips for Planning a Beauty Appointment (80–100 words)
                    </Label>
                    <Textarea
                      rows={3}
                      value={editFormData.section7_tips}
                      onChange={(e) => setEditFormData({ ...editFormData, section7_tips: e.target.value })}
                      className="mt-1 rounded-xl text-xs sm:text-sm leading-relaxed"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-brand-gray-700">
                      Section 9 — Call to Action (40–60 words)
                    </Label>
                    <Textarea
                      rows={3}
                      value={editFormData.section9_cta}
                      onChange={(e) => setEditFormData({ ...editFormData, section9_cta: e.target.value })}
                      className="mt-1 rounded-xl text-xs sm:text-sm leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: FAQS SECTION 8 */}
              {activeTab === "faqs" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs font-bold text-brand-gray-700">
                      District Frequently Asked Questions ({editFormData.section8_faqs?.length || 0})
                    </Label>
                  </div>

                  {(editFormData.section8_faqs || []).map((faq: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-brand-gray-50 border border-brand-gray-200/80 space-y-2">
                      <div>
                        <Label className="text-[11px] font-bold text-brand-gray-500">Question {idx + 1}</Label>
                        <Input
                          value={faq.q}
                          onChange={(e) => {
                            const newFaqs = [...editFormData.section8_faqs]
                            newFaqs[idx].q = e.target.value
                            setEditFormData({ ...editFormData, section8_faqs: newFaqs })
                          }}
                          className="mt-1 rounded-xl bg-white text-xs font-bold"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] font-bold text-brand-gray-500">Answer</Label>
                        <Textarea
                          rows={2}
                          value={faq.a}
                          onChange={(e) => {
                            const newFaqs = [...editFormData.section8_faqs]
                            newFaqs[idx].a = e.target.value
                            setEditFormData({ ...editFormData, section8_faqs: newFaqs })
                          }}
                          className="mt-1 rounded-xl bg-white text-xs leading-relaxed"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: GOOGLE SERP PREVIEW */}
              {activeTab === "serp" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-2 border-b border-brand-gray-100">
                    <span className="text-xs font-bold text-brand-gray-700">
                      Google Search Result Snippet Preview
                    </span>
                    <div className="flex gap-1 bg-brand-gray-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setSerpDevice("desktop")}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all",
                          serpDevice === "desktop" ? "bg-white text-brand-gray-900 shadow-2xs" : "text-brand-gray-500"
                        )}
                      >
                        <Monitor className="w-3.5 h-3.5" />
                        <span>Desktop</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSerpDevice("mobile")}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all",
                          serpDevice === "mobile" ? "bg-white text-brand-gray-900 shadow-2xs" : "text-brand-gray-500"
                        )}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Mobile</span>
                      </button>
                    </div>
                  </div>

                  {/* Google Snippet Container */}
                  <div
                    className={cn(
                      "p-6 rounded-2xl bg-white border border-brand-gray-200 font-sans shadow-xs",
                      serpDevice === "mobile" ? "max-w-sm mx-auto" : "max-w-2xl"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">
                        P
                      </div>
                      <div>
                        <div className="text-[12px] text-brand-gray-800 font-medium leading-none">
                          Parloora Bangladesh
                        </div>
                        <div className="text-[11px] text-emerald-800 font-mono leading-none mt-0.5">
                          https://parloora.com/locations/{editFormData.slug}
                        </div>
                      </div>
                    </div>

                    <h3 className="text-lg text-[#1a0dab] hover:underline cursor-pointer font-medium leading-snug mb-1">
                      {editFormData.seoTitle || "Beauty Parlours & Salons in Bangladesh | Parloora"}
                    </h3>

                    <p className="text-xs text-[#4d5156] leading-relaxed">
                      {editFormData.metaDescription || "Explore verified beauty parlours, hair salons, and spas across Bangladesh."}
                    </p>
                  </div>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-brand-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border-brand-gray-200 text-xs font-bold"
                >
                  Cancel
                </Button>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/locations/${editingArticle?.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold text-brand-gray-600 hover:bg-brand-gray-100"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Live</span>
                  </Link>

                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold gap-1.5 shadow-sm px-5"
                  >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save Changes</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
