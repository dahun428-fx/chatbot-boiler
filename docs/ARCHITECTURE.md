# Architecture Guide

이 문서는 LLM Chatbot Boilerplate의 아키텍처와 설계 원칙을 설명합니다.

## 📁 디렉토리 구조

```
src/
├── entities/           # 도메인 엔티티
│   ├── chat/          # 채팅 관련 엔티티
│   └── message-set/   # 메시지 세트 정의
├── features/          # 기능 모듈
│   ├── chat/          # 채팅 기능
│   └── layout/        # 레이아웃 관련
├── routes/            # 라우트 정의 (TanStack Router)
├── shared/            # 공유 모듈
│   ├── api/           # API 클라이언트
│   │   └── llm/       # LLM Provider 추상화
│   ├── constants/     # 상수 정의
│   ├── context/       # React Context
│   ├── hooks/         # 커스텀 훅
│   ├── lib/           # 유틸리티 함수
│   ├── store/         # 전역 상태 (Recoil)
│   ├── types/         # 타입 정의
│   └── ui/            # 공통 UI 컴포넌트
│       ├── basic/     # 기본 컴포넌트
│       ├── error/     # 에러 핸들링
│       ├── icons/     # 아이콘 컴포넌트
│       └── Hoc/       # Higher-Order Components
├── styles/            # 글로벌 스타일
├── types/             # 전역 타입
└── ui/                # 앱 레벨 UI
```

## 🏛️ 설계 원칙

### Feature-Sliced Design (FSD)

이 프로젝트는 [Feature-Sliced Design](https://feature-sliced.design/) 아키텍처를 따릅니다:

1. **Layers** (계층): shared → entities → features → routes
2. **Slices** (슬라이스): 각 계층 내 도메인 분리
3. **Segments** (세그먼트): ui, api, model, lib 등

### 의존성 규칙

```
routes → features → entities → shared
```

- 상위 계층은 하위 계층에만 의존
- 동일 계층 간 직접 의존 금지
- `shared`는 모든 계층에서 사용 가능

## 🔧 핵심 모듈

### LLM Provider (`shared/api/llm`)

다양한 LLM 서비스를 통합하는 추상화 레이어:

```typescript
// 환경변수 기반 자동 설정
const provider = createLLMProvider();

// 또는 명시적 설정
const provider = createLLMProvider({
  type: 'openai',
  apiKey: 'sk-...',
  defaultModel: 'gpt-4o',
});

// 일반 채팅
const response = await provider.chat({
  messages: [{ role: 'user', content: 'Hello!' }],
});

// 스트리밍
for await (const chunk of provider.stream({ messages })) {
  console.log(chunk.content);
}
```

### 상태 관리

- **Recoil**: 클라이언트 전역 상태
- **TanStack Query**: 서버 상태 및 캐싱

```typescript
// Recoil atom 예시
const chatInputAtom = atom<string>({
  key: 'chatInput',
  default: '',
});

// TanStack Query 예시
const { data } = useQuery({
  queryKey: ['chatHistory', roomId],
  queryFn: () => fetchChatHistory(roomId),
});
```

### Error Boundary

```typescript
import { ErrorBoundary, LLMErrorFallback } from '@/shared/ui/error';

<ErrorBoundary
  fallback={(props) => <LLMErrorFallback {...props} />}
  onError={(error, info) => trackError(error, info)}
  context="ChatRoom"
>
  <ChatRoom />
</ErrorBoundary>
```

## 📡 API 통신

### SSE (Server-Sent Events) 스트리밍

```typescript
import { createSSEStream, createRetryableSSEStream } from '@/shared/api/llm';

// 기본 SSE 스트림
const stream = createSSEStream({
  url: '/api/chat/stream',
  method: 'POST',
  body: { message: 'Hello' },
});

// 재시도 로직 포함
const reliableStream = createRetryableSSEStream(
  { url, method: 'POST', body },
  { maxRetries: 3 }
);
```

### HTTP 요청

```typescript
import { httpRequest } from '@/shared/api';

const response = await httpRequest.post('/api/chat', {
  message: 'Hello',
});
```

## 🎨 스타일링

### TailwindCSS + HeroUI

```tsx
// TailwindCSS 유틸리티
<div className="flex items-center gap-4 rounded-lg bg-gray-100 p-4">

// HeroUI 컴포넌트
import { Button, Input } from '@heroui/react';
```

### 반응형 디자인

```tsx
// 모바일 우선 설계
<div className="w-full md:w-1/2 lg:w-1/3">
```

## 🔒 타입 안전성

### 엄격한 TypeScript 설정

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### 타입 유틸리티

```typescript
import type { NonNullable, Required } from '@/shared/lib/type-utils';
```

## 🧪 테스트 전략

### 단위 테스트 (Vitest)

```bash
yarn test        # watch 모드
yarn test:run    # 단일 실행
yarn test:ui     # UI 모드
```

### 컴포넌트 테스트 (Storybook)

```bash
yarn storybook   # 개발 서버
yarn build:sb    # 빌드
```

## 📦 빌드 및 배포

### 개발

```bash
yarn dev         # 개발 서버 (http://localhost:5173)
```

### 프로덕션

```bash
yarn build       # Vite 빌드
yarn preview     # 프리뷰 서버
```

### Docker

```bash
docker build -t llm-chatbot .
docker run -p 80:80 llm-chatbot
```

## 🔄 데이터 흐름

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │───▶│   Feature   │───▶│   Entity    │
│  Interaction│    │   (hooks)   │    │   (api)     │
└─────────────┘    └─────────────┘    └─────────────┘
                          │                   │
                          ▼                   ▼
                   ┌─────────────┐    ┌─────────────┐
                   │    State    │◀───│  LLM/API    │
                   │   (Recoil)  │    │  Response   │
                   └─────────────┘    └─────────────┘
```

## 🚀 확장 가이드

새로운 기능 추가 시:

1. `entities/`에 도메인 모델 정의
2. `features/`에 기능 로직 구현
3. `routes/`에 라우트 추가
4. 공통 컴포넌트는 `shared/ui/`에 배치

자세한 내용은 [DEVELOPMENT.md](./DEVELOPMENT.md)를 참조하세요.
