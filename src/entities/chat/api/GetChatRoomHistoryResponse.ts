import { ApiBasicResponse } from '@/shared/api/types';
import { MessageForHistory } from '@/shared/types/message.type';

export interface GetChatRoomHistoryResponse extends ApiBasicResponse {
  messages: MessageForHistory[];
}
