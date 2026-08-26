"use client"

import { useState } from "react"
import { Trash2, Camera, Star, Check } from "lucide-react"
import { MEAL_LABELS, MEAL_ORDER, type DayData, type MealEntry } from "@/lib/types"
import { useStore } from "@/lib/store"

// 顯示某日所有飲食，依餐別分組
// 可刪除，也可以直接把今天吃過的食物加入「常吃」
export function MealList({
  day,
  onRemove,
}: {
  day: DayData
  onRemove: (id: string) => void
}) {
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
          items.reduce((s, m) => s + m.calories, 0)
        )

        const protein = Math.round(
          items.reduce((s, m) => s + m.protein, 0)
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
              {items.map((m) => (
                <MealRow
                  key={m.id}
                  entry={m}
                  onRemove={() => onRemove(m.id)}
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
}: {
  entry: MealEntry
  onRemove: () => void
}) {
  const { data, addCommonFood } = useStore()

  const [added, setAdded] = useState(false)

  // 判斷這個食物是否已經存在於「常吃」
  const existingCommon = data.commonFoods.find(
    (food) =>
      food.name.trim().toLowerCase() === entry.name.trim().toLowerCase()
  )

  const addToCommon = () => {
    // 已經存在就不重複新增
    if (existingCommon || added) return

    addCommonFood({
      name: entry.name,
      portion: entry.portion || "1 份",
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fat: entry.fat,
    })

    setAdded(true)
  }

  const isCommon = !!existingCommon || added

  return (
    <li className="px-5 py-3">
      <div className="flex items-center gap-3">
        {/* 照片 */}
        {entry.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.photo}
            alt={entry.name}
            className="size-12 shrink-0 rounded-xl object-cover"
          />
        ) : null}

        {/* 食物內容 */}
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
      </div>

      {/* 操作按鈕 */}
      <div className="mt-2 flex items-center justify-end gap-2">
        {/* 加入常吃 */}
        <button
          type="button"
          onClick={addToCommon}
          disabled={isCommon}
          className={
            isCommon
              ? "flex h-9 items-center gap-1.5 rounded-xl bg-primary/10 px-3 text-xs font-semibold text-primary"
              : "flex h-9 items-center gap-1.5 rounded-xl bg-accent px-3 text-xs font-semibold text-accent-foreground transition-colors active:bg-accent/70"
          }
        >
          {isCommon ? (
            <>
              <Check className="size-3.5" />
              已是常吃
            </>
          ) : (
            <>
              <Star className="size-3.5" />
              加入常吃
            </>
          )}
        </button>

        {/* 刪除 */}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`刪除 ${entry.name}`}
          className="flex size-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive transition-colors active:bg-destructive/20"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </li>
  )
}
