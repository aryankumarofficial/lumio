import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Button } from './button'
import { Input } from './input'
import { cn } from '../lib/utils'

function InputGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="input-group" role="group" className={cn('flex w-full items-stretch overflow-hidden rounded-xl border border-input bg-background shadow-sm focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20', className)} {...props} />
}

const inputGroupAddonVariants = cva('flex items-center justify-center px-3 text-muted-foreground [&_svg]:size-4', {
  variants: {
    align: {
      'inline-start': 'border-r border-input',
      'inline-end': 'border-l border-input',
    },
  },
  defaultVariants: {
    align: 'inline-start',
  },
})

function InputGroupAddon({ className, align = 'inline-start', ...props }: React.ComponentProps<'div'> & VariantProps<typeof inputGroupAddonVariants>) {
  return <div role="group" data-slot="input-group-addon" data-align={align} className={cn(inputGroupAddonVariants({ align }), className)} {...props} />
}

function InputGroupText({ className, ...props }: React.ComponentProps<'span'>) {
  return <span data-slot="input-group-text" className={cn('inline-flex items-center gap-2 text-sm text-muted-foreground', className)} {...props} />
}

function InputGroupInput({ className, ...props }: React.ComponentProps<'input'>) {
  return <Input data-slot="input-group-control" className={cn('flex-1 border-0 shadow-none focus-visible:ring-0', className)} {...props} />
}

function InputGroupButton({ className, type = 'button', size = 'icon-sm', variant = 'ghost', ...props }: Omit<React.ComponentProps<typeof Button>, 'size'> & { size?: 'icon-sm' | 'icon' | 'sm' | 'default' | 'lg' }) {
  return <Button type={type} size={size as never} variant={variant} className={cn('rounded-none border-0 shadow-none', className)} {...props} />
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput }
