// src/entities/message-set/types/messageKey.ts

/** 모듈과 액션 열거형 */
export enum Module {
  CHATBOT = 'chatbot',
  LLM = 'llm',
  ERROR = 'error',
}

export enum Action {
  START = 'start',
  ASK_AGAIN = 'ask',
  ENDING_PHRASE = 'ending_phrase',
  TIMEOUT = 'timeout',
  FEEDBACK = 'feedback',
  STREAMING = 'streaming',
  STREAMING_PREFIX = 'streaming_prefix',
  TEXT_STREAM = 'text_stream',
  END = 'end',
  ERROR = 'error',
}

/** 기본 키 인터페이스 */
interface BaseKey {
  module: Module;
  action: Action;
}

export interface ChatbotStreamingPrefixKey extends BaseKey {
  module: Module.CHATBOT;
  action: Action.STREAMING_PREFIX;
}

export interface ChatbotStreamingKey extends BaseKey {
  module: Module.CHATBOT;
  action: Action.STREAMING;
}

export interface ChatbotStartKey extends BaseKey {
  module: Module.CHATBOT;
  action: Action.START;
}

export interface ChatbotAskAgainKey extends BaseKey {
  module: Module.CHATBOT;
  action: Action.ASK_AGAIN;
}

export interface ChatbotFeedbackKey extends BaseKey {
  module: Module.CHATBOT;
  action: Action.FEEDBACK;
}

export interface ChatbotTextStreamKey extends BaseKey {
  module: Module.CHATBOT;
  action: Action.TEXT_STREAM;
}

export interface ChatbotEndKey extends BaseKey {
  module: Module.CHATBOT;
  action: Action.END;
}

export interface LlmStartMsgKey extends BaseKey {
  module: Module.LLM;
  action: Action.START;
}

export interface LlmEndingPhraseKey extends BaseKey {
  module: Module.LLM;
  action: Action.ENDING_PHRASE;
}

export interface LlmAskAgainKey extends BaseKey {
  module: Module.LLM;
  action: Action.ASK_AGAIN;
}

export interface LlmErrorKey extends BaseKey {
  module: Module.LLM;
  action: Action.ERROR;
}

export interface ErrorKey extends BaseKey {
  module: Module.ERROR;
  action: Action.START | Action.TIMEOUT;
}

/** 가능한 모든 MessageKey 유니언 타입 */
export type MessageKey =
  | ChatbotStreamingPrefixKey
  | ChatbotStreamingKey
  | ChatbotStartKey
  | ChatbotAskAgainKey
  | ChatbotFeedbackKey
  | ChatbotTextStreamKey
  | ChatbotEndKey
  | LlmStartMsgKey
  | LlmEndingPhraseKey
  | LlmAskAgainKey
  | ErrorKey
  | LlmErrorKey;
