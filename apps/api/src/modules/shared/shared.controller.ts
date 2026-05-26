import { Request, Response, NextFunction } from 'express'
import { db } from '@repo/db'

export const getSharedNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const shareId = String(req.params.shareId)

        const note = await db.query.notes.findFirst({
            where: (n, { and, eq }) => and(
                eq(n.shareId, shareId),
                eq(n.isPublic, true),
            ),
            with: {
                noteTags: { with: { tag: true } },
                aiGenerations: {
                    orderBy: (g, { desc }) => desc(g.createdAt),
                    limit: 1,
                },
            },
        })

        if (!note) {
            res.status(404).json({ error: 'Note not found or not public' })
            return
        }

        // Strip sensitive fields
        const { userId, ...publicNote } = note

        res.json({ note: publicNote })
    } catch (err) {
        next(err)
    }
}
