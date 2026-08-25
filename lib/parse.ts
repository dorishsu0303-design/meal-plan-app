import { FOOD_DB } from "./foods"
import type { Nutrition } from "./types"

// 一句話輸入解析結果
export interface ParsedItem extends Nutrition {
  name: string
  portion: string
  qty: number
  matched: boolean // 是否有比對到資料庫（false 表示需要使用者確認營養值）
}

const CN_NUM: Record<string, number> = {
  零: 0,
  一: 1,
  兩: 2,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
  半: 0.5,
}

// 把中文數字轉成阿拉伯數字（支援 一~九十九、半）
function cnToNum(s: string): number | null {
  if (!s) return null
  if (/^\d+(\.\d+)?$/.test(s)) return Number.parseFloat(s)
  if (s === "半") return 0.5
  let total = 0
  const idx = s.indexOf("十")
  if (idx !== -1) {
    const before = s.slice(0, idx)
    const after = s.slice(idx + 1)
    const tens = before ? (CN_NUM[before] ?? 1) : 1
    const ones = after ? (CN_NUM[after] ?? 0) : 0
    total = tens * 10 + ones
    return total
  }
  // 單一中文數字
  if (s.length === 1 && CN_NUM[s] !== undefined) return CN_NUM[s]
  return null
}

// 從片語中抓出數量（阿拉伯數字或中文數字），找不到則回傳 1
function extractQty(seg: string): number {
  // 阿拉伯數字，例如 2顆 / 1.5 份
  const arabic = seg.match(/(\d+(?:\.\d+)?)/)
  if (arabic) return Number.parseFloat(arabic[1])
  // 中文數字，例如 兩顆 / 半個 / 三份
  const cn = seg.match(/([零一二兩三四五六七八九十]+|半)/)
  if (cn) {
    const n = cnToNum(cn[1])
    if (n !== null) return n
  }
  return 1
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

// 主要解析函式
export function parseSentence(text: string): ParsedItem[] {
  if (!text.trim()) return []

  // 用常見分隔符切段
  const segments = text
    .replace(/今天|今日|我|吃了|吃|喝了|喝|還有|以及|和|跟|加上|加/g, "、")
    .split(/[、,，。.；;\n\r\t　]+|\s{1,}/)
    .map((s) => s.trim())
    .filter(Boolean)

  const items: ParsedItem[] = []

  for (const seg of segments) {
    const qty = extractQty(seg)
    let matched = false

    for (const food of FOOD_DB) {
      const hit = food.keywords.find((k) => seg.includes(k))
      if (hit) {
        items.push({
          name: food.name,
          qty,
          portion: `${qty} ${food.unit}`,
          calories: round1(food.calories * qty),
          protein: round1(food.protein * qty),
          carbs: round1(food.carbs * qty),
          fat: round1(food.fat * qty),
          matched: true,
        })
        matched = true
        break
      }
    }

    if (!matched) {
      // 去掉數量與單位詞，留下食物名稱
      const cleanName = seg
        .replace(/(\d+(?:\.\d+)?)|([零一二兩三四五六七八九十]+|半)/g, "")
        .replace(/[顆個份杯瓶碗條隻塊根片包盒碗]/g, "")
        .trim()
      if (!cleanName) continue
      items.push({
        name: cleanName,
        qty,
        portion: `${qty} 份`,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        matched: false,
      })
    }
  }

  return items
}
