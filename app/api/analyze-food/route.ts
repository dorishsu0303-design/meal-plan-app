import { NextResponse } from "next/server"

export const runtime = "nodejs"

type FoodItem = {
  name: string
  portion: string
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
          "calories",
          "protein",
          "carbs",
          "fat",
        ],
        properties: {
          name: {
            type: "string",
          },
          portion: {
            type: "string",
          },
          calories: {
            type: "number",
          },
          protein: {
            type: "number",
          },
          carbs: {
            type: "number",
          },
          fat: {
            type: "number",
          },
        },
      },
    },
  },
}

function isFoodItem(value: unknown): value is FoodItem {
  if (!value || typeof value !== "object") return false

  const item = value as Record<string, unknown>

  return (
    typeof item.name === "string" &&
    typeof item.portion === "string" &&
    typeof item.calories === "number" &&
    Number.isFinite(item.calories) &&
    typeof item.protein === "number" &&
    Number.isFinite(item.protein) &&
    typeof item.carbs === "number" &&
    Number.isFinite(item.carbs) &&
    typeof item.fat === "number" &&
    Number.isFinite(item.fat)
  )
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: "尚未設定 OPENAI_API_KEY。" },
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
          // 如果環境變數沒有設定，就使用這個模型
          model:
            process.env.OPENAI_VISION_MODEL ||
            "gpt-4.1-mini",

          input: [
            {
              role: "system",
              content: [
                {
                  type: "input_text",
                  text: `
你是「台灣飲食紀錄 APP」的食物照片辨識助手。

你的工作是：
1. 仔細辨識照片中所有可以食用的主要食物。
2. 一種食物一筆。
3. 如果照片中有多種食物，必須分開列出。
4. 根據照片中「實際看到的份量」估算營養。
5. 不要把餐盤、碗、筷子、杯子、桌面、包裝當成食物。
6. 不要因為看不清楚就回傳空白。
7. 如果無法完全確定食物名稱，請使用最接近的常見中文名稱。
8. 台灣常見食品請使用台灣習慣名稱，例如：
   - 茶葉蛋
   - 雞胸肉
   - 雞腿
   - 白飯
   - 地瓜
   - 蛋白飲
   - 杏仁
   - 腰果
9. 如果照片中可以看出「半份、半顆、半隻、幾顆、幾片」，
   portion 必須描述實際份量。
10. 營養數值都是「照片中這一份」的估算值，不是每100克。
11. calories 使用 kcal。
12. protein、carbs、fat 使用公克。
13. 所有數值必須 >= 0。
14. 不要加入任何解釋文字，只輸出符合 JSON schema 的資料。

例如：
照片中有半隻雞腿和2顆茶葉蛋，
應該分成兩筆：
「雞腿」 portion「半隻」
「茶葉蛋」 portion「2 顆」

如果照片中有：
5顆腰果 + 5顆杏仁
也必須分成兩筆。
                  `.trim(),
                },
              ],
            },
            {
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: `
請仔細分析這張飲食照片。

請辨識：
- 所有主要食物
- 每種食物的實際份量
- 該份量的熱量
- 蛋白質
- 碳水化合物
- 脂肪

即使食物不是完全清楚，也請根據照片做合理估算，不要直接回傳空的 items。
                  `.trim(),
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

    // ★ 這裡很重要：
    // 如果 API 失敗，把 OpenAI 真正回傳的錯誤印出來
    if (!response.ok) {
      const errorText = await response.text()

      console.error(
        "Food image analysis failed:",
        response.status,
        errorText,
      )

      return NextResponse.json(
        {
          error: `照片辨識服務錯誤 (${response.status})`,
          detail:
            process.env.NODE_ENV === "development"
              ? errorText
              : undefined,
        },
        { status: 502 },
      )
    }

    const result = (await response.json()) as {
      output_text?: unknown
    }

    console.log("Food image analysis result:", result)

    if (typeof result.output_text !== "string") {
      return NextResponse.json(
        {
          error: "照片辨識沒有取得有效結果。",
        },
        { status: 502 },
      )
    }

    let parsed: unknown

    try {
      parsed = JSON.parse(result.output_text)
    } catch (error) {
      console.error(
        "Food image JSON parse error:",
        error,
        result.output_text,
      )

      return NextResponse.json(
        {
          error: "照片辨識結果格式錯誤。",
        },
        { status: 502 },
      )
    }

    const items =
      parsed &&
      typeof parsed === "object" &&
      Array.isArray((parsed as { items?: unknown }).items)
        ? (parsed as { items: unknown[] }).items.filter(isFoodItem)
        : []

    console.log("Food image parsed items:", items)

    if (items.length === 0) {
      return NextResponse.json(
        {
          error:
            "照片中沒有辨識到有效食物，請換一張光線較好、食物較清楚的照片。",
          items: [],
        },
        { status: 200 },
      )
    }

    return NextResponse.json({
      items,
    })
  } catch (error) {
    console.error(
      "Food image analysis exception:",
      error,
    )

    return NextResponse.json(
      {
        error: "無法完成照片辨識，請稍後再試。",
      },
      { status: 500 },
    )
  }
}
