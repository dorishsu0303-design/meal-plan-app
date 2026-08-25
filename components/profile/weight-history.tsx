"use client"

import { Trash2 } from "lucide-react"
import type { AppData } from "@/lib/types"
import { formatDisplay } from "@/lib/date"

export function WeightHistory({
  data,
  onClear,
}: {
  data: AppData
  onClear: (dateKey: string) => void
}) {
  const rows = Object.values(data.days)
    .filter((d) => typeof d.weight === "number")
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  if (rows.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
        尚無體重紀錄，點上方「每日身體資料」新增
      </div>
    )
  }

  return (
    <ul className="overflow-hidden rounded-3xl border border-border bg-card">
      {rows.map((d, i) => {
        const prev = rows[i + 1]?.weight
        const diff = typeof prev === "number" ? Math.round((d.weight! - prev) * 10) / 10 : null
        return (
          <li key={d.date} className="flex items-center justify-between border-b border-border px-5 py-3 last:border-b-0">
            <span className="text-[15px] font-medium text-foreground">{formatDisplay(d.date)}</span>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-foreground">
                {d.weight}
                <span className="ml-0.5 text-sm font-normal text-muted-foreground">kg</span>
              </span>
              {diff != null ? (
                <span
                  className={
                    diff < 0
                      ? "text-sm font-semibold text-primary"
                      : diff > 0
                        ? "text-sm font-semibold text-chart-5"
                        : "text-sm text-muted-foreground"
                  }
                >
                  {diff > 0 ? "+" : ""}
                  {diff}
                </span>
              ) : (
                <span className="w-8" />
              )}
              <button
                type="button"
                onClick={() => onClear(d.date)}
                aria-label={`刪除 ${formatDisplay(d.date)} 的體重`}
                className="flex size-9 items-center justify-center rounded-full text-muted-foreground active:bg-destructive/10 active:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
