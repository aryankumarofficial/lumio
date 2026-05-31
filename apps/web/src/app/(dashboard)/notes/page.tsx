'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@repo/ui/components/button'
import { NoteList } from '../../../components/notes/note-list'
import { SearchBar } from '../../../components/notes/search-bar'
import { useNotes } from '../../../hooks/use-notes'

export default function NotesPage() {
  const router = useRouter()
  const { fetchNotes, createNote, loading } = useNotes()

  useEffect(() => {
    void fetchNotes()
  }, [fetchNotes])

  async function handleCreate() {
    try {
      const note = await createNote()
      router.push(`/notes/${note.id}`)
    } catch {
      toast.error('Failed to create note')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Your workspace</p>
          <h1 className="text-3xl font-semibold tracking-tight">Notes</h1>
        </div>
        <Button onClick={handleCreate} size="sm" className="sm:self-start">
          <Plus className="size-4" />
          New note
        </Button>
      </div>
      <SearchBar />
      <NoteList loading={loading} />
    </div>
  )
}