"use client"

import { useMemo, useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { useStore } from "@/lib/store"
import { sumDay } from "@/lib/nutrition"
import { MEAL_LABELS, MEAL_ORDER, type MealType } from "@/lib/types"

function formatDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number)
  return `${year}/${month}/${day}`
}

function formatWeekday(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number)
  const date = new Date(year, month - 1, day)

  const weekdays = ["日", "一", "二", "三", "四", "五", "六"]
  return `星期${weekdays[date.getDay()]}`
}

function shiftDate(dateKey: string, amount: number) {
  const [year, month, day] = dateKey.split("-").map(Number)
  const date = new Date(year, month - 1, day)

  date.setDate(date.getDate() + amount)

  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")

  return `${y}-${m}-${d}`
}

function todayString() {
  const now = new Date()

  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")

  return `${y}-${m}-${d}`
}

export default function HistoryPage() {
  const { data, loaded } = useStore()

  const today = todayString()
  const [selectedDate, setSelectedDate] = useState(today)

  const day = data.days[selectedDate]

  const emptyDay = {
    date: selectedDate,
    meals: [],
  }

  const currentDay = day ?? emptyDay
  const totals = sumDay(currentDay)

  // 取得所有曾經有資料的日期
  const historyDates = useMemo(() => {
    const dates = Object.keys(data.days)

    return dates.sort((a, b) => b.localeCompare(a))
  }, [data.days])

  const hasData = currentDay.meals.length > 0 ||
    currentDay.weight !== undefined ||
    currentDay.water !== undefined ||
    currentDay.sleep !== undefined ||
    currentDay.exercise !== undefined

  const goPreviousDay = () => {
    setSelectedDate((current) => shiftDate(current, -1))
  }

  const goNextDay = () => {
    const next = shiftDate(selectedDate, 1)

    // 不允許跑到未來
    if (next <= today) {
      setSelectedDate(next)
    }
  }

  if (!loaded) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        載入中…
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 標題 */}
      <header className="px-1">
        <h1 className="text-2xl font-black text-foreground">
          飲食歷史
        </h1>

        <p className="mt-0.5 text-sm font-medium text-muted-foreground">
          查看每天的飲食與身體紀錄
        </p>
      </header>

      {/* 日期切換 */}
      <section className="rounded-3xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={goPreviousDay}
            className="flex size-11 items-center justify-center rounded-2xl bg-muted active:bg-muted/70"
            aria-label="前一天"
          >
            <ChevronLeft className="size-5" />
          </button>

          <div className="flex flex-1 flex-col items-center">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-5 text-primary" />

              <input
                type="date"
                value={selectedDate}
                max={today}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(e.target.value)
                  }
                }}
                className="rounded-xl bg-background px-2 py-1 text-center text-base font-bold text-foreground outline-none"
              />
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              {formatWeekday(selectedDate)}
            </p>
          </div>

          <button
            type="button"
            onClick={goNextDay}
            disabled={selectedDate >= today}
            className="flex size-11 items-center justify-center rounded-2xl bg-muted active:bg-muted/70 disabled:opacity-30"
            aria-label="下一天"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        {/* 今天按鈕 */}
        {selectedDate !== today ? (
          <button
            type="button"
            onClick={() => setSelectedDate(today)}
            className="mt-3 w-full rounded-2xl bg-primary/10 py-2.5 text-sm font-bold text-primary active:bg-primary/20"
          >
            回到今天
          </button>
        ) : null}
      </section>

      {/* 歷史日期快速選擇 */}
      {historyDates.length > 0 ? (
        <section className="space-y-2">
          <p className="px-1 text-sm font-semibold text-secondary-foreground">
            有紀錄的日期
          </p>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {historyDates.map((date) => {
              const active = date === selectedDate

              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className={
                    active
                      ? "shrink-0 rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
                      : "shrink-0 rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground active:bg-muted"
                  }
                >
                  {formatDate(date)}
                </button>
              )
            })}
          </div>
        </section>
      ) : null}

      {/* 當日沒有資料 */}
      {!hasData ? (
        <div className="rounded-3xl border border-dashed border-border bg-card px-5 py-10 text-center">
          <CalendarDays className="mx-auto size-10 text-muted-foreground" />

          <p className="mt-3 text-base font-semibold text-foreground">
            這一天還沒有紀錄
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            可以選擇其他日期查看飲食資料。
          </p>
        </div>
      ) : (
        <>
          {/* 當日營養總計 */}
          <section className="rounded-3xl border border-border bg-card p-4">
            <h2 className="mb-3 text-base font-bold text-foreground">
              {formatDate(selectedDate)} 營養總計
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <Stat
                label="總熱量"
                value={Math.round(totals.calories)}
                unit="kcal"
              />

              <Stat
                label="蛋白質"
                value={Math.round(totals.protein)}
                unit="g"
                primary
              />

              <Stat
                label="碳水"
                value={Math.round(totals.carbs)}
                unit="g"
              />

              <Stat
                label="脂肪"
                value={Math.round(totals.fat)}
                unit="g"
              />
            </div>
          </section>

          {/* 身體資料 */}
          <section className="rounded-3xl border border-border bg-card p-4">
            <h2 className="mb-3 text-base font-bold text-foreground">
              身體紀錄
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <BodyStat
                label="體重"
                value={currentDay.weight}
                unit="kg"
              />

              <BodyStat
                label="喝水"
                value={currentDay.water}
                unit="ml"
              />

              <BodyStat
                label="睡眠"
                value={currentDay.sleep}
                unit="小時"
              />

              <BodyStat
                label="運動"
                value={currentDay.exercise}
                unit="分鐘"
              />
            </div>
          </section>

          {/* 飲食紀錄 */}
          <section className="space-y-3">
            <h2 className="px-1 text-base font-bold text-foreground">
              當日飲食
            </h2>

            {MEAL_ORDER.map((meal) => {
              const items = currentDay.meals.filter(
                (item) => item.meal === meal
              )

              if (items.length === 0) return null

              const mealCalories = Math.round(
                items.reduce((sum, item) => sum + item.calories, 0)
              )

              const mealProtein = Math.round(
                items.reduce((sum, item) => sum + item.protein, 0)
              )

              return (
                <section
                  key={meal}
                  className="overflow-hidden rounded-3xl border border-border bg-card"
                >
                  <header className="flex items-center justify-between bg-muted/50 px-5 py-3">
                    <h3 className="font-bold text-foreground">
                      {MEAL_LABELS[meal]}
                    </h3>

                    <span className="text-xs text-muted-foreground">
                      {mealCalories} kcal ・ 蛋白 {mealProtein}g
                    </span>
                  </header>

                  <div className="divide-y divide-border">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 px-5 py-3"
                      >
                        {item.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.photo}
                            alt={item.name}
                            className="size-12 shrink-0 rounded-xl object-cover"
                          />
                        ) : null}

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[15px] font-semibold text-foreground">
                            {item.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {item.portion} ・{" "}
                            {Math.round(item.calories)} kcal
                          </p>

                          <p className="text-xs text-muted-foreground">
                            蛋白 {Math.round(item.protein)}g ・ 碳{" "}
                            {Math.round(item.carbs)}g ・ 脂{" "}
                            {Math.round(item.fat)}g
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
          </section>
        </>
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  unit,
  primary,
}: {
  label: string
  value: number
  unit: string
  primary?: boolean
}) {
  return (
    <div className="rounded-2xl bg-muted/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>

      <p
        className={
          primary
            ? "mt-1 text-2xl font-black text-primary"
            : "mt-1 text-2xl font-black text-foreground"
        }
      >
        {value}
        <span className="ml-1 text-xs font-medium text-muted-foreground">
          {unit}
        </span>
      </p>
    </div>
  )
}

function BodyStat({
  label,
  value,
  unit,
}: {
  label: string
  value?: number
  unit: string
}) {
  return (
    <div className="rounded-2xl bg-muted/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>

      {value !== undefined ? (
        <p className="mt-1 text-xl font-black text-foreground">
          {value}
          <span className="ml-1 text-xs font-medium text-muted-foreground">
            {unit}
          </span>
        </p>
      ) : (
        <p className="mt-1 text-sm font-medium text-muted-foreground">
          尚未記錄
        </p>
      )}
    </div>
  )
}
