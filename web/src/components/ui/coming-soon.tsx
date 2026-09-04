import { Card, CardContent } from "@/components/ui/card"
import { Construction } from "lucide-react"

export function ComingSoon({ title, description }: { title: string, description?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="border-brand-gray-200 shadow-sm max-w-md w-full">
        <CardContent className="p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-brand-gray-100 rounded-full flex items-center justify-center mb-6">
            <Construction className="w-8 h-8 text-brand-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-brand-gray-900 mb-2">{title}</h2>
          <p className="text-brand-gray-500 text-sm">
            {description || "This feature is currently under development and will be available in a future update."}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
