# Naver Maps 로더

## 개요

Naver Maps API를 Web Vitals를 고려하여 최적화된 방식으로 로드하는 유틸리티입니다.

## Web Vitals 최적화 전략

### 변경 전 (Before)
- `main.tsx`에서 즉시 Naver Maps 스크립트 로드
- 모든 사용자에게 스크립트 로드 (지도를 사용하지 않는 경우에도)
- FCP, LCP 지표에 부정적 영향

### 변경 후 (After)
- **Lazy Loading**: 필요한 시점에만 로드
- **DNS Preconnect**: HTML에서 DNS 조회만 미리 수행
- **중복 로드 방지**: 프로미스 캐싱으로 동시 호출 처리
- **경로 기반 로딩**: 병원/지도 기능 사용 시에만 로드

## 사용 방법

### 기본 사용

```typescript
import { loadNaverMaps } from '@/lib/loadNaverMaps';

// 컴포넌트 내에서
useEffect(() => {
  loadNaverMaps()
    .then(() => {
      // Naver Maps API 사용 가능
      console.log('Naver Maps loaded!');
    })
    .catch((error) => {
      console.error('Failed to load Naver Maps:', error);
    });
}, []);
```

### Idle 상태에서 로드

브라우저가 유휴 상태일 때 로드하여 메인 스레드 부하 최소화:

```typescript
import { loadNaverMapsOnIdle } from '@/lib/loadNaverMaps';

useEffect(() => {
  loadNaverMapsOnIdle(2000) // 2초 타임아웃
    .then(() => {
      console.log('Naver Maps loaded on idle!');
    })
    .catch(console.error);
}, []);
```

## 구현 위치

### 1. 유틸리티 함수
- **파일**: `src/lib/loadNaverMaps.ts`
- **export**: `loadNaverMaps`, `loadNaverMapsOnIdle`

### 2. DNS Preconnect
- **파일**: `index.html`
- **위치**: `<head>` 섹션

```html
<!-- Naver Maps API - DNS 조회만 미리 수행 -->
<link rel="preconnect" href="https://oapi.map.naver.com">
<link rel="dns-prefetch" href="//oapi.map.naver.com">
```

### 3. 사용 예시

#### 병원 지도 열기 (use-naver-map-open.ts)
```typescript
import { loadNaverMaps } from '@/lib/loadNaverMaps';

const openHospital = async (hospital: HospitalLike) => {
  // SDK 로드
  await loadNaverMaps();
  
  // geocode 사용
  const resp = await geocode(hospital.address);
  // ... 나머지 로직
};
```

#### 동적 지도 컴포넌트 (DynamicMap.tsx)
```typescript
import { loadNaverMaps } from '@/lib/loadNaverMaps';

useEffect(() => {
  loadNaverMaps()
    .then(() => {
      naver.maps.Service.geocode({ query: address }, callback);
    })
    .catch(console.error);
}, [address]);
```

## 성능 지표 개선

### Core Web Vitals 영향

| 지표 | 개선 사항 |
|------|----------|
| **FCP** (First Contentful Paint) | 초기 로드 시 스크립트 요청 제거 |
| **LCP** (Largest Contentful Paint) | 메인 콘텐츠 렌더링 지연 방지 |
| **FID** (First Input Delay) | 메인 스레드 블로킹 감소 |
| **TBT** (Total Blocking Time) | 파싱/실행 시간 지연 로딩 |

### 예상 개선 효과

- **초기 번들 사이즈**: Naver Maps SDK 제외 (~100KB 감소)
- **초기 로딩 시간**: 200-300ms 개선 (네트워크 환경에 따라 상이)
- **미사용 리소스 로드**: 0% (지도 미사용 시 로드 안 함)

## 타입 정의

```typescript
// src/types/global.d.ts
declare global {
  interface Window {
    naver?: {
      maps: unknown;
    };
  }
}
```

## 주의사항

1. **중복 로드 방지**: 동일한 프로미스 인스턴스 재사용
2. **에러 처리**: 네트워크 오류 시 적절한 폴백 필요
3. **타임아웃**: `loadNaverMapsOnIdle`은 타임아웃 설정 가능 (기본 2000ms)

## 관련 파일

- `src/lib/loadNaverMaps.ts` - 로더 유틸리티
- `src/types/global.d.ts` - 타입 정의
- `src/features/address/hooks/use-naver-map-open.ts` - 사용 예시
- `src/shared/ui/map/DynamicMap.tsx` - 사용 예시
- `index.html` - DNS preconnect 설정
