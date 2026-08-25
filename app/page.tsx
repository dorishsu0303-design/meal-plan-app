"use client"

import { useStore } from "@/lib/store"
import { todayKey, formatDisplay } from "@/lib/date"
import { sumDay, buildReminders } from "@/lib/nutrition"
import { ProteinFocus } from "@/components/home/protein-focus"
import { StatGrid } from "@/components/home/stat-grid"
import { TodayMeals } from "@/components/home/today-meals"
import { MounjaroSummary } from "@/components/home/mounjaro-summary"
import { ReminderList } from "@/components/reminder-list"

export default function HomePage() {
  const { data, loaded, getDay } = useStore()
  const key = todayKey()
  const day = getDay(key)
  const totals = sumDay(day)
  const reminders = buildReminders(totals, data.goals)

  return (
    <div className="space-y-4">
      <header className="px-1">
        <h1 className="text-2xl font-black text-foreground">減重日記</h1>
        <p className="mt-0.5 text-sm font-medium text-muted-foreground">{formatDisplay(key)}</p>
      </header>

      {!loaded ? (
        <div className="py-20 text-center text-muted-foreground">載入中…</div>
      ) : (
        <>
          <ProteinFocus totals={totals} goals={data.goals} />
          <ReminderList reminders={reminders} />
          <section aria-label="今日數據">
            <StatGrid day={day} totals={totals} goals={data.goals} />
          </section>
          <TodayMeals day={day} />
          <MounjaroSummary records={data.mounjaro} />
        </>
      )}
    </div>
  )
}
