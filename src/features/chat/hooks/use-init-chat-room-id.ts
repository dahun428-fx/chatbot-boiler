// src/hooks/useInitChatRoomId.ts
import { useRecoilState } from 'recoil';

import { chatRoomIdState } from '../atom/chat';

// 새로고침 시에, 기존 챗룸이 있으면, 해당 챗룸 아이디를 sessionStorage에 저장
// 구현 방법 : 아무것도 하지 않는다 - 기존 챗룸 아이디 유지

// 새로고침 시에, 기존 챗룸이 없으면, 신규 챗룸 아이디를 sessionStorage에 저장
// 구현 방법 : getUserProfile API 를 통해 받아온 챗룸 아이디를 sessionStorage에 저장
// sessionStorage 에 chatRoomId 확인, 없으면 chatRoomId 저장.

// 대화 이력에서 챗룸 아이디를 누르면, 해당 챗룸 아이디를 다시 sessionStorage에 저장
// 구현 방법 : sideNav 의 chatHistory 의 chatRoomId 를 sessionStorage에 저장한다.

// 대화 이력에서 '새 대화' 를 누르면, 새롭게 챗룸 아이디를 발급받은 내역을 sessionStorage에 저장
// 구현 방법 : userToken 을 제거하고, 새로운 유저를 받은 뒤, 그 chatRoomId 를 sessionStorage에 저장한다.

export function useChatRoomActions() {
  const [chatRoomId, setChatRoomId] = useRecoilState(chatRoomIdState);

  /** 대화 이력에서 특정 챗룸 선택 */
  const selectFromHistory = (id: string) => {
    setChatRoomId(id); // atom effect가 sessionStorage에 저장
  };

  /** 임의 세팅(필요 시) */
  const setDirect = (id: string | null) => setChatRoomId(id);

  const initChatRoomId = (insertChatRoomId: string, isReset?: boolean) => {
    if (chatRoomId && !isReset) {
      return;
    }
    setDirect(insertChatRoomId);
  };

  return { chatRoomId: chatRoomId ?? '', selectFromHistory, setDirect, initChatRoomId };
}
