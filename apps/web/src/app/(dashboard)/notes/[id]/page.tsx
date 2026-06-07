'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@repo/ui/components/button'
import type { Note } from '../../../../lib/api'
import { notesApi } from '../../../../lib/api'
import { AiPanel } from '../../../../components/notes/ai-panel'
import { NoteEditor } from '../../../../components/notes/note-editor'
import { useNotes } from '../../../../hooks/use-notes'

export default function NoteEditorPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params.id
  const { updateNote, deleteNote } = useNotes()
  const [note, setNote] = useState<Note | null>(null)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle')
  const [deleting, setDeleting] = useState(false)

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

  const handleDelete = useCallback(async () => {
    if (!note || !id || deleting) {
      return
    }

    const confirmed = window.confirm(`Delete "${note.title}"? This cannot be undone.`)
    if (!confirmed) {
      return
    }

    setDeleting(true)

    try {
      await deleteNote(id)
      router.push('/notes')
      toast.success('Note deleted')
    } catch {
      toast.error('Failed to delete note')
    } finally {
      setDeleting(false)
    }
  }, [deleteNote, deleting, id, note, router])

  if (!note) {
    return <div className="h-8 w-48 animate-pulse rounded bg-muted" />
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/notes')}>
            <ArrowLeft className="size-4" />
            Back to notes
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="size-4" />
            {deleting ? 'Deleting...' : 'Delete note'}
          </Button>
        </div>
        <NoteEditor note={note} saveStatus={saveStatus} onChange={handleChange} />
      </div>
      <div className="xl:pt-1">
        <AiPanel note={note} onNoteUpdate={setNote} />
      </div>
    </div>
  )
}