# 🤖 LLM Chatbot Boilerplate

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-18.3-61dafb?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vite-6.0-646cff?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwindcss" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

**프로덕션 레디** TypeScript + React 기반의 LLM 챗봇 보일러플레이트입니다. 환경변수 하나로 OpenAI, Anthropic, Google Gemini를 전환하고, 백엔드 API와 직접 LLM 호출 모드를 자유롭게 선택할 수 있습니다.

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 🔌 **멀티 LLM 지원** | OpenAI, Anthropic Claude, Google Gemini 어댑터 내장 |
| 🔄 **서비스 추상화** | 환경변수로 BackendAPI ↔ LLMAPI 모드 전환 |
| 🌊 **실시간 스트리밍** | SSE 기반 스트리밍 응답 + 타이핑 애니메이션 |
| 🔒 **API Key 보호** | Vite Proxy로 개발 환경에서도 API Key 숨김 |
| 📝 **마크다운 렌더링** | GFM, 코드 하이라이팅, 테이블 지원 |
| 💾 **선택적 저장** | LocalStorage 저장 on/off 설정 |
| 🌐 **다국어 지원** | i18next 기반 (한국어/영어) |
| 🧪 **TDD 테스트** | Vitest + Testing Library (91개 테스트) |
| 📱 **반응형 UI** | 모바일/데스크톱 완벽 지원 |

---

## 📋 목차

