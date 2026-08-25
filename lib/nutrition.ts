import type { DayData, Goals, Nutrition } from "./types"

export interface DayTotals extends Nutrition {
  mealCount: number
}

// 加總某日所有飲食的營養
export function sumDay(day: DayData | undefined): DayTotals {
  const totals: DayTotals = { calories: 0, protein: 0, carbs: 0, fat: 0, mealCount: 0 }
  if (!day) return totals
  for (const m of day.meals) {
    totals.calories += m.calories
    totals.protein += m.protein
    totals.carbs += m.carbs
    totals.fat += m.fat
    totals.mealCount += 1
  }
  totals.calories = Math.round(totals.calories)
  totals.protein = Math.round(totals.protein)
  totals.carbs = Math.round(totals.carbs)
  totals.fat = Math.round(totals.fat)
  return totals
}

export type ReminderTone = "good" | "warn" | "info"

export interface Reminder {
  tone: ReminderTone
  text: string
}

// 產生今日營養提醒。重點：蛋白質是否足夠、是否吃太少。
// 不鼓勵極低熱量飲食。
export function buildReminders(totals: DayTotals, goals: Goals): Reminder[] {
  const reminders: Reminder[] = []

  // 蛋白質提醒
  if (totals.mealCount === 0) {
    reminders.push({ tone: "info", text: "今天還沒有紀錄，記得補充足夠的蛋白質。" })
  } else if (totals.protein < goals.protein * 0.6) {
    reminders.push({
      tone: "warn",
      text: "⚠️ 今天蛋白質偏低，下一餐優先補充蛋白質。",
    })
  } else if (totals.protein < goals.protein) {
    reminders.push({
      tone: "info",
      text: `蛋白質再加把勁，距離目標還差 ${Math.max(0, Math.round(goals.protein - totals.protein))} 克。`,
    })
  } else {
    reminders.push({ tone: "good", text: "很好！今天蛋白質已達標。" })
  }

  // 熱量偏低提醒（僅在有紀錄時）
  if (totals.mealCount > 0 && totals.calories < goals.caloriesMin) {
    reminders.push({
      tone: "warn",
      text: "⚠️ 今天吃得偏少，減重期間仍需要注意整體營養。",
    })
  }

  return reminders
}

// 蛋白質達成率 0~1（可超過 1）
export function proteinRatio(totals: DayTotals, goals: Goals): number {
  if (goals.protein <= 0) return 0
  return totals.protein / goals.protein
}

export function caloriesRatio(totals: DayTotals, goals: Goals): number {
  if (goals.calories <= 0) return 0
  return totals.calories / goals.calories
}
