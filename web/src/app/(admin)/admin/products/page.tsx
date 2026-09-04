"use client"

import * as React from "react"
import Image from "next/image"
import { Package, Search, Filter, Loader2, Store, Box, AlertTriangle, Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getAdminProducts, updateAdminProduct, createAdminProduct, deleteAdminEntity } from "@/lib/actions/admin"
import { cn, formatCurrency } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function AdminProductsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [isCreating, setIsCreating] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editData, setEditData] = React.useState<any>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleViewDetails = (product: any) => {
    setSelectedProduct(product)
    setEditData({ ...product })
    setIsEditing(false)
    setIsCreating(false)
    setIsModalOpen(true)
  }

  const handleOpenCreate = () => {
    setSelectedProduct(null)
    setEditData({
      name: "",
      price: "",
      stock: "",
      brand: "",
      category: "Skincare",
      description: "",
      image_url: ""
    })
    setIsEditing(true)
    setIsCreating(true)
    setIsModalOpen(true)
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    if (isCreating) {
      const res = await createAdminProduct({
        name: editData.name,
        price: parseFloat(editData.price || 0),
        stock: parseInt(editData.stock || 0),
        brand: editData.brand,
        category: editData.category,
        description: editData.description,
        is_active: true
      })
      if (res.success && res.data) {
        setProducts([res.data, ...products])
        setIsModalOpen(false)
      } else {
        alert("Failed to create product: " + (res.error || "Please run migration SQL first."))
      }
    } else {
      if (!selectedProduct?.id) return
      const res = await updateAdminProduct(selectedProduct.id, {
        name: editData.name,
        price: parseFloat(editData.price || 0),
        stock: parseInt(editData.stock || 0),
        brand: editData.brand,
        description: editData.description
      })
      if (res.success) {
        setProducts(products.map(p => p.id === selectedProduct.id ? { ...p, ...editData } : p))
        setSelectedProduct({ ...selectedProduct, ...editData })
        setIsEditing(false)
      } else {
        alert("Failed to save changes")
      }
    }
    setIsSaving(false)
  }

  const handleDeleteProduct = async () => {
    if (!selectedProduct?.id) return
    if (!confirm("Are you sure you want to delete this product from the platform?")) return
    setIsSaving(true)
    const res = await deleteAdminEntity("products", selectedProduct.id)
    if (res.success) {
      setProducts(products.filter(p => p.id !== selectedProduct.id))
      setIsModalOpen(false)
    } else {
      alert("Failed to delete product: " + res.error)
    }
    setIsSaving(false)
  }

  React.useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getAdminProducts()
      setProducts(data)
      setLoading(false)
    }
    load()
  }, [])


  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.parlours?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <Package className="w-6 h-6 text-blue-600" />
            Product Catalog
          </h2>
          <p className="text-brand-gray-500 text-sm mt-1">Monitor and manage retail products sold by parlours.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400" />
            <Input 
              placeholder="Search product, brand..." 
              className="pl-9 h-10 bg-white border-brand-gray-200 focus-visible:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="bg-white border-brand-gray-200 hover:bg-brand-gray-50 h-10 px-3">
            <Filter className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Filter</span>
          </Button>
          <Button 
            onClick={handleOpenCreate} 
            className="bg-brand-gray-900 text-white hover:bg-brand-gray-800 h-10 rounded-xl px-4 font-bold text-xs shadow-md shrink-0 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Button>
        </div>
      </div>

      <Card className="border-brand-gray-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="pb-4 border-b border-brand-gray-100 flex flex-row items-center justify-between bg-white">
          <CardTitle className="text-base font-bold text-brand-gray-900">Platform Products</CardTitle>
          <div className="flex gap-2">
             <Badge className="bg-blue-50 text-blue-700 border-blue-200">
              Total: {products.length}
            </Badge>
            <Badge className="bg-red-50 text-red-700 border-red-200">
              Low Stock: {products.filter(p => (p.stock || 0) < 5).length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0 bg-white">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-brand-gray-500 flex flex-col items-center bg-white">
              <Package className="w-12 h-12 text-brand-gray-300 mb-3" />
              <p>No products found matching your search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-brand-gray-50 text-brand-gray-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Product Info</th>
                    <th className="px-6 py-4">Parlour</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gray-100 bg-white">
                   {filteredProducts.map((product) => (
                    <tr 
                      key={product.id} 
                      className="hover:bg-brand-gray-50 transition-colors bg-white cursor-pointer"
                      onClick={() => handleViewDetails(product)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 overflow-hidden shrink-0 flex items-center justify-center relative">
                            {product.image ? (
                              <Image src={product.image} alt={product.name} fill className="object-cover" />
                            ) : (
                              <Box className="w-5 h-5 text-blue-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-brand-gray-900">{product.name}</p>
                            <p className="text-[10px] text-brand-gray-400 font-medium mt-0.5">{product.brand || 'No Brand'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-brand-gray-700 font-medium">
                          <Store className="w-3.5 h-3.5 text-brand-gray-400" />
                          <span className="text-sm">{product.parlours?.name || 'Unknown Parlour'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-sm font-bold",
                            (product.stock || 0) < 5 ? "text-red-600" : "text-brand-gray-900"
                          )}>
                            {product.stock || 0}
                          </span>
                          {(product.stock || 0) < 5 && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                        </div>
                        <p className="text-[10px] text-brand-gray-400 uppercase tracking-wider mt-0.5">Units Left</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-brand-gray-900">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Badge variant="outline" className={cn(
                          "uppercase text-[10px] font-bold border-0",
                          product.is_active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        )}>
                          {product.is_active !== false ? 'In Stock' : 'Discontinued'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] border-none shadow-2xl p-0 overflow-hidden bg-white rounded-3xl">
          <div className="h-32 bg-brand-gray-900 relative">
            {selectedProduct?.image && (
              <Image src={selectedProduct.image} alt="" fill className="object-cover opacity-50" />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <Package className="w-12 h-12 text-white/50" />
            </div>
            <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
              {isCreating ? "New Product Draft" : (selectedProduct?.category || "Platform Retail")}
            </div>
          </div>
          <div className="px-6 pb-8 -mt-10 relative">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-brand-gray-100">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-brand-gray-400">Product Name</Label>
                    <Input 
                      value={editData?.name} 
                      onChange={e => setEditData({...editData, name: e.target.value})} 
                      placeholder="e.g. Lavender Hydrating Facial Serum"
                      className="rounded-xl border-brand-gray-200"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-brand-gray-400">Price (৳)</Label>
                      <Input 
                        type="number"
                        value={editData?.price} 
                        onChange={e => setEditData({...editData, price: e.target.value})} 
                        placeholder="Price in BDT"
                        className="rounded-xl border-brand-gray-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-brand-gray-400">Stock Units</Label>
                      <Input 
                        type="number"
                        value={editData?.stock} 
                        onChange={e => setEditData({...editData, stock: e.target.value})} 
                        placeholder="Available stock"
                        className="rounded-xl border-brand-gray-200"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-brand-gray-400">Brand</Label>
                      <Input 
                        value={editData?.brand} 
                        onChange={e => setEditData({...editData, brand: e.target.value})} 
                        placeholder="Brand name"
                        className="rounded-xl border-brand-gray-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-brand-gray-400">Category</Label>
                      <select 
                        value={editData?.category}
                        onChange={e => setEditData({...editData, category: e.target.value})}
                        className="w-full h-10 px-3 border border-brand-gray-200 rounded-xl text-xs bg-white outline-none focus:border-brand-gray-400"
                      >
                        <option value="Skincare">Skincare</option>
                        <option value="Haircare">Haircare</option>
                        <option value="Cosmetics">Cosmetics</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-brand-gray-400">Product Description</Label>
                    <Textarea 
                      value={editData?.description} 
                      onChange={e => setEditData({...editData, description: e.target.value})} 
                      placeholder="Describe the product benefits and usage..."
                      className="rounded-xl border-brand-gray-200 min-h-[80px]"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <DialogTitle className="text-xl font-black text-brand-gray-900 leading-tight">{selectedProduct?.name}</DialogTitle>
                      <p className="text-xs text-brand-gray-500 mt-1.5 flex items-center gap-1.5 font-semibold">
                        <Store className="w-4 h-4 text-brand-gray-400" />
                        {selectedProduct?.parlours?.name || "Platform Store"}
                      </p>
                    </div>
                    <Badge className="bg-brand-gray-900 text-white border-0 text-xs font-black px-3 py-1.5 rounded-full shrink-0">
                      {formatCurrency(selectedProduct?.price)}
                    </Badge>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="p-3 bg-brand-gray-50 rounded-2xl border border-brand-gray-100">
                      <p className="text-[10px] font-bold text-brand-gray-400 uppercase tracking-wide">Brand Partner</p>
                      <p className="text-xs font-black text-brand-gray-800 mt-0.5">{selectedProduct?.brand || 'No Brand'}</p>
                    </div>
                    <div className="p-3 bg-brand-gray-50 rounded-2xl border border-brand-gray-100">
                      <p className="text-[10px] font-bold text-brand-gray-400 uppercase tracking-wide">Available Stock</p>
                      <p className={cn(
                        "text-xs font-black mt-0.5",
                        (selectedProduct?.stock || 0) < 5 ? "text-red-600" : "text-brand-gray-800"
                      )}>
                        {selectedProduct?.stock || 0} Units
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-[10px] font-bold text-brand-gray-400 uppercase tracking-wide mb-2">Description</p>
                    <p className="text-xs text-brand-gray-600 leading-relaxed font-medium">
                      {selectedProduct?.description || 'No description provided for this premium retail product.'}
                    </p>
                  </div>
                </>
              )}

              <div className="mt-8 pt-6 border-t border-brand-gray-100 flex flex-wrap gap-3">
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
                      onClick={handleDeleteProduct}
                      disabled={isSaving}
                      title="Delete Product"
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
                      Edit Product
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
