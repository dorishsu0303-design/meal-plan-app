import type { CommonFood, Nutrition } from "./types"

// 食物營養資料庫（每一個「單位份量」的估算值）
// 這些是常見的估算值，僅供參考；使用者可自行調整，避免假裝精準。
export interface FoodDef extends Nutrition {
  keywords: string[] // 可辨識的關鍵字（會以「包含」比對）
  unit: string // 單位名稱，例如「顆」「杯」「份」
  name: string // 標準名稱
}

export const FOOD_DB: FoodDef[] = [
  { name: "茶葉蛋", keywords: ["茶葉蛋", "茶碗蛋"], unit: "顆", calories: 70, protein: 6, carbs: 1, fat: 5 },
  { name: "雞蛋", keywords: ["雞蛋", "水煮蛋", "白煮蛋", "蛋"], unit: "顆", calories: 70, protein: 6, carbs: 0.6, fat: 5 },
  { name: "蛋白飲", keywords: ["蛋白飲", "高蛋白飲", "乳清", "蛋白粉"], unit: "份", calories: 120, protein: 20, carbs: 5, fat: 1.5 },
  { name: "高蛋白牛奶", keywords: ["高蛋白牛奶", "高蛋白奶"], unit: "瓶", calories: 160, protein: 15, carbs: 13, fat: 5 },
  { name: "牛奶", keywords: ["牛奶", "鮮奶"], unit: "杯", calories: 130, protein: 7, carbs: 10, fat: 7 },
  { name: "無糖豆漿", keywords: ["無糖豆漿", "豆漿"], unit: "杯", calories: 80, protein: 8, carbs: 4, fat: 4 },
  { name: "雞胸肉", keywords: ["雞胸肉", "雞胸", "舒肥雞"], unit: "份", calories: 165, protein: 35, carbs: 0, fat: 2 },
  { name: "雞腿", keywords: ["雞腿"], unit: "隻", calories: 250, protein: 25, carbs: 0, fat: 16 },
  { name: "雞腿便當", keywords: ["雞腿便當", "便當", "排骨便當", "雞排飯"], unit: "個", calories: 750, protein: 30, carbs: 95, fat: 28 },
  { name: "白飯", keywords: ["白飯", "米飯", "飯"], unit: "碗", calories: 280, protein: 5, carbs: 60, fat: 0.5 },
  { name: "地瓜", keywords: ["地瓜", "番薯", "蕃薯"], unit: "條", calories: 120, protein: 2, carbs: 28, fat: 0.2 },
  { name: "奇異果", keywords: ["奇異果", "獼猴桃"], unit: "顆", calories: 45, protein: 0.8, carbs: 11, fat: 0.4 },
  { name: "香蕉", keywords: ["香蕉"], unit: "根", calories: 90, protein: 1, carbs: 23, fat: 0.3 },
  { name: "蘋果", keywords: ["蘋果"], unit: "顆", calories: 80, protein: 0.4, carbs: 21, fat: 0.2 },
  { name: "高蛋白食品", keywords: ["7-11", "超商高蛋白", "高蛋白食品", "御飯糰", "茶碗蒸"], unit: "份", calories: 180, protein: 20, carbs: 15, fat: 5 },
  { name: "沙拉", keywords: ["沙拉", "生菜"], unit: "份", calories: 120, protein: 5, carbs: 10, fat: 6 },
  { name: "豆腐", keywords: ["豆腐"], unit: "塊", calories: 90, protein: 9, carbs: 3, fat: 5 },
  { name: "鮭魚", keywords: ["鮭魚", "鮭魚排"], unit: "份", calories: 220, protein: 25, carbs: 0, fat: 13 },
  { name: "堅果", keywords: ["堅果", "杏仁", "核桃"], unit: "份", calories: 180, protein: 5, carbs: 6, fat: 16 },
  { name: "咖啡", keywords: ["黑咖啡", "美式咖啡", "咖啡"], unit: "杯", calories: 5, protein: 0.3, carbs: 0, fat: 0 },
]

// 預設常吃食物（使用者可刪除或新增）
export const DEFAULT_COMMON_FOODS: CommonFood[] = [
  { id: "cf-1", name: "蛋白飲", portion: "1 份", calories: 120, protein: 20, carbs: 5, fat: 1.5, builtin: true },
  { id: "cf-2", name: "茶葉蛋", portion: "1 顆", calories: 70, protein: 6, carbs: 1, fat: 5, builtin: true },
  { id: "cf-3", name: "雞胸肉", portion: "1 份", calories: 165, protein: 35, carbs: 0, fat: 2, builtin: true },
  { id: "cf-4", name: "無糖豆漿", portion: "1 杯", calories: 80, protein: 8, carbs: 4, fat: 4, builtin: true },
  { id: "cf-5", name: "高蛋白牛奶", portion: "1 瓶", calories: 160, protein: 15, carbs: 13, fat: 5, builtin: true },
  { id: "cf-6", name: "奇異果", portion: "1 顆", calories: 45, protein: 0.8, carbs: 11, fat: 0.4, builtin: true },
  { id: "cf-7", name: "地瓜", portion: "1 條", calories: 120, protein: 2, carbs: 28, fat: 0.2, builtin: true },
  { id: "cf-8", name: "7-11 高蛋白食品", portion: "1 份", calories: 180, protein: 20, carbs: 15, fat: 5, builtin: true },
]
