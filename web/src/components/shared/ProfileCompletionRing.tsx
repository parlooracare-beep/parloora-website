"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProfileCompletionRingProps {
  percentage: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function ProfileCompletionRing({
  percentage = 0,
  size = 80,
  strokeWidth = 6,
  className
}: ProfileCompletionRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (Math.min(Math.max(percentage, 0), 100) / 100) * circumference

  // Color mapping based on score
  let strokeColor = "stroke-red-500"
  let textColor = "text-red-600"
  let bgColor = "bg-red-50"

  if (percentage >= 80) {
    strokeColor = "stroke-emerald-500"
    textColor = "text-emerald-600"
    bgColor = "bg-emerald-50"
  } else if (percentage >= 50) {
    strokeColor = "stroke-amber-500"
    textColor = "text-amber-600"
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    bgColor = "bg-amber-50"
  }

  return (
    <div 
      className={cn("relative flex items-center justify-center select-none", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          className="stroke-brand-gray-100"
          strokeWidth={strokeWidth}
        />
        {/* Animated indicator */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          className={cn(strokeColor, "transition-all duration-500 ease-out")}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      {/* Center Text */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className={cn("text-xs font-black leading-none", textColor)}>
          {percentage}%
        </span>
      </div>
    </div>
  )
}
