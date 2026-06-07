'use client'

import { SidebarNav } from './sidebar-nav'

export function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r border-border/60 bg-card/70 px-3 py-4 backdrop-blur lg:flex">
      <div className="px-3 pb-6 pt-2">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">Peblo</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight">AI Notes</p>
      </div>
      <SidebarNav />
    </aside>
  )
}
