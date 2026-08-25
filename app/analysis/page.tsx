"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { todayKey } from "@/lib/date"
import { sumDay, buildReminders } from "@/lib/nutrition"
import { buildRange, rangeAverages } from "@/lib/analysis"
import { LineTrend, BarTrend } from "@/components/analysis/trend-chart"
import { ReminderList } from "@/components/reminder-list"

type RangeKind = "today" | "7" | "30"

const TABS: { key: RangeKind; label: string }[] = [
  { key: "today", label: "今日" },
  { key: "7", label: "7 日" },
  { key: "30", label: "30 日" },
]

export default function AnalysisPage() {
  const { data, loaded } = useStore()
  const [range, setRange] = useState<RangeKind>("today")

  const key = todayKey()
  const todayTotals = sumDay(data.days[key])
  const reminders = buildReminders(todayTotals, data.goals)

  const days = range === "7" ? 7 : 30
  const series = useMemo(() => buildRange(data, days), [data, days])
  const avg = useMemo(() => rangeAverages(data, days), [data, days])

  return (
    <div className="space-y-4">
      <header className="px-1">
        <h1 className="text-2xl font-black text-foreground">分析</h1>
        <p className="mt-0.5 text-sm font-medium text-muted-foreground">追蹤你的營養與體重趨勢</p>
      </header>

      {/* 區間切換 */}
      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-muted p-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setRange(t.key)}
            aria-pressed={range === t.key}
            className={cn(
              "h-11 rounded-xl text-[15px] font-bold transition-colors",
              range === t.key ? "bg-card text-primary shadow-sm" : "text-muted-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!loaded ? (
        <div className="py-20 text-center text-muted-foreground">載入中…</div>
      ) : range === "today" ? (
        <TodayView totals={todayTotals} reminders={reminders} goals={data.goals} />
      ) : (
        <RangeView days={days} series={series} avg={avg} proteinGoal={data.goals.protein} />
      )}
    </div>
  )
}

function TodayView({
  totals,
  reminders,
  goals,
}: {
  totals: ReturnType<typeof sumDay>
  reminders: ReturnType<typeof buildReminders>
  goals: { calories: number; protein: number }
}) {
  return (
    <div className="space-y-4">
      <ReminderList reminders={reminders} />
      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="mb-3 text-base font-bold text-foreground">今日營養分析</h2>
        <div className="space-y-3">
          <MacroBar label="蛋白質" value={totals.protein} goal={goals.protein} unit="g" color="var(--primary)" />
          <MacroBar label="熱量" value={totals.calories} goal={goals.calories} unit="kcal" color="var(--chart-2)" />
          <div className="grid grid-cols-2 gap-3 pt-1">
            <MiniStat label="碳水" value={totals.carbs} unit="g" />
            <MiniStat label="脂肪" value={totals.fat} unit="g" />
          </div>
        </div>
      </section>
    </div>
  )
}

function RangeView({
  days,
  series,
  avg,
  proteinGoal,
}: {
  days: number
  series: ReturnType<typeof buildRange>
  avg: ReturnType<typeof rangeAverages>
  proteinGoal: number
}) {
  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 gap-3">
        <SummaryCard label="平均熱量" value={`${avg.avgCalories}`} unit="kcal" />
        <SummaryCard label="平均蛋白質" value={`${avg.avgProtein}`} unit="g" accent />
        <SummaryCard
          label="目前體重"
          value={avg.latestWeight != null ? `${avg.latestWeight}` : "—"}
          unit={avg.latestWeight != null ? "kg" : ""}
        />
        <SummaryCard
          label={`${days} 日體重變化`}
          value={avg.weightChange != null ? `${avg.weightChange > 0 ? "+" : ""}${avg.weightChange}` : "—"}
          unit={avg.weightChange != null ? "kg" : ""}
          good={avg.weightChange != null && avg.weightChange <= 0}
        />
      </section>

      <ChartCard title="體重趨勢">
        <LineTrend data={series.weight} unit="kg" emptyText="尚無體重紀錄，到「我的」新增" />
      </ChartCard>

      <ChartCard title="每日蛋白質" subtitle={`虛線為目標 ${proteinGoal} g`}>
        <BarTrend data={series.protein} unit="g" goal={proteinGoal} color="var(--primary)" emptyText="尚無飲食紀錄" />
      </ChartCard>

      <ChartCard title="每日熱量">
        <BarTrend data={series.calories} unit="kcal" color="var(--chart-2)" emptyText="尚無飲食紀錄" />
      </ChartCard>
    </div>
  )
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-4">
      <div className="mb-2 flex items-baseline justify-between px-1">
        <h2 className="text-base font-bold text-foreground">{title}</h2>
        {subtitle ? <span className="text-xs text-muted-foreground">{subtitle}</span> : null}
      </div>
      {children}
    </section>
  )
}

function MacroBar({
  label,
  value,
  goal,
  unit,
  color,
}: {
  label: string
  value: number
  goal: number
  unit: string
  color: string
}) {
  const pct = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-sm font-semibold text-secondary-foreground">{label}</span>
        <span className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{value}</span> / {goal} {unit}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function MiniStat({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="rounded-2xl bg-muted/60 px-4 py-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xl font-bold text-foreground">
        {value}
        <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>
      </p>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  unit,
  accent,
  good,
}: {
  label: string
  value: string
  unit: string
  accent?: boolean
  good?: boolean
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1">
        <span
          className={cn(
            "text-2xl font-black",
            good ? "text-primary" : accent ? "text-primary" : "text-foreground",
          )}
        >
          {value}
        </span>
        <span className="ml-1 text-sm text-muted-foreground">{unit}</span>
      </p>
    </div>
  )
}
