"use client"

import { useState } from "react"
import { Sparkles, Trash2 } from "lucide-react"
import { Sheet } from "@/components/ui/sheet"
import { TextArea, TextInput } from "@/components/ui/field"
import { BigButton } from "@/components/ui/big-button"
import { parseSentence } from "@/lib/parse"
import { useStore } from "@/lib/store"
import { MEAL_LABELS, type MealType } from "@/lib/types"

interface Row {
  name: string
  portion: string

  // 輸入時使用字串，避免小數點被 React 立即轉換掉
  calories: string
  protein: string
  carbs: string
  fat: string

  matched: boolean
  include: boolean
}

function toInputNumber(value: number): string {
  if (!Number.isFinite(value)) return ""
  return String(value)
}

function toNumber(value: string): number {
  const cleaned = value.trim()

  if (!cleaned) return 0

  const n = Number.parseFloat(cleaned)

  return Number.isFinite(n) && n >= 0 ? n : 0
}

export function OneLineSheet({
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
  const { addMeal } = useStore()

  const [text, setText] = useState("")
  const [rows, setRows] = useState<Row[] | null>(null)

  const reset = () => {
    setText("")
    setRows(null)
  }

  const handleParse = () => {
    const parsed = parseSentence(text)

    setRows(
      parsed.map((p) => ({
        name: p.name,
        portion: p.portion,
        calories: toInputNumber(p.calories),
        protein: toInputNumber(p.protein),
        carbs: toInputNumber(p.carbs),
        fat: toInputNumber(p.fat),
        matched: p.matched,
        include: true,
      })),
    )
  }

  const updateRow = (i: number, patch: Partial<Row>) => {
    setRows((prev) =>
      prev
        ? prev.map((r, idx) =>
            idx === i ? { ...r, ...patch } : r,
          )
        : prev,
    )
  }

  const handleAdd = () => {
    if (!rows) return

    rows
      .filter((r) => r.include && r.name.trim())
      .forEach((r) => {
        addMeal(dateKey, {
          meal,
          name: r.name.trim(),
          portion: r.portion || "1 份",

          // 按下加入時才轉成 number
          calories: toNumber(r.calories),
          protein: toNumber(r.protein),
          carbs: toNumber(r.carbs),
          fat: toNumber(r.fat),
        })
      })

    reset()
    onClose()
  }

  const includeCount =
    rows?.filter((r) => r.include && r.name.trim()).length ?? 0

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`一句話輸入 · ${MEAL_LABELS[meal]}`}
    >
      <div className="space-y-4">

        {/* 一句話輸入 */}
        <div>
          <TextArea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="例如：今天吃了2顆茶葉蛋、一杯蛋白飲、半個雞腿便當"
          />

          <p className="mt-1.5 text-xs text-muted-foreground">
            可使用「、」「＋」「+」或空格分隔多個食物，系統會自動拆解與估算。
          </p>
        </div>

        <BigButton
          variant="soft"
          onClick={handleParse}
          disabled={!text.trim()}
        >
          <Sparkles className="size-5" />
          解析食物
        </BigButton>

        {rows ? (
          rows.length === 0 ? (
            <p className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
              沒有解析到食物，請調整文字後再試一次。
            </p>
          ) : (
            <div className="space-y-3">

              <p className="text-sm font-semibold text-secondary-foreground">
                解析結果（可修改後加入），需確認的項目請填入營養值：
              </p>

              {rows.map((r, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-background p-3"
                >

                  {/* 食物名稱 */}
                  <div className="flex items-center gap-2">

                    <input
                      type="checkbox"
                      checked={r.include}
                      onChange={(e) =>
                        updateRow(i, {
                          include: e.target.checked,
                        })
                      }
                      className="size-5 accent-[var(--primary)]"
                      aria-label="是否加入"
                    />

                    <TextInput
                      className="h-10 flex-1"
                      value={r.name}
                      onChange={(e) =>
                        updateRow(i, {
                          name: e.target.value,
                        })
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setRows((prev) =>
                          prev
                            ? prev.filter(
                                (_, idx) => idx !== i,
                              )
                            : prev,
                        )
                      }
                      aria-label="刪除此項"
                      className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>

                  </div>

                  {/* 無法辨識提示 */}
                  {!r.matched ? (
                    <p className="mt-2 rounded-lg bg-chart-5/10 px-2.5 py-1.5 text-xs font-medium text-chart-5">
                      無法可靠辨識，請確認營養值
                    </p>
                  ) : null}

                  {/* 營養資料 */}
                  <div className="mt-2 grid grid-cols-2 gap-2">

                    {/* 份量 */}
                    <label className="flex items-center gap-1 text-xs text-muted-foreground">
                      份量

                      <TextInput
                        className="h-9"
                        value={r.portion}
                        onChange={(e) =>
                          updateRow(i, {
                            portion: e.target.value,
                          })
                        }
                      />
                    </label>

                    {/* 熱量 */}
                    <label className="flex items-center gap-1 text-xs text-muted-foreground">
                      熱量

                      <TextInput
                        className="h-9"
                        type="text"
                        inputMode="decimal"
                        value={r.calories}
                        onChange={(e) =>
                          updateRow(i, {
                            calories: e.target.value,
                          })
                        }
                      />
                    </label>

                    {/* 蛋白質 */}
                    <label className="flex items-center gap-1 text-xs text-muted-foreground">
                      蛋白

                      <TextInput
                        className="h-9"
                        type="text"
                        inputMode="decimal"
                        value={r.protein}
                        onChange={(e) =>
                          updateRow(i, {
                            protein: e.target.value,
                          })
                        }
                      />
                    </label>

                    {/* 碳水 */}
                    <label className="flex items-center gap-1 text-xs text-muted-foreground">
                      碳水

                      <TextInput
                        className="h-9"
                        type="text"
                        inputMode="decimal"
                        value={r.carbs}
                        onChange={(e) =>
                          updateRow(i, {
                            carbs: e.target.value,
                          })
                        }
                      />
                    </label>

                    {/* 脂肪 */}
                    <label className="col-span-2 flex items-center gap-1 text-xs text-muted-foreground">
                      脂肪

                      <TextInput
                        className="h-9"
                        type="text"
                        inputMode="decimal"
                        value={r.fat}
                        onChange={(e) =>
                          updateRow(i, {
                            fat: e.target.value,
                          })
                        }
                      />
                    </label>

                  </div>
                </div>
              ))}

              <BigButton
                onClick={handleAdd}
                disabled={includeCount === 0}
              >
                加入 {includeCount} 筆到{MEAL_LABELS[meal]}
              </BigButton>

            </div>
          )
        ) : null}

      </div>
    </Sheet>
  )
}
