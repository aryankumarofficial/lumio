import { Response, NextFunction } from 'express'
import { db, notes, tags, noteTags, aiGenerations, eq, desc, gte, sql, count, sum, and } from '@repo/db'
import { AuthRequest } from '../../middleware/authenticate.js'

export const getInsights = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

        const [
            totalNotes,
            recentNotes,
            topTags,
            aiStats,
            weeklyActivity,
        ] = await Promise.all([
            // Total active notes
            db.$count(notes, eq(notes.userId, userId)),

            // 5 most recently edited
            db.query.notes.findMany({
                where: eq(notes.userId, userId),
                orderBy: desc(notes.updatedAt),
                limit: 5,
                columns: { id: true, title: true, updatedAt: true },
            }),

            // Most used tags
            db
                .select({
                    tagId: tags.id,
                    name: tags.name,
                    color: tags.color,
                    useCount: count(noteTags.noteId),
                })
                .from(tags)
                .leftJoin(noteTags, eq(tags.id, noteTags.tagId))
                .where(eq(tags.userId, userId))
                .groupBy(tags.id, tags.name, tags.color)
                .orderBy(desc(count(noteTags.noteId)))
                .limit(5),

            // AI usage stats
            db
                .select({
                    totalGenerations: count(aiGenerations.id),
                    totalTokensUsed: sum(aiGenerations.tokensUsed),
                })
                .from(aiGenerations)
                .leftJoin(notes, eq(aiGenerations.noteId, notes.id))
                .where(eq(notes.userId, userId)),

            // Notes edited in the last 7 days grouped by day
            db
                .select({
                    day: sql<string>`DATE(${notes.updatedAt})`,
                    count: count(notes.id),
                })
                .from(notes)
                .where(and(eq(notes.userId, userId), gte(notes.updatedAt, weekAgo)))
                .groupBy(sql`DATE(${notes.updatedAt})`)
                .orderBy(sql`DATE(${notes.updatedAt})`),
        ])

        res.json({
            totalNotes,
            recentNotes,
            topTags,
            aiStats: aiStats[0],
            weeklyActivity,
        })
    } catch (err) {
        next(err)
    }
}
