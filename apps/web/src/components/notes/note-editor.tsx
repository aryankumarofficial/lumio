'use client'

import dynamic from 'next/dynamic'
import { Check, Loader2 } from 'lucide-react'
import { Input } from '@repo/ui/components/input'
import type { Note } from '../../lib/api'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface Props {
  note: Note
  saveStatus: 'saved' | 'saving' | 'idle'
  onChange: (field: 'title' | 'content', value: string) => void
}

export function NoteEditor({ note, saveStatus, onChange }: Props) {
  return (
    <div className="flex min-h-[calc(100vh-11rem)] flex-col gap-4 rounded-2xl border bg-card/70 p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <Input
          className="border-0 px-0 text-3xl font-semibold tracking-tight shadow-none focus-visible:ring-0"
          value={note.title}
          onChange={(event) => onChange('title', event.target.value)}
          placeholder="Untitled"
        />
        <span className="flex items-center gap-1 text-xs text-muted-foreground sm:shrink-0">
          {saveStatus === 'saving' ? <Loader2 className="size-3 animate-spin" /> : null}
          {saveStatus === 'saved' ? <Check className="size-3 text-emerald-500" /> : null}
          {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : ''}
        </span>
      </div>

      <div data-color-mode="auto" className="min-h-0 flex-1 rounded-xl border bg-background/60 p-3">
        <MDEditor value={note.content} onChange={(value) => onChange('content', value ?? '')} height={560} preview="live" />
      </div>
    </div>
  )
}