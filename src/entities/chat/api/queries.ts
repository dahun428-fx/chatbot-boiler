import { DefaultError, useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

import { apiCaller } from '@/shared/api';
import { ApiBody } from '@/shared/api/api.types';

import { GetChatRoomHistoryRequest } from './GetChatRoomHistoryRequest';
import { GetChatRoomHistoryResponse } from './GetChatRoomHistoryResponse';
import { GetUserChatRoomSummariesRequest } from './GetUserChatRoomSummariesRequest';
import { GetUserChatRoomSummariesResponse } from './GetUserChatRoomSummariesResponse';
import { OpenToAIChatroomRequest } from './OpenToAIChatroomRequest';
import { OpenToAIChatroomResponse } from './OpenToAIChatroomResponse';

/**
 * 채팅 관련 React Query 키 정의
 */
export const CHAT_QUERY_KEY = {
  /** AI 챗룸 개설 */
  OPEN_TO_AICHAT_ROOM: (params: OpenToAIChatroomRequest) => ['chat', 'openToAIChatroom', params],
  /** 특정 챗룸의 대화 내역 조회 */
  GET_CHAT_HISTORY: (params: GetChatRoomHistoryRequest) => [
    'chat',
    'getChatRoomHistory',
    params.chatRoomId,
  ],
  /** 사용자 챗룸 요약 목록 조회 */
  GET_USER_CHAT_ROOM_SUMMARIES: (params: GetUserChatRoomSummariesRequest) => [
    'chat',
    'getUserChatRoomSummaries',
    params,
  ],
};

/**
 * 채팅 API 호출 설정 모음
 */
const queries = {
  /** AI 챗룸 개설 요청 */
  openToAIChatroom: (params: OpenToAIChatroomRequest) => ({
    queryKey: CHAT_QUERY_KEY.OPEN_TO_AICHAT_ROOM(params),
    queryFn: () => apiCaller('openToAIChatroom'),
  }),

  /** 특정 챗룸 대화 내역 조회 */
  getChatRoomHistory: (params: GetChatRoomHistoryRequest) => ({
    queryKey: CHAT_QUERY_KEY.GET_CHAT_HISTORY(params),
    queryFn: () =>
      apiCaller('getChatRoomHistory', { queryParams: { chatRoomId: params.chatRoomId } }),
  }),

  /** 사용자 챗룸 요약 목록 조회 */
  getUserChatRoomSummaries: (params: GetUserChatRoomSummariesRequest) => ({
    queryKey: CHAT_QUERY_KEY.GET_USER_CHAT_ROOM_SUMMARIES(params),
    queryFn: () =>
      apiCaller('getUserChatRoomSummaries', undefined, {
        pagination: params.pagination ?? 0,
      } as ApiBody<'getUserChatRoomSummaries'>),
  }),
};

/**
 * AI 챗룸 개설 useQuery 훅
 */
export const useOpenToAIChatroom = <TData = OpenToAIChatroomResponse>(
  params: OpenToAIChatroomRequest,
  options?: Omit<
    UseQueryOptions<OpenToAIChatroomRequest, DefaultError, TData>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    ...queries.openToAIChatroom(params),
    ...options,
  });
};

/**
 * 특정 챗룸의 대화 내역 조회 useQuery 훅
 */
export const useGetChatRoomHistory = <TData = GetChatRoomHistoryResponse>(
  params: { chatRoomId?: string },
  options?: Omit<
    UseQueryOptions<GetChatRoomHistoryResponse, DefaultError, TData>,
    'queryKey' | 'queryFn'
  >
): UseQueryResult<TData, DefaultError> => {
  return useQuery<GetChatRoomHistoryResponse, DefaultError, TData>({
    queryKey: CHAT_QUERY_KEY.GET_CHAT_HISTORY({ ...params, chatRoomId: params.chatRoomId ?? '' }),
    queryFn: async () => {
      if (!params.chatRoomId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { items: [] } as any;
      }
      return apiCaller('getChatRoomHistory', undefined, {
        chatRoomId: params.chatRoomId,
      } as ApiBody<'getChatRoomHistory'>);
    },
    enabled: Boolean(params.chatRoomId),
    ...options,
  });
};

/**
 * 사용자 챗룸 요약 목록 조회 useQuery 훅
 */
export const useGetUserChatRoomSummaries = <TData = GetUserChatRoomSummariesResponse>(
  params: GetUserChatRoomSummariesRequest,
  options?: Omit<
    UseQueryOptions<GetUserChatRoomSummariesResponse, DefaultError, TData>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    ...queries.getUserChatRoomSummaries(params),
    ...options,
  });
};

/**
 * 대화 내역 API 호출을 직접 실행하는 함수
 */
export const fetchChatRoomHistoryRaw = async (
  chatRoomId: string
): Promise<GetChatRoomHistoryResponse> => {
  return apiCaller('getChatRoomHistory', undefined, {
    chatRoomId,
  } as ApiBody<'getChatRoomHistory'>);
};
