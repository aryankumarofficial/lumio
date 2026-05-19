import {relations} from 'drizzle-orm'
import {users} from './user.js'
import {notes} from './notes.js'
import {noteTags, tags} from './tags.js'
import {aiGenerations} from './ai-generations.js'

export const usersRelations = relations(users, ({many}) => ({
    notes: many(notes),
    tags: many(tags),
}))

export const notesRelations = relations(notes, ({one, many}) => ({
    user: one(users, {fields: [notes.userId], references: [users.id]}),
    noteTags: many(noteTags),
    aiGenerations: many(aiGenerations),
}))

export const tagsRelations = relations(tags, ({one, many}) => ({
    user: one(users, {fields: [tags.userId], references: [users.id]}),
    noteTags: many(noteTags),
}))

export const noteTagsRelations = relations(noteTags, ({one}) => ({
    note: one(notes, {fields: [noteTags.noteId], references: [notes.id]}),
    tag: one(tags, {fields: [noteTags.tagId], references: [tags.id]}),
}))

export const aiGenerationsRelations = relations(aiGenerations, ({one}) => ({
    note: one(notes, {fields: [aiGenerations.noteId], references: [notes.id]}),
}))