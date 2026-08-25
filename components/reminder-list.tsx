import { cn } from "@/lib/utils"
import type { Reminder } from "@/lib/nutrition"

const TONE_STYLES: Record<Reminder["tone"], string> = {
  good: "bg-primary/10 text-primary border-primary/20",
  warn: "bg-chart-5/10 text-chart-5 border-chart-5/25",
  info: "bg-accent text-accent-foreground border-border",
}

export function ReminderList({ reminders }: { reminders: Reminder[] }) {
  if (reminders.length === 0) return null
  return (
    <div className="space-y-2">
      {reminders.map((r, i) => (
        <div
          key={i}
          className={cn("rounded-2xl border px-4 py-3 text-[15px] font-medium leading-relaxed", TONE_STYLES[r.tone])}
        >
          {r.text}
        </div>
      ))}
    </div>
  )
}
