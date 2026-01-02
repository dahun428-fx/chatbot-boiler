import { DeleteChatSessionRequest } from '@/entities/chat/api/DeleteChatSessionRequest';
import { DeleteChatSessionResponse } from '@/entities/chat/api/DeleteChatSessionResponse';
import { GetChatRoomHistoryRequest } from '@/entities/chat/api/GetChatRoomHistoryRequest';
import { GetChatRoomHistoryResponse } from '@/entities/chat/api/GetChatRoomHistoryResponse';
import { GetUserChatRoomSummariesRequest } from '@/entities/chat/api/GetUserChatRoomSummariesRequest';
import { GetUserChatRoomSummariesResponse } from '@/entities/chat/api/GetUserChatRoomSummariesResponse';
import { OpenToAIChatroomRequest } from '@/entities/chat/api/OpenToAIChatroomRequest';
import { OpenToAIChatroomResponse } from '@/entities/chat/api/OpenToAIChatroomResponse';
import { SaveUserChatRequest } from '@/entities/chat/api/SaveUserChatRequest';
import { SaveUserChatResponse } from '@/entities/chat/api/SaveUserChatResponse';

export const API_DEFINITIONS = {
  openToAIChatroom: {
    method: 'GET',
    path: '?job=openToAIChatroom',
    bodyType: {} as OpenToAIChatroomRequest,
    responseType: {} as OpenToAIChatroomResponse,
  },
  getChatRoomHistory: {
    method: 'POST',
    path: '?job=getChatRoomHistory',
    bodyType: {} as GetChatRoomHistoryRequest,
    responseType: {} as GetChatRoomHistoryResponse,
  },
  saveUserChat: {
    method: 'POST',
    path: '?job=saveUserChat',
    bodyType: {} as SaveUserChatRequest,
    responseType: {} as SaveUserChatResponse,
  },
  getUserChatRoomSummaries: {
    method: 'POST',
    path: '?job=getUserChatRoomSummaries',
    bodyType: {} as GetUserChatRoomSummariesRequest,
    responseType: {} as GetUserChatRoomSummariesResponse,
  },
  deleteChatSession: {
    method: 'POST',
    path: '?job=deleteChatSession',
    bodyType: {} as DeleteChatSessionRequest,
    responseType: {} as DeleteChatSessionResponse,
  },
} as const;

export type ApiName = keyof typeof API_DEFINITIONS;
export type ApiBody<T extends ApiName> = (typeof API_DEFINITIONS)[T]['bodyType'];
export type ApiResponse<T extends ApiName> = (typeof API_DEFINITIONS)[T]['responseType'];
