# LLM Chatbot Boilerplate

TypeScript + React 기반의 **LLM 챗봇 보일러플레이트**입니다. Vite 빌드 환경과 TanStack Router/Query를 중심으로 구성하고, HeroUI/MUI/TailwindCSS로 UI를 구현합니다. ESLint/Prettier, Vitest + Testing Library, Storybook으로 품질을 관리합니다.

## ✨ 주요 기능

- 🤖 **LLM 통합**: OpenAI, Anthropic 등 다양한 LLM Provider 어댑터 지원
- � **ChatService 추상화**: 환경변수 기반 서비스 전환 (BackendAPI ↔ LLMAPI)
- 💬 **실시간 스트리밍**: SSE 기반 스트리밍 응답 처리
- 🎨 **풍부한 UI**: 마크다운 렌더링, 스트리밍 텍스트 애니메이션
- 💾 **선택적 저장**: LocalStorage 저장 on/off
- 📱 **반응형 디자인**: 모바일/데스크톱 지원
- 🌐 **다국어 지원**: i18next 기반 다국어 처리
- 🧪 **테스트 환경**: Vitest + Testing Library + Storybook

> 권장 Node: **≥ 18.18** (Vite 6 권장 범위)
> 패키지 매니저: **Yarn 권장** (Corepack 사용 권장)

---

## 빠른 시작 (Quick Start)

```bash
# 의존성 설치
yarn install

# 개발 서버 (http://localhost:3000)
yarn dev

# 빌드 / 프리뷰
yarn build
yarn preview

# 테스트
yarn test          # watch 모드
yarn test:run      # 1회 실행
yarn test:coverage # 커버리지

# Storybook
yarn storybook

# 린트
yarn lint
```

---

## 환경 변수 설정

`.env.example`을 복사하여 `.env.local` 또는 `.env.development`를 생성하세요.

```bash
cp .env.example .env.local
```

### 필수 환경 변수

```bash
# ==============================================
# ChatService 설정 (핵심)
# ==============================================
# 서비스 타입: BackendAPI | LLMAPI
VITE_CHAT_SERVICE_TYPE=BackendAPI

# 스트리밍 모드: true (SSE) | false (전체 응답)
VITE_STREAMING_MODE=true

# LocalStorage 저장: true | false
VITE_LOCALSTORAGE_SAVE=false

# 타임아웃 (밀리초)
VITE_API_TIMEOUT_MS=30000

# 시스템 프롬프트
VITE_SYSTEM_PROMPT=You are a helpful assistant.

# ==============================================
# Backend API 설정 (VITE_CHAT_SERVICE_TYPE=BackendAPI 시)
# ==============================================
VITE_BACKEND_API_URL=http://localhost:8000/api/chat

# ==============================================
# LLM 직접 호출 설정 (VITE_CHAT_SERVICE_TYPE=LLMAPI 시)
# ==============================================
VITE_LLM_PROVIDER=openai
VITE_LLM_API_KEY=your-api-key
VITE_LLM_MODEL=gpt-4
```

> ⚠️ **주의**: `.env.local`은 절대 Git에 커밋하지 마세요!

---

## 기술 스택

| 카테고리 | 기술 |
|---------|------|
| **언어/런타임** | TypeScript 5, React 18 |
| **번들러** | Vite 6 + vite-tsconfig-paths |
| **라우팅** | TanStack Router 1 |
| **데이터 패칭** | TanStack Query 5 |
| **상태관리** | Recoil 0.7 |
| **폼/검증** | React Hook Form 7, Zod 3 |
| **UI/스타일** | HeroUI, MUI v6, TailwindCSS 3, Emotion |
| **테스트** | Vitest, Testing Library, Storybook |
| **품질** | ESLint, Prettier |

---

## 프로젝트 구조

```
src/
├── entities/          # 도메인 엔티티 (chat, message-set)
├── features/          # 기능 단위 모듈 (chat, layout)
├── routes/            # 페이지 라우트
├── shared/            # 공유 모듈
│   ├── api/           # API 클라이언트, LLM 어댑터
│   ├── constants/     # 상수, enum
│   ├── context/       # React Context
│   ├── hooks/         # 공용 훅
│   ├── lib/           # 유틸리티
│   ├── types/         # 타입 정의
│   └── ui/            # UI 컴포넌트
├── styles/            # 전역 스타일
└── ui/                # 레이아웃 컴포넌트
```

---

## 아키텍처

- **Feature-Sliced Design**: 기능 중심 폴더 구조
- **렌더링**: CSR 기반, 라우트별 코드 스플리팅
- **상태 관리**: 서버 상태(Query) ↔ 클라이언트 상태(Recoil) 분리
- **ChatService 추상화**: Factory 패턴으로 서비스 전환

---

## 🔌 ChatService 사용법

### 기본 사용 (useChat 훅)

```tsx
import { useChat } from '@/features/chat';

const ChatPage = () => {
  const { messages, isLoading, streamingContent, error, send, abort, retry, clear } = useChat();

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      
      {streamingContent && <div>{streamingContent}</div>}
      
      {error && (
        <button onClick={retry}>재시도</button>
      )}
      
      <input onKeyDown={(e) => e.key === 'Enter' && send(e.target.value)} />
    </div>
  );
};
```

### 훅 분리 사용

```tsx
// 읽기 전용 상태
const { messages, isLoading, error } = useChatState();

// 쓰기 전용 액션
const { send, abort, clear, retry } = useChatActions();
```

### 서비스 직접 사용

```tsx
import { chatService, createChatService } from '@/features/chat';

// 기본 싱글톤 사용
const response = await chatService.sendMessage(messages, onChunk, { streaming: true });

// 커스텀 설정으로 생성
const customService = createChatService({
  type: 'LLMAPI',
  streaming: true,
  llmProvider: 'anthropic',
});
```

### 새 서비스 등록

```tsx
import { registerService } from '@/features/chat';

// 커스텀 서비스 등록
registerService('RAGService', (config) => new RAGService(config));

// .env에서 사용
// VITE_CHAT_SERVICE_TYPE=RAGService
```

---

## 확장 가이드

### 새 LLM Provider 추가

`src/shared/api/llm/adapters/`에 새 어댑터 생성:

```typescript
// CustomAdapter.ts
import { LLMAdapter, LLMRequest, LLMResponse } from '../types';

export class CustomAdapter implements LLMAdapter {
  async chat(request: LLMRequest): Promise<LLMResponse> {
    // 구현
  }
  
  async *stream(request: LLMRequest): AsyncGenerator<string> {
    // SSE 스트리밍 구현
  }
}
```

### 새 메시지 렌더러 추가

```tsx
import { registerMessageRenderer } from '@/features/chat';

// 이미지 메시지 렌더러
const ImageMessage = ({ message }) => (
  <img src={message.content} alt="uploaded" />
);

registerMessageRenderer('image', ImageMessage);
```

---

## 라이선스

MIT License
