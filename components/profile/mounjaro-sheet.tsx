"use client"

import { useState } from "react"
import { Sheet } from "@/components/ui/sheet"
import { Field, TextInput, TextArea } from "@/components/ui/field"
import { BigButton } from "@/components/ui/big-button"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { todayKey } from "@/lib/date"

const DOSES = ["2.5 mg", "5 mg", "7.5 mg", "10 mg", "12.5 mg", "15 mg"]
const APPETITE = [
  { v: 1, label: "很低" },
  { v: 2, label: "偏低" },
  { v: 3, label: "普通" },
  { v: 4, label: "偏高" },
  { v: 5, label: "很高" },
]

export function MounjaroSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addMounjaro } = useStore()
  const [date, setDate] = useState(todayKey())
  const [dose, setDose] = useState("2.5 mg")
  const [appetite, setAppetite] = useState(3)
  const [nausea, setNausea] = useState(false)
  const [bloating, setBloating] = useState(false)
  const [constipation, setConstipation] = useState(false)
  const [otherFeeling, setOtherFeeling] = useState("")
  const [note, setNote] = useState("")

  const reset = () => {
    setDate(todayKey())
    setDose("2.5 mg")
    setAppetite(3)
    setNausea(false)
    setBloating(false)
    setConstipation(false)
    setOtherFeeling("")
    setNote("")
  }

  const handleSave = () => {
    addMounjaro({ date, dose, appetite, nausea, bloating, constipation, otherFeeling: otherFeeling.trim(), note: note.trim() })
    reset()
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="新增猛健樂紀錄">
      <div className="space-y-4">
        <Field label="注射日期">
          <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>

        <Field label="劑量">
          <div className="grid grid-cols-3 gap-2">
            {DOSES.map((d) => (
              <Chip key={d} active={dose === d} onClick={() => setDose(d)}>
                {d}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label="注射後食慾（1～5）">
          <div className="grid grid-cols-5 gap-2">
            {APPETITE.map((a) => (
              <button
                key={a.v}
                type="button"
                onClick={() => setAppetite(a.v)}
                aria-pressed={appetite === a.v}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-2xl border py-2.5 transition-colors",
                  appetite === a.v
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground",
                )}
              >
                <span className="text-lg font-black">{a.v}</span>
                <span className="text-[11px]">{a.label}</span>
              </button>
            ))}
          </div>
        </Field>

        <Field label="身體感受">
          <div className="grid grid-cols-3 gap-2">
            <Toggle active={nausea} onClick={() => setNausea((v) => !v)}>
              噁心
            </Toggle>
            <Toggle active={bloating} onClick={() => setBloating((v) => !v)}>
              胃脹
            </Toggle>
            <Toggle active={constipation} onClick={() => setConstipation((v) => !v)}>
              便秘
            </Toggle>
          </div>
        </Field>

        <Field label="其他身體感受">
          <TextInput
            value={otherFeeling}
            onChange={(e) => setOtherFeeling(e.target.value)}
            placeholder="例如：疲倦、頭暈"
          />
        </Field>

        <Field label="備註">
          <TextArea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="想記錄的其他事項" />
        </Field>

        <BigButton onClick={handleSave}>儲存紀錄</BigButton>
      </div>
    </Sheet>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-11 rounded-2xl border text-[15px] font-bold transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground",
      )}
    >
      {children}
    </button>
  )
}

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-12 rounded-2xl border text-[15px] font-bold transition-colors",
        active ? "border-chart-5 bg-chart-5/15 text-chart-5" : "border-border bg-background text-muted-foreground",
      )}
    >
      {children}
    </button>
  )
}
