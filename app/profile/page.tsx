"use client"

import { useState } from "react"
import { Syringe, Activity, Plus } from "lucide-react"
import { useStore } from "@/lib/store"
import { BigButton } from "@/components/ui/big-button"
import { MounjaroSheet } from "@/components/profile/mounjaro-sheet"
import { BodyDataSheet } from "@/components/profile/body-data-sheet"
import { MounjaroList } from "@/components/profile/mounjaro-list"
import { WeightHistory } from "@/components/profile/weight-history"

export default function ProfilePage() {
  const { data, loaded, removeMounjaro, updateDay, clearAll } = useStore()
  const [mjOpen, setMjOpen] = useState(false)
  const [bodyOpen, setBodyOpen] = useState(false)

  const handleReset = () => {
    if (window.confirm("確定要清除所有資料嗎？此動作無法復原。")) {
      clearAll()
    }
  }

  return (
    <div className="space-y-6">
      <header className="px-1">
        <h1 className="text-2xl font-black text-foreground">我的</h1>
        <p className="mt-0.5 text-sm font-medium text-muted-foreground">猛健樂與身體資料紀錄</p>
      </header>

      {/* 快速動作 */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setMjOpen(true)}
          className="flex flex-col items-center gap-2 rounded-3xl border border-border bg-card px-3 py-5 active:bg-muted"
        >
          <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <Syringe className="size-6" />
          </span>
          <span className="text-[15px] font-bold text-foreground">猛健樂紀錄</span>
        </button>
        <button
          type="button"
          onClick={() => setBodyOpen(true)}
          className="flex flex-col items-center gap-2 rounded-3xl border border-border bg-card px-3 py-5 active:bg-muted"
        >
          <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <Activity className="size-6" />
          </span>
          <span className="text-[15px] font-bold text-foreground">每日身體資料</span>
        </button>
      </div>

      {!loaded ? (
        <div className="py-20 text-center text-muted-foreground">載入中…</div>
      ) : (
        <>
          {/* 猛健樂紀錄 */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-bold text-foreground">猛健樂紀錄</h2>
              <button
                type="button"
                onClick={() => setMjOpen(true)}
                className="flex items-center gap-1 text-sm font-semibold text-primary"
              >
                <Plus className="size-4" /> 新增
              </button>
            </div>
            <MounjaroList records={data.mounjaro} onRemove={removeMounjaro} />
          </section>

          {/* 體重歷史 */}
          <section className="space-y-3">
            <h2 className="px-1 text-lg font-bold text-foreground">體重歷史</h2>
            <WeightHistory data={data} onClear={(key) => updateDay(key, { weight: undefined })} />
          </section>

          {/* 資料管理 */}
          <section className="space-y-3">
            <h2 className="px-1 text-lg font-bold text-foreground">資料管理</h2>
            <div className="rounded-3xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground text-pretty">
                你的資料儲存在這支手機的瀏覽器中，不會上傳雲端。未來可擴充登入與雲端同步功能。
              </p>
              <BigButton variant="danger" className="mt-3 h-12" onClick={handleReset}>
                清除所有資料
              </BigButton>
            </div>
          </section>
        </>
      )}

      <MounjaroSheet open={mjOpen} onClose={() => setMjOpen(false)} />
      <BodyDataSheet open={bodyOpen} onClose={() => setBodyOpen(false)} />
    </div>
  )
}
