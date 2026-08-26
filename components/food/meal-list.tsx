"use client"

import { useState } from "react"
import { Trash2, Camera, Star, Check } from "lucide-react"
import { MEAL_LABELS, MEAL_ORDER, type DayData, type MealEntry } from "@/lib/types"
import { useStore } from "@/lib/store"

// 顯示某日所有飲食，依餐別分組
// 每筆飲食都可以：
// 1. 刪除
// 2. 加入常吃食物
export function MealList({
  day,
  onRemove,
}: {
  day: DayData
  onRemove: (id: string) => void
}) {
  const { data, addCommonFood } = useStore()
  const [addedIds, setAddedIds] = useState<string[]>([])

  const addToCommon = (entry: MealEntry) => {
    // 如果已經有相同名稱 + 相同份量，就不要重複加入
    const exists = data.commonFoods.some(
      (food) =>
        food.name.trim() === entry.name.trim() &&
        food.portion.trim() === entry.portion.trim(),
    )

    if (exists) {
      setAddedIds((prev) =>
        prev.includes(entry.id) ? prev : [...prev, entry.id],
      )
      return
    }

    addCommonFood({
      name: entry.name,
      portion: entry.portion || "1 份",
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fat: entry.fat,
    })

    setAddedIds((prev) =>
      prev.includes(entry.id) ? prev : [...prev, entry.id],
    )
  }

  if (day.meals.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card px-5 py-10 text-center">
        <p className="text-base text-muted-foreground text-pretty">
          今天還沒有飲食紀錄，
          <br />
          用下方三種方式新增第一筆吧。
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {MEAL_ORDER.map((meal) => {
        const items = day.meals.filter((m) => m.meal === meal)

        if (items.length === 0) return null

        const subtotal = Math.round(
          items.reduce((s, m) => s + m.calories, 0),
        )

        const protein = Math.round(
          items.reduce((s, m) => s + m.protein, 0),
        )

        return (
          <section
            key={meal}
            className="overflow-hidden rounded-3xl border border-border bg-card"
          >
            <header className="flex items-baseline justify-between bg-muted/50 px-5 py-3">
              <h3 className="text-base font-bold text-foreground">
                {MEAL_LABELS[meal]}
              </h3>

              <span className="text-sm text-muted-foreground">
                {subtotal} kcal ・ 蛋白質 {protein} g
              </span>
            </header>

            <ul className="divide-y divide-border">
              {items.map((entry) => (
                <MealRow
                  key={entry.id}
                  entry={entry}
                  onRemove={() => onRemove(entry.id)}
                  onAddCommon={() => addToCommon(entry)}
                  isCommon={addedIds.includes(entry.id)}
                />
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

function MealRow({
  entry,
  onRemove,
  onAddCommon,
  isCommon,
}: {
  entry: MealEntry
  onRemove: () => void
  onAddCommon: () => void
  isCommon: boolean
}) {
  return (
    <li className="flex items-center gap-3 px-5 py-3">
      {entry.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={entry.photo}
          alt={entry.name}
          className="size-12 shrink-0 rounded-xl object-cover"
        />
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-base font-semibold text-foreground">
            {entry.name}
          </p>

          {entry.photo ? (
            <Camera
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-label="含照片"
            />
          ) : null}
        </div>

        <p className="text-sm text-muted-foreground">
          {entry.portion ? `${entry.portion}・` : ""}
          {Math.round(entry.calories)} kcal・蛋白{" "}
          {Math.round(entry.protein)}g・碳{" "}
          {Math.round(entry.carbs)}g・脂{" "}
          {Math.round(entry.fat)}g
        </p>
      </div>

      {/* 加入常吃 */}
      <button
        type="button"
        onClick={onAddCommon}
        aria-label={
          isCommon
            ? `${entry.name} 已加入常吃`
            : `將 ${entry.name} 加入常吃`
        }
        title={isCommon ? "已加入常吃" : "加入常吃"}
        className={[
          "flex size-10 shrink-0 items-center justify-center rounded-full transition-colors",
          isCommon
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground active:bg-primary/10 active:text-primary",
        ].join(" ")}
      >
        {isCommon ? (
          <Check className="size-5" />
        ) : (
          <Star className="size-5" />
        )}
      </button>

      {/* 刪除 */}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`刪除 ${entry.name}`}
        className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors active:bg-destructive/10 active:text-destructive"
      >
        <Trash2 className="size-5" />
      </button>
    </li>
  )
}
