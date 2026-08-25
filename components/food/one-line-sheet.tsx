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
  calories: number
  protein: number
  carbs: number
  fat: number
  matched: boolean
  include: boolean
}

type NumericField = "calories" | "protein" | "carbs" | "fat"

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

  // 暫存正在輸入中的小數字串
  // 例如輸入 12.5 時，可以先保留 "12."
  const [draftNumbers, setDraftNumbers] = useState<Record<string, string>>({})

  const reset = () => {
    setText("")
    setRows(null)
    setDraftNumbers({})
  }

  const handleParse = () => {
    const parsed = parseSentence(text)

    setRows(
      parsed.map((p) => ({
        ...p,
        include: true,
      })),
    )

    setDraftNumbers({})
  }

  const updateRow = (i: number, patch: Partial<Row>) => {
    setRows((prev) =>
      prev
        ? prev.map((r, idx) =>
            idx === i
              ? {
                  ...r,
                  ...patch,
                }
              : r,
          )
        : prev,
    )
  }

  // 更新數字欄位
  // 可以正常輸入：
  // 0.5
  // 12.5
  // 100.25
  // 以及輸入過程中的 "0."、"12."
  const updateNumeric = (i: number, field: NumericField, value: string) => {
    const key = `${i}-${field}`

    // 空白允許暫時存在
    if (value === "") {
      setDraftNumbers((prev) => ({
        ...prev,
        [key]: "",
      }))

      updateRow(i, {
        [field]: 0,
      })

      return
    }

    // 只允許數字與一個小數點
    if (!/^\d*\.?\d*$/.test(value)) {
      return
    }

    // 保留使用者正在輸入的原始字串
    setDraftNumbers((prev) => ({
      ...prev,
      [key]: value,
    }))

    // "12."、"0." 都可以暫存
    // 真正計算時再轉成數字
    const n = Number.parseFloat(value)

    if (Number.isFinite(n) && n >= 0) {
      updateRow(i, {
        [field]: n,
      })
    }
  }

  // 顯示數字欄位
  const getNumericValue = (i: number, field: NumericField, value: number) => {
    const key = `${i}-${field}`

    if (Object.prototype.hasOwnProperty.call(draftNumbers, key)) {
      return draftNumbers[key]
    }

    return value === 0 ? "" : String(value)
  }

  const handleAdd = () => {
    if (!rows) return

    rows
      .filter((r) => r.include && r.name.trim())
      .forEach((r) =>
        addMeal(dateKey, {
          meal,
          name: r.name.trim(),
          portion: r.portion,
          calories: Number.isFinite(r.calories) ? r.calories : 0,
          protein: Number.isFinite(r.protein) ? r.protein : 0,
          carbs: Number.isFinite(r.carbs) ? r.carbs : 0,
          fat: Number.isFinite(r.fat) ? r.fat : 0,
        }),
      )

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
        <div>
          <TextArea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="例如：今天吃了2顆茶葉蛋、一杯蛋白飲、半隻雞腿"
          />

          <p className="mt-1.5 text-xs text-muted-foreground">
            用「、」或空格分隔多個食物，系統會自動拆解與估算。
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
                            ? prev.filter((_, idx) => idx !== i)
                            : prev,
                        )
                      }
                      aria-label="刪除此項"
                      className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  {!r.matched ? (
                    <p className="mt-2 rounded-lg bg-chart-5/10 px-2.5 py-1.5 text-xs font-medium text-chart-5">
                      無法可靠辨識，請確認營養值
                    </p>
                  ) : null}

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
                        inputMode="decimal"
                        value={getNumericValue(i, "calories", r.calories)}
                        onChange={(e) =>
                          updateNumeric(i, "calories", e.target.value)
                        }
                      />
                    </label>

                    {/* 蛋白質 */}
                    <label className="flex items-center gap-1 text-xs text-muted-foreground">
                      蛋白

                      <TextInput
                        className="h-9"
                        inputMode="decimal"
                        value={getNumericValue(i, "protein", r.protein)}
                        onChange={(e) =>
                          updateNumeric(i, "protein", e.target.value)
                        }
                      />
                    </label>

                    {/* 碳水 */}
                    <label className="flex items-center gap-1 text-xs text-muted-foreground">
                      碳水

                      <TextInput
                        className="h-9"
                        inputMode="decimal"
                        value={getNumericValue(i, "carbs", r.carbs)}
                        onChange={(e) =>
                          updateNumeric(i, "carbs", e.target.value)
                        }
                      />
                    </label>

                    {/* 脂肪 */}
                    <label className="col-span-2 flex items-center gap-1 text-xs text-muted-foreground">
                      脂肪

                      <TextInput
                        className="h-9"
                        inputMode="decimal"
                        value={getNumericValue(i, "fat", r.fat)}
                        onChange={(e) =>
                          updateNumeric(i, "fat", e.target.value)
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
