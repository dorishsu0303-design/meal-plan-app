"use client"

import { Line, LineChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts"

export interface TrendPoint {
  label: string
  value: number | null
}

interface BaseProps {
  data: TrendPoint[]
  unit?: string
  color?: string
  goal?: number
  emptyText?: string
}

const AXIS = "var(--muted-foreground)"

function TooltipBox({ active, payload, label, unit }: any) {
  if (!active || !payload?.length || payload[0].value == null) return null
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-sm shadow-md">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-muted-foreground">
        {payload[0].value}
        {unit ? ` ${unit}` : ""}
      </p>
    </div>
  )
}

// 折線圖：適合體重、連續趨勢
export function LineTrend({ data, unit, color = "var(--primary)", goal, emptyText }: BaseProps) {
  const hasData = data.some((d) => d.value != null)
  if (!hasData) return <EmptyChart text={emptyText} />
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: AXIS }} tickLine={false} axisLine={false} minTickGap={16} />
        <YAxis tick={{ fontSize: 12, fill: AXIS }} tickLine={false} axisLine={false} width={44} domain={["auto", "auto"]} />
        <Tooltip content={<TooltipBox unit={unit} />} />
        {goal ? <ReferenceLine y={goal} stroke="var(--chart-5)" strokeDasharray="4 4" /> : null}
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={3}
          dot={{ r: 3, fill: color }}
          activeDot={{ r: 5 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// 長條圖：適合每日蛋白質、熱量
export function BarTrend({ data, unit, color = "var(--primary)", goal, emptyText }: BaseProps) {
  const hasData = data.some((d) => d.value != null && d.value > 0)
  if (!hasData) return <EmptyChart text={emptyText} />
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: AXIS }} tickLine={false} axisLine={false} minTickGap={16} />
        <YAxis tick={{ fontSize: 12, fill: AXIS }} tickLine={false} axisLine={false} width={44} />
        <Tooltip content={<TooltipBox unit={unit} />} cursor={{ fill: "var(--muted)" }} />
        {goal ? <ReferenceLine y={goal} stroke="var(--chart-5)" strokeDasharray="4 4" /> : null}
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function EmptyChart({ text }: { text?: string }) {
  return (
    <div className="flex h-[200px] items-center justify-center rounded-2xl bg-muted/50 text-center text-sm text-muted-foreground">
      {text ?? "尚無足夠資料"}
    </div>
  )
}
