# Contributing Guide

LLM Chatbot Boilerplate에 기여해 주셔서 감사합니다! 🎉

## 🚀 시작하기

### 1. Fork & Clone

```bash
# 저장소 Fork 후 Clone
git clone https://github.com/YOUR_USERNAME/chatbot-boilerplate.git
cd chatbot-boilerplate

# 의존성 설치
yarn install
```

### 2. 브랜치 생성

```bash
# feature 브랜치 생성
git checkout -b feature/your-feature-name

# bugfix 브랜치 생성
git checkout -b fix/bug-description
```

### 3. 개발

```bash
# 개발 서버 실행
yarn dev

# 테스트 실행
yarn test

# Storybook 실행
yarn storybook
```

---

## 📁 프로젝트 구조

```
src/
├── features/chat/       # 채팅 기능 모듈
│   ├── services/        # ChatService 구현체
│   ├── hooks/           # React 훅
│   ├── ui/              # UI 컴포넌트
│   ├── atom/            # Recoil 상태
│   └── types/           # 타입 정의
├── shared/              # 공유 모듈
└── routes/              # 페이지 라우트
```

---

## 🔧 개발 가이드라인

### 코드 스타일

- **TypeScript**: 모든 코드는 TypeScript로 작성
- **ESLint**: `yarn lint`로 검사
- **Prettier**: 자동 포맷팅 적용

### 컴포넌트 작성

```tsx
/**
 * 컴포넌트 설명
 *
 * @example
 * ```tsx
 * <MyComponent prop="value" />
 * ```
 */
export const MyComponent = memo(function MyComponent({ prop }: Props) {
  return <div>{prop}</div>;
});
```

### 훅 작성

```tsx
/**
 * 훅 설명
 *
 * @returns 반환값 설명
 */
export const useMyHook = () => {
  // 구현
};
```

### 테스트 작성

```tsx
describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('text')).toBeInTheDocument();
  });
});
```

### Storybook 스토리

```tsx
const meta = {
  title: 'Features/Chat/MyComponent',
  component: MyComponent,
  tags: ['autodocs'],
} satisfies Meta<typeof MyComponent>;

export const Default: Story = {
  args: { prop: 'value' },
};
```

---

## 📝 커밋 컨벤션

[Conventional Commits](https://www.conventionalcommits.org/) 형식을 따릅니다.

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | 설명 |
|------|------|
| `feat` | 새로운 기능 |
| `fix` | 버그 수정 |
| `docs` | 문서 변경 |
| `style` | 코드 스타일 변경 (포맷팅 등) |
| `refactor` | 리팩토링 |
| `test` | 테스트 추가/수정 |
| `chore` | 빌드, 설정 변경 |

### 예시

```bash
feat(chat): add retry functionality

- Add retry button to ErrorDisplay
- Implement retry logic in useChatActions
- Add tests for retry functionality

Closes #123
```

---

## 🔀 Pull Request

### PR 체크리스트

- [ ] 관련 Issue가 있다면 연결
- [ ] 테스트 통과 (`yarn test:run`)
- [ ] 린트 통과 (`yarn lint`)
- [ ] Storybook 스토리 추가 (UI 컴포넌트인 경우)
- [ ] 문서 업데이트 (필요한 경우)

### PR 템플릿

```markdown
## 변경 사항
- 변경 내용 1
- 변경 내용 2

## 테스트
- 테스트 방법

## 스크린샷
(UI 변경 시)
```

---

## 🐛 버그 리포트

GitHub Issues에 다음 정보를 포함해 주세요:

1. **환경**: OS, Node 버전, 브라우저
2. **재현 단계**: 버그 재현 방법
3. **예상 동작**: 예상한 결과
4. **실제 동작**: 실제 결과
5. **스크린샷**: 해당되는 경우

---

## 💡 기능 제안

새로운 기능을 제안할 때:

1. 먼저 Issue를 검색하여 중복 확인
2. 새 Issue 생성 시 다음 포함:
   - 기능 설명
   - 사용 사례
   - 구현 아이디어 (있다면)

---

## 📜 라이선스

이 프로젝트에 기여하면 MIT 라이선스에 동의하는 것으로 간주됩니다.

---

감사합니다! 🙏
