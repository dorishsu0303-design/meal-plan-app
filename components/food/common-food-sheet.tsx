"use client"

import { useState } from "react"
import { Plus, Trash2, Check, Star } from "lucide-react"
import { Sheet } from "@/components/ui/sheet"
import { BigButton } from "@/components/ui/big-button"
import { NutritionFields, type EditableFood } from "./nutrition-fields"
import { useStore } from "@/lib/store"
import { MEAL_LABELS, type MealType } from "@/lib/types"

const EMPTY: EditableFood = {
  name: "",
  portion: "1 份",
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
}

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
  const {
    data,
    addMeal,
    addCommonFood,
    removeCommonFood,
  } = useStore()

  const [adding, setAdding] = useState(false)
  const [draft, setDraft] =
    useState<EditableFood>(EMPTY)

  const [justAdded, setJustAdded] =
    useState<string | null>(null)

  // ==========================================================
  // 快速加入今日
  // ==========================================================

  const quickAdd = (id: string) => {
    const food = data.commonFoods.find(
      (item) => item.id === id,
    )

    if (!food) return

    addMeal(dateKey, {
      meal,

      name: food.name,

      portion: food.portion || "1 份",

      calories: food.calories,

      protein: food.protein,

      carbs: food.carbs,

      fat: food.fat,
    })

    setJustAdded(id)

    setTimeout(() => {
      setJustAdded((current) =>
        current === id ? null : current,
      )
    }, 1200)
  }

  // ==========================================================
  // 新增自訂常吃
  // ==========================================================

  const saveNewCommon = () => {
    const name = draft.name.trim()

    if (!name) return

    addCommonFood({
      name,

      portion:
        draft.portion.trim() || "1 份",

      calories: Number(draft.calories) || 0,

      protein: Number(draft.protein) || 0,

      carbs: Number(draft.carbs) || 0,

      fat: Number(draft.fat) || 0,

      builtin: false,
    })

    setDraft(EMPTY)

    setAdding(false)
  }

  // ==========================================================
  // 取消新增
  // ==========================================================

  const cancelAdding = () => {
    setDraft(EMPTY)
    setAdding(false)
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`常吃食物 · ${MEAL_LABELS[meal]}`}
    >
      <div className="space-y-4">

        {/* 說明 */}
        <div className="rounded-2xl bg-muted/60 px-4 py-3">
          <p className="text-sm font-medium text-muted-foreground">
            點一下食物，就會直接加入
            {MEAL_LABELS[meal]}。
          </p>
        </div>

        {/* ====================================================
            常吃清單
        ==================================================== */}

        {data.commonFoods.length > 0 ? (
          <div className="space-y-2">

            {data.commonFoods.map((food) => (
              <div
                key={food.id}
                className="flex items-stretch gap-2"
              >

                {/* 食物 */}
                <button
                  type="button"
                  onClick={() =>
                    quickAdd(food.id)
                  }
                  className="flex min-h-[72px] flex-1 items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 text-left transition-colors active:bg-muted"
                >

                  <span className="min-w-0">

                    {/* 名稱 */}
                    <span className="flex items-center gap-1.5">
                      <Star
                        className="size-4 shrink-0 text-primary"
                        fill="currentColor"
                      />

                      <span className="truncate text-[15px] font-bold text-foreground">
                        {food.name}
                      </span>
                    </span>

                    {/* 份量 */}
                    <span className="ml-5 text-sm text-muted-foreground">
                      {food.portion}
                    </span>

                    {/* 營養 */}
                    <span className="ml-5 mt-0.5 block text-xs text-muted-foreground">
                      {food.calories} kcal · 蛋白{" "}
                      {food.protein}g · 碳{" "}
                      {food.carbs}g · 脂{" "}
                      {food.fat}g
                    </span>

                  </span>

                  {/* 加入狀態 */}
                  {justAdded === food.id ? (
                    <span className="ml-2 flex shrink-0 items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
                      <Check className="size-3.5" />
                      已加入
                    </span>
                  ) : (
                    <Plus className="ml-2 size-5 shrink-0 text-primary" />
                  )}

                </button>

                {/* 自訂食物才能刪除 */}
                {!food.builtin ? (
                  <button
                    type="button"
                    onClick={() =>
                      removeCommonFood(food.id)
                    }
                    aria-label={`刪除常吃食物 ${food.name}`}
                    className="flex size-[72px] shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive transition-colors active:bg-destructive/20"
                  >
                    <Trash2 className="size-5" />
                  </button>
                ) : null}

              </div>
            ))}

          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center">
            <Star className="mx-auto size-8 text-muted-foreground" />

            <p className="mt-2 text-sm font-medium text-muted-foreground">
              還沒有常吃食物
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              可以從每日紀錄加入，或自行新增。
            </p>
          </div>
        )}

        {/* ====================================================
            新增常吃
        ==================================================== */}

        {adding ? (
          <div className="space-y-3 rounded-2xl border border-border bg-background p-4">

            <div>
              <p className="text-base font-bold text-foreground">
                新增常吃食物
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                之後可以從「常吃」快速加入飲食紀錄。
              </p>
            </div>

            <NutritionFields
              value={draft}
              onChange={setDraft}
            />

            <div className="grid grid-cols-2 gap-2">

              <BigButton
                variant="outline"
                className="h-12"
                onClick={cancelAdding}
              >
                取消
              </BigButton>

              <BigButton
                className="h-12"
                onClick={saveNewCommon}
                disabled={!draft.name.trim()}
              >
                儲存
              </BigButton>

            </div>
          </div>
        ) : (
          <BigButton
            variant="soft"
            onClick={() => setAdding(true)}
          >
            <Plus className="size-5" />
            新增常吃食物
          </BigButton>
        )}

      </div>
    </Sheet>
  )
}
