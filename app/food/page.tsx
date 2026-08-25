"use client"

import { useState } from "react"
import { Sparkles, Camera, Star } from "lucide-react"
import { useStore } from "@/lib/store"
import { todayKey, formatDisplay } from "@/lib/date"
import { sumDay } from "@/lib/nutrition"
import { MealTabs, defaultMeal } from "@/components/food/meal-tabs"
import { MealList } from "@/components/food/meal-list"
import { OneLineSheet } from "@/components/food/one-line-sheet"
import { PhotoSheet } from "@/components/food/photo-sheet"
import { CommonFoodSheet } from "@/components/food/common-food-sheet"
import { MEAL_LABELS, type MealType } from "@/lib/types"

type SheetKind = "oneline" | "photo" | "common" | null

export default function FoodPage() {
  const { loaded, getDay, removeMeal } = useStore()
  const key = todayKey()
  const day = getDay(key)
  const totals = sumDay(day)

  const [meal, setMeal] = useState<MealType>(defaultMeal())
  const [sheet, setSheet] = useState<SheetKind>(null)

  return (
    <div className="space-y-4">
      <header className="px-1">
        <h1 className="text-2xl font-black text-foreground">飲食紀錄</h1>
        <p className="mt-0.5 text-sm font-medium text-muted-foreground">{formatDisplay(key)}</p>
      </header>

      {/* 今日總計 */}
      <div className="grid grid-cols-2 gap-3 rounded-3xl border border-border bg-card p-4">
        <TotalItem label="總熱量" value={`${totals.calories}`} unit="kcal" />
        <TotalItem label="蛋白質" value={`${totals.protein}`} unit="g" accent />
        <TotalItem label="碳水" value={`${totals.carbs}`} unit="g" />
        <TotalItem label="脂肪" value={`${totals.fat}`} unit="g" />
      </div>

      {/* 選擇餐別 */}
      <div className="space-y-2">
        <p className="px-1 text-sm font-semibold text-secondary-foreground">選擇餐別</p>
        <MealTabs value={meal} onChange={setMeal} />
      </div>

      {/* 三種輸入方式 */}
      <div className="space-y-2">
        <p className="px-1 text-sm font-semibold text-secondary-foreground">新增到「{MEAL_LABELS[meal]}」</p>
        <div className="grid grid-cols-3 gap-3">
          <AddMethod
            icon={<Sparkles className="size-6" />}
            label="一句話"
            desc="打字輸入"
            onClick={() => setSheet("oneline")}
          />
          <AddMethod
            icon={<Camera className="size-6" />}
            label="拍照"
            desc="相機/相簿"
            onClick={() => setSheet("photo")}
          />
          <AddMethod
            icon={<Star className="size-6" />}
            label="常吃"
            desc="快速選擇"
            onClick={() => setSheet("common")}
          />
        </div>
      </div>

      {/* 今日清單 */}
      <div className="space-y-2 pt-1">
        <p className="px-1 text-sm font-semibold text-secondary-foreground">今日清單</p>
        {loaded ? <MealList day={day} onRemove={(id) => removeMeal(key, id)} /> : null}
      </div>

      <OneLineSheet open={sheet === "oneline"} onClose={() => setSheet(null)} meal={meal} dateKey={key} />
      <PhotoSheet open={sheet === "photo"} onClose={() => setSheet(null)} meal={meal} dateKey={key} />
      <CommonFoodSheet open={sheet === "common"} onClose={() => setSheet(null)} meal={meal} dateKey={key} />
    </div>
  )
}

function TotalItem({ label, value, unit, accent }: { label: string; value: string; unit: string; accent?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="mt-0.5">
        <span className={accent ? "text-2xl font-black text-primary" : "text-2xl font-black text-foreground"}>
          {value}
        </span>
        <span className="ml-1 text-sm text-muted-foreground">{unit}</span>
      </span>
    </div>
  )
}

function AddMethod({
  icon,
  label,
  desc,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  desc: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-3xl border border-border bg-card px-2 py-4 text-center transition-colors active:bg-muted"
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        {icon}
      </span>
      <span className="text-[15px] font-bold text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground">{desc}</span>
    </button>
  )
}
