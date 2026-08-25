import { NextResponse } from "next/server"

export const runtime = "nodejs"

type FoodItem = { name: string; portion: string; calories: number; protein: number; carbs: number; fat: number }

const foodSchema = {
  type: "object", additionalProperties: false, required: ["items"], properties: {
    items: { type: "array", maxItems: 8, items: {
      type: "object", additionalProperties: false,
      required: ["name", "portion", "calories", "protein", "carbs", "fat"],
      properties: {
        name: { type: "string" }, portion: { type: "string" }, calories: { type: "number" },
        protein: { type: "number" }, carbs: { type: "number" }, fat: { type: "number" },
      },
    } },
  },
}

function isFoodItem(value: unknown): value is FoodItem {
  if (!value || typeof value !== "object") return false
  const item = value as Record<string, unknown>
  return typeof item.name === "string" && typeof item.portion === "string" &&
    ["calories", "protein", "carbs", "fat"].every((key) => typeof item[key] === "number" && Number.isFinite(item[key]))
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return NextResponse.json({ error: "尚未設定照片辨識服務。" }, { status: 503 })

  const body = (await request.json().catch(() => null)) as { image?: unknown } | null
  const image = body?.image
  if (typeof image !== "string" || !/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(image)) {
    return NextResponse.json({ error: "請上傳 JPEG、PNG 或 WebP 圖片。" }, { status: 400 })
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_VISION_MODEL || "gpt-4.1-mini",
        input: [
          { role: "system", content: "你是台灣飲食紀錄助手。辨識照片中的食物，將每一種主要食物列為一筆。根據可見份量估算整筆的熱量(kcal)、蛋白質、碳水與脂肪(g)。不確定時採保守估算；不要辨識餐具、包裝或背景。所有數值必須是非負數。" },
          { role: "user", content: [{ type: "input_text", text: "請分析這張餐點照片。" }, { type: "input_image", image_url: image, detail: "high" }] },
        ],
        text: { format: { type: "json_schema", name: "food_analysis", strict: true, schema: foodSchema } },
      }),
    })
    if (!response.ok) {
      console.error("Food image analysis failed", response.status)
      return NextResponse.json({ error: "照片辨識暫時無法使用，請稍後再試。" }, { status: 502 })
    }
    const result = (await response.json()) as { output_text?: unknown }
    const parsed = typeof result.output_text === "string" ? JSON.parse(result.output_text) : null
    const items = Array.isArray(parsed?.items) ? parsed.items.filter(isFoodItem) : []
    return NextResponse.json({ items })
  } catch (error) {
    console.error("Food image analysis error", error)
    return NextResponse.json({ error: "無法完成照片辨識，請稍後再試。" }, { status: 500 })
  }
}
