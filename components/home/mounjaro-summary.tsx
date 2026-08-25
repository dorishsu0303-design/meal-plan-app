import Link from "next/link"
import { ChevronRight, Syringe } from "lucide-react"
import { Card, CardTitle } from "@/components/ui/card"
import type { MounjaroRecord } from "@/lib/types"
import { daysBetween, formatDisplay, todayKey } from "@/lib/date"

const APPETITE_LABEL = ["", "很低", "偏低", "普通", "偏高", "很高"]

export function MounjaroSummary({ records }: { records: MounjaroRecord[] }) {
  const latest = records[0]

  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardTitle>猛健樂</CardTitle>
        <Link href="/profile" className="flex items-center gap-0.5 text-sm font-semibold text-primary">
          紀錄 <ChevronRight className="size-4" />
        </Link>
      </div>

      {!latest ? (
        <div className="mt-3 flex flex-col items-center gap-2 py-5 text-center">
          <Syringe className="size-7 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">尚未紀錄注射資料</p>
          <Link href="/profile" className="text-sm font-semibold text-primary">
            新增猛健樂紀錄
          </Link>
        </div>
      ) : (
        <div className="mt-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">最近注射</span>
            <span className="text-[15px] font-semibold text-foreground">{formatDisplay(latest.date)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">劑量</span>
            <span className="text-[15px] font-semibold text-foreground">{latest.dose || "—"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">注射後</span>
            <span className="text-[15px] font-semibold text-foreground">
              第 {Math.max(0, daysBetween(latest.date, todayKey()))} 天
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">注射後食慾</span>
            <span className="rounded-full bg-accent px-3 py-0.5 text-sm font-bold text-accent-foreground">
              {latest.appetite}／5 · {APPETITE_LABEL[latest.appetite] ?? ""}
            </span>
          </div>
        </div>
      )}
    </Card>
  )
}
