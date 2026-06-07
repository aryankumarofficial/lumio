'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@repo/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { useAuth } from '../../hooks/use-auth'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema } from '@repo/schemas'
import type { Signup } from '@repo/schemas'

export function SignupForm() {
  const router = useRouter()
  const { signup } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Signup>({ resolver: zodResolver(signupSchema) })

  async function onSubmit(data: Signup) {
    try {
      await signup(data.name, data.email, data.password)
      router.push('/notes')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Signup failed')
    }
  }

  return (
    <Card className="border-border/60 bg-card/90 shadow-2xl shadow-black/5 backdrop-blur">
      <CardHeader className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Peblo</p>
        <CardTitle className="text-2xl">Create your workspace</CardTitle>
        <CardDescription>Start using Peblo for free</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" autoComplete="name" placeholder="John Doe" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="new-password" placeholder="Min 8 characters" {...register('password')} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account? <Link href="/login" className="text-primary underline-offset-4 hover:underline">Sign in</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}