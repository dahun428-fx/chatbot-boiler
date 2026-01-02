import { ApiBasicResponse } from '@/shared/api/api.types';
import { MessageForHistory } from '@/shared/types/message.type';

export interface GetChatRoomHistoryResponse extends ApiBasicResponse {
  messages: MessageForHistory[];
}
