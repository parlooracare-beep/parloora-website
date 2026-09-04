"use client"

import * as React from "react"
import NextImage from "next/image"
import { 
  Image as ImageIcon, FileText, Search, Loader2, UploadCloud, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Copy, Check, Trash2, Eye, ExternalLink, Filter, HelpCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getMediaFiles, uploadMediaFile, deleteMediaFile } from "@/lib/actions/media"
import { cn } from "@/lib/utils"

export default function AdminMediaPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [files, setFiles] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [activeTab, setActiveTab] = React.useState<"all" | "images" | "docs">("all")
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null)
  const [uploading, setUploading] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedFile, setSelectedFile] = React.useState<any>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const loadFiles = async () => {
    setLoading(true)
    const data = await getMediaFiles()
    setFiles(data)
    setLoading(false)
  }

  React.useEffect(() => {
    loadFiles()
  }, [])

  const handleCopyLink = (url: string, index: number) => {
    navigator.clipboard.writeText(url)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    setUploading(true)
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      
      // Convert to base64
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(",")[1]
          resolve(base64String)
        }
      })
      reader.readAsDataURL(file)
      const base64Data = await base64Promise

      const res = await uploadMediaFile(file.name, base64Data, file.type)
      if (!res.success) {
        alert(`Failed to upload ${file.name}: ${res.error || "Please run migration SQL for parloora-media storage bucket."}`)
      }
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
    loadFiles()
  }

  const handleDelete = async (fileName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${fileName}"?`)) return
    setIsDeleting(true)
    const res = await deleteMediaFile(fileName)
    if (res.success) {
      setSelectedFile(null)
      loadFiles()
    } else {
      alert("Failed to delete asset: " + res.error)
    }
    setIsDeleting(false)
  }

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase())
    const mime = file.metadata?.mimetype || ""
    const isImage = mime.startsWith("image/")
    
    if (activeTab === "images") return matchesSearch && isImage
    if (activeTab === "docs") return matchesSearch && !isImage
    return matchesSearch
  })

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-gray-900 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-purple-600" />
            Media Library
          </h2>
          <p className="text-brand-gray-500 text-sm mt-1">Upload and manage visual media assets for services, products, and blogs.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400" />
            <Input 
              placeholder="Search assets..." 
              className="pl-9 h-10 bg-white border-brand-gray-200 focus-visible:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            multiple 
            accept="image/*,application/pdf,application/msword"
          />
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={uploading}
            className="bg-brand-gray-900 text-white hover:bg-brand-gray-800 h-10 rounded-xl px-4 font-bold text-xs shadow-md shrink-0 flex items-center gap-1.5"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Upload Assets</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-3 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-brand-gray-200 pb-2">
            {[
              { id: "all", label: "All Media" },
              { id: "images", label: "Images" },
              { id: "docs", label: "Documents" }
            ].map((tab) => (
              <button
                key={tab.id}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-4 py-2 text-xs font-bold capitalize transition-all border-b-2 -mb-[9px]",
                  activeTab === tab.id 
                    ? "border-purple-600 text-purple-600" 
                    : "border-transparent text-brand-gray-500 hover:text-brand-gray-800"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-[40vh]">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <Card className="border-brand-gray-200 shadow-sm p-12 text-center text-brand-gray-500 bg-white">
              <UploadCloud className="w-12 h-12 text-brand-gray-300 mx-auto mb-3" />
              <p className="font-bold text-brand-gray-900">No assets found</p>
              <p className="text-xs text-brand-gray-400 mt-1">Upload images or documents to populate your media library.</p>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredFiles.map((file, i) => {
                const mime = file.metadata?.mimetype || ""
                const isImage = mime.startsWith("image/")
                return (
                  <div 
                    key={file.id || i}
                    onClick={() => setSelectedFile(file)}
                    className={cn(
                      "group border rounded-2xl overflow-hidden bg-white cursor-pointer hover:shadow-md transition-all flex flex-col relative",
                      selectedFile?.name === file.name ? "border-purple-600 ring-2 ring-purple-600/20" : "border-brand-gray-250"
                    )}
                  >
                    <div className="aspect-square bg-brand-gray-50 relative flex items-center justify-center overflow-hidden border-b border-brand-gray-100">
                      {isImage ? (
                        <NextImage src={file.url} alt={file.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <FileText className="w-12 h-12 text-brand-gray-400" />
                      )}
                      
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 rounded-full bg-white text-brand-gray-900 hover:bg-brand-gray-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(file.url, "_blank")
                          }}
                          title="Open Link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 rounded-full bg-white text-brand-gray-900 hover:bg-brand-gray-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCopyLink(file.url, i)
                          }}
                          title="Copy Public URL"
                        >
                          {copiedIndex === i ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 text-left">
                      <p className="text-xs font-bold text-brand-gray-950 truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-[10px] text-brand-gray-400 font-medium mt-0.5">
                        {formatSize(file.metadata?.size)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Sidebar details panel */}
        <div className="lg:col-span-1">
          <Card className="border-brand-gray-200 shadow-sm bg-white rounded-3xl sticky top-6">
            <CardHeader className="border-b border-brand-gray-100">
              <CardTitle className="text-base font-bold text-brand-gray-900">Asset Info</CardTitle>
              <CardDescription>Select an asset to view metadata details.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              {selectedFile ? (
                <div className="space-y-4">
                  <div className="aspect-video bg-brand-gray-50 rounded-xl overflow-hidden border border-brand-gray-150 flex items-center justify-center">
                    {(selectedFile.metadata?.mimetype || "").startsWith("image/") ? (
                      <NextImage src={selectedFile.url} alt="" fill className="object-cover" />
                    ) : (
                      <FileText className="w-16 h-16 text-brand-gray-400" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-brand-gray-400 uppercase">File Name</p>
                    <p className="text-xs font-bold text-brand-gray-800 break-all">{selectedFile.name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-brand-gray-400 uppercase">Size</p>
                      <p className="text-xs font-semibold text-brand-gray-700">{formatSize(selectedFile.metadata?.size)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-brand-gray-400 uppercase">Mime Type</p>
                      <p className="text-xs font-semibold text-brand-gray-700">{selectedFile.metadata?.mimetype || "unknown"}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-brand-gray-400 uppercase">Uploaded At</p>
                    <p className="text-xs font-semibold text-brand-gray-700">
                      {selectedFile.created_at ? new Date(selectedFile.created_at).toLocaleString() : "N/A"}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-brand-gray-100">
                    <p className="text-[10px] font-bold text-brand-gray-400 uppercase">Asset Public Link</p>
                    <div className="flex gap-1.5">
                      <Input 
                        value={selectedFile.url} 
                        readOnly 
                        className="h-9 text-xs rounded-xl bg-brand-gray-50 border-brand-gray-250 select-all" 
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9 px-2 border-brand-gray-250 rounded-xl"
                        onClick={() => handleCopyLink(selectedFile.url, 9999)}
                      >
                        {copiedIndex === 9999 ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    variant="destructive" 
                    disabled={isDeleting}
                    className="w-full bg-red-650 hover:bg-red-700 text-white rounded-xl h-10 font-bold text-xs mt-4 flex items-center justify-center gap-1.5"
                    onClick={() => handleDelete(selectedFile.name)}
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    <span>Delete Permanently</span>
                  </Button>
                </div>
              ) : (
                <div className="py-8 text-center text-brand-gray-400 flex flex-col items-center">
                  <HelpCircle className="w-8 h-8 text-brand-gray-300 mb-2" />
                  <p className="text-xs">No asset currently selected.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
