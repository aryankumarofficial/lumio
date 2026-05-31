'use client'

import { useEffect, useState } from 'react'
import { FileText, Sparkles, Tag, TrendingUp } from 'lucide-react'
import { ActivityChart } from '../../../components/insights/activity-chart'
import { StatsCard } from '../../../components/insights/stats-card'
import { insightsApi, type Insights } from '../../../lib/api'

export default function InsightsPage() {
  const [data, setData] = useState<Insights | null>(null)

  useEffect(() => {
    void insightsApi.get().then(setData)
  }, [])

  if (!data) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-xl bg-muted/70" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Workspace analytics</p>
        <h1 className="text-3xl font-semibold tracking-tight">Insights</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard icon={FileText} label="Total notes" value={data.totalNotes} />
        <StatsCard icon={Sparkles} label="AI generations" value={data.aiStats.totalGenerations} />
        <StatsCard icon={TrendingUp} label="Tokens used" value={data.aiStats.totalTokensUsed.toLocaleString()} />
        <StatsCard icon={Tag} label="Unique tags" value={data.topTags.length} />
      </div>

      <ActivityChart data={data.weeklyActivity} />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card/70 p-5 shadow-sm backdrop-blur">
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Recently edited</h2>
          <ul className="space-y-2">
            {data.recentNotes.map((note) => (
              <li key={note.id} className="truncate rounded-lg bg-muted/40 px-3 py-2 text-sm">
                {note.title}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border bg-card/70 p-5 shadow-sm backdrop-blur">
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Top tags</h2>
          <ul className="space-y-2">
            {data.topTags.map((tag) => (
              <li key={tag.id} className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm">
                <span className="size-2 rounded-full" style={{ background: tag.color }} />
                <span>{tag.name}</span>
                <span className="ml-auto text-muted-foreground">{tag.useCount}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}