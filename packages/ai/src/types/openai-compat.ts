export type AnthropicCompatibleMessage = {
    model: string;

    content: Array<{
        type: "text";
        text: string;
    }>;

    usage: {
        input_tokens: number;
        output_tokens: number;
    };
};

export type AnthropicCompatibleStreamEvent =
    | {
        type: "content_block_delta";
        delta: {
            type: "text_delta";
            text: string;
        };
    };