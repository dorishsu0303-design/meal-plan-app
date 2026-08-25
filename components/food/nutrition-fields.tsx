"use client"

import { Field, TextInput } from "@/components/ui/field"
import type { Nutrition } from "@/lib/types"

export interface EditableFood extends Nutrition {
  name: string
  portion: string
}

// 可編輯的食物營養欄位（名稱、份量、四大營養）
export function NutritionFields({
  value,
  onChange,
}: {
  value: EditableFood
  onChange: (v: EditableFood) => void
}) {
  const num = (s: string) => {
    const n = Number.parseFloat(s)
    return Number.isFinite(n) && n >= 0 ? n : 0
  }

  return (
    <div className="space-y-3">
      <Field label="名稱">
        <TextInput
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="例如：雞胸肉"
        />
      </Field>
      <Field label="份量">
        <TextInput
          value={value.portion}
          onChange={(e) => onChange({ ...value, portion: e.target.value })}
          placeholder="例如：1 份、2 顆"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="熱量 (kcal)">
          <TextInput
            inputMode="decimal"
            value={value.calories || ""}
            onChange={(e) => onChange({ ...value, calories: num(e.target.value) })}
            placeholder="0"
          />
        </Field>
        <Field label="蛋白質 (g)">
          <TextInput
            inputMode="decimal"
            value={value.protein || ""}
            onChange={(e) => onChange({ ...value, protein: num(e.target.value) })}
            placeholder="0"
          />
        </Field>
        <Field label="碳水 (g)">
          <TextInput
            inputMode="decimal"
            value={value.carbs || ""}
            onChange={(e) => onChange({ ...value, carbs: num(e.target.value) })}
            placeholder="0"
          />
        </Field>
        <Field label="脂肪 (g)">
          <TextInput
            inputMode="decimal"
            value={value.fat || ""}
            onChange={(e) => onChange({ ...value, fat: num(e.target.value) })}
            placeholder="0"
          />
        </Field>
      </div>
    </div>
  )
}
