'use client'

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

interface Props {
  data: { day: string; count: number }[]
}

export function ActivityChart({ data }: Props) {
  return (
    <section className="rounded-2xl border bg-card/70 p-5 shadow-sm backdrop-blur">
      <h2 className="mb-3 text-sm font-medium text-muted-foreground">Weekly activity</h2>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en', { weekday: 'short' })}
            />
            <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} className="fill-primary" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}