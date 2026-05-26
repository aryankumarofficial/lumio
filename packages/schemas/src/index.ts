import { z } from 'zod'

// Auth schemas
export const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// Note schemas
export const createNoteSchema = z.object({
  title: z.string().min(1).max(255).default('Untitled'),
  content: z.string().default(''),
  tagIds: z.array(z.string().uuid()).default([]),
})

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().optional(),
  isArchived: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
})

export type CreateNote = z.infer<typeof createNoteSchema>
export type UpdateNote = z.infer<typeof updateNoteSchema>
export type Signup = z.infer<typeof signupSchema>
export type Login = z.infer<typeof loginSchema>
