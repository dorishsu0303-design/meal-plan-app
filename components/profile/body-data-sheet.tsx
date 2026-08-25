"use client"

import { useState } from "react"
import { Sheet } from "@/components/ui/sheet"
import { Field, TextInput } from "@/components/ui/field"
import { BigButton } from "@/components/ui/big-button"
import { useStore } from "@/lib/store"
import { todayKey, formatDisplay } from "@/lib/date"

export function BodyDataSheet({
  open,
  onClose,
  dateKey,
}: {
  open: boolean
  onClose: () => void
  dateKey?: string
}) {
  const key = dateKey ?? todayKey()
  const { getDay, updateDay } = useStore()
  const day = getDay(key)

  const [weight, setWeight] = useState(day.weight != null ? String(day.weight) : "")
  const [water, setWater] = useState(day.water != null ? String(day.water) : "")
  const [sleep, setSleep] = useState(day.sleep != null ? String(day.sleep) : "")
  const [exercise, setExercise] = useState(day.exercise != null ? String(day.exercise) : "")

  const num = (s: string) => {
    const n = Number.parseFloat(s)
    return Number.isFinite(n) && n >= 0 ? n : undefined
  }

  const handleSave = () => {
    updateDay(key, {
      weight: num(weight),
      water: num(water),
      sleep: num(sleep),
      exercise: num(exercise),
    })
    onClose()
  }

  const addWater = (ml: number) => {
    const current = num(water) ?? 0
    setWater(String(current + ml))
  }

  return (
    <Sheet open={open} onClose={onClose} title="每日身體資料">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{formatDisplay(key)}</p>

        <Field label="體重 (kg)">
          <TextInput
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="例如：72.5"
          />
        </Field>

        <Field label="喝水量 (ml)">
          <TextInput inputMode="numeric" value={water} onChange={(e) => setWater(e.target.value)} placeholder="例如：1500" />
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[250, 500, 750].map((ml) => (
              <button
                key={ml}
                type="button"
                onClick={() => addWater(ml)}
                className="h-10 rounded-xl bg-accent text-sm font-bold text-accent-foreground active:bg-accent/80"
              >
                +{ml}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="睡眠 (小時)">
            <TextInput inputMode="decimal" value={sleep} onChange={(e) => setSleep(e.target.value)} placeholder="7" />
          </Field>
          <Field label="運動 (分鐘)">
            <TextInput inputMode="numeric" value={exercise} onChange={(e) => setExercise(e.target.value)} placeholder="30" />
          </Field>
        </div>

        <BigButton onClick={handleSave}>儲存</BigButton>
      </div>
    </Sheet>
  )
}
