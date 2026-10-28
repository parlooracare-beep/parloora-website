import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B1D5F]/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] select-none cursor-pointer",
  {
    variants: {
      variant: {
        // Dark Premium: Deep Purple #4B1D5F Signature Luxury
        default:
          "bg-[#4B1D5F] text-white shadow-md shadow-[#4B1D5F]/20 hover:bg-[#3D144E] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#4B1D5F]/30 border border-white/10 active:translate-y-0",
        // Primary / Rose Gold Signature CTA
        primary:
          "bg-gradient-to-r from-[#F3D5D5] via-[#E2A9A9] to-[#D89898] text-[#341045] font-bold shadow-[0_4px_18px_rgba(226,169,169,0.38)] hover:shadow-[0_8px_24px_rgba(226,169,169,0.5)] hover:-translate-y-0.5 hover:brightness-[1.02] border border-white/50 active:translate-y-0",
        rosegold:
          "bg-gradient-to-r from-[#F3D5D5] via-[#E2A9A9] to-[#D89898] text-[#341045] font-bold shadow-[0_4px_18px_rgba(226,169,169,0.38)] hover:shadow-[0_8px_24px_rgba(226,169,169,0.5)] hover:-translate-y-0.5 hover:brightness-[1.02] border border-white/50 active:translate-y-0",
        // Secondary: Premium Outline with Deep Purple
        outline:
          "border-2 border-[#4B1D5F] bg-white text-[#4B1D5F] font-semibold hover:bg-[#4B1D5F]/6 shadow-xs hover:border-[#4B1D5F]",
        "outline-white":
          "border-2 border-white/70 bg-white/10 backdrop-blur-md text-white font-semibold hover:bg-white/20 hover:border-white shadow-xs",
        // Soft Tinted Surface
        secondary:
          "bg-[#F5E9E2] text-[#4B1D5F] font-semibold hover:bg-[#EBD8CE] shadow-xs hover:-translate-y-0.5 active:translate-y-0",
        // Destructive
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 hover:-translate-y-0.5 active:translate-y-0",
        // Ghost
        ghost:
          "text-brand-gray-700 hover:bg-primary/8 hover:text-primary active:scale-95",
        // Link
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto font-medium",
        // Glassmorphism Light
        glass:
          "bg-white/80 backdrop-blur-md border border-white/70 text-brand-gray-900 shadow-xs hover:bg-white/95 hover:-translate-y-0.5 active:translate-y-0",
        // Glassmorphism Dark
        "glass-dark":
          "bg-[#4B1D5F]/85 backdrop-blur-md border border-white/15 text-white shadow-md hover:bg-[#4B1D5F] hover:-translate-y-0.5 active:translate-y-0",
        // Gradient Brand
        gradient:
          "bg-gradient-to-r from-[#4B1D5F] to-[#7B2E9F] text-white shadow-md shadow-[#4B1D5F]/25 hover:opacity-95 hover:-translate-y-0.5 active:translate-y-0",
      },
      size: {
        default: "h-11 px-5 py-2.5 text-sm",
        sm: "h-9 rounded-xl px-3.5 text-xs font-semibold",
        lg: "h-13 rounded-2xl px-7 text-base font-bold",
        xl: "h-14 rounded-2xl px-8 text-lg font-bold",
        icon: "h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl p-0",
        "icon-sm": "h-9 w-9 rounded-lg p-0",
        "icon-lg": "h-12 w-12 min-h-[48px] min-w-[48px] rounded-2xl p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, disabled, children, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

