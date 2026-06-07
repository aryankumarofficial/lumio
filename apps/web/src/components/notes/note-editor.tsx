"use client"

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@repo/ui/components/input'
import { Field } from '@repo/ui/components/field'
import { FieldGroup } from '@repo/ui/components/field-group'
import type { Note } from '../../lib/api'
import { updateNoteSchema, type UpdateNote } from '@repo/schemas'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface Props {
  note: Note
  saveStatus: 'saved' | 'saving' | 'idle'
  onChange: (field: 'title' | 'content', value: string) => void
}

export function NoteEditor({ note, saveStatus, onChange }: Props) {
  const form = useForm<UpdateNote>({
    resolver: zodResolver(updateNoteSchema),
    defaultValues: { title: note.title, content: note.content },
  })

  useEffect(() => {
    form.reset({ title: note.title, content: note.content })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?.id])

  return (
    <div className="flex min-h-[calc(100vh-11rem)] flex-col gap-4 rounded-2xl border bg-card/70 p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <Controller
          name="title"
          control={form.control}
          render={({ field }) => (
            <Field className="flex-1" label={null}>
              <Input
                className="border-0 px-0 text-3xl font-semibold tracking-tight shadow-none focus-visible:ring-0"
                value={field.value}
                onChange={(e) => {
                  const v = e.target.value
                  field.onChange(v)
                  onChange('title', v)
                }}
                placeholder="Untitled"
              />
            </Field>
          )}
        />

        <span className="flex items-center gap-1 text-xs text-muted-foreground sm:shrink-0">
          {saveStatus === 'saving' ? <Loader2 className="size-3 animate-spin" /> : null}
          {saveStatus === 'saved' ? <Check className="size-3 text-emerald-500" /> : null}
          {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : ''}
        </span>
      </div>

      <div data-color-mode="auto" className="min-h-0 flex-1 rounded-xl border bg-background/60 p-3">
        <Controller
          name="content"
          control={form.control}
          render={({ field }) => (
            <FieldGroup>
              <MDEditor
                value={field.value}
                onChange={(value) => {
                  const v = value ?? ''
                  field.onChange(v)
                  onChange('content', v)
                }}
                height={560}
                preview="live"
              />
            </FieldGroup>
          )}
        />
      </div>
    </div>
  )
}