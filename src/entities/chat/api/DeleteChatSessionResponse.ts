/* eslint-disable @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type */

import { ApiBasicResponse } from '@/shared/api/types';

export interface DeleteChatSessionResponse extends ApiBasicResponse {
  chatRoomId: string;
}
