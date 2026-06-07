import OpenAI from "openai";

const apiKey = process.env.AI_API_KEY;

const baseURL =
    process.env.AI_BASE_URL ??
    "https://generativelanguage.googleapis.com/v1beta/openai/";

let _openai: OpenAI | null = null;

if (apiKey) {
    _openai = new OpenAI({ apiKey, baseURL });
} else {
    // Delay throwing until the client is actually used to avoid startup crashes
    _openai = null;
}

export const openai: OpenAI = new Proxy({} as OpenAI, {
    get(_, prop) {
        if (!_openai) {
            throw new Error("AI_API_KEY env not set — set AI_API_KEY to use the OpenAI client");
        }
        return (_openai as any)[prop];
    },
    apply(_target, _thisArg, _args) {
        if (!_openai) throw new Error("AI_API_KEY env not set — set AI_API_KEY to use the OpenAI client");
        return (_openai as any).apply(_thisArg, _args);
    },
}) as OpenAI;

export const DEFAULT_MODEL = process.env.AI_DEFAULT_MODEL ?? "gemini-2.5-flash";

export const MAX_NOTE_CHARS = 10000;