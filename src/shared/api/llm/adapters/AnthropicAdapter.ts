/**
 * Anthropic (Claude) API Adapter
 */

import { createSSEStream, parseSSEEvent } from '../SSEClient';
import type {
    LLMAdapter,
    LLMError,
    LLMProviderConfig,
    LLMRequest,
    LLMResponse,
    LLMStreamChunk,
} from '../types';
import { LLMError as LLMErrorClass } from '../types';

interface AnthropicMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface AnthropicChatRequest {
    model: string;
    messages: AnthropicMessage[];
    system?: string;
    max_tokens: number;
    temperature?: number;
    stream?: boolean;
}

interface AnthropicChatResponse {
    id: string;
    type: string;
    role: string;
    content: Array<{
        type: string;
        text: string;
    }>;
    model: string;
    stop_reason: string;
    usage: {
        input_tokens: number;
        output_tokens: number;
    };
}

interface AnthropicStreamEvent {
    type: string;
    index?: number;
    delta?: {
        type: string;
        text?: string;
    };
    content_block?: {
        type: string;
        text: string;
    };
}

export class AnthropicAdapter implements LLMAdapter {
    readonly name = 'anthropic';
    private config: LLMProviderConfig;
    private baseUrl: string;

    constructor(config: LLMProviderConfig) {
        this.config = config;
        this.baseUrl = config.baseUrl || 'https://api.anthropic.com/v1';
    }

    async chat(request: LLMRequest): Promise<LLMResponse> {
        const { systemMessage, messages } = this.convertMessages(request.messages);

        const body: AnthropicChatRequest = {
            model: request.model || this.config.defaultModel || 'claude-3-opus-20240229',
            messages,
            system: systemMessage,
            max_tokens: request.maxTokens || 4096,
            temperature: request.temperature,
            stream: false,
        };

        const response = await fetch(`${this.baseUrl}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.config.apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify(body),
            signal: request.signal,
        });

        if (!response.ok) {
            throw this.handleError(response.status, await response.text());
        }

        const data: AnthropicChatResponse = await response.json();

        return {
            content: data.content[0]?.text || '',
            model: data.model,
            usage: {
                promptTokens: data.usage.input_tokens,
                completionTokens: data.usage.output_tokens,
                totalTokens: data.usage.input_tokens + data.usage.output_tokens,
            },
            finishReason: data.stop_reason === 'end_turn' ? 'stop' : 'length',
        };
    }

    async *stream(request: LLMRequest): AsyncGenerator<LLMStreamChunk, void, unknown> {
        const { systemMessage, messages } = this.convertMessages(request.messages);

        const body: AnthropicChatRequest = {
            model: request.model || this.config.defaultModel || 'claude-3-opus-20240229',
            messages,
            system: systemMessage,
            max_tokens: request.maxTokens || 4096,
            temperature: request.temperature,
            stream: true,
        };

        const sseStream = createSSEStream({
            url: `${this.baseUrl}/messages`,
            method: 'POST',
            headers: {
                'x-api-key': this.config.apiKey,
                'anthropic-version': '2023-06-01',
            },
            body,
            signal: request.signal,
        });

        for await (const data of sseStream) {
            const event = parseSSEEvent(data) as AnthropicStreamEvent;

            if (event?.type === 'content_block_delta' && event.delta?.text) {
                yield { content: event.delta.text, done: false };
            } else if (event?.type === 'message_stop') {
                yield { content: '', done: true };
            }
        }
    }

    private convertMessages(messages: LLMRequest['messages']): {
        systemMessage?: string;
        messages: AnthropicMessage[];
    } {
        let systemMessage: string | undefined;
        const convertedMessages: AnthropicMessage[] = [];

        for (const msg of messages) {
            if (msg.role === 'system') {
                systemMessage = msg.content;
            } else {
                convertedMessages.push({
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content,
                });
            }
        }

        return { systemMessage, messages: convertedMessages };
    }

    private handleError(status: number, body: string): LLMError {
        let errorData: { error?: { message?: string; type?: string } } = {};

        try {
            errorData = JSON.parse(body);
        } catch {
            // ignore parse error
        }

        const message = errorData?.error?.message || `Anthropic API error: ${status}`;

        switch (status) {
            case 401:
                return new LLMErrorClass(message, 'auth_error', status);
            case 429:
                return new LLMErrorClass(message, 'rate_limit', status);
            case 400:
                return new LLMErrorClass(message, 'invalid_request', status);
            case 404:
                return new LLMErrorClass(message, 'model_not_found', status);
            default:
                return new LLMErrorClass(message, 'unknown', status);
        }
    }
}
