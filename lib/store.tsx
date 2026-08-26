"use client"

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

function uid(prefix = ""): string {
  return `${prefix}${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 7)}`
}

/**
 * 從 localStorage 讀取資料
 */
function loadData(): AppData {
  if (typeof window === "undefined") {
    return emptyData()
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    // 第一次使用
    if (!raw) {
      const data = emptyData()

      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data),
      )

      return data
    }

    const parsed = JSON.parse(raw) as Partial<AppData>

    return {
      version: parsed.version ?? 1,

      // 每一天獨立保存
      days: parsed.days ?? {},

      mounjaro: parsed.mounjaro ?? [],

      // 保留使用者自己新增的常吃食物
      commonFoods:
        parsed.commonFoods && parsed.commonFoods.length > 0
          ? parsed.commonFoods
          : DEFAULT_COMMON_FOODS.map((f) => ({ ...f })),

      goals: {
        ...DEFAULT_GOALS,
        ...(parsed.goals ?? {}),
      },
    }
  } catch (error) {
    console.error("讀取飲食資料失敗：", error)
    return emptyData()
  }
}

interface StoreContextValue {
  data: AppData
  loaded: boolean

  getDay: (key: string) => DayData

  updateDay: (
    key: string,
    patch: Partial<Omit<DayData, "date" | "meals">>,
  ) => void

  addMeal: (
    key: string,
    entry: Omit<MealEntry, "id" | "createdAt">,
  ) => void

  updateMeal: (
    key: string,
    id: string,
    patch: Partial<MealEntry>,
  ) => void

  removeMeal: (key: string, id: string) => void

  addMounjaro: (
    rec: Omit<MounjaroRecord, "id" | "createdAt">,
  ) => void

  removeMounjaro: (id: string) => void

  addCommonFood: (food: Omit<CommonFood, "id">) => void

  removeCommonFood: (id: string) => void

  updateGoals: (patch: Partial<Goals>) => void

  clearAll: () => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [data, setData] = useState<AppData>(emptyData)
  const [loaded, setLoaded] = useState(false)

  // 啟動時讀取資料
  useEffect(() => {
    const saved = loadData()

    setData(saved)
    setLoaded(true)
  }, [])

  // 每次資料變更就保存
  useEffect(() => {
    if (!loaded) return

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data),
      )
    } catch (error) {
      console.error("保存飲食資料失敗：", error)
    }
  }, [data, loaded])

  /**
   * 取得某一天
   */
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

  /**
   * 更新某一天的體重、喝水、睡眠、運動
   */
  const updateDay = useCallback(
    (
      key: string,
      patch: Partial<Omit<DayData, "date" | "meals">>,
    ) => {
      setData((prev) => {
        const existing = prev.days[key] ?? {
          date: key,
          meals: [],
        }

        return {
          ...prev,

          days: {
            ...prev.days,

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

  /**
   * 新增飲食
   */
  const addMeal = useCallback(
    (
      key: string,
      entry: Omit<MealEntry, "id" | "createdAt">,
    ) => {
      setData((prev) => {
        const existing = prev.days[key] ?? {
          date: key,
          meals: [],
        }

        const meal: MealEntry = {
          ...entry,
          id: uid("meal-"),
          createdAt: Date.now(),
        }

        return {
          ...prev,

          days: {
            ...prev.days,

            [key]: {
              ...existing,
              meals: [...existing.meals, meal],
            },
          },
        }
      })
    },
    [],
  )

  /**
   * 修改飲食
   */
  const updateMeal = useCallback(
    (
      key: string,
      id: string,
      patch: Partial<MealEntry>,
    ) => {
      setData((prev) => {
        const existing = prev.days[key]

        if (!existing) return prev

        return {
          ...prev,

          days: {
            ...prev.days,

            [key]: {
              ...existing,

              meals: existing.meals.map((meal) =>
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

  /**
   * 刪除飲食
   */
  const removeMeal = useCallback(
    (key: string, id: string) => {
      setData((prev) => {
        const existing = prev.days[key]

        if (!existing) return prev

        return {
          ...prev,

          days: {
            ...prev.days,

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

  /**
   * 新增猛健樂紀錄
   */
  const addMounjaro = useCallback(
    (
      rec: Omit<MounjaroRecord, "id" | "createdAt">,
    ) => {
      setData((prev) => ({
        ...prev,

        mounjaro: [
          {
            ...rec,
            id: uid("mj-"),
            createdAt: Date.now(),
          },
          ...prev.mounjaro,
        ],
      }))
    },
    [],
  )

  /**
   * 刪除猛健樂紀錄
   */
  const removeMounjaro = useCallback(
    (id: string) => {
      setData((prev) => ({
        ...prev,

        mounjaro: prev.mounjaro.filter(
          (record) => record.id !== id,
        ),
      }))
    },
    [],
  )

  /**
   * 新增常吃食物
   */
  const addCommonFood = useCallback(
    (food: Omit<CommonFood, "id">) => {
      setData((prev) => {
        // 防止完全相同的食物重複加入
        const exists = prev.commonFoods.some(
          (item) =>
            item.name.trim() === food.name.trim() &&
            item.portion.trim() === food.portion.trim(),
        )

        if (exists) {
          return prev
        }

        return {
          ...prev,

          commonFoods: [
            ...prev.commonFoods,
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

  /**
   * 刪除常吃食物
   */
  const removeCommonFood = useCallback(
    (id: string) => {
      setData((prev) => ({
        ...prev,

        commonFoods: prev.commonFoods.filter(
          (food) => food.id !== id,
        ),
      }))
    },
    [],
  )

  /**
   * 修改每日目標
   */
  const updateGoals = useCallback(
    (patch: Partial<Goals>) => {
      setData((prev) => ({
        ...prev,

        goals: {
          ...prev.goals,
          ...patch,
        },
      }))
    },
    [],
  )

  /**
   * 清除全部資料
   */
  const clearAll = useCallback(() => {
    const fresh = emptyData()

    setData(fresh)

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(fresh),
      )
    } catch {
      // ignore
    }
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

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext)

  if (!ctx) {
    throw new Error(
      "useStore 必須在 StoreProvider 內使用",
    )
  }

  return ctx
}
