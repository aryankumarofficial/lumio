import {integer, json, pgTable, text, timestamp, uuid} from 'drizzle-orm/pg-core'
import {notes} from './notes.js'

export const aiGenerations = pgTable('ai_generations', {
    id: uuid('id').primaryKey().defaultRandom(),
    noteId: uuid('note_id').notNull().references(() => notes.id, {onDelete: 'cascade'}),
    summary: text('summary').notNull(),
    actionItems: json('action_items').$type<string[]>().notNull().default([]),
    suggestedTitle: text('suggested_title'),
    tokensUsed: integer('tokens_used'),                          // for insights dashboard
    model: text('model').notNull().default('claude-sonnet-4-20250514'),
    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
})

export type AiGeneration = typeof aiGenerations.$inferSelect
export type NewAiGeneration = typeof aiGenerations.$inferInsert