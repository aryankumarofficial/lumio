import {boolean, pgTable, text, timestamp, uuid} from 'drizzle-orm/pg-core'
import {users} from './user.js'

export const notes = pgTable('notes', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, {onDelete: 'cascade'}),
    title: text('title').notNull().default('Untitled'),
    content: text('content').notNull().default(''),
    isArchived: boolean('is_archived').notNull().default(false),
    isPublic: boolean('is_public').notNull().default(false),
    shareId: text('share_id').unique(),          // nanoid, set on first share
    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow().$onUpdateFn(() => new Date()),
})

export type Note = typeof notes.$inferSelect
export type NewNote = typeof notes.$inferInsert