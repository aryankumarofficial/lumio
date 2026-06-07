import * as React from 'react'
import { cn } from '../lib/utils'
import { Label } from './label'

function Field({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="field" className={cn('flex flex-col gap-2', className)} {...props} />
}

function FieldGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="field-group" className={cn('grid gap-4', className)} {...props} />
}

function FieldContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="field-content" className={cn('flex flex-col gap-1.5', className)} {...props} />
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return <Label data-slot="field-label" className={cn('text-sm font-medium', className)} {...props} />
}

function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot="field-description" className={cn('text-sm text-muted-foreground', className)} {...props} />
}

function FieldError({ className, children, errors, ...props }: React.ComponentProps<'div'> & { errors?: Array<{ message?: string } | undefined> }) {
  const content = children ?? errors?.find((error) => error?.message)?.message

  if (!content) {
    return null
  }

  return (
    <div role="alert" data-slot="field-error" className={cn('text-sm text-destructive', className)} {...props}>
      {content}
    </div>
  )
}

export { Field, FieldGroup, FieldContent, FieldLabel, FieldDescription, FieldError }
