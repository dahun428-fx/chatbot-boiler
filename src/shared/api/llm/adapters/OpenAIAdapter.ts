/**
 * OpenAI API Adapter
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

interface OpenAIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface OpenAIChatRequest {
    model: string;
    messages: OpenAIMessage[];
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
}

interface OpenAIChatResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

interface OpenAIStreamChunk {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        delta: {
            role?: string;
            content?: string;
        };
        finish_reason: string | null;
    }>;
}

export class OpenAIAdapter implements LLMAdapter {
    readonly name = 'openai';
    private config: LLMProviderConfig;
    private baseUrl: string;

    constructor(config: LLMProviderConfig) {
        this.config = config;
        this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    }

    async chat(request: LLMRequest): Promise<LLMResponse> {
        const body: OpenAIChatRequest = {
            model: request.model || this.config.defaultModel || 'gpt-4',
            messages: request.messages,
            temperature: request.temperature,
            max_tokens: request.maxTokens,
            stream: false,
        };

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.config.apiKey}`,
            },
            body: JSON.stringify(body),
            signal: request.signal,
        });

        if (!response.ok) {
            throw this.handleError(response.status, await response.text());
        }

        const data: OpenAIChatResponse = await response.json();

        return {
            content: data.choices[0]?.message?.content || '',
            model: data.model,
            usage: {
                promptTokens: data.usage.prompt_tokens,
                completionTokens: data.usage.completion_tokens,
                totalTokens: data.usage.total_tokens,
            },
            finishReason: data.choices[0]?.finish_reason as LLMResponse['finishReason'],
        };
    }

    async *stream(request: LLMRequest): AsyncGenerator<LLMStreamChunk, void, unknown> {
        const body: OpenAIChatRequest = {
            model: request.model || this.config.defaultModel || 'gpt-4',
            messages: request.messages,
            temperature: request.temperature,
            max_tokens: request.maxTokens,
            stream: true,
        };

        const sseStream = createSSEStream({
            url: `${this.baseUrl}/chat/completions`,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.config.apiKey}`,
            },
            body,
            signal: request.signal,
        });

        for await (const data of sseStream) {
            const parsed = parseSSEEvent(data) as OpenAIStreamChunk;

            if (parsed && typeof parsed === 'object' && 'choices' in parsed) {
                const content = parsed.choices[0]?.delta?.content || '';
                const done = parsed.choices[0]?.finish_reason !== null;

                yield { content, done };
            }
        }
    }

    private handleError(status: number, body: string): LLMError {
        let errorData: { error?: { message?: string; type?: string } } = {};

        try {
            errorData = JSON.parse(body);
        } catch {
            // ignore parse error
        }

        const message = errorData?.error?.message || `OpenAI API error: ${status}`;

        switch (status) {
            case 401:
                return new LLMErrorClass(message, 'auth_error', status);
            case 429:
                return new LLMErrorClass(message, 'rate_limit', status);
            case 400:
                if (message.includes('context_length')) {
                    return new LLMErrorClass(message, 'context_length_exceeded', status);
                }
                return new LLMErrorClass(message, 'invalid_request', status);
            case 404:
                return new LLMErrorClass(message, 'model_not_found', status);
            default:
                return new LLMErrorClass(message, 'unknown', status);
        }
    }
}
