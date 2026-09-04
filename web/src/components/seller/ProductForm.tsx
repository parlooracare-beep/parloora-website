"use client"

import * as React from "react"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { X, Upload, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createProduct, updateProduct } from "@/lib/actions/products"

interface ProductFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product?: any
  onClose: () => void
  onSuccess: () => void
}

export function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const [loading, setLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: product?.name || "",
    brand: product?.brand || "",
    category: product?.category || "Skincare",
    price: product?.price || 0,
    stock: product?.stock || 0,
    description: product?.description || "",
    image_url: product?.image_url || ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = product 
      ? await updateProduct(product.id, formData)
      : await createProduct(formData)

    setLoading(false)
    if (res.success) {
      onSuccess()
      onClose()
    } else {
      alert("Error: " + res.error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-xl font-bold text-brand-gray-900">{product ? "Edit Product" : "Add New Product"}</h3>
            <p className="text-xs text-brand-gray-500 mt-0.5">Fill in the details for your physical product.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-brand-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-brand-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <label className="text-xs font-bold text-brand-gray-700 uppercase tracking-wider">Product Name</label>
              <Input 
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Organic Face Serum" 
                className="rounded-xl border-brand-gray-200 focus:ring-primary"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-gray-700 uppercase tracking-wider">Brand</label>
              <Input 
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g. L'Oreal" 
                className="rounded-xl border-brand-gray-200 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-gray-700 uppercase tracking-wider">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-brand-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {["Skincare", "Haircare", "Makeup", "Fragrance", "Tools"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-gray-700 uppercase tracking-wider">Price (৳)</label>
              <Input 
                required
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="rounded-xl border-brand-gray-200 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-gray-700 uppercase tracking-wider">Stock Level</label>
              <Input 
                required
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="rounded-xl border-brand-gray-200 focus:ring-primary"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <label className="text-xs font-bold text-brand-gray-700 uppercase tracking-wider">Image URL</label>
              <Input 
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://images.unsplash.com/..." 
                className="rounded-xl border-brand-gray-200 focus:ring-primary"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <label className="text-xs font-bold text-brand-gray-700 uppercase tracking-wider">Description</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl border-brand-gray-200 text-sm p-3 focus:ring-primary focus:border-primary min-h-[100px]"
                placeholder="Describe your product..."
              />
            </div>
          </div>
        </form>

        <div className="p-6 border-t bg-brand-gray-50 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl h-12">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-primary hover:bg-primary/90 rounded-xl h-12 font-bold gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {product ? "Update Product" : "Save Product"}
          </Button>
        </div>
      </div>
    </div>
  )
}
