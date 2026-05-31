import Anthropic from '@anthropic-ai/sdk'

let anthropic: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
    if (!anthropic) {
        if (!process.env.ANTHROPIC_API_KEY) {
            throw new Error('ANTHROPIC_API_KEY is not set. Please add it to your .env file')
        }
        anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        })
    }
    return anthropic
}

export const DEFAULT_MODEL = 'claude-sonnet-4-20250514' as const
export const MAX_NOTE_CHARS = 50_000      