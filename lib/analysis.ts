import type { AppData } from "./types"
import { lastNDays, formatShort } from "./date"
import { sumDay } from "./nutrition"

export interface RangeSeries {
  keys: string[]
  weight: { label: string; value: number | null }[]
  protein: { label: string; value: number | null }[]
  calories: { label: string; value: number | null }[]
}

export interface RangeAverages {
  avgCalories: number
  avgProtein: number
  avgCarbs: number
  avgFat: number
  daysWithFood: number
  latestWeight: number | null
  weightChange: number | null // 期間內首末體重差
}

// 取得最近 n 天的趨勢資料
export function buildRange(data: AppData, n: number): RangeSeries {
  const keys = lastNDays(n)
  const weight = keys.map((k) => ({ label: formatShort(k), value: data.days[k]?.weight ?? null }))
  const protein = keys.map((k) => {
    const d = data.days[k]
    return { label: formatShort(k), value: d && d.meals.length ? sumDay(d).protein : null }
  })
  const calories = keys.map((k) => {
    const d = data.days[k]
    return { label: formatShort(k), value: d && d.meals.length ? sumDay(d).calories : null }
  })
  return { keys, weight, protein, calories }
}

export function rangeAverages(data: AppData, n: number): RangeAverages {
  const keys = lastNDays(n)
  let cal = 0
  let pro = 0
  let carb = 0
  let fat = 0
  let daysWithFood = 0
  for (const k of keys) {
    const d = data.days[k]
    if (d && d.meals.length) {
      const t = sumDay(d)
      cal += t.calories
      pro += t.protein
      carb += t.carbs
      fat += t.fat
      daysWithFood += 1
    }
  }

  // 體重：取期間內有紀錄的第一筆與最後一筆
  const weights = keys.map((k) => data.days[k]?.weight).filter((w): w is number => typeof w === "number")
  const latestWeight = weights.length ? weights[weights.length - 1] : null
  const weightChange = weights.length >= 2 ? Math.round((weights[weights.length - 1] - weights[0]) * 10) / 10 : null

  const div = daysWithFood || 1
  return {
    avgCalories: Math.round(cal / div),
    avgProtein: Math.round(pro / div),
    avgCarbs: Math.round(carb / div),
    avgFat: Math.round(fat / div),
    daysWithFood,
    latestWeight,
    weightChange,
  }
}
