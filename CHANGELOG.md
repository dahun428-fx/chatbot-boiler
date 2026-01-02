# Changelog

이 프로젝트의 모든 주요 변경사항을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따르며,
버전 관리는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

### Added
- ChatService 추상화 레이어
  - `BackendAPIService`: 백엔드 API를 통한 채팅
  - `LLMAPIService`: LLM 직접 호출
  - Factory 패턴으로 서비스 전환 지원
- 새로운 훅 구조
  - `useChat`: 통합 훅 (권장)
  - `useChatState`: 읽기 전용 상태
  - `useChatActions`: 쓰기 전용 액션
- LocalStorage 저장 기능 (환경변수로 on/off)
- 에러 처리 및 재시도 기능
- DateDivider 컴포넌트 (날짜 구분선)
- 마크다운 렌더링 지원 (react-markdown)
- 스트리밍 애니메이션 (fade-in 효과)
- Storybook 스토리 추가
  - ChatInput
  - ChatMessage
  - ChatMessageList
  - ErrorDisplay
  - DateDivider

### Changed
- ChatMessage 컴포넌트 구조 개선
  - MessageBubbleWrapper 적용
  - 마크다운 지원
  - 로딩/로고 아이콘 토글

### Fixed
- 한글 IME 조합 중 Enter 입력 시 중복 전송 문제
- 스트리밍 메시지 중복 표시 문제

---

## [1.0.0] - 2026-01-02

### Added
- 초기 보일러플레이트 릴리스
- React 18 + TypeScript 5 + Vite 6 기반
- TanStack Router / Query 통합
- Recoil 상태 관리
- HeroUI / MUI / TailwindCSS UI
- ESLint / Prettier 설정
- Vitest + Testing Library 테스트 환경
- Storybook 문서화
- i18next 다국어 지원
- Docker 배포 설정

---

## 버전 가이드

- **Major (X.0.0)**: 호환성이 깨지는 변경
- **Minor (0.X.0)**: 새로운 기능 추가 (하위 호환)
- **Patch (0.0.X)**: 버그 수정
