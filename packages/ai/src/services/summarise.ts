import { getAnthropicClient, DEFAULT_MODEL, MAX_NOTE_CHARS } from '../client'
import { NOTE_ANALYSIS_SYSTEM, buildNotePrompt } from '../prompts/notes'
import { AIError, NoteAnalysisWithUsage, StreamChunk } from '../types'

type ParsedAnalysis = {
  summary: string
  actionItems: string[]
  suggestedTitle: string
}

function parseResponse(raw: string): ParsedAnalysis {
  let parsed: ParsedAnalysis
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new AIError(`Failed to parse AI response: ${raw}`, 'INVALID_RESPONSE')
  }
  if (!parsed.summary || !Array.isArray(parsed.actionItems) || !parsed.suggestedTitle) {
    throw new AIError('AI response missing required fields', 'INVALID_RESPONSE')
  }
  return parsed
}

function validateContent(content: string) {
  if (!content?.trim()) {
    throw new AIError('Note content is empty', 'INVALID_RESPONSE')
  }
  if (content.length > MAX_NOTE_CHARS) {
    throw new AIError(`Note exceeds ${MAX_NOTE_CHARS} character limit`, 'CONTENT_TOO_LONG')
  }
}

export async function analyseNote(content: string): Promise<NoteAnalysisWithUsage> {
  validateContent(content)

  try {
    const response = await getAnthropicClient().messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 1024,
      system: NOTE_ANALYSIS_SYSTEM,
      messages: [{ role: 'user', content: buildNotePrompt(content) }],
    })

    const raw = response.content.find((b) => b.type === 'text')?.text ?? ''
    const parsed = parseResponse(raw)

    return {
      ...parsed,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      model: response.model,
    }
  } catch (err) {
    if (err instanceof AIError) throw err
    if (err instanceof Error && err.message.includes('rate_limit')) {
      throw new AIError('Rate limit reached', 'RATE_LIMIT', err)
    }
    throw new AIError('Anthropic API call failed', 'API_ERROR', err)
  }
}

export async function* analyseNoteStream(
  content: string,
): AsyncGenerator<StreamChunk> {
  try {
    validateContent(content)
  } catch (err) {
    yield { type: 'error', error: err instanceof AIError ? err.message : 'Invalid content' }
    return
  }

  try {
    const stream = getAnthropicClient().messages.stream({
      model: DEFAULT_MODEL,
      max_tokens: 1024,
      system: NOTE_ANALYSIS_SYSTEM,
      messages: [{ role: 'user', content: buildNotePrompt(content) }],
    })

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield { type: 'delta', text: event.delta.text }
      }
    }

    const final = await stream.finalMessage()
    const raw = final.content.find((b) => b.type === 'text')?.text ?? ''
    const parsed = parseResponse(raw)

    yield {
      type: 'done',
      data: {
        ...parsed,
        tokensUsed: final.usage.input_tokens + final.usage.output_tokens,
        model: final.model,
      },
    }
  } catch (err) {
    yield {
      type: 'error',
      error: err instanceof Error ? err.message : 'Unexpected AI error',
    }
  }
}