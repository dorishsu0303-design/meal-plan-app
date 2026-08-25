import { NextResponse } from "next/server"
import { FOOD_DB } from "@/lib/foods"

export const runtime = "nodejs"

type FoodItem = {
  name: string
  portion: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

type AIItem = {
  name: string
  portion: string
  quantity: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

const foodSchema = {
  type: "object",
  additionalProperties: false,
  required: ["items"],
  properties: {
    items: {
      type: "array",
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "name",
          "portion",
          "quantity",
          "unit",
          "calories",
          "protein",
          "carbs",
          "fat",
        ],
        properties: {
          name: { type: "string" },
          portion: { type: "string" },
          quantity: { type: "number" },
          unit: { type: "string" },
          calories: { type: "number" },
          protein: { type: "number" },
          carbs: { type: "number" },
          fat: { type: "number" },
        },
      },
    },
  },
}

function isAIItem(value: unknown): value is AIItem {
  if (!value || typeof value !== "object") return false

  const item = value as Record<string, unknown>

  return (
    typeof item.name === "string" &&
    typeof item.portion === "string" &&
    typeof item.quantity === "number" &&
    Number.isFinite(item.quantity) &&
    item.quantity >= 0 &&
    typeof item.unit === "string" &&
    ["calories", "protein", "carbs", "fat"].every(
      (key) =>
        typeof item[key] === "number" &&
        Number.isFinite(item[key]) &&
        Number(item[key]) >= 0,
    )
  )
}

function round1(n: number) {
  return Math.round(n * 10) / 10
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[，、。,.＋+]/g, "")
}

/**
 * 找 FOOD_DB 裡最接近的食物
 */
function findFood(name: string) {
  const target = normalize(name)

  // 先找完全符合名稱
  const exact = FOOD_DB.find((food) => normalize(food.name) === target)

  if (exact) return exact

  // 再用 keywords 找
  const keywordMatch = FOOD_DB.find((food) =>
    food.keywords.some((keyword) => {
      const k = normalize(keyword)
      return target.includes(k) || k.includes(target)
    }),
  )

  return keywordMatch
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: "尚未設定照片辨識服務。" },
      { status: 503 },
    )
  }

  const body = (await request.json().catch(() => null)) as {
    image?: unknown
  } | null

  const image = body?.image

  if (
    typeof image !== "string" ||
    !/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(image)
  ) {
    return NextResponse.json(
      { error: "請上傳 JPEG、PNG 或 WebP 圖片。" },
      { status: 400 },
    )
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.OPENAI_VISION_MODEL || "gpt-4.1-mini",

          input: [
            {
              role: "system",
              content: `
你是台灣飲食紀錄助手。

請仔細辨識照片中的食物。

【最重要】
1. 每一種食物各列一筆。
2. 必須辨識「數量／份量」。
3. quantity 必須是數字。
4. 如果看到「半隻、半個、半份」，quantity = 0.5。
5. 如果看到「1/2」，quantity = 0.5。
6. 如果看到「一顆、1顆、一個、1個、一份」，quantity = 1。
7. 如果看到「2顆、3顆、5顆」等，必須正確輸出數字。
8. 中文數字也要轉成數字。
9. 不要把不同食物合併成一筆。
10. 不要辨識餐具、桌面、包裝或背景。
11. unit 要描述實際單位，例如：
   - 顆
   - 個
   - 隻
   - 份
   - 杯
   - 碗
   - 片
12. portion 要完整描述照片看到的份量，例如：
   - 半隻雞腿
   - 2顆茶葉蛋
   - 5顆腰果
   - 1杯蛋白飲

【營養值】
如果不確定營養值，可以先依照片份量估算。
但最重要的是正確辨識：
「食物名稱 + 數量 + 單位」。

例如照片看到：
半隻雞腿 + 2顆茶葉蛋

必須輸出兩筆：

雞腿：
quantity = 0.5
unit = "隻"
portion = "半隻雞腿"

茶葉蛋：
quantity = 2
unit = "顆"
portion = "2顆茶葉蛋"

所有營養數值必須是非負數。
`,
            },
            {
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: `
請分析這張餐點照片。

特別注意：
請仔細辨識每一種食物的「數量與份量」。
不要只寫「雞腿」或「茶葉蛋」，
要盡可能判斷是幾隻、幾顆、幾份。
`,
                },
                {
                  type: "input_image",
                  image_url: image,
                  detail: "high",
                },
              ],
            },
          ],

          text: {
            format: {
              type: "json_schema",
              name: "food_analysis",
              strict: true,
              schema: foodSchema,
            },
          },
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text().catch(() => "")
      console.error(
        "Food image analysis failed",
        response.status,
        errorText,
      )

      return NextResponse.json(
        { error: "照片辨識暫時無法使用，請稍後再試。" },
        { status: 502 },
      )
    }

    const result = (await response.json()) as {
      output_text?: unknown
    }

    const parsed =
      typeof result.output_text === "string"
        ? JSON.parse(result.output_text)
        : null

    const aiItems: AIItem[] = Array.isArray(parsed?.items)
      ? parsed.items.filter(isAIItem)
      : []

    const items: FoodItem[] = aiItems.map((item) => {
      const quantity = item.quantity > 0 ? item.quantity : 1

      // 嘗試對應 FOOD_DB
      const dbFood = findFood(item.name)

      if (dbFood) {
        // 使用資料庫營養值 × 照片辨識出的數量
        return {
          name: dbFood.name,
          portion: item.portion || `${quantity}${dbFood.unit}`,
          calories: round1(dbFood.calories * quantity),
          protein: round1(dbFood.protein * quantity),
          carbs: round1(dbFood.carbs * quantity),
          fat: round1(dbFood.fat * quantity),
        }
      }

      // 找不到資料庫食物時，保留 AI 估算
      return {
        name: item.name,
        portion: item.portion,
        calories: round1(item.calories),
        protein: round1(item.protein),
        carbs: round1(item.carbs),
        fat: round1(item.fat),
      }
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Food image analysis error", error)

    return NextResponse.json(
      { error: "無法完成照片辨識，請稍後再試。" },
      { status: 500 },
    )
  }
}
