"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

// 由底部滑出的面板，適合手機單手操作
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="關閉"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative mx-auto flex max-h-[90dvh] w-full max-w-md flex-col rounded-t-4xl border border-border bg-card",
          "animate-in slide-in-from-bottom duration-300",
        )}
      >
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <div className="absolute left-1/2 top-2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-border" aria-hidden="true" />
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉"
            className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-2">{children}</div>
      </div>
    </div>
  )
}
