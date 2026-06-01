import { createMessage, streamMessage } from "../client";
import {
    DEFAULT_MODEL,
    MAX_NOTE_CHARS,
} from "../client";

import {
    NOTE_ANALYSIS_SYSTEM,
    buildNotePrompt,
} from "../prompts/notes";

import {
    AIError,
    NoteAnalysisWithUsage,
    StreamChunk,
} from "../types";

type ParsedAnalysis = {
    summary: string;
    actionItems: string[];
    suggestedTitle: string;
};

function parseResponse(raw: string): ParsedAnalysis {
    let parsed: ParsedAnalysis;

    try {
        parsed = JSON.parse(raw);
    } catch {
        throw new AIError(
            `Failed to parse AI response: ${raw}`,
            "INVALID_RESPONSE"
        );
    }

    if (
        !parsed.summary ||
        !Array.isArray(parsed.actionItems) ||
        !parsed.suggestedTitle
    ) {
        throw new AIError(
            "AI response missing required fields",
            "INVALID_RESPONSE"
        );
    }

    return parsed;
}

function validateContent(content: string) {
    if (!content?.trim()) {
        throw new AIError(
            "Note content is empty",
            "INVALID_RESPONSE"
        );
    }

    if (content.length > MAX_NOTE_CHARS) {
        throw new AIError(
            `Note exceeds ${MAX_NOTE_CHARS} character limit`,
            "CONTENT_TOO_LONG"
        );
    }
}

export async function analyseNote(
    content: string
): Promise<NoteAnalysisWithUsage> {
    validateContent(content);

    try {
        const response = await createMessage({
            system: NOTE_ANALYSIS_SYSTEM,

            max_tokens: 1024,

            messages: [
                {
                    role: "user",
                    content: buildNotePrompt(content),
                },
            ],
        });

        const raw =
            response.content.find(
                (block) => block.type === "text"
            )?.text ?? "";

        const parsed = parseResponse(raw);

        return {
            ...parsed,

            tokensUsed:
                response.usage.input_tokens +
                response.usage.output_tokens,

            model: response.model,
        };
    } catch (err) {
        if (err instanceof AIError) {
            throw err;
        }

        if (
            err instanceof Error &&
            err.message.toLowerCase().includes("rate")
        ) {
            throw new AIError(
                "Rate limit reached",
                "RATE_LIMIT",
                err
            );
        }

        throw new AIError(
            "AI API call failed",
            "API_ERROR",
            err
        );
    }
}

export async function* analyseNoteStream(
    content: string
): AsyncGenerator<StreamChunk> {
    try {
        validateContent(content);
    } catch (err) {
        yield {
            type: "error",
            error:
                err instanceof AIError
                    ? err.message
                    : "Invalid content",
        };

        return;
    }

    let accumulatedText = "";

    try {
        const stream = streamMessage({
            system: NOTE_ANALYSIS_SYSTEM,

            max_tokens: 1024,

            messages: [
                {
                    role: "user",
                    content: buildNotePrompt(content),
                },
            ],
        });

        for await (const event of stream) {
            if (
                event.type === "content_block_delta" &&
                event.delta.type === "text_delta"
            ) {
                accumulatedText += event.delta.text;

                yield {
                    type: "delta",
                    text: event.delta.text,
                };
            }
        }

        const parsed = parseResponse(accumulatedText);

        yield {
            type: "done",

            data: {
                ...parsed,

                tokensUsed: 0,

                model: DEFAULT_MODEL,
            },
        };
    } catch (err) {
        yield {
            type: "error",
            error:
                err instanceof Error
                    ? err.message
                    : "Unexpected AI error",
        };
    }
}