# \<나만의 건강 AI 코치>

TypeScript + React 기반의 웹 애플리케이션입니다. Vite 빌드 환경과 TanStack Router/Query를 중심으로 구성하고, HeroUI/MUI/TailwindCSS로 UI를 구현합니다. ESLint/Prettier, Vitest + Testing Library로 품질을 관리합니다.

> 권장 Node: **≥ 18.18** (Vite 6 권장 범위)
> 패키지 매니저: **Yarn 권장** (Corepack 사용 권장)

---

## 빠른 시작(Quick Start)

```bash

# 의존성 설치
yarn install

# 개발 서버
yarn dev

# 빌드 / 프리뷰
yarn build
yarn preview

# 품질/테스트
yarn lint
yarn test
```

---

## 환경 변수(.env.local 예시)

> ⚠️ **주의**: 실제 키/엔드포인트가 포함되어 있으니 `.env.local`은 저장소에 커밋하지 마세요.
> 운영/스테이징과 로컬은 값을 분리하는 것을 권장합니다.
> key 값 필요시 운영자에게 문의하세요.

```bash
# 공통
VITE_APP_ENV=local

# 네이버 지도
VITE_NAVER_MAP_CLIENT_ID=

# 백엔드 엔드포인트
VITE_PUBLIC_END_POINT=

# 하이닥 연동
VITE_PUBLIC_HIDOC_END_POINT=
VITE_PUBLIC_HIDOC_API_KEY=

# 스토리지 키
VITE_PUBLIC_USER_TOKEN_KEY=
VITE_PUBLIC_CHAT_ROOM_ID=

# 바로케어 마이페이지(결과 리스트)
VITE_PUBLIC_BACARE_MYRESULT_LIST_URL=

```

---

## 기술 스택(요약)

- **언어/런타임**: TypeScript 5 (타입스크립트), React 18 (리액트)
- **번들러/Dev 서버**: Vite 6 (바이트) + `vite-tsconfig-paths`
- **라우팅**: TanStack Router 1 (탠스택 라우터, DevTools 포함)
- **데이터 패칭/캐시**: TanStack Query 5 (탠스택 쿼리)
- **상태관리**: Recoil 0.7 (리코일)
- **폼/검증**: React Hook Form 7, Zod 3 + `@hookform/resolvers`
- **UI/스타일링**: HeroUI(NextUI v2 계열), MUI v6, Emotion, TailwindCSS 3
- **테스트**: Vitest 3, Testing Library(+ `jest-dom`), `jsdom`
- **품질**: ESLint(Airbnb + TS + Prettier + react-hooks + query), Prettier

---

## 아키텍처(간략)

- **렌더링 전략**: CSR 우선. 최초 진입 시 핵심 데이터만 프리패치(TanStack Router loader / Query prefetch)
- **상태 경계**: **서버 상태(Query)** ↔ **클라이언트 상태(Recoil)** 명확 구분
- **스타일 가이드**: Tailwind 토큰화, Emotion 테마 일원화, HeroUI 기본 + MUI 특수 컴포넌트 한정

---

## 테스트/품질 & 배포

- **Web Vitals 목표**: LCP < 2.5s, INP < 200ms, CLS < 0.1
- **번들 예산**: 초기 JS < 200KB gzip(라우트 단위 코드 스플리팅)
- **빌드**: `yarn build` (내부 `tsc -b && vite build`)
- **릴리스 노트**: 변경 요약 + 핵심 성능 지표 포함

---

## 라이선스

다나아데이터
