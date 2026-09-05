import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

export type LogoSize = "sm" | "md" | "lg" | "xl" | number

export interface LogoProps {
  size?: LogoSize
  variant?: "default" | "light" | "dark"
  withText?: boolean
  subtext?: string
  subtextClassName?: string
  href?: string | false
  className?: string
  imgClassName?: string
  priority?: boolean
}

const SIZE_MAP: Record<"sm" | "md" | "lg" | "xl", { dim: number; textClass: string; rounded: string }> = {
  sm: { dim: 32, textClass: "text-lg font-bold tracking-tight", rounded: "rounded-lg" },
  md: { dim: 40, textClass: "text-xl font-bold tracking-tight", rounded: "rounded-xl" },
  lg: { dim: 48, textClass: "text-2xl font-black tracking-tight", rounded: "rounded-2xl" },
  xl: { dim: 56, textClass: "text-2xl font-black tracking-tight", rounded: "rounded-2xl" },
}

export function ParlooraLogo({
  size = "md",
  variant = "default",
  withText = true,
  subtext,
  subtextClassName,
  href = "/",
  className,
  imgClassName,
  priority = true,
}: LogoProps) {
  const isPreset = typeof size === "string" && size in SIZE_MAP
  const config = isPreset ? SIZE_MAP[size as "sm" | "md" | "lg" | "xl"] : null
  const dim = config ? config.dim : (typeof size === "number" ? size : 40)
  const textClass = config ? config.textClass : "text-xl font-bold tracking-tight"
  const rounded = config ? config.rounded : "rounded-xl"

  const textColorClass = {
    default: "bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent",
    light: "text-white font-black tracking-tighter",
    dark: "text-brand-gray-900 font-black",
  }[variant]

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 select-none transition-transform duration-200", className)}>
      <Image
        src="/logo.png"
        alt="Parloora"
        width={dim}
        height={dim}
        priority={priority}
        className={cn(
          "object-contain aspect-square shrink-0 transition-transform duration-300",
          rounded,
          imgClassName
        )}
      />
      {withText && (
        <div className="flex flex-col justify-center">
          <span className={cn(textClass, textColorClass, "leading-tight")}>
            Parloora
          </span>
          {subtext && (
            <span
              className={cn(
                "text-[10px] block font-bold tracking-widest uppercase -mt-0.5",
                subtextClassName || "text-primary"
              )}
            >
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="group inline-flex items-center">
        {content}
      </Link>
    )
  }

  return content
}

export default ParlooraLogo
