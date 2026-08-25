"use client"

import { useState } from "react"
import { Plus, Trash2, Check } from "lucide-react"
import { Sheet } from "@/components/ui/sheet"
import { BigButton } from "@/components/ui/big-button"
import { NutritionFields, type EditableFood } from "./nutrition-fields"
import { useStore } from "@/lib/store"
import { MEAL_LABELS, type MealType } from "@/lib/types"

const EMPTY: EditableFood = { name: "", portion: "1 份", calories: 0, protein: 0, carbs: 0, fat: 0 }

export function CommonFoodSheet({
  open,
  onClose,
  meal,
  dateKey,
}: {
  open: boolean
  onClose: () => void
  meal: MealType
  dateKey: string
}) {
  const { data, addMeal, addCommonFood, removeCommonFood } = useStore()
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<EditableFood>(EMPTY)
  const [justAdded, setJustAdded] = useState<string | null>(null)

  const quickAdd = (id: string) => {
    const f = data.commonFoods.find((x) => x.id === id)
    if (!f) return
    addMeal(dateKey, {
      meal,
      name: f.name,
      portion: f.portion,
      calories: f.calories,
      protein: f.protein,
      carbs: f.carbs,
      fat: f.fat,
    })
    setJustAdded(id)
    setTimeout(() => setJustAdded((v) => (v === id ? null : v)), 1200)
  }

  const saveNewCommon = () => {
    if (!draft.name.trim()) return
    addCommonFood({ ...draft, name: draft.name.trim(), portion: draft.portion || "1 份" })
    setDraft(EMPTY)
    setAdding(false)
  }

  return (
    <Sheet open={open} onClose={onClose} title={`常吃食物 · ${MEAL_LABELS[meal]}`}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">點一下即可加入{MEAL_LABELS[meal]}。</p>

        <div className="grid grid-cols-1 gap-2">
          {data.commonFoods.map((f) => (
            <div key={f.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => quickAdd(f.id)}
                className="flex flex-1 items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 text-left active:bg-muted"
              >
                <span>
                  <span className="text-[15px] font-bold text-foreground">{f.name}</span>
                  <span className="ml-2 text-sm text-muted-foreground">{f.portion}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {f.calories} kcal · 蛋白 {f.protein}g · 碳 {f.carbs}g · 脂 {f.fat}g
                  </span>
                </span>
                {justAdded === f.id ? (
                  <span className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
                    <Check className="size-3.5" /> 已加入
                  </span>
                ) : (
                  <Plus className="size-5 shrink-0 text-primary" />
                )}
              </button>
              {!f.builtin ? (
                <button
                  type="button"
                  onClick={() => removeCommonFood(f.id)}
                  aria-label={`刪除常吃食物 ${f.name}`}
                  className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              ) : null}
            </div>
          ))}
        </div>

        {adding ? (
          <div className="space-y-3 rounded-2xl border border-border bg-background p-4">
            <p className="text-sm font-bold text-foreground">新增常吃食物</p>
            <NutritionFields value={draft} onChange={setDraft} />
            <div className="grid grid-cols-2 gap-2">
              <BigButton variant="outline" className="h-12" onClick={() => setAdding(false)}>
                取消
              </BigButton>
              <BigButton className="h-12" onClick={saveNewCommon} disabled={!draft.name.trim()}>
                儲存
              </BigButton>
            </div>
          </div>
        ) : (
          <BigButton variant="soft" onClick={() => setAdding(true)}>
            <Plus className="size-5" /> 新增常吃食物
          </BigButton>
        )}
      </div>
    </Sheet>
  )
}
