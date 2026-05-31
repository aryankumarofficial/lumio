'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@repo/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card'
import type { AiGeneration, Note } from '../../lib/api'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface Props {
  note: Note
  onNoteUpdate: (note: Note) => void
}

export function AiPanel({ note, onNoteUpdate }: Props) {
  const [streaming, setStreaming] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [result, setResult] = useState<AiGeneration | null>(note.aiGenerations?.[0] ?? null)

  async function handleSummarise() {
    setStreaming(true)
    setStreamText('')
    setResult(null)

    try {
      const response = await fetch(`${API}/notes/${note.id}/summarise/stream`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok || !response.body) {
        throw new Error('Stream failed')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          break
        }

        for (const line of decoder.decode(value).split('\n')) {
          if (!line.startsWith('data: ')) {
            continue
          }

          const chunk = JSON.parse(line.slice(6))

          if (chunk.type === 'delta') {
            setStreamText((current) => current + chunk.text)
          }

          if (chunk.type === 'done') {
            setResult(chunk.data)
            onNoteUpdate({ ...note, aiGenerations: [chunk.data, ...note.aiGenerations] })
            setStreamText('')
          }

          if (chunk.type === 'error') {
            toast.error(chunk.error)
          }
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'AI failed')
    } finally {
      setStreaming(false)
    }
  }

  return (
    <Card className="sticky top-6 border-border/60 bg-card/90 shadow-sm backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Sparkles className="size-4 text-primary" />
          AI analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleSummarise} disabled={streaming || !note.content.trim()} size="sm" className="w-full">
          {streaming ? 'Analysing...' : 'Summarise note'}
        </Button>

        {streaming && streamText ? (
          <p className="whitespace-pre-wrap text-xs leading-6 text-muted-foreground">{streamText}</p>
        ) : null}

        {result && !streaming ? (
          <div className="space-y-4 text-sm">
            <section className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Summary</p>
              <p className="leading-6">{result.summary}</p>
            </section>

            {result.actionItems.length > 0 ? (
              <section className="space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Action items</p>
                <ul className="list-disc space-y-1 pl-5">
                  {result.actionItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {result.suggestedTitle ? (
              <section className="space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Suggested title</p>
                <p className="italic">{result.suggestedTitle}</p>
              </section>
            ) : null}

            <p className="text-xs text-muted-foreground">
              {result.tokensUsed.toLocaleString()} tokens · {result.model}
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}