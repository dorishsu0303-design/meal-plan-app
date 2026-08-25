"use client"

import { cn } from "@/lib/utils"

type Variant = "primary" | "soft" | "outline" | "danger"

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground active:bg-primary/90",
  soft: "bg-accent text-accent-foreground active:bg-accent/80",
  outline: "border border-border bg-card text-foreground active:bg-muted",
  danger: "bg-destructive/10 text-destructive active:bg-destructive/20",
}

export function BigButton({
  variant = "primary",
  className,
  type = "button",
  ...props
}: React.ComponentProps<"button"> & { variant?: Variant }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  )
}
