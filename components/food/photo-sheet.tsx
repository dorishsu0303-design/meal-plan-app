"use client"

import { useRef, useState } from "react"
import { Camera, ImagePlus, LoaderCircle, Sparkles, X } from "lucide-react"
import { Sheet } from "@/components/ui/sheet"
import { BigButton } from "@/components/ui/big-button"
import { NutritionFields, type EditableFood } from "./nutrition-fields"
import { useStore } from "@/lib/store"
import { MEAL_LABELS, type MealType } from "@/lib/types"

const EMPTY: EditableFood = { name: "", portion: "1 份", calories: 0, protein: 0, carbs: 0, fat: 0 }

function fileToDataUrl(file: File, maxSize = 720): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const image = new Image()
      image.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
        const canvas = document.createElement("canvas")
        canvas.width = Math.round(image.width * scale)
        canvas.height = Math.round(image.height * scale)
        const context = canvas.getContext("2d")
        if (!context) return reject(new Error("Canvas is unavailable"))
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL("image/jpeg", 0.7))
      }
      image.onerror = reject
      image.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function PhotoSheet({ open, onClose, meal, dateKey }: { open: boolean; onClose: () => void; meal: MealType; dateKey: string }) {
  const { addMeal } = useStore()
  const cameraRef = useRef<HTMLInputElement>(null)
  const libraryRef = useRef<HTMLInputElement>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<EditableFood[]>([EMPTY])
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState("")

  const reset = () => {
    setPhoto(null)
    setDrafts([EMPTY])
    setAnalyzing(false)
    setError("")
  }

  const onPick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      setPhoto(await fileToDataUrl(file))
      setDrafts([EMPTY])
      setError("")
    } catch {
      setError("這張照片無法讀取，請換一張再試。")
    }
    event.target.value = ""
  }

  const analyzePhoto = async () => {
    if (!photo || analyzing) return
    setAnalyzing(true)
    setError("")
    try {
      const response = await fetch("/api/analyze-food", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: photo }) })
      const result = (await response.json().catch(() => null)) as { items?: EditableFood[]; error?: string } | null
      if (!response.ok) throw new Error(result?.error || "照片辨識失敗，請稍後再試。")
      if (!result?.items?.length) throw new Error("沒有辨識到食物，請換一張更清楚的照片，或自行填寫。")
      setDrafts(result.items)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "照片辨識失敗，請稍後再試。")
    } finally {
      setAnalyzing(false)
    }
  }

  const updateDraft = (index: number, value: EditableFood) => setDrafts((previous) => previous.map((draft, current) => (current === index ? value : draft)))

  const handleAdd = () => {
    const included = drafts.filter((draft) => draft.name.trim())
    included.forEach((draft, index) => addMeal(dateKey, {
      meal, name: draft.name.trim(), portion: draft.portion || "1 份", calories: draft.calories,
      protein: draft.protein, carbs: draft.carbs, fat: draft.fat,
      // 同一張圖只存一次，避免多項食物重複占滿瀏覽器儲存空間。
      photo: index === 0 ? photo ?? undefined : undefined,
    }))
    reset()
    onClose()
  }

  const includeCount = drafts.filter((draft) => draft.name.trim()).length

  return (
    <Sheet open={open} onClose={onClose} title={`拍照紀錄 · ${MEAL_LABELS[meal]}`}>
      <div className="space-y-4">
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={onPick} className="hidden" />
        <input ref={libraryRef} type="file" accept="image/*" onChange={onPick} className="hidden" />
        {photo ? (
          <div className="relative overflow-hidden rounded-2xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="今日飲食照片" className="max-h-64 w-full object-cover" />
            <button type="button" onClick={reset} aria-label="移除照片" className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-foreground/60 text-background"><X className="size-5" /></button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <BigButton variant="soft" onClick={() => cameraRef.current?.click()}><Camera className="size-5" /> 拍照</BigButton>
            <BigButton variant="soft" onClick={() => libraryRef.current?.click()}><ImagePlus className="size-5" /> 從相簿選</BigButton>
          </div>
        )}
        {photo ? <BigButton variant="soft" onClick={analyzePhoto} disabled={analyzing}>{analyzing ? <LoaderCircle className="size-5 animate-spin" /> : <Sparkles className="size-5" />}{analyzing ? "正在辨識照片…" : "辨識照片中的食物"}</BigButton> : null}
        <p className="rounded-2xl bg-chart-5/10 px-4 py-3 text-sm font-medium text-chart-5">辨識結果是估算值；請確認下方食物與營養數字後再加入。</p>
        {error ? <p role="alert" className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{error}</p> : null}
        <div className="space-y-5">
          {drafts.map((draft, index) => <div key={index} className={drafts.length > 1 ? "rounded-2xl border border-border p-3" : ""}>
            {drafts.length > 1 ? <p className="mb-3 text-sm font-bold text-secondary-foreground">食物 {index + 1}</p> : null}
            <NutritionFields value={draft} onChange={(value) => updateDraft(index, value)} />
          </div>)}
        </div>
        <BigButton onClick={handleAdd} disabled={includeCount === 0}>加入 {includeCount} 筆到{MEAL_LABELS[meal]}</BigButton>
      </div>
    </Sheet>
  )
}
