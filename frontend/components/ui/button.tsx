"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
      effect: {
        none: "",
        shimmer: "relative overflow-hidden before:absolute before:inset-0 before:translate-x-[-100%] hover:before:translate-x-[100%] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-transform before:duration-700",
        glow: "shadow-lg hover:shadow-primary/50 dark:hover:shadow-primary/60 transition-shadow duration-300",
        scale: "hover:scale-105 active:scale-95 transition-transform duration-200",
        ripple: "relative overflow-hidden",
        morphing: "hover:rounded-2xl transition-all duration-300",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      effect: "none",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  effect = "none",
  asChild = false,
  onClick,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"
  const [ripples, setRipples] = React.useState<{ id: number; x: number; y: number }[]>([])
  const ref = React.useRef<HTMLButtonElement>(null)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (effect === "ripple" && !asChild && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      const id = Date.now()
      setRipples((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
      setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600)
    }
    onClick?.(e)
  }

  return (
    <Comp
      ref={asChild ? undefined : ref}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-effect={effect}
      className={cn(buttonVariants({ variant, size, effect, className }))}
      onClick={handleClick}
      {...props}
    >
      {children}
      {effect === "ripple" && !asChild && (
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              className="absolute rounded-full bg-white/30 pointer-events-none"
              initial={{ width: 0, height: 0, left: ripple.x, top: ripple.y, x: "-50%", y: "-50%" }}
              animate={{
                width: 400,
                height: 400,
                left: ripple.x,
                top: ripple.y,
                x: "-50%",
                y: "-50%",
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          ))}
        </AnimatePresence>
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
