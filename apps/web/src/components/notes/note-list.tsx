'use client'

import Link from 'next/link'
import { useNotes } from '../../hooks/use-notes'
import { NoteCard } from './note-card'

export function NoteList({ loading }: { loading: boolean }) {
  const { notes } = useNotes()

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-2xl bg-muted/70" />
        ))}
      </div>
    )
  }

  if (notes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-card/50 px-6 py-14 text-center text-sm text-muted-foreground">
        No notes yet. Create one to get started.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <Link key={note.id} href={`/notes/${note.id}`} className="block">
          <NoteCard note={note} />
        </Link>
      ))}
    </div>
  )
}