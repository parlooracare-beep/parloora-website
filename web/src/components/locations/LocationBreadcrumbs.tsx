import Link from "next/link"
import { ChevronRight, Home, MapPin } from "lucide-react"

export interface BreadcrumbItem {
  name: string
  href: string
}

interface LocationBreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function LocationBreadcrumbs({ items }: LocationBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="py-3 px-4 md:px-0">
      <ol className="flex items-center flex-wrap gap-1.5 text-xs text-brand-gray-500 font-medium">
        <li className="flex items-center gap-1.5">
          <Link
            href="/"
            className="hover:text-primary transition-colors flex items-center gap-1 text-brand-gray-600"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </li>
        <li className="flex items-center gap-1.5">
          <ChevronRight className="w-3 h-3 text-brand-gray-400 shrink-0" />
          <Link
            href="/locations"
            className="hover:text-primary transition-colors flex items-center gap-1 text-brand-gray-600"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Locations</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={item.href} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-brand-gray-400 shrink-0" />
              {isLast ? (
                <span className="text-primary font-bold truncate max-w-[200px] sm:max-w-none" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-primary transition-colors truncate max-w-[160px] sm:max-w-none">
                  {item.name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
