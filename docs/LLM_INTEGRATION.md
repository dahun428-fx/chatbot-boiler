# LLM Integration Guide

이 문서는 LLM Chatbot Boilerplate에서 LLM 서비스를 통합하는 방법을 설명합니다.

## 📋 목차

1. [지원 Provider](#-지원-provider)
2. [빠른 시작](#-빠른-시작)
3. [환경 설정](#-환경-설정)
4. [API 사용법](#-api-사용법)
5. [스트리밍](#-스트리밍)
6. [에러 처리](#-에러-처리)
7. [커스텀 Provider 추가](#-커스텀-provider-추가)

---

## 🔌 지원 Provider

| Provider | 모델 예시 | 특징 |
|----------|-----------|------|
| **OpenAI** | gpt-4o, gpt-4-turbo, gpt-3.5-turbo | 가장 널리 사용됨 |
| **Anthropic** | claude-3-opus, claude-3-sonnet, claude-3-haiku | 긴 컨텍스트, 안전성 |
| **Custom** | 자체 모델 | 자체 백엔드 서버 |

---

## ⚡ 빠른 시작

### 1. 환경변수 설정

```bash
# .env.local
VITE_LLM_PROVIDER=openai
VITE_LLM_API_KEY=sk-your-api-key-here
VITE_LLM_MODEL=gpt-4o
```

### 2. Provider 사용

```typescript
import { createLLMProvider } from '@/shared/api/llm';

const provider = createLLMProvider();

// 채팅
const response = await provider.chat({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' },
  ],
});

console.log(response.content);
```

---

## ⚙️ 환경 설정

### 환경변수 목록

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `VITE_LLM_PROVIDER` | Provider 타입 (`openai`, `anthropic`, `custom`) | `openai` |
| `VITE_LLM_API_KEY` | API 키 | - |
| `VITE_LLM_MODEL` | 기본 모델 | Provider별 기본값 |
| `VITE_LLM_BASE_URL` | 커스텀 API 엔드포인트 | Provider별 기본값 |

### Provider별 설정

#### OpenAI

```bash
VITE_LLM_PROVIDER=openai
VITE_LLM_API_KEY=sk-...
VITE_LLM_MODEL=gpt-4o
# 선택: Azure OpenAI 사용 시
VITE_LLM_BASE_URL=https://your-resource.openai.azure.com
```

#### Anthropic

```bash
VITE_LLM_PROVIDER=anthropic
VITE_LLM_API_KEY=sk-ant-...
VITE_LLM_MODEL=claude-3-5-sonnet-20241022
```

#### Custom (자체 서버)

```bash
VITE_LLM_PROVIDER=custom
VITE_LLM_API_KEY=your-auth-token
VITE_LLM_BASE_URL=https://your-api.com
```

---

## 📡 API 사용법

### Provider 생성

```typescript
import { 
  createLLMProvider,
  OpenAIAdapter,
  AnthropicAdapter,
  CustomAdapter,
} from '@/shared/api/llm';

// 방법 1: 환경변수 자동 감지
const provider = createLLMProvider();

// 방법 2: 명시적 설정
const provider = createLLMProvider({
  type: 'openai',
  apiKey: 'sk-...',
  defaultModel: 'gpt-4o',
});

// 방법 3: 직접 어댑터 생성
const openai = new OpenAIAdapter({
  apiKey: 'sk-...',
  defaultModel: 'gpt-4o',
});
```

### 메시지 형식

```typescript
import type { LLMMessage } from '@/shared/api/llm';

const messages: LLMMessage[] = [
  { role: 'system', content: '당신은 친절한 AI 어시스턴트입니다.' },
  { role: 'user', content: '안녕하세요!' },
  { role: 'assistant', content: '안녕하세요! 무엇을 도와드릴까요?' },
  { role: 'user', content: '오늘 날씨 어때요?' },
];
```

### 일반 채팅 (Non-streaming)

```typescript
const response = await provider.chat({
  messages,
  model: 'gpt-4o', // 선택
  temperature: 0.7, // 선택 (0-2)
  maxTokens: 1024, // 선택
});

console.log(response.content);
console.log(response.usage); // { promptTokens, completionTokens, totalTokens }
```

### 요청 취소

```typescript
const controller = new AbortController();

// 5초 후 취소
setTimeout(() => controller.abort(), 5000);

try {
  const response = await provider.chat({
    messages,
    signal: controller.signal,
  });
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('요청이 취소되었습니다.');
  }
}
```

---

## 🌊 스트리밍

### 기본 스트리밍

```typescript
const stream = provider.stream({
  messages: [{ role: 'user', content: 'Tell me a story' }],
});

let fullContent = '';

for await (const chunk of stream) {
  fullContent += chunk.content;
  console.log(chunk.content); // 실시간 출력
  
  if (chunk.done) {
    console.log('스트리밍 완료');
  }
}
```

### React에서 스트리밍

```typescript
function useLLMStream() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const provider = createLLMProvider();
  
  const sendMessage = async (userMessage: string) => {
    setIsLoading(true);
    setContent('');
    
    try {
      const stream = provider.stream({
        messages: [{ role: 'user', content: userMessage }],
      });
      
      for await (const chunk of stream) {
        setContent(prev => prev + chunk.content);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return { content, isLoading, sendMessage };
}
```

### SSE 클라이언트 직접 사용

```typescript
import { createSSEStream, createRetryableSSEStream } from '@/shared/api/llm';

// 기본 스트림
const stream = createSSEStream({
  url: '/api/chat/stream',
  method: 'POST',
  headers: { Authorization: 'Bearer token' },
  body: { message: 'Hello' },
});

for await (const data of stream) {
  console.log(data);
}

// 재시도 로직 포함
const reliableStream = createRetryableSSEStream(
  {
    url: '/api/chat/stream',
    method: 'POST',
    body: { message: 'Hello' },
  },
  {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
  }
);
```

---

## 🚨 에러 처리

### LLMError 타입

```typescript
import { LLMError } from '@/shared/api/llm';

try {
  await provider.chat({ messages });
} catch (error) {
  if (error instanceof LLMError) {
    switch (error.type) {
      case 'auth_error':
        console.log('API 키를 확인하세요');
        break;
      case 'rate_limit':
        console.log('잠시 후 다시 시도하세요');
        break;
      case 'invalid_request':
        console.log('요청 형식이 올바르지 않습니다');
        break;
      case 'network_error':
        console.log('네트워크 연결을 확인하세요');
        break;
      case 'timeout':
        console.log('응답 시간이 초과되었습니다');
        break;
      default:
        console.log('알 수 없는 오류:', error.message);
    }
    
    console.log('상태 코드:', error.statusCode);
  }
}
```

### Error Boundary 사용

```tsx
import { ErrorBoundary, LLMErrorFallback } from '@/shared/ui/error';

function ChatPage() {
  return (
    <ErrorBoundary
      fallback={(props) => <LLMErrorFallback {...props} />}
      onError={(error, info) => {
        // 에러 로깅 서비스에 전송
        errorTracker.capture(error, { extra: info });
      }}
    >
      <ChatRoom />
    </ErrorBoundary>
  );
}
```

---

## 🔧 커스텀 Provider 추가

### 새 어댑터 구현

```typescript
// src/shared/api/llm/adapters/MyCustomAdapter.ts

import type { LLMAdapter, LLMProviderConfig, LLMRequest, LLMResponse, LLMStreamChunk } from '../types';

export class MyCustomAdapter implements LLMAdapter {
  readonly name = 'my-custom';
  private config: LLMProviderConfig;
  
  constructor(config: LLMProviderConfig) {
    this.config = config;
  }
  
  async chat(request: LLMRequest): Promise<LLMResponse> {
    const response = await fetch(`${this.config.baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        messages: request.messages,
        model: request.model || this.config.defaultModel,
      }),
      signal: request.signal,
    });
    
    const data = await response.json();
    
    return {
      content: data.result,
      model: data.model,
      finishReason: 'stop',
    };
  }
  
  async *stream(request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
    // 스트리밍 구현
    // ...
    yield { content: '', done: true };
  }
}
```

### Provider 팩토리에 등록

```typescript
// src/shared/api/llm/index.ts 수정

import { MyCustomAdapter } from './adapters/MyCustomAdapter';

export function createLLMProvider(options?: CreateLLMProviderOptions): LLMAdapter {
  switch (type) {
    // ... 기존 케이스
    case 'my-custom':
      return new MyCustomAdapter(config);
    // ...
  }
}
```

---

## 📚 추가 리소스

- [OpenAI API 문서](https://platform.openai.com/docs/api-reference)
- [Anthropic API 문서](https://docs.anthropic.com/claude/reference)
- [Architecture Guide](./ARCHITECTURE.md)

---

## ❓ FAQ

### Q: API 키는 어디서 발급받나요?

- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/

### Q: 프록시 서버를 통해 요청하려면?

`.env` 파일에서 `VITE_LLM_BASE_URL`을 프록시 서버 주소로 설정하세요:

```bash
VITE_LLM_BASE_URL=https://your-proxy-server.com/api
```

### Q: 여러 Provider를 동시에 사용할 수 있나요?

네, 각각 별도의 어댑터 인스턴스를 생성하면 됩니다:

```typescript
const openai = new OpenAIAdapter({ apiKey: '...' });
const anthropic = new AnthropicAdapter({ apiKey: '...' });

// 필요에 따라 선택적 사용
const response = await (useOpenAI ? openai : anthropic).chat({ messages });
```
