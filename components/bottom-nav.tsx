"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  UtensilsCrossed,
  CalendarDays,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"

const TABS = [
  { href: "/", label: "首頁", icon: Home },
  { href: "/food", label: "飲食紀錄", icon: UtensilsCrossed },
  { href: "/history", label: "歷史", icon: CalendarDays },
  { href: "/profile", label: "我的", icon: User },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="主要導覽"
      className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md border-t border-border bg-card/95 backdrop-blur-md"
    >
      <ul className="flex items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-1.5">
        {TABS.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href)

          const Icon = tab.icon

          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl py-2 text-xs font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "size-6",
                    active && "stroke-[2.4]",
                  )}
                  aria-hidden="true"
                />

                <span className="text-[13px]">
                  {tab.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
