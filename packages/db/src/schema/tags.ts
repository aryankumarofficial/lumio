import {pgTable, primaryKey, text, timestamp, unique, uuid} from 'drizzle-orm/pg-core'
import {users} from './user.js'
import {notes} from './notes.js'

export const tags = pgTable('tags', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, {onDelete: 'cascade'}),
    name: text('name').notNull(),
    color: text('color').notNull().default('#6366f1'),
    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
}, (t) => [
    unique().on(t.userId, t.name),
])

export const noteTags = pgTable('note_tags', {
    noteId: uuid('note_id').notNull().references(() => notes.id, {onDelete: 'cascade'}),
    tagId: uuid('tag_id').notNull().references(() => tags.id, {onDelete: 'cascade'}),
}, (t) => [
    primaryKey({columns: [t.noteId, t.tagId]}),
])

export type Tag = typeof tags.$inferSelect
export type NewTag = typeof tags.$inferInsert