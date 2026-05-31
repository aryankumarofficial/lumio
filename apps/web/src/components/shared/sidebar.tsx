'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, FileText } from 'lucide-react'
import { cn } from '../../lib/utils'

const links = [
  { href: '/notes', label: 'Notes', icon: FileText },
  { href: '/insights', label: 'Insights', icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 flex-col border-r border-border/60 bg-card/70 px-3 py-4 backdrop-blur lg:flex">
      <div className="px-3 pb-6 pt-2">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">Peblo</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight">AI Notes</p>
      </div>

      <nav className="space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                active ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}