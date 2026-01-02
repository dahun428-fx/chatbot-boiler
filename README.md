# LLM Chatbot Boilerplate

TypeScript + React 기반의 **LLM 챗봇 보일러플레이트**입니다. Vite 빌드 환경과 TanStack Router/Query를 중심으로 구성하고, HeroUI/MUI/TailwindCSS로 UI를 구현합니다. ESLint/Prettier, Vitest + Testing Library, Storybook으로 품질을 관리합니다.

## ✨ 주요 기능

- 🤖 **LLM 통합**: OpenAI, Anthropic 등 다양한 LLM Provider 어댑터 지원
- 💬 **실시간 스트리밍**: SSE 기반 스트리밍 응답 처리
- 🎨 **풍부한 UI**: 마크다운 렌더링, 스트리밍 텍스트 애니메이션
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
# 앱 환경
VITE_APP_ENV=local

# API 엔드포인트
VITE_PUBLIC_END_POINT=https://your-api-server.com
VITE_PUBLIC_PROXY_END_POINT=https://your-proxy-server.com

# LLM API (선택 - 직접 호출 시)
VITE_LLM_API_KEY=your-llm-api-key
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
- **LLM 통합**: Provider 어댑터 패턴으로 다양한 LLM 지원

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

---

## 라이선스

MIT License
