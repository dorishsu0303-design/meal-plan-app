"use client"

import { Trash2 } from "lucide-react"
import type { MounjaroRecord } from "@/lib/types"
import { formatDisplay, daysBetween, todayKey } from "@/lib/date"

const APPETITE_LABEL = ["", "很低", "偏低", "普通", "偏高", "很高"]

export function MounjaroList({
  records,
  onRemove,
}: {
  records: MounjaroRecord[]
  onRemove: (id: string) => void
}) {
  if (records.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
        尚無猛健樂紀錄
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {records.map((r) => {
        const feelings = [
          r.nausea && "噁心",
          r.bloating && "胃脹",
          r.constipation && "便秘",
          r.otherFeeling,
        ].filter(Boolean) as string[]
        return (
          <li key={r.id} className="rounded-3xl border border-border bg-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-base font-bold text-foreground">
                  {formatDisplay(r.date)}
                  <span className="ml-2 rounded-full bg-accent px-2.5 py-0.5 text-sm font-bold text-accent-foreground">
                    {r.dose}
                  </span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  注射後第 {Math.max(0, daysBetween(r.date, todayKey()))} 天・食慾 {r.appetite}／5（
                  {APPETITE_LABEL[r.appetite] ?? ""}）
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(r.id)}
                aria-label="刪除此筆紀錄"
                className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground active:bg-destructive/10 active:text-destructive"
              >
                <Trash2 className="size-5" />
              </button>
            </div>

            {feelings.length ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {feelings.map((f, i) => (
                  <span key={i} className="rounded-full bg-chart-5/12 px-2.5 py-0.5 text-xs font-medium text-chart-5">
                    {f}
                  </span>
                ))}
              </div>
            ) : null}

            {r.note ? <p className="mt-2 text-sm text-secondary-foreground">{r.note}</p> : null}
          </li>
        )
      })}
    </ul>
  )
}
