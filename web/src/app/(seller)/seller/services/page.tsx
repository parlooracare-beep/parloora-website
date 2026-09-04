"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Plus, Clock, Edit, Trash2, Loader2, AlertCircle, Scissors } from "lucide-react"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getSellerServices, deleteService } from "@/lib/actions/services"
import { getParlourByOwnerId } from "@/lib/actions/parlours"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/types/supabase"

type Service = Database["public"]["Tables"]["services"]["Row"]
type Parlour = Database["public"]["Tables"]["parlours"]["Row"]

export default function ServicesPage() {
  const [services, setServices] = React.useState<Service[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [parlour, setParlour] = React.useState<Parlour | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadData = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const p = await getParlourByOwnerId(user.id)
      if (p) {
        setParlour(p)
        const s = await getSellerServices(p.id)
        setServices(s)
      } else {
        setError("No parlour found for this account. Please set up your parlour profile first.")
      }
    }
    setLoading(false)
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return
    const res = await deleteService(serviceId)
    if (res.success) {
      setServices(services.filter(s => s.id !== serviceId))
    } else {
      alert("Failed to delete service")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-red-700 mb-2">Notice</h2>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brand-gray-900">Manage Services</h2>
        {/* We can use a modal or link to a new page. Let's assume a modal or just an alert for now, 
            since the user has to build the actual form. We'll make it a simple prompt-based addition for demo, 
            or link to /seller/services/new */}
        <Link href="/seller/services/new">
          <Button className="bg-primary hover:bg-primary/90 rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Add Service
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.length === 0 ? (
          <Card className="col-span-full border-dashed border-2 border-brand-gray-200 bg-brand-gray-50/50">
            <CardContent className="p-12 text-center">
              <Scissors className="w-12 h-12 text-brand-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-brand-gray-900 mb-1">No services found</h3>
              <p className="text-brand-gray-500 mb-6">Start by adding your first service to your parlour.</p>
              <Link href="/seller/services/new">
                <Button className="bg-primary hover:bg-primary/90 rounded-xl">
                  <Plus className="w-4 h-4 mr-2" /> Add Service
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          services.map((service) => (
            <Card key={service.id} className="overflow-hidden border-brand-gray-100 hover:shadow-md transition-all group">
              <div className="relative h-40 bg-brand-gray-100">
                {service.image ? (
                  <Image src={service.image} alt={service.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-gray-300">
                    <Scissors className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <Badge className={service.is_active ? "bg-emerald-500 text-white border-0" : "bg-brand-gray-500 text-white border-0"}>
                    {service.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{service.category}</p>
                    <h3 className="text-lg font-bold text-brand-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                      {service.name}
                    </h3>
                  </div>
                  <p className="text-lg font-black text-brand-gray-900">৳{Number(service.price).toLocaleString()}</p>
                </div>
                
                <div className="flex items-center gap-3 mt-4 text-sm text-brand-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-brand-gray-400" />
                    {service.duration || "N/A"}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-brand-gray-50">
                  <Link href={`/seller/services/${service.id}`} className="flex-1">
                    <Button variant="outline" className="w-full rounded-xl border-brand-gray-200 hover:border-primary hover:text-primary transition-all">
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-xl text-brand-gray-400 hover:text-destructive hover:bg-destructive/5"
                    onClick={() => handleDelete(service.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
