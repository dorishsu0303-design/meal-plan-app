import { Ring } from "@/components/ui/ring"
import type { DayTotals } from "@/lib/nutrition"
import type { Goals } from "@/lib/types"

// 首頁最重要的卡片：一眼看出「今天蛋白質夠不夠」「是不是吃太少」
export function ProteinFocus({ totals, goals }: { totals: DayTotals; goals: Goals }) {
  const proteinRatio = goals.protein > 0 ? totals.protein / goals.protein : 0
  const proteinOk = totals.protein >= goals.protein
  const tooLittle = totals.mealCount > 0 && totals.calories < goals.caloriesMin

  return (
    <div className="rounded-3xl bg-primary p-5 text-primary-foreground shadow-sm">
      <div className="flex items-center gap-5">
        <Ring
          ratio={proteinRatio}
          size={124}
          stroke={13}
          trackClassName="text-primary-foreground/20"
          barClassName="text-primary-foreground"
        >
          <span className="text-3xl font-black leading-none">{totals.protein}</span>
          <span className="mt-1 text-xs font-medium opacity-80">/ {goals.protein} 克</span>
        </Ring>
        <div className="flex-1">
          <p className="text-sm font-medium opacity-90">今日蛋白質</p>
          <p className="mt-1 text-lg font-bold leading-snug text-balance">
            {proteinOk ? "今天蛋白質已達標，很棒！" : "蛋白質還沒到目標，下一餐多補充。"}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1.5 text-sm font-semibold">
            <span>今日熱量</span>
            <span className="text-base font-black">{totals.calories}</span>
            <span className="opacity-80">kcal</span>
          </div>
          {tooLittle ? (
            <p className="mt-2 text-sm font-semibold text-primary-foreground">今天吃得偏少，注意整體營養。</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
