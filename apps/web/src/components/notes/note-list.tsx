'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Copy, ExternalLink, Share2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuTrigger } from '@repo/ui/components/ui/context-menu'
import type { Note } from '../../lib/api'
import { useNotes } from '../../hooks/use-notes'
import { NoteCard } from './note-card'
import { DeleteNoteDialog } from './delete-note-dialog'
import { notesApi } from '../../lib/api'

export function NoteList({ loading }: { loading: boolean }) {
  const { notes } = useNotes()
  const router = useRouter()
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null)

  async function copyText(value: string, message: string) {
    await navigator.clipboard.writeText(value)
    toast.success(message)
  }

  async function handleCopyLink(noteId: string) {
    await copyText(`${window.location.origin}/notes/${noteId}`, 'Note link copied')
  }

  async function handleShare(noteId: string) {
    try {
      const { shareId } = await notesApi.share(noteId)
      await copyText(`${window.location.origin}/shared/${shareId}`, 'Share link copied')
    } catch {
      toast.error('Failed to share note')
    }
  }

  async function handleDelete(noteId: string) {
    try {
      await useNotes.getState().deleteNote(noteId)
      toast.success('Note deleted')
      router.refresh()
    } catch {
      toast.error('Failed to delete note')
    }
  }

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
    <>
      <div className="space-y-3">
        {notes.map((note) => (
          <ContextMenu key={note.id}>
            <ContextMenuTrigger asChild>
              <Link href={`/notes/${note.id}`} className="block">
                <NoteCard note={note} />
              </Link>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-72">
              <ContextMenuLabel>Note actions</ContextMenuLabel>
              <ContextMenuItem onSelect={() => router.push(`/notes/${note.id}`)}>
                <ExternalLink className="mr-2 size-4" />
                Open note
                <ContextMenuShortcut>Enter</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onSelect={() => void handleCopyLink(note.id)}>
                <Copy className="mr-2 size-4" />
                Copy note link
              </ContextMenuItem>
              <ContextMenuItem onSelect={() => void handleShare(note.id)}>
                <Share2 className="mr-2 size-4" />
                Share note
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={() => setNoteToDelete(note)}
              >
                <Trash2 className="mr-2 size-4" />
                Delete note
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>
      {noteToDelete ? (
        <DeleteNoteDialog
          open
          title={noteToDelete.title}
          onOpenChange={(open) => {
            if (!open) {
              setNoteToDelete(null)
            }
          }}
          onConfirm={async () => {
            await handleDelete(noteToDelete.id)
            setNoteToDelete(null)
          }}
        />
      ) : null}
    </>
  )
}