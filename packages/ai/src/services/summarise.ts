import { anthropic, DEFAULT_MODEL, MAX_NOTE_CHARS } from '../client'
import { NOTE_ANALYSIS_SYSTEM, buildNotePrompt }    from '../prompts/notes'
import { AIError, NoteAnalysisWithUsage, StreamChunk } from '../types'

// ─── Non-streaming (returns full parsed result) ───────────────────────────────

export async function analyseNote(content: string): Promise<NoteAnalysisWithUsage> {
  if (!content?.trim()) {
    throw new AIError('Note content is empty', 'INVALID_RESPONSE')
  }

  if (content.length > MAX_NOTE_CHARS) {
    throw new AIError(
      `Note exceeds maximum length of ${MAX_NOTE_CHARS} characters`,
      'CONTENT_TOO_LONG',
    )
  }

  let response

  try {
    response = await anthropic.messages.create({
      model:      DEFAULT_MODEL,
      max_tokens: 1024,
      system:     NOTE_ANALYSIS_SYSTEM,
      messages:   [{ role: 'user', content: buildNotePrompt(content) }],
    })
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('rate_limit')) {
      throw new AIError('Rate limit reached, try again shortly', 'RATE_LIMIT', err)
    }
    throw new AIError('Anthropic API call failed', 'API_ERROR', err)
  }

  const raw = response.content.find((b) => b.type === 'text')?.text ?? ''

  let parsed: { summary: string; actionItems: string[]; suggestedTitle: string }

  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new AIError(`Failed to parse AI response as JSON: ${raw}`, 'INVALID_RESPONSE')
  }

  if (!parsed.summary || !Array.isArray(parsed.actionItems) || !parsed.suggestedTitle) {
    throw new AIError('AI response missing required fields', 'INVALID_RESPONSE')
  }

  return {
    summary:        parsed.summary,
    actionItems:    parsed.actionItems,
    suggestedTitle: parsed.suggestedTitle,
    tokensUsed:     response.usage.input_tokens + response.usage.output_tokens,
    model:          response.model,
  }
}

// ─── Streaming (yields SSE-compatible chunks) ────────────────────────────────
// Use this in the Express route — sends tokens to the client as they arrive,
// then emits the final parsed JSON in the 'done' chunk.

export async function* analyseNoteStream(
  content: string,
): AsyncGenerator<StreamChunk> {
  if (!content?.trim()) {
    yield { type: 'error', error: 'Note content is empty' }
    return
  }

  if (content.length > MAX_NOTE_CHARS) {
    yield { type: 'error', error: 'Note content is too long' }
    return
  }

  try {
    const stream = anthropic.messages.stream({
      model:      DEFAULT_MODEL,
      max_tokens: 1024,
      system:     NOTE_ANALYSIS_SYSTEM,
      messages:   [{ role: 'user', content: buildNotePrompt(content) }],
    })

    // Stream raw tokens to client for live feedback
    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield { type: 'delta', text: event.delta.text }
      }
    }

    // Once complete, parse and emit structured result
    const final    = await stream.finalMessage()
    const raw      = final.content.find((b) => b.type === 'text')?.text ?? ''

    const parsed: { summary: string; actionItems: string[]; suggestedTitle: string } =
      JSON.parse(raw)

    yield {
      type: 'done',
      data: {
        summary:        parsed.summary,
        actionItems:    parsed.actionItems,
        suggestedTitle: parsed.suggestedTitle,
        tokensUsed:     final.usage.input_tokens + final.usage.output_tokens,
        model:          final.model,
      },
    }
  } catch (err) {
    yield {
      type:  'error',
      error: err instanceof Error ? err.message : 'Unexpected AI error',
    }
  }
}
