'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import type { Note } from '../../../../lib/api'
import { notesApi } from '../../../../lib/api'
import { AiPanel } from '../../../../components/notes/ai-panel'
import { NoteEditor } from '../../../../components/notes/note-editor'
import { useNotes } from '../../../../hooks/use-notes'

export default function NoteEditorPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const { updateNote } = useNotes()
  const [note, setNote] = useState<Note | null>(null)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle')

  useEffect(() => {
    if (!id) {
      return
    }

    void notesApi
      .get(id)
      .then((data) => setNote(data.note))
      .catch(() => toast.error('Note not found'))
  }, [id])

  const handleChange = useCallback(
    async (field: 'title' | 'content', value: string) => {
      if (!note || !id) {
        return
      }

      setNote((current) => (current ? { ...current, [field]: value } : current))
      setSaveStatus('saving')

      try {
        await updateNote(id, { [field]: value })
        setSaveStatus('saved')
      } catch {
        toast.error('Failed to save')
        setSaveStatus('idle')
      }
    },
    [id, note, updateNote],
  )

  if (!note) {
    return <div className="h-8 w-48 animate-pulse rounded bg-muted" />
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0">
        <NoteEditor note={note} saveStatus={saveStatus} onChange={handleChange} />
      </div>
      <div className="xl:pt-1">
        <AiPanel note={note} onNoteUpdate={setNote} />
      </div>
    </div>
  )
}