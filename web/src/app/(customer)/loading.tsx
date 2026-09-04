// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
            <span className="text-[10px] font-black text-primary">P</span>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm font-bold text-brand-gray-400 animate-pulse">
        Loading Parloora...
      </p>
    </div>
  )
}
