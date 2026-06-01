import OpenAI from "openai";

const apiKey = process.env.AI_API_KEY;

if (!apiKey) {
    throw new Error(`AI_API_KEY env not set`)
}
export const openai = new OpenAI({
    apiKey,
    baseURL:
        process.env.AI_BASE_URL ??
        "https://generativelanguage.googleapis.com/v1beta/openai/"
});


export const DEFAULT_MODEL =
    process.env.AI_DEFAULT_MODEL ??
    "gemini-2.5-flash";

export const MAX_NOTE_CHARS = 10000;