import { notFound } from 'next/navigation'
import type { Note } from '../../../lib/api'
import { sharedApi } from '../../../lib/api'

export default async function SharedNotePage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params

  let note: Note

  try {
    const data = await sharedApi.get(shareId)
    note = data.note
  } catch {
    notFound()
  }

  const latestGeneration = note.aiGenerations?.[0]

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {note.noteTags.map(({ tag }) => (
              <span
                key={tag.id}
                className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
          <h1 className="text-4xl font-semibold tracking-tight">{note.title}</h1>
          <p className="text-sm text-muted-foreground">
            Last updated {new Date(note.updatedAt).toLocaleDateString()}
          </p>
        </header>

        {latestGeneration ? (
          <section className="space-y-3 rounded-2xl border bg-muted/30 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">AI summary</p>
            <p className="text-sm leading-6">{latestGeneration.summary}</p>
            {latestGeneration.actionItems.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {latestGeneration.actionItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}

        <article className="whitespace-pre-wrap rounded-2xl border bg-card/70 p-5 text-sm leading-7 shadow-sm">
          {note.content}
        </article>
      </div>
    </div>
  )
}