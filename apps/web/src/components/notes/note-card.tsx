import { formatDistanceToNow } from 'date-fns'
import type { Note } from '../../lib/api'
import { TagBadge } from './tag-badge'

function getPreview(content: string) {
  const text = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/[*_~>-]/g, '')
    .replace(/\n{2,}/g, '\n')
    .replace(/\s+/g, ' ')
    .trim()

  if (!text) {
    return 'No content yet.'
  }

  return text.length > 180 ? `${text.slice(0, 180).trimEnd()}...` : text
}

export function NoteCard({ note }: { note: Note }) {
  const noteTags = note.noteTags ?? []
  const preview = getPreview(note.content)

  return (
    <article className="group rounded-2xl border bg-card/70 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-accent/40 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 truncate text-base font-medium">{note.title}</h3>
        <span className="shrink-0 text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{preview}</p>
      {noteTags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {noteTags.map(({ tag }) => (
            <TagBadge key={tag.id} name={tag.name} color={tag.color} />
          ))}
        </div>
      ) : null}
    </article>
  )
}