"use client"

import * as React from "react"
import Image from "next/image"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Plus, Search, ShoppingBag, Edit2, Trash2, MoreVertical, Loader2, Package } from "lucide-react"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ProductForm } from "@/components/seller/ProductForm"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getProducts, deleteProduct } from "@/lib/actions/products"
import { createClient } from "@/lib/supabase/client"

export default function SellerProductsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showForm, setShowForm] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingProduct, setEditingProduct] = React.useState<any>(null)
  const [searchTerm, setSearchTerm] = React.useState("")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = React.useState<any>(null)

  const loadProducts = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    if (user) {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false })
      setProducts(data || [])
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    const res = await deleteProduct(id)
    if (res.success) {
      setProducts(products.filter(p => p.id !== id))
    } else {
      alert("Failed to delete product")
    }
  }

  React.useEffect(() => {
    loadProducts()
  }, [])

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            Product Inventory
          </h2>
          <p className="text-brand-gray-500 text-sm mt-1">Manage your physical product listings and stock.</p>
        </div>
        
        <Button 
          onClick={() => { setEditingProduct(null); setShowForm(true) }}
          className="bg-primary hover:bg-primary/90 rounded-xl px-6 gap-2 h-11"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-brand-gray-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400" />
          <Input 
            placeholder="Search products by name or brand..." 
            className="pl-9 bg-transparent border-0 focus-visible:ring-0 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-brand-gray-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-20 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-brand-gray-500 text-sm">Loading inventory...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-brand-gray-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-brand-gray-200" />
              </div>
              <p className="text-brand-gray-500 font-medium">No products found in your inventory.</p>
              <Button 
                variant="link" 
                onClick={() => setShowForm(true)}
                className="text-primary mt-2"
              >
                Add your first product
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-brand-gray-50 text-brand-gray-500 text-xs uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Product Info</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gray-100">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-brand-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg bg-brand-gray-100 border border-brand-gray-200 overflow-hidden shrink-0">
                            {product.image_url ? (
                              <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                            ) : (
                              <ShoppingBag className="w-5 h-5 text-brand-gray-300 m-3.5" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-brand-gray-900">{product.name}</p>
                            <p className="text-[10px] text-brand-gray-500 uppercase font-bold tracking-tighter">{product.brand || "Parloora Selection"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="bg-white text-brand-gray-600 border-brand-gray-200">
                          {product.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-bold text-brand-gray-900">
                        ৳{product.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={cn(
                            "font-bold",
                            product.stock < 5 ? "text-rose-500" : "text-brand-gray-700"
                          )}>
                            {product.stock} units
                          </span>
                          {product.stock < 5 && <span className="text-[10px] text-rose-400 font-bold uppercase">Low Stock</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={cn(
                          "border-0 uppercase text-[10px] font-black",
                          product.is_active ? "bg-emerald-100 text-emerald-700" : "bg-brand-gray-100 text-brand-gray-500"
                        )}>
                          {product.is_active ? "Active" : "Hidden"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={() => { setEditingProduct(product); setShowForm(true) }}
                          >
                            <Edit2 className="w-4 h-4 text-brand-gray-400" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleDelete(product.id)}>
                            <Trash2 className="w-4 h-4 text-rose-300" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <ProductForm 
          product={editingProduct}
          onClose={() => setShowForm(false)}
          onSuccess={loadProducts}
        />
      )}
    </div>
  )
}
