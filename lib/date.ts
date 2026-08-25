// 日期工具，統一使用本地時間的 YYYY-MM-DD 作為 key

export function toKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function todayKey(): string {
  return toKey(new Date())
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y, m - 1, d)
}

// 產生最近 n 天的 key 陣列（由舊到新，含今天）
export function lastNDays(n: number, end: Date = new Date()): string[] {
  const keys: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(end)
    d.setDate(d.getDate() - i)
    keys.push(toKey(d))
  }
  return keys
}

// 兩個日期 key 相差幾天
export function daysBetween(a: string, b: string): number {
  const ms = fromKey(b).getTime() - fromKey(a).getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"]

// 顯示用：8月25日 週一
export function formatDisplay(key: string): string {
  const d = fromKey(key)
  return `${d.getMonth() + 1}月${d.getDate()}日 週${WEEKDAYS[d.getDay()]}`
}

// 短顯示：8/25
export function formatShort(key: string): string {
  const d = fromKey(key)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
