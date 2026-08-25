import type { LucideIcon } from "lucide-react"
import { Beef, Flame, Wheat, Droplet, Dumbbell, Moon, Scale, EggFried } from "lucide-react"
import type { DayData, Goals } from "@/lib/types"
import type { DayTotals } from "@/lib/nutrition"

function Tile({
  icon: Icon,
  label,
  value,
  unit,
  accent = "text-primary",
}: {
  icon: LucideIcon
  label: string
  value: string
  unit?: string
  accent?: string
}) {
  return (
    <div className="rounded-3xl border border-border/70 bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className={`size-5 ${accent}`} aria-hidden="true" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-black text-foreground">{value}</span>
        {unit ? <span className="text-sm font-medium text-muted-foreground">{unit}</span> : null}
      </div>
    </div>
  )
}

export function StatGrid({ day, totals, goals }: { day: DayData; totals: DayTotals; goals: Goals }) {
  const dash = (v: number | undefined) => (v === undefined || v === null ? "—" : String(v))

  return (
    <div className="grid grid-cols-2 gap-3">
      <Tile icon={Scale} label="今日體重" value={dash(day.weight)} unit={day.weight ? "kg" : ""} accent="text-chart-3" />
      <Tile icon={Flame} label="熱量" value={String(totals.calories)} unit="kcal" accent="text-chart-2" />
      <Tile icon={Beef} label="蛋白質" value={String(totals.protein)} unit="g" accent="text-primary" />
      <Tile icon={Wheat} label="碳水" value={String(totals.carbs)} unit="g" accent="text-chart-4" />
      <Tile icon={EggFried} label="脂肪" value={String(totals.fat)} unit="g" accent="text-chart-5" />
      <Tile icon={Droplet} label="喝水量" value={dash(day.water)} unit={day.water ? "ml" : ""} accent="text-chart-3" />
      <Tile icon={Dumbbell} label="運動時間" value={dash(day.exercise)} unit={day.exercise ? "分" : ""} accent="text-primary" />
      <Tile icon={Moon} label="睡眠時間" value={dash(day.sleep)} unit={day.sleep ? "小時" : ""} accent="text-chart-3" />
    </div>
  )
}
