export interface NoteAnalysis {
    summary: string
    actionItems: string[]
    suggestedTitle: string
}

export interface NoteAnalysisWithUsage extends NoteAnalysis {
    tokensUsed: number
    model: string
}

export interface StreamChunk {
    type: 'delta' | 'done' | 'error'
    text?: string
    data?: NoteAnalysisWithUsage
    error?: string
}

export class AIError extends Error {
    constructor(
        message: string,
        public readonly code: 'INVALID_RESPONSE' | 'API_ERROR' | 'RATE_LIMIT' | 'CONTENT_TOO_LONG',
        public readonly cause?: unknown,
    ) {
        super(message)
        this.name = 'AIError'
    }
}