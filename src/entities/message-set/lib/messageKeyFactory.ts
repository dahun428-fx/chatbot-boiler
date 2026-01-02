import {
  Action,
  ChatbotAskAgainKey,
  ChatbotEndKey,
  ChatbotFeedbackKey,
  ChatbotStartKey,
  ChatbotStreamingKey,
  ChatbotStreamingPrefixKey,
  ChatbotTextStreamKey,
  ErrorKey,
  LlmAskAgainKey,
  LlmEndingPhraseKey,
  LlmErrorKey,
  LlmStartMsgKey,
  Module,
} from '../types/messageKey';

/**
 * MessageKey 생성 팩토리 함수
 */
export const MessageKeyFactory = {
  chatbot: {
    start(): ChatbotStartKey {
      return { module: Module.CHATBOT, action: Action.START };
    },
    askAgain(): ChatbotAskAgainKey {
      return { module: Module.CHATBOT, action: Action.ASK_AGAIN };
    },
    feedback(): ChatbotFeedbackKey {
      return { module: Module.CHATBOT, action: Action.FEEDBACK };
    },
    streaming_prefix(): ChatbotStreamingPrefixKey {
      return { module: Module.CHATBOT, action: Action.STREAMING_PREFIX };
    },
    streaming(): ChatbotStreamingKey {
      return { module: Module.CHATBOT, action: Action.STREAMING };
    },
    text_stream(): ChatbotTextStreamKey {
      return { module: Module.CHATBOT, action: Action.TEXT_STREAM };
    },
    end(): ChatbotEndKey {
      return { module: Module.CHATBOT, action: Action.END };
    },
  },
  llm: {
    start(): LlmStartMsgKey {
      return { module: Module.LLM, action: Action.START };
    },
    endingPhrase(): LlmEndingPhraseKey {
      return { module: Module.LLM, action: Action.ENDING_PHRASE };
    },
    askAgain(): LlmAskAgainKey {
      return { module: Module.LLM, action: Action.ASK_AGAIN };
    },
    error(): LlmErrorKey {
      return { module: Module.LLM, action: Action.ERROR };
    },
  },
  error: {
    start(): ErrorKey {
      return { module: Module.ERROR, action: Action.START };
    },
    timeout(): ErrorKey {
      return { module: Module.ERROR, action: Action.TIMEOUT };
    },
  },
};
