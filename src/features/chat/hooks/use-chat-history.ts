// src/hooks/useChatHistory.ts
import { useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import camelcaseKeys from 'camelcase-keys';

import { GetUserChatRoomSummariesResponse } from '@/entities/chat/api/GetUserChatRoomSummariesResponse';
import { HttpClient } from '@/shared/api/http';

const chatApi = new HttpClient({
  baseUrl: '/api',
  headers: {
    'user-token': sessionStorage.getItem('userToken') ?? '',
  },
  onResponse: async (response) => ({
    ...response,
    data: camelcaseKeys(response.data as Record<string, unknown>, { deep: true }),
  }),
});

interface InfiniteChatResponse extends GetUserChatRoomSummariesResponse {
  nextPage?: number;
}

export function useChatHistory(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;

  return useInfiniteQuery<InfiniteChatResponse, Error>({
    refetchOnWindowFocus: false, // ✅ 포커스 시 재요청 끔
    refetchOnReconnect: false, // ✅ 재연결 시 재요청 끔
    refetchOnMount: false, // ✅ 재마운트 시 재요청 끔
    enabled,
    queryKey: ['chatHistory'],
    // 데이터 가져오는 함수
    queryFn: async ({ pageParam = 0 }) => {
      // --- 의도적 딜레이 (예: 800ms) ---
      // await new Promise((resolve) => setTimeout(resolve, 1000));

      return chatApi.post<InfiniteChatResponse>('', { pagination: pageParam }, { params: { job: 'getUserChatRoomSummaries' } });
    },

    // 페이징 설정
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.chatHistory || lastPage.chatHistory.length === 0) return undefined;
      return lastPage.pagination + 1;
    },
    // 실패 시 1회 재시도
    retry: 1,
    staleTime: 5 * 1000, // 5초
  });
}

export function useResetChatHistory() {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    // 혹시 진행 중 요청이 있으면 취소
    await queryClient.cancelQueries({ queryKey: ['chatHistory'] });
    // 캐시 완전 제거 → 페이지 스택도 모두 초기화
    queryClient.removeQueries({ queryKey: ['chatHistory'] });
    // 초기화 후 refetch
    await queryClient.refetchQueries({ queryKey: ['chatHistory'] });
  }, [queryClient]);
}
