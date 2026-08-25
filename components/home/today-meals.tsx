import Link from "next/link"
import { ChevronRight, UtensilsCrossed } from "lucide-react"
import { Card, CardTitle } from "@/components/ui/card"
import { MEAL_LABELS, MEAL_ORDER, type DayData } from "@/lib/types"

export function TodayMeals({ day }: { day: DayData }) {
  const byMeal = MEAL_ORDER.map((m) => ({
    meal: m,
    items: day.meals.filter((x) => x.meal === m),
  })).filter((g) => g.items.length > 0)

  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardTitle>今日飲食摘要</CardTitle>
        <Link href="/food" className="flex items-center gap-0.5 text-sm font-semibold text-primary">
          去紀錄 <ChevronRight className="size-4" />
        </Link>
      </div>

      {byMeal.length === 0 ? (
        <div className="mt-3 flex flex-col items-center gap-2 py-6 text-center">
          <UtensilsCrossed className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">今天還沒有紀錄飲食</p>
          <Link href="/food" className="text-sm font-semibold text-primary">
            現在新增第一筆
          </Link>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {byMeal.map((g) => (
            <div key={g.meal}>
              <p className="text-xs font-bold text-muted-foreground">{MEAL_LABELS[g.meal]}</p>
              <ul className="mt-1 space-y-1">
                {g.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between text-[15px]">
                    <span className="text-foreground">
                      {item.name}
                      <span className="ml-1 text-sm text-muted-foreground">{item.portion}</span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-muted-foreground">
                      {Math.round(item.calories)} kcal · 蛋{Math.round(item.protein)}g
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
