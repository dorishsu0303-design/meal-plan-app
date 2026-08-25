// 資料型別定義 - 集中管理，方便未來擴充登入與雲端同步

export type MealType = "breakfast" | "lunch" | "dinner" | "snack"

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
  snack: "點心",
}

export const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snack"]

// 單筆營養資料（食物共用）
export interface Nutrition {
  calories: number // 熱量 kcal
  protein: number // 蛋白質 g
  carbs: number // 碳水 g
  fat: number // 脂肪 g
}

// 一筆飲食紀錄
export interface MealEntry extends Nutrition {
  id: string
  meal: MealType
  name: string
  portion: string // 份量描述，例如「2 顆」「1 份」
  photo?: string // 照片 dataURL（可選）
  createdAt: number
}

// 常吃食物
export interface CommonFood extends Nutrition {
  id: string
  name: string
  portion: string
  builtin?: boolean // 內建預設項目
}

// 猛健樂注射紀錄
export interface MounjaroRecord {
  id: string
  date: string // 注射日期 YYYY-MM-DD
  dose: string // 劑量，例如「2.5 mg」
  appetite: number // 注射後食慾 1~5
  nausea: boolean // 噁心
  bloating: boolean // 胃脹
  constipation: boolean // 便秘
  otherFeeling: string // 其他身體感受
  note: string // 備註
  createdAt: number
}

// 每日身體資料 + 飲食
export interface DayData {
  date: string // YYYY-MM-DD
  weight?: number // 體重 kg
  water?: number // 喝水量 ml
  sleep?: number // 睡眠 小時
  exercise?: number // 運動 分鐘
  meals: MealEntry[]
}

// 每日營養目標（可供未來設定調整）
export interface Goals {
  calories: number // 熱量參考上限
  caloriesMin: number // 熱量偏低警示門檻
  protein: number // 蛋白質目標（每日至少）
  water: number // 喝水目標 ml
}

export interface AppData {
  version: number
  days: Record<string, DayData>
  mounjaro: MounjaroRecord[]
  commonFoods: CommonFood[]
  goals: Goals
}
