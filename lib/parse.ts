import { FOOD_DB } from "./foods"
import type { Nutrition } from "./types"

// 一句話輸入解析結果
export interface ParsedItem extends Nutrition {
  name: string
  portion: string
  qty: number
  matched: boolean
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

// 把中文數字轉成阿拉伯數字
function cnToNum(s: string): number | null {
  if (!s) return null

  // 阿拉伯數字
  if (/^\d+(?:\.\d+)?$/.test(s)) {
    return Number.parseFloat(s)
  }

  if (s === "半") return 0.5

  // 十、十一、十二、二十、二十一...
  const idx = s.indexOf("十")

  if (idx !== -1) {
    const before = s.slice(0, idx)
    const after = s.slice(idx + 1)

    const tens = before ? (CN_NUM[before] ?? 1) : 1
    const ones = after ? (CN_NUM[after] ?? 0) : 0

    return tens * 10 + ones
  }

  // 單一中文數字
  if (s.length === 1 && CN_NUM[s] !== undefined) {
    return CN_NUM[s]
  }

  return null
}

// 從片語中抓出數量
function extractQty(seg: string): number {
  // 例如：
  // 2顆茶葉蛋
  // 1.5杯蛋白飲
  // 2份雞肉
  const arabic = seg.match(/(\d+(?:\.\d+)?)/)

  if (arabic) {
    return Number.parseFloat(arabic[1])
  }

  // 例如：
  // 兩顆茶葉蛋
  // 半隻雞腿
  // 三份白飯
  const cn = seg.match(/(零|一|兩|二|三|四|五|六|七|八|九|十|半)+/)

  if (cn) {
    const n = cnToNum(cn[0])

    if (n !== null) {
      return n
    }
  }

  // 沒有寫數量，預設 1
  return 1
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

// 將一段文字解析成食物
function parseOneSegment(seg: string): ParsedItem | null {
  if (!seg.trim()) return null

  const qty = extractQty(seg)

  // 優先比對食物資料庫
  for (const food of FOOD_DB) {
    const hit = food.keywords.find((k) => seg.includes(k))

    if (hit) {
      return {
        name: food.name,
        qty,
        portion: `${qty} ${food.unit}`,
        calories: round1(food.calories * qty),
        protein: round1(food.protein * qty),
        carbs: round1(food.carbs * qty),
        fat: round1(food.fat * qty),
        matched: true,
      }
    }
  }

  // 找不到資料庫食物時，清理名稱
  const cleanName = seg
    .replace(/(\d+(?:\.\d+)?)|([零一二兩三四五六七八九十半]+)/g, "")
    .replace(/[顆個份杯瓶碗條隻塊根片包盒碟匙湯]/g, "")
    .trim()

  if (!cleanName) return null

  return {
    name: cleanName,
    qty,
    portion: `${qty} 份`,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    matched: false,
  }
}

// 主要解析函式
export function parseSentence(text: string): ParsedItem[] {
  if (!text.trim()) return []

  // 先把常見連接詞轉成分隔符
  let normalized = text
    .replace(/今天|今日|我|吃了|吃|喝了|喝|還有|以及|和|跟|加上/g, "、")

  // ★ 重要：
  // 支援：
  // ＋
  // +
  // 、，
  // 逗號
  // 句號
  // 分號
  // 空白
  //
  // 例如：
  // 半隻雞腿＋2顆茶葉蛋
  // ↓
  // 半隻雞腿
  // 2顆茶葉蛋
  normalized = normalized.replace(/[＋+、,，。.；;\n\r\t　]+/g, "、")

  const segments = normalized
    .split("、")
    .map((s) => s.trim())
    .filter(Boolean)

  const items: ParsedItem[] = []

  for (const seg of segments) {
    const item = parseOneSegment(seg)

    if (item) {
      items.push(item)
    }
  }

  return items
}
