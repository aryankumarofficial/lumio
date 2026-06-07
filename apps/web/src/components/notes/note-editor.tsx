"use client"

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { Check, FilePenLine, Loader2, NotebookPen } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@repo/ui/components/input-group'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@repo/ui/components/field'
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
      <FieldGroup className="gap-6">
        <Field>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <FieldContent>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <Controller
                name="title"
                control={form.control}
                render={({ field }) => (
                  <div className="flex-1">
                    <InputGroup>
                      <InputGroupAddon>
                        <FilePenLine className="size-4" />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="title"
                        className="px-0 text-3xl font-semibold tracking-tight"
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const v = e.target.value
                          field.onChange(v)
                          onChange('title', v)
                        }}
                        placeholder="Untitled"
                      />
                      <InputGroupText className="pr-3 text-xs">
                        {saveStatus === 'saving' ? <Loader2 className="size-3 animate-spin" /> : null}
                        {saveStatus === 'saved' ? <Check className="size-3 text-emerald-500" /> : null}
                        {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Draft'}
                      </InputGroupText>
                    </InputGroup>
                    <FieldError errors={[form.formState.errors.title]} />
                  </div>
                )}
              />
            </div>
            <FieldDescription>Give the note a clear title so it is easier to find later.</FieldDescription>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="content">Content</FieldLabel>
          <FieldContent>
            <div data-color-mode="auto" className="min-h-0 flex-1 rounded-xl border bg-background/60 p-3">
              <Controller
                name="content"
                control={form.control}
                render={({ field }) => (
                  <MDEditor
                    value={field.value ?? ''}
                    onChange={(value) => {
                      const v = value ?? ''
                      field.onChange(v)
                      onChange('content', v)
                    }}
                    height={560}
                    preview="live"
                  />
                )}
              />
            </div>
            <FieldDescription>
              <NotebookPen className="mr-1 inline-block size-4 align-[-2px]" /> Markdown is supported here.
            </FieldDescription>
          </FieldContent>
        </Field>
      </FieldGroup>
    </div>
  )
}