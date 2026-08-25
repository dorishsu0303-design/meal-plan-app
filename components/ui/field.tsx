"use client"

import { cn } from "@/lib/utils"

// 大字級輸入框，方便長輩操作
export function TextInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-2xl border border-border bg-background px-4 text-base text-foreground",
        "placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30",
        className,
      )}
      {...props}
    />
  )
}

export function TextArea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "w-full rounded-2xl border border-border bg-background px-4 py-3 text-base text-foreground",
        "placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30",
        className,
      )}
      {...props}
    />
  )
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string
  htmlFor?: string
  hint?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-secondary-foreground">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
