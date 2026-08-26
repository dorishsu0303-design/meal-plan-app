"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, CalendarDays, ChevronDown } from "lucide-react"
import { useStore } from "@/lib/store"
import { MEAL_LABELS, MEAL_ORDER, type MealType } from "@/lib/types"
import { sumDay } from "@/lib/nutrition"

function formatDate(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`)
  if (Number.isNaN(date.getTime())) return dateKey

  const weekdays = ["日", "一", "二", "三", "四", "五", "六"]

  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}/${String(date.getDate()).padStart(2, "0")}（${weekdays[date.getDay()]}）`
}

function shiftDate(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T00:00:00`)
  date.setDate(date.getDate() + days)

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`
}

function todayKeyLocal() {
  const now = new Date()

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(now.getDate()).padStart(2, "0")}`
}

export default function HistoryPage() {
  const { data, loaded, getDay } = useStore()

  const [selectedDate, setSelectedDate] = useState(todayKeyLocal())

  const day = getDay(selectedDate)
  const totals = sumDay(day)

  const hasData =
    Boolean(day.weight) ||
    Boolean(day.water) ||
    Boolean(day.sleep) ||
    Boolean(day.exercise) ||
    day.meals.length > 0

  const previousDay = shiftDate(selectedDate, -1)
  const nextDay = shiftDate(selectedDate, 1)

  const today = todayKeyLocal()
  const isToday = selectedDate === today

  const availableDates = useMemo(() => {
    return Object.keys(data.days)
      .filter((key) => key <= today)
      .sort((a, b) => b.localeCompare(a))
  }, [data.days, today])

  const recentDates = availableDates.slice(0, 30)

  if (!loaded) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        載入中…
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-8">
      {/* 標題 */}
      <header className="px-1">
        <h1 className="text-2xl font-black text-foreground">歷史紀錄</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          每天的體重、飲食與生活紀錄都會保留下來
        </p>
      </header>

      {/* 日期切換 */}
      <section className="rounded-3xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setSelectedDate(previousDay)}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted active:bg-muted/70"
            aria-label="前一天"
          >
            <ChevronLeft className="size-5" />
          </button>

          <label className="flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-2">
            <CalendarDays className="size-5 text-primary" />

            <input
              type="date"
              value={selectedDate}
              max={today}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="min-w-0 bg-transparent text-center text-base font-bold text-foreground outline-none"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              if (!isToday) setSelectedDate(nextDay)
            }}
            disabled={isToday}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted disabled:opacity-30"
            aria-label="後一天"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <div className="mt-3 text-center">
          <p className="text-lg font-black text-foreground">
            {formatDate(selectedDate)}
          </p>

          {!isToday ? (
            <button
              type="button"
              onClick={() => setSelectedDate(today)}
              className="mt-1 text-sm font-semibold text-primary"
            >
              回到今天
            </button>
          ) : null}
        </div>
      </section>

      {/* 最近紀錄 */}
      {recentDates.length > 0 ? (
        <section className="rounded-3xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <CalendarDays className="size-5 text-primary" />
            <h2 className="font-bold">最近紀錄</h2>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {recentDates.map((date) => {
              const active = date === selectedDate
              const record = data.days[date]
              const recordTotals = sumDay(record)

              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className={`min-w-[92px] rounded-2xl border px-3 py-2 text-left transition ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background active:bg-muted"
                  }`}
                >
                  <p className="text-xs font-medium opacity-80">
                    {date.slice(5).replace("-", "/")}
                  </p>

                  <p className="mt-1 text-sm font-bold">
                    {record.weight
                      ? `${record.weight} kg`
                      : `${Math.round(recordTotals.calories)} kcal`}
                  </p>
                </button>
              )
            })}
          </div>
        </section>
      ) : null}

      {/* 當日沒有資料 */}
      {!hasData ? (
        <section className="rounded-3xl border border-dashed border-border bg-card px-5 py-12 text-center">
          <CalendarDays className="mx-auto size-10 text-muted-foreground" />

          <p className="mt-3 text-base font-bold text-foreground">
            這一天還沒有紀錄
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            回到首頁即可新增今天的資料。
          </p>

          <Link
            href="/"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground"
          >
            回到首頁
          </Link>
        </section>
      ) : (
        <>
          {/* 每日營養摘要 */}
          <section className="grid grid-cols-2 gap-3">
            <SummaryCard
              label="今日熱量"
              value={Math.round(totals.calories)}
              unit="kcal"
            />

            <SummaryCard
              label="蛋白質"
              value={Math.round(totals.protein)}
              unit="g"
            />

            <SummaryCard
              label="喝水"
              value={day.water ?? 0}
              unit="ml"
            />

            <SummaryCard
              label="體重"
              value={day.weight ?? 0}
              unit="kg"
            />
          </section>

          {/* 身體資料 */}
          <section className="rounded-3xl border border-border bg-card p-5">
            <h2 className="mb-4 text-base font-bold">當日身體資料</h2>

            <div className="grid grid-cols-2 gap-3">
              <InfoItem
                label="體重"
                value={day.weight ? `${day.weight} kg` : "未記錄"}
              />

              <InfoItem
                label="喝水"
                value={day.water ? `${day.water} ml` : "未記錄"}
              />

              <InfoItem
                label="睡眠"
                value={day.sleep ? `${day.sleep} 小時` : "未記錄"}
              />

              <InfoItem
                label="運動"
                value={
                  day.exercise ? `${day.exercise} 分鐘` : "未記錄"
                }
              />
            </div>
          </section>

          {/* 飲食紀錄 */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-black">飲食紀錄</h2>

              <span className="text-sm text-muted-foreground">
                {day.meals.length} 筆
              </span>
            </div>

            {MEAL_ORDER.map((meal) => {
              const items = day.meals.filter(
                (item) => item.meal === meal,
              )

              if (items.length === 0) return null

              const calories = items.reduce(
                (sum, item) => sum + item.calories,
                0,
              )

              const protein = items.reduce(
                (sum, item) => sum + item.protein,
                0,
              )

              return (
                <MealSection
                  key={meal}
                  meal={meal}
                  items={items}
                  calories={calories}
                  protein={protein}
                />
              )
            })}
          </section>
        </>
      )}
    </div>
  )
}

function SummaryCard({
  label,
  value,
  unit,
}: {
  label: string
  value: number
  unit: string
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>

      <p className="mt-1 text-2xl font-black text-foreground">
        {value || "--"}
        <span className="ml-1 text-sm font-medium text-muted-foreground">
          {value ? unit : ""}
        </span>
      </p>
    </div>
  )
}

function InfoItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl bg-muted/50 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-bold text-foreground">{value}</p>
    </div>
  )
}

function MealSection({
  meal,
  items,
  calories,
  protein,
}: {
  meal: MealType
  items: {
    id: string
    name: string
    portion: string
    calories: number
    protein: number
    carbs: number
    fat: number
  }[]
  calories: number
  protein: number
}) {
  const [open, setOpen] = useState(true)

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between bg-muted/50 px-5 py-4 text-left"
      >
        <div>
          <h3 className="font-bold">{MEAL_LABELS[meal]}</h3>

          <p className="mt-0.5 text-xs text-muted-foreground">
            {Math.round(calories)} kcal ・ 蛋白質{" "}
            {Math.round(protein)} g
          </p>
        </div>

        <ChevronDown
          className={`size-5 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div className="divide-y divide-border">
          {items.map((item) => (
            <div
              key={item.id}
              className="px-5 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-bold">
                    {item.name}
                  </p>

                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {item.portion}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="font-bold">
                    {Math.round(item.calories)} kcal
                  </p>

                  <p className="text-xs text-muted-foreground">
                    蛋白 {Math.round(item.protein)}g
                  </p>
                </div>
              </div>

              <div className="mt-2 text-xs text-muted-foreground">
                碳水 {Math.round(item.carbs)}g ・ 脂肪{" "}
                {Math.round(item.fat)}g
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
