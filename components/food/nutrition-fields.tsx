"use client"

import { Field, TextInput } from "@/components/ui/field"
import type { Nutrition } from "@/lib/types"

export interface EditableFood extends Nutrition {
  name: string
  portion: string
}

// 可編輯的食物營養欄位
// 支援小數，例如：120.5、20.5、1.5
export function NutritionFields({
  value,
  onChange,
}: {
  value: EditableFood
  onChange: (v: EditableFood) => void
}) {
  // 數字欄位允許：
  // 0
  // 0.5
  // 1.5
  // 12.25
  const num = (s: string): number => {
    if (s === "") return 0

    const n = Number.parseFloat(s)

    if (!Number.isFinite(n) || n < 0) {
      return 0
    }

    return n
  }

  return (
    <div className="space-y-3">
      {/* 名稱 */}
      <Field label="名稱">
        <TextInput
          value={value.name}
          onChange={(e) =>
            onChange({
              ...value,
              name: e.target.value,
            })
          }
          placeholder="例如：雞胸肉"
        />
      </Field>

      {/* 份量 */}
      <Field label="份量">
        <TextInput
          value={value.portion}
          onChange={(e) =>
            onChange({
              ...value,
              portion: e.target.value,
            })
          }
          placeholder="例如：1 份、2 顆"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        {/* 熱量 */}
        <Field label="熱量 (kcal)">
          <TextInput
            type="number"
            step="0.1"
            min="0"
            inputMode="decimal"
            value={value.calories === 0 ? "" : value.calories}
            onChange={(e) =>
              onChange({
                ...value,
                calories: num(e.target.value),
              })
            }
            placeholder="例如：120.5"
          />
        </Field>

        {/* 蛋白質 */}
        <Field label="蛋白質 (g)">
          <TextInput
            type="number"
            step="0.1"
            min="0"
            inputMode="decimal"
            value={value.protein === 0 ? "" : value.protein}
            onChange={(e) =>
              onChange({
                ...value,
                protein: num(e.target.value),
              })
            }
            placeholder="例如：20.5"
          />
        </Field>

        {/* 碳水 */}
        <Field label="碳水 (g)">
          <TextInput
            type="number"
            step="0.1"
            min="0"
            inputMode="decimal"
            value={value.carbs === 0 ? "" : value.carbs}
            onChange={(e) =>
              onChange({
                ...value,
                carbs: num(e.target.value),
              })
            }
            placeholder="例如：5.5"
          />
        </Field>

        {/* 脂肪 */}
        <Field label="脂肪 (g)">
          <TextInput
            type="number"
            step="0.1"
            min="0"
            inputMode="decimal"
            value={value.fat === 0 ? "" : value.fat}
            onChange={(e) =>
              onChange({
                ...value,
                fat: num(e.target.value),
              })
            }
            placeholder="例如：1.5"
          />
        </Field>
      </div>
    </div>
  )
}
