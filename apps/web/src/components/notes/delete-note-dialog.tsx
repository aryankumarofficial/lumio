'use client'

import type { ReactElement } from 'react'
import { useState } from 'react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@repo/ui/components/ui/alert-dialog'

interface Props {
  title: string
  onConfirm: () => Promise<void> | void
  trigger?: ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
  loadingLabel?: string
  actionLabel?: string
}

export function DeleteNoteDialog({
  title,
  onConfirm,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  loadingLabel = 'Deleting...',
  actionLabel = 'Delete note',
}: Props) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const [pending, setPending] = useState(false)

  const open = controlledOpen ?? uncontrolledOpen
  const onOpenChange = controlledOnOpenChange ?? setUncontrolledOpen

  async function handleConfirm() {
    setPending(true)

    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger> : null}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete note?</AlertDialogTitle>
          <AlertDialogDescription>
            Delete &ldquo;{title}&rdquo;? This action cannot be undone. The note will be permanently removed from your workspace.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={pending} variant="destructive">
            {pending ? loadingLabel : actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