- [빠른 시작](#-빠른-시작)
- [환경 변수 설정](#-환경-변수-설정)
- [아키텍처](#-아키텍처)
- [LLM Provider 설정](#-llm-provider-설정)
- [ChatService 사용법](#-chatservice-사용법)
- [테스트](#-테스트)
- [확장 가이드](#-확장-가이드)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)

---

## 🚀 빠른 시작

### 요구 사항

- **Node.js**: ≥ 18.18 (Vite 6 권장)
- **패키지 매니저**: Yarn (권장) 또는 npm

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/your-repo/llm-chatbot-boilerplate.git
cd llm-chatbot-boilerplate

# 2. 의존성 설치
yarn install

# 3. 환경 변수 설정
cp .env.example .env.local

# 4. 개발 서버 실행 (http://localhost:3000)
yarn dev
```

### 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `yarn dev` | 개발 서버 실행 (포트 3000) |
| `yarn build` | 프로덕션 빌드 |
| `yarn preview` | 빌드 결과 미리보기 |
| `yarn test` | 테스트 실행 (watch 모드) |
| `yarn test:run` | 테스트 1회 실행 |
| `yarn test:coverage` | 커버리지 리포트 |
| `yarn lint` | ESLint 검사 |
| `yarn storybook` | Storybook 실행 |

---

## ⚙️ 환경 변수 설정

`.env.example`을 복사하여 `.env.local` 또는 `.env.development`를 생성하세요.

### 🔥 핵심 설정

```bash
# ==============================================
# ChatService 설정
# ==============================================

# 서비스 타입 선택
# - BackendAPI: 자체 백엔드 서버 경유 (프로덕션 권장)
# - LLMAPI: LLM API 직접 호출 (개발/프로토타입)
VITE_CHAT_SERVICE_TYPE=LLMAPI

# 스트리밍 모드
VITE_STREAMING_MODE=true

# LocalStorage 저장
VITE_LOCALSTORAGE_SAVE=false

# 타임아웃 (밀리초)
VITE_API_TIMEOUT_MS=30000

# 시스템 프롬프트
VITE_SYSTEM_PROMPT=You are a helpful assistant.
```

### 🔌 LLM Provider 설정

```bash
# ==============================================
# LLM 직접 호출 설정 (VITE_CHAT_SERVICE_TYPE=LLMAPI 시)
# ==============================================

# Provider: openai | anthropic | gemini
VITE_LLM_PROVIDER=gemini

# 모델명
VITE_LLM_MODEL=gemini-2.0-flash

# API Key 보안 설정
# ⚠️ VITE_ 접두사 없음 = 브라우저에 노출되지 않음!
LLM_API_KEY=your-api-key-here

# 프록시 사용 (API Key 숨김)
VITE_LLM_USE_PROXY=true
```

### 🖥️ Backend API 설정

```bash
# ==============================================
# Backend API 설정 (VITE_CHAT_SERVICE_TYPE=BackendAPI 시)
# ==============================================

VITE_BACKEND_API_URL=http://localhost:8000/api/chat
```

> ⚠️ **보안 주의**: `.env.local` 파일은 절대 Git에 커밋하지 마세요!

---

## 🏗️ 아키텍처

### 서비스 모드 비교

```
┌─────────────────────────────────────────────────────────────────┐
│                        ChatService 추상화                         │
├─────────────────────────────────┬───────────────────────────────┤
│         BackendAPI 모드          │          LLMAPI 모드           │
├─────────────────────────────────┼───────────────────────────────┤
│  Browser → Your Backend → LLM   │   Browser → Vite Proxy → LLM  │
│                                 │   (개발환경, API Key 숨김)       │
│  ✅ 프로덕션 권장                   │   ✅ 빠른 프로토타이핑            │
│  ✅ API Key 완전 보호              │   ✅ 백엔드 없이 테스트           │
│  ✅ 비즈니스 로직 추가 가능           │   ⚠️ 프로덕션에서는 BackendAPI    │
└─────────────────────────────────┴───────────────────────────────┘
```

### 데이터 흐름 (LLMAPI + Proxy)

```
┌──────────┐    ┌─────────────────┐    ┌──────────────────┐    ┌─────────┐
│ Browser  │───▶│ /llm-proxy/...  │───▶│ Vite Dev Server  │───▶│ LLM API │
│          │    │ (API Key 없음)   │    │ (API Key 주입)    │    │         │
└──────────┘    └─────────────────┘    └──────────────────┘    └─────────┘
```

### 컴포넌트 계층

```
┌─────────────────────────────────────────────────────────┐
│                     useChat (통합 훅)                     │
├───────────────────────┬─────────────────────────────────┤
│    useChatState       │         useChatActions          │
│  (읽기 전용 상태)        │        (쓰기 전용 액션)             │
├───────────────────────┴─────────────────────────────────┤
│                    Recoil Atoms                         │
│  messagesState | isLoadingState | streamingContentState │
├─────────────────────────────────────────────────────────┤
│                    ChatService                          │
│          LLMAPIService | BackendAPIService              │
├─────────────────────────────────────────────────────────┤
│                    LLM Adapters                         │
│    OpenAIAdapter | AnthropicAdapter | GeminiAdapter     │
└─────────────────────────────────────────────────────────┘
```

---

## 🔌 LLM Provider 설정

### OpenAI

```bash
VITE_LLM_PROVIDER=openai
VITE_LLM_MODEL=gpt-4o
LLM_API_KEY=sk-...
VITE_LLM_USE_PROXY=true
```

### Google Gemini

```bash
VITE_LLM_PROVIDER=gemini
VITE_LLM_MODEL=gemini-2.0-flash
LLM_API_KEY=AIzaSy...
VITE_LLM_USE_PROXY=true
```

**사용 가능한 Gemini 모델:**
- `gemini-2.0-flash` (추천)
- `gemini-1.5-pro`
- `gemini-1.5-flash`

### Anthropic Claude

```bash
VITE_LLM_PROVIDER=anthropic
VITE_LLM_MODEL=claude-3-5-sonnet-20241022
LLM_API_KEY=sk-ant-...
VITE_LLM_USE_PROXY=true
```

---

## 💬 ChatService 사용법

### 1. useChat 훅 (권장)

```tsx
import { useChat } from '@/features/chat';

const ChatPage = () => {
  const { 
    messages,           // 메시지 목록
    isLoading,          // 로딩 상태
    streamingContent,   // 스트리밍 중인 텍스트
    error,              // 에러 상태
    send,               // 메시지 전송
    abort,              // 요청 취소
    retry,              // 재시도
    clear               // 대화 초기화
  } = useChat();

  const handleSend = (text: string) => {
    send(text);
  };

  return (
    <div>
      {/* 메시지 목록 */}
      {messages.map((msg) => (
        <div key={msg.id} className={msg.role}>
          {msg.content}
        </div>
      ))}
      
      {/* 스트리밍 중인 응답 */}
      {streamingContent && (
        <div className="assistant streaming">
          {streamingContent}
        </div>
      )}
      
      {/* 에러 처리 */}
      {error && (
        <div className="error">
          <p>{error.message}</p>
          <button onClick={retry}>재시도</button>
        </div>
      )}
      
      {/* 입력 */}
      <input 
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            handleSend(e.currentTarget.value);
          }
        }}
        disabled={isLoading}
      />
      
      {isLoading && <button onClick={abort}>취소</button>}
    </div>
  );
};
```

### 2. 훅 분리 사용

```tsx
// 읽기 전용 상태만 필요할 때
const { messages, isLoading, error } = useChatState();

// 액션만 필요할 때
const { send, abort, clear, retry } = useChatActions();
```

### 3. 서비스 직접 사용

```tsx
import { chatService, createChatService } from '@/features/chat';

// 기본 싱글톤 사용
const response = await chatService.sendMessage(
  messages,
  (chunk) => console.log(chunk.content),
  { streaming: true }
);

// 커스텀 설정으로 생성
const customService = createChatService({
  type: 'LLMAPI',
  streaming: true,
  llmProvider: 'anthropic',
  llmModel: 'claude-3-5-sonnet-20241022',
});
```

### 4. 새 서비스 등록

```tsx
import { registerService } from '@/features/chat';

// 커스텀 RAG 서비스 등록
class RAGService implements ChatService {
  async sendMessage(messages, onChunk, options) {
    // RAG 파이프라인 구현
  }
}

registerService('RAGService', (config) => new RAGService(config));

// 환경변수로 사용
// VITE_CHAT_SERVICE_TYPE=RAGService
```

---

## 🧪 테스트

### 테스트 구조

```
src/test/
├── setup.ts                    # Vitest 설정
├── test-utils.tsx              # 테스트 유틸리티
├── mocks/
│   └── MockLLMAdapter.ts       # LLM Mock
├── api/
│   └── MockLLMAdapter.test.ts  # Mock 어댑터 테스트 (24개)
├── components/
│   ├── ChatInput.test.tsx      # 입력 컴포넌트 테스트 (18개)
│   └── ChatMessage.test.tsx    # 메시지 컴포넌트 테스트 (14개)
├── hooks/
│   ├── useChat.test.tsx        # useChat 훅 테스트
│   └── useLLMChat.test.tsx     # LLM 채팅 훅 테스트 (15개)
└── integration/
    └── chat-flow.test.tsx      # 통합 테스트 (12개)
```

### 테스트 실행

```bash
# Watch 모드
yarn test

# 1회 실행
yarn test:run

# 커버리지 리포트
yarn test:coverage

# UI 모드
yarn test:ui
```

### MockLLMAdapter 사용

```tsx
import { MockLLMAdapter } from '@/test/mocks/MockLLMAdapter';

describe('Chat Feature', () => {
  it('should handle streaming response', async () => {
    const mock = new MockLLMAdapter({
      responses: ['Hello!', 'How can I help?'],
      streamDelay: 10,
    });

    const chunks: string[] = [];
    for await (const chunk of mock.stream({ messages: [] })) {
      chunks.push(chunk.content);
    }

    expect(chunks.join('')).toBe('Hello!');
  });

  it('should simulate error', async () => {
    const mock = new MockLLMAdapter({
      shouldError: true,
      errorType: 'rate_limit',
    });

    await expect(mock.chat({ messages: [] })).rejects.toThrow();
  });
});
```

---

## 🔧 확장 가이드

### 새 LLM Provider 추가

`src/shared/api/llm/direct/adapters/`에 새 어댑터 생성:

```typescript
// NewProviderAdapter.ts
import type { LLMAdapter, LLMRequest, LLMResponse, LLMStreamChunk } from '../types';

export class NewProviderAdapter implements LLMAdapter {
  readonly name = 'new-provider';
  
  constructor(private config: LLMProviderConfig) {}

  async chat(request: LLMRequest): Promise<LLMResponse> {
    const response = await fetch('https://api.new-provider.com/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model || this.config.defaultModel,
        messages: request.messages,
      }),
    });
    
    const data = await response.json();
    return {
      content: data.content,
      model: data.model,
    };
  }

  async *stream(request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
    // SSE 스트리밍 구현
  }
}
```

### createLLM에 등록

```typescript
// src/shared/api/llm/direct/index.ts
export function createLLM(options: CreateLLMOptions): LLMAdapter {
  switch (options.type) {
    case 'openai':
      return new OpenAIAdapter(options);
    case 'new-provider':  // 추가
      return new NewProviderAdapter(options);
    // ...
  }
}
```

### 새 메시지 타입 추가

```tsx
// 이미지 메시지 렌더러
const ImageMessage = ({ message }) => (
  <img src={message.metadata?.imageUrl} alt="uploaded" />
);

// 렌더러 등록
registerMessageRenderer('image', ImageMessage);
```

---

## 🛠️ 기술 스택

### Core

| 기술 | 버전 | 용도 |
|------|------|------|
| TypeScript | 5.x | 타입 안전성 |
| React | 18.3 | UI 프레임워크 |
| Vite | 6.x | 빌드 도구 |

### 라우팅 & 데이터

| 기술 | 버전 | 용도 |
|------|------|------|
| TanStack Router | 1.x | 파일 기반 라우팅 |
| TanStack Query | 5.x | 서버 상태 관리 |
| Recoil | 0.7 | 클라이언트 상태 관리 |

### UI & 스타일

| 기술 | 버전 | 용도 |
|------|------|------|
| TailwindCSS | 3.x | 유틸리티 CSS |
| HeroUI | 2.x | UI 컴포넌트 |
| MUI | 6.x | UI 컴포넌트 |
| Framer Motion | 12.x | 애니메이션 |

### 테스트 & 품질

| 기술 | 버전 | 용도 |
|------|------|------|
| Vitest | 3.x | 테스트 러너 |
| Testing Library | 16.x | 컴포넌트 테스트 |
| ESLint | 9.x | 코드 린팅 |
| Prettier | - | 코드 포맷팅 |

---

## 📁 프로젝트 구조

```
src/
├── entities/                 # 도메인 엔티티
│   ├── chat/                 # 채팅방 관련 API
│   └── message-set/          # 메시지 세트 타입
│
├── features/                 # 기능 단위 모듈
│   ├── chat/                 # 💬 채팅 기능 (핵심)
│   │   ├── atom/             # Recoil 상태
│   │   ├── hooks/            # React 훅
│   │   ├── lib/              # 유틸리티
│   │   ├── services/         # ChatService 구현
│   │   ├── types/            # 타입 정의
│   │   └── ui/               # UI 컴포넌트
│   └── layout/               # 레이아웃 관련
│
├── routes/                   # 페이지 라우트
│   ├── __root.tsx            # 루트 레이아웃
│   ├── index.tsx             # 홈 페이지
│   └── chat.tsx              # 채팅 페이지
│
├── shared/                   # 공유 모듈
│   ├── api/                  # API 클라이언트
│   │   └── llm/              # 🔌 LLM 어댑터
│   │       ├── direct/       # 직접 연결 어댑터
│   │       │   └── adapters/ # OpenAI, Anthropic, Gemini
│   │       └── server/       # 서버 경유 클라이언트
│   ├── constants/            # 상수, enum
│   ├── context/              # React Context
│   ├── hooks/                # 공용 훅
│   ├── lib/                  # 유틸리티 함수
│   ├── types/                # 공용 타입
│   └── ui/                   # 공용 UI 컴포넌트
│
├── styles/                   # 전역 스타일
│   └── globals.css           # TailwindCSS
│
├── test/                     # 테스트
│   ├── mocks/                # Mock 객체
│   ├── api/                  # API 테스트
│   ├── components/           # 컴포넌트 테스트
│   ├── hooks/                # 훅 테스트
│   └── integration/          # 통합 테스트
│
└── ui/                       # 앱 레벨 UI
    └── ModalOutlet.tsx       # 모달 아웃렛

public/
└── locales/                  # 다국어 번역 파일
    ├── en/                   # 영어
    └── ko/                   # 한국어
```

---

## 📄 라이선스

MIT License

Copyright (c) 2026