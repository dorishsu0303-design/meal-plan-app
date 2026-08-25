"use client"

import { cn } from "@/lib/utils"
import { MEAL_LABELS, MEAL_ORDER, type MealType } from "@/lib/types"

export function defaultMeal(): MealType {
  const h = new Date().getHours()
  if (h < 10) return "breakfast"
  if (h < 15) return "lunch"
  if (h < 20) return "dinner"
  return "snack"
}

export function MealTabs({ value, onChange }: { value: MealType; onChange: (m: MealType) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2 rounded-2xl bg-muted p-1.5">
      {MEAL_ORDER.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          aria-pressed={value === m}
          className={cn(
            "h-11 rounded-xl text-[15px] font-bold transition-colors",
            value === m ? "bg-card text-primary shadow-sm" : "text-muted-foreground",
          )}
        >
          {MEAL_LABELS[m]}
        </button>
      ))}
    </div>
  )
}
