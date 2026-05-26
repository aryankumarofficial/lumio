import { Response, NextFunction } from 'express'
import { db, notes, tags, noteTags, aiGenerations, eq, and } from '@repo/db'
import { createNoteSchema, updateNoteSchema } from '@repo/schemas'
import { analyseNote, analyseNoteStream } from '@repo/ai'
import { nanoid } from 'nanoid'
import { AuthRequest } from '../../middleware/authenticate.js'

export const getNotes = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { search, tag, archived } = req.query
        const userId = req.user!.userId

        const result = await db.query.notes.findMany({
            where: (n, { and, eq, or, ilike }) =>
                and(
                    eq(n.userId, userId),
                    eq(n.isArchived, archived === 'true'),
                    search
                        ? or(
                              ilike(n.title, `%${search}%`),
                              ilike(n.content, `%${search}%`),
                          )
                        : undefined,
                ),
            with: {
                noteTags: { with: { tag: true } },
                aiGenerations: {
                    orderBy: (g, { desc }) => desc(g.createdAt),
                    limit: 1,
                },
            },
            orderBy: (n, { desc }) => desc(n.updatedAt),
        })

        // Filter by tag name if provided
        const filtered = tag
            ? result.filter((n) =>
                  n.noteTags.some((nt) => nt.tag.name === tag),
              )
            : result

        res.json({ notes: filtered })
    } catch (err) {
        next(err)
    }
}

export const createNote = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const body = createNoteSchema.parse(req.body)
        const userId = req.user!.userId

        const [note] = await db
            .insert(notes)
            .values({ userId, title: body.title, content: body.content })
            .returning()

        if (!note) throw new Error('Failed to create note')

        if (body.tagIds.length > 0) {
            await db.insert(noteTags).values(
                body.tagIds.map((tagId: string) => ({ noteId: note.id, tagId })),
            )
        }

        res.status(201).json({ note })
    } catch (err) {
        next(err)
    }
}

export const getNote = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const noteId = String(req.params.id)

        const note = await db.query.notes.findFirst({
            where: (n, { and, eq }) => and(eq(n.id, noteId), eq(n.userId, req.user!.userId)),
            with: { noteTags: { with: { tag: true } }, aiGenerations: { orderBy: (g, { desc }) => desc(g.createdAt), limit: 1 } },
        })

        if (!note) {
            res.status(404).json({ error: 'Note not found' })
            return
        }

        res.json({ note })
    } catch (err) {
        next(err)
    }
}

export const updateNote = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const body = updateNoteSchema.parse(req.body)
        const userId = req.user!.userId

        const noteId = String(req.params.id)

        const existing = await db.query.notes.findFirst({
            where: (n, { and, eq }) => and(eq(n.id, noteId), eq(n.userId, userId)),
        })

        if (!existing) {
            res.status(404).json({ error: 'Note not found' })
            return
        }

        const { tagIds, ...noteFields } = body

        const [updated] = await db
            .update(notes)
            .set({ ...noteFields, updatedAt: new Date() })
            .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
            .returning()

        // Sync tags if provided
        if (tagIds !== undefined) {
            await db.delete(noteTags).where(eq(noteTags.noteId, noteId))
            if (tagIds.length > 0) {
                await db.insert(noteTags).values(
                    tagIds.map((tagId: string) => ({ noteId, tagId })),
                )
            }
        }

        res.json({ note: updated })
    } catch (err) {
        next(err)
    }
}

export const deleteNote = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const noteId = String(req.params.id)

        const deleted = await db
            .delete(notes)
            .where(and(eq(notes.id, noteId), eq(notes.userId, req.user!.userId)))
            .returning({ id: notes.id })

        if (deleted.length === 0) {
            res.status(404).json({ error: 'Note not found' })
            return
        }

        res.json({ success: true })
    } catch (err) {
        next(err)
    }
}

export const shareNote = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const noteId = String(req.params.id)

        const existing = await db.query.notes.findFirst({
            where: (n, { and, eq }) => and(eq(n.id, noteId), eq(n.userId, req.user!.userId)),
        })

        if (!existing) {
            res.status(404).json({ error: 'Note not found' })
            return
        }

        const shareId = existing.shareId ?? nanoid(12)

        const [updated] = await db
            .update(notes)
            .set({ isPublic: true, shareId, updatedAt: new Date() })
            .where(eq(notes.id, noteId))
            .returning({ shareId: notes.shareId })

        if (!updated) throw new Error('Failed to update shareId')

        res.json({ shareId: updated.shareId })
    } catch (err) {
        next(err)
    }
}

export const summariseNote = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const noteId = String(req.params.id)

        const note = await db.query.notes.findFirst({
            where: (n, { and, eq }) => and(eq(n.id, noteId), eq(n.userId, req.user!.userId)),
        })

        if (!note) {
            res.status(404).json({ error: 'Note not found' })
            return
        }

        const result = await analyseNote(note.content)

        const [generation] = await db
            .insert(aiGenerations)
            .values({
                noteId: note.id,
                summary: result.summary,
                actionItems: result.actionItems,
                suggestedTitle: result.suggestedTitle,
                tokensUsed: result.tokensUsed,
                model: result.model,
            })
            .returning()

        res.json({ generation })
    } catch (err) {
        next(err)
    }
}

export const summariseNoteStream = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const noteId = String(req.params.id)

        const note = await db.query.notes.findFirst({
            where: (n, { and, eq }) => and(eq(n.id, noteId), eq(n.userId, req.user!.userId)),
        })

        if (!note) {
            res.status(404).json({ error: 'Note not found' })
            return
        }

        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')
        res.flushHeaders()

        const send = (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`)

        for await (const chunk of analyseNoteStream(note.content)) {
            send(chunk)

            if (chunk.type === 'done' && chunk.data) {
                await db.insert(aiGenerations).values({
                    noteId: note.id,
                    summary: chunk.data.summary,
                    actionItems: chunk.data.actionItems,
                    suggestedTitle: chunk.data.suggestedTitle,
                    tokensUsed: chunk.data.tokensUsed,
                    model: chunk.data.model,
                })
            }

            if (chunk.type === 'done' || chunk.type === 'error') {
                res.end()
                return
            }
        }
    } catch (err) {
        next(err)
    }
}
