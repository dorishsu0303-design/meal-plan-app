"use client"

// 資料儲存層：目前使用瀏覽器 localStorage。
// 所有資料都透過這裡統一管理。
// 未來若要改成雲端同步，可以直接修改這個檔案。

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import type {
  AppData,
  CommonFood,
  DayData,
  Goals,
  MealEntry,
  MounjaroRecord,
} from "./types"

import { DEFAULT_COMMON_FOODS } from "./foods"
import { todayKey } from "./date"

// ============================================================
// LocalStorage
// ============================================================

const STORAGE_KEY = "weight-diary-v1"

// ============================================================
// 預設目標
// ============================================================

const DEFAULT_GOALS: Goals = {
  calories: 1600,
  caloriesMin: 1000,
  protein: 80,
  water: 1500,
}

// ============================================================
// 空白資料
// ============================================================

function emptyData(): AppData {
  return {
    version: 1,
    days: {},
    mounjaro: [],
    commonFoods: DEFAULT_COMMON_FOODS.map((food) => ({ ...food })),
    goals: { ...DEFAULT_GOALS },
  }
}

// ============================================================
// 首次使用範例資料
// ============================================================

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

// ============================================================
// 讀取資料
// ============================================================

function loadData(): AppData {
  if (typeof window === "undefined") {
    return emptyData()
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    // 第一次使用
    if (!raw) {
      const seeded = sampleData()

      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(seeded),
      )

      return seeded
    }

    const parsed = JSON.parse(raw) as AppData

    // ========================================================
    // 補齊舊版本可能缺少的資料
    // ========================================================

    return {
      ...emptyData(),
      ...parsed,

      days: parsed.days ?? {},

      mounjaro: parsed.mounjaro ?? [],

      goals: {
        ...DEFAULT_GOALS,
        ...(parsed.goals ?? {}),
      },

      commonFoods:
        parsed.commonFoods?.length
          ? parsed.commonFoods
          : DEFAULT_COMMON_FOODS.map((food) => ({ ...food })),
    }
  } catch (error) {
    console.error("讀取飲食資料失敗", error)
    return emptyData()
  }
}

// ============================================================
// ID
// ============================================================

function uid(prefix = ""): string {
  return (
    prefix +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 7)
  )
}

// ============================================================
// Store API
// ============================================================

interface StoreContextValue {
  data: AppData
  loaded: boolean

  // 每日資料
  getDay: (key: string) => DayData

  updateDay: (
    key: string,
    patch: Partial<Omit<DayData, "date" | "meals">>,
  ) => void

  // 飲食
  addMeal: (
    key: string,
    entry: Omit<MealEntry, "id" | "createdAt">,
  ) => void

  updateMeal: (
    key: string,
    id: string,
    patch: Partial<MealEntry>,
  ) => void

  removeMeal: (
    key: string,
    id: string,
  ) => void

  // 把每日飲食加入常吃
  addMealToCommon: (
    key: string,
    mealId: string,
  ) => void

  // 常吃
  addCommonFood: (
    food: Omit<CommonFood, "id">,
  ) => void

  removeCommonFood: (
    id: string,
  ) => void

  // 猛健樂
  addMounjaro: (
    rec: Omit<MounjaroRecord, "id" | "createdAt">,
  ) => void

  removeMounjaro: (
    id: string,
  ) => void

  // 目標
  updateGoals: (
    patch: Partial<Goals>,
  ) => void

  // 清除全部資料
  clearAll: () => void
}

// ============================================================
// Context
// ============================================================

const StoreContext =
  createContext<StoreContextValue | null>(null)

// ============================================================
// Provider
// ============================================================

export function StoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [data, setData] = useState<AppData>(emptyData)
  const [loaded, setLoaded] = useState(false)

  // ==========================================================
  // APP 啟動時讀取資料
  // ==========================================================

  useEffect(() => {
    const savedData = loadData()

    setData(savedData)
    setLoaded(true)
  }, [])

  // ==========================================================
  // 每次資料變動，自動保存
  // ==========================================================

  useEffect(() => {
    if (!loaded) return

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data),
      )
    } catch (error) {
      console.error("保存飲食資料失敗", error)
    }
  }, [data, loaded])

  // ==========================================================
  // 取得某一天
  // ==========================================================

  const getDay = useCallback(
    (key: string): DayData => {
      return (
        data.days[key] ?? {
          date: key,
          meals: [],
        }
      )
    },
    [data.days],
  )

  // ==========================================================
  // 更新每日資料
  // ==========================================================

  const updateDay = useCallback(
    (
      key: string,
      patch: Partial<Omit<DayData, "date" | "meals">>,
    ) => {
      setData((previous) => {
        const existing =
          previous.days[key] ?? {
            date: key,
            meals: [],
          }

        return {
          ...previous,

          days: {
            ...previous.days,

            [key]: {
              ...existing,
              ...patch,
            },
          },
        }
      })
    },
    [],
  )

  // ==========================================================
  // 新增飲食
  // ==========================================================

  const addMeal = useCallback(
    (
      key: string,
      entry: Omit<MealEntry, "id" | "createdAt">,
    ) => {
      setData((previous) => {
        const existing =
          previous.days[key] ?? {
            date: key,
            meals: [],
          }

        const meal: MealEntry = {
          ...entry,
          id: uid("m-"),
          createdAt: Date.now(),
        }

        return {
          ...previous,

          days: {
            ...previous.days,

            [key]: {
              ...existing,

              meals: [
                ...existing.meals,
                meal,
              ],
            },
          },
        }
      })
    },
    [],
  )

  // ==========================================================
  // 修改飲食
  // ==========================================================

  const updateMeal = useCallback(
    (
      key: string,
      id: string,
      patch: Partial<MealEntry>,
    ) => {
      setData((previous) => {
        const existing = previous.days[key]

        if (!existing) {
          return previous
        }

        return {
          ...previous,

          days: {
            ...previous.days,

            [key]: {
              ...existing,

              meals: existing.meals.map(
                (meal) =>
                  meal.id === id
                    ? {
                        ...meal,
                        ...patch,
                      }
                    : meal,
              ),
            },
          },
        }
      })
    },
    [],
  )

  // ==========================================================
  // 刪除飲食
  // ==========================================================

  const removeMeal = useCallback(
    (
      key: string,
      id: string,
    ) => {
      setData((previous) => {
        const existing = previous.days[key]

        if (!existing) {
          return previous
        }

        return {
          ...previous,

          days: {
            ...previous.days,

            [key]: {
              ...existing,

              meals: existing.meals.filter(
                (meal) => meal.id !== id,
              ),
            },
          },
        }
      })
    },
    [],
  )

  // ==========================================================
  // ★ 每日飲食 → 加入常吃
  // ==========================================================

  const addMealToCommon = useCallback(
    (
      key: string,
      mealId: string,
    ) => {
      setData((previous) => {
        const day = previous.days[key]

        if (!day) {
          return previous
        }

        const meal = day.meals.find(
          (item) => item.id === mealId,
        )

        if (!meal) {
          return previous
        }

        // ----------------------------------------------------
        // 防止完全相同的食物重複加入
        // ----------------------------------------------------

        const alreadyExists =
          previous.commonFoods.some(
            (food) =>
              food.name === meal.name &&
              food.portion === meal.portion &&
              food.calories === meal.calories &&
              food.protein === meal.protein &&
              food.carbs === meal.carbs &&
              food.fat === meal.fat,
          )

        if (alreadyExists) {
          return previous
        }

        // ----------------------------------------------------
        // 建立新的常吃食物
        // ----------------------------------------------------

        const commonFood: CommonFood = {
          id: uid("cf-"),

          name: meal.name,

          portion: meal.portion,

          calories: meal.calories,

          protein: meal.protein,

          carbs: meal.carbs,

          fat: meal.fat,

          builtin: false,
        }

        return {
          ...previous,

          commonFoods: [
            ...previous.commonFoods,
            commonFood,
          ],
        }
      })
    },
    [],
  )

  // ==========================================================
  // 新增常吃
  // ==========================================================

  const addCommonFood = useCallback(
    (
      food: Omit<CommonFood, "id">,
    ) => {
      setData((previous) => {
        // 避免完全相同的常吃食物重複
        const exists =
          previous.commonFoods.some(
            (item) =>
              item.name === food.name &&
              item.portion === food.portion &&
              item.calories === food.calories &&
              item.protein === food.protein &&
              item.carbs === food.carbs &&
              item.fat === food.fat,
          )

        if (exists) {
          return previous
        }

        return {
          ...previous,

          commonFoods: [
            ...previous.commonFoods,

            {
              ...food,
              id: uid("cf-"),
            },
          ],
        }
      })
    },
    [],
  )

  // ==========================================================
  // 刪除常吃
  // ==========================================================

  const removeCommonFood = useCallback(
    (id: string) => {
      setData((previous) => ({
        ...previous,

        commonFoods:
          previous.commonFoods.filter(
            (food) => food.id !== id,
          ),
      }))
    },
    [],
  )

  // ==========================================================
  // 新增猛健樂紀錄
  // ==========================================================

  const addMounjaro = useCallback(
    (
      rec: Omit<MounjaroRecord, "id" | "createdAt">,
    ) => {
      setData((previous) => ({
        ...previous,

        mounjaro: [
          {
            ...rec,
            id: uid("mj-"),
            createdAt: Date.now(),
          },

          ...previous.mounjaro,
        ],
      }))
    },
    [],
  )

  // ==========================================================
  // 刪除猛健樂紀錄
  // ==========================================================

  const removeMounjaro = useCallback(
    (id: string) => {
      setData((previous) => ({
        ...previous,

        mounjaro:
          previous.mounjaro.filter(
            (record) => record.id !== id,
          ),
      }))
    },
    [],
  )

  // ==========================================================
  // 修改每日目標
  // ==========================================================

  const updateGoals = useCallback(
    (patch: Partial<Goals>) => {
      setData((previous) => ({
        ...previous,

        goals: {
          ...previous.goals,
          ...patch,
        },
      }))
    },
    [],
  )

  // ==========================================================
  // 清除全部資料
  // ==========================================================

  const clearAll = useCallback(() => {
    setData(emptyData())
  }, [])

  // ==========================================================
  // Context value
  // ==========================================================

  const value = useMemo<StoreContextValue>(
    () => ({
      data,
      loaded,

      getDay,
      updateDay,

      addMeal,
      updateMeal,
      removeMeal,

      // ★ 新增
      addMealToCommon,

      addCommonFood,
      removeCommonFood,

      addMounjaro,
      removeMounjaro,

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

      // ★ 新增
      addMealToCommon,

      addCommonFood,
      removeCommonFood,

      addMounjaro,
      removeMounjaro,

      updateGoals,

      clearAll,
    ],
  )

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  )
}

// ============================================================
// useStore
// ============================================================

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext)

  if (!ctx) {
    throw new Error(
      "useStore 必須在 StoreProvider 內使用",
    )
  }

  return ctx
}
