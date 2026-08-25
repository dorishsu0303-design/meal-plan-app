"use client"

// 資料儲存層：目前使用瀏覽器 localStorage。
// 所有讀寫都透過這裡的 API，未來要換成雲端同步只需修改這個檔案。

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { AppData, CommonFood, DayData, Goals, MealEntry, MounjaroRecord } from "./types"
import { DEFAULT_COMMON_FOODS } from "./foods"
import { todayKey } from "./date"

const STORAGE_KEY = "weight-diary-v1"

const DEFAULT_GOALS: Goals = {
  calories: 1600,
  caloriesMin: 1000,
  protein: 80,
  water: 1500,
}

function emptyData(): AppData {
  return {
    version: 1,
    days: {},
    mounjaro: [],
    commonFoods: DEFAULT_COMMON_FOODS.map((f) => ({ ...f })),
    goals: { ...DEFAULT_GOALS },
  }
}

// 首次使用的少量範例資料（使用者可刪除）
function sampleData(): AppData {
  const base = emptyData()
  const today = todayKey()
  base.days[today] = {
    date: today,
    weight: 72.5,
    water: 750,
    sleep: 7,
    exercise: 20,
    meals: [
      {
        id: "sample-1",
        meal: "breakfast",
        name: "茶葉蛋",
        portion: "2 顆",
        calories: 140,
        protein: 12,
        carbs: 2,
        fat: 10,
        createdAt: Date.now() - 3600_000,
      },
      {
        id: "sample-2",
        meal: "breakfast",
        name: "無糖豆漿",
        portion: "1 杯",
        calories: 80,
        protein: 8,
        carbs: 4,
        fat: 4,
        createdAt: Date.now() - 3500_000,
      },
    ],
  }
  base.mounjaro = [
    {
      id: "sample-m1",
      date: today,
      dose: "2.5 mg",
      appetite: 2,
      nausea: false,
      bloating: true,
      constipation: false,
      otherFeeling: "",
      note: "範例資料，可刪除",
      createdAt: Date.now(),
    },
  ]
  return base
}

function loadData(): AppData {
  if (typeof window === "undefined") return emptyData()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const seeded = sampleData()
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
      return seeded
    }
    const parsed = JSON.parse(raw) as AppData
    // 補齊缺少的欄位，避免舊資料造成錯誤
    return {
      ...emptyData(),
      ...parsed,
      goals: { ...DEFAULT_GOALS, ...(parsed.goals ?? {}) },
      commonFoods: parsed.commonFoods?.length ? parsed.commonFoods : DEFAULT_COMMON_FOODS.map((f) => ({ ...f })),
    }
  } catch {
    return emptyData()
  }
}

function uid(prefix = ""): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}

interface StoreContextValue {
  data: AppData
  loaded: boolean
  getDay: (key: string) => DayData
  updateDay: (key: string, patch: Partial<Omit<DayData, "date" | "meals">>) => void
  addMeal: (key: string, entry: Omit<MealEntry, "id" | "createdAt">) => void
  updateMeal: (key: string, id: string, patch: Partial<MealEntry>) => void
  removeMeal: (key: string, id: string) => void
  addMounjaro: (rec: Omit<MounjaroRecord, "id" | "createdAt">) => void
  removeMounjaro: (id: string) => void
  addCommonFood: (food: Omit<CommonFood, "id">) => void
  removeCommonFood: (id: string) => void
  updateGoals: (patch: Partial<Goals>) => void
  clearAll: () => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setData(loadData())
    setLoaded(true)
  }, [])

  // 資料變動時寫回 localStorage
  useEffect(() => {
    if (!loaded) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // 忽略寫入錯誤（例如容量已滿）
    }
  }, [data, loaded])

  const getDay = useCallback(
    (key: string): DayData => {
      return data.days[key] ?? { date: key, meals: [] }
    },
    [data.days],
  )

  const updateDay = useCallback((key: string, patch: Partial<Omit<DayData, "date" | "meals">>) => {
    setData((prev) => {
      const existing = prev.days[key] ?? { date: key, meals: [] }
      return {
        ...prev,
        days: { ...prev.days, [key]: { ...existing, ...patch } },
      }
    })
  }, [])

  const addMeal = useCallback((key: string, entry: Omit<MealEntry, "id" | "createdAt">) => {
    setData((prev) => {
      const existing = prev.days[key] ?? { date: key, meals: [] }
      const meal: MealEntry = { ...entry, id: uid("m-"), createdAt: Date.now() }
      return {
        ...prev,
        days: { ...prev.days, [key]: { ...existing, meals: [...existing.meals, meal] } },
      }
    })
  }, [])

  const updateMeal = useCallback((key: string, id: string, patch: Partial<MealEntry>) => {
    setData((prev) => {
      const existing = prev.days[key]
      if (!existing) return prev
      return {
        ...prev,
        days: {
          ...prev.days,
          [key]: { ...existing, meals: existing.meals.map((m) => (m.id === id ? { ...m, ...patch } : m)) },
        },
      }
    })
  }, [])

  const removeMeal = useCallback((key: string, id: string) => {
    setData((prev) => {
      const existing = prev.days[key]
      if (!existing) return prev
      return {
        ...prev,
        days: { ...prev.days, [key]: { ...existing, meals: existing.meals.filter((m) => m.id !== id) } },
      }
    })
  }, [])

  const addMounjaro = useCallback((rec: Omit<MounjaroRecord, "id" | "createdAt">) => {
    setData((prev) => ({
      ...prev,
      mounjaro: [{ ...rec, id: uid("mj-"), createdAt: Date.now() }, ...prev.mounjaro],
    }))
  }, [])

  const removeMounjaro = useCallback((id: string) => {
    setData((prev) => ({ ...prev, mounjaro: prev.mounjaro.filter((r) => r.id !== id) }))
  }, [])

  const addCommonFood = useCallback((food: Omit<CommonFood, "id">) => {
    setData((prev) => ({ ...prev, commonFoods: [...prev.commonFoods, { ...food, id: uid("cf-") }] }))
  }, [])

  const removeCommonFood = useCallback((id: string) => {
    setData((prev) => ({ ...prev, commonFoods: prev.commonFoods.filter((f) => f.id !== id) }))
  }, [])

  const updateGoals = useCallback((patch: Partial<Goals>) => {
    setData((prev) => ({ ...prev, goals: { ...prev.goals, ...patch } }))
  }, [])

  const clearAll = useCallback(() => {
    setData(emptyData())
  }, [])

  const value = useMemo<StoreContextValue>(
    () => ({
      data,
      loaded,
      getDay,
      updateDay,
      addMeal,
      updateMeal,
      removeMeal,
      addMounjaro,
      removeMounjaro,
      addCommonFood,
      removeCommonFood,
      updateGoals,
      clearAll,
    }),
    [
      data,
      loaded,
      getDay,
      updateDay,
      addMeal,
      updateMeal,
      removeMeal,
      addMounjaro,
      removeMounjaro,
      addCommonFood,
      removeCommonFood,
      updateGoals,
      clearAll,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore 必須在 StoreProvider 內使用")
  return ctx
}
