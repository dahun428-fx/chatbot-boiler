// ---- 세션 레지스트리 (훅/컴포넌트 간 취소 공유) ----
// dual-key 등록을 위해 messageId와 targetId를 모두 보관
export type SessionEntry = { controller: AbortController; targetId: string; messageId: string };
export const streamRegistry = new Map<string, SessionEntry>();
export const setSession = (key: string, entry: SessionEntry) => {
  streamRegistry.set(key, entry);
};
export const abortSession = (key: string) => {
  streamRegistry.get(key)?.controller.abort();
};
export const deleteSession = (key: string) => {
  streamRegistry.delete(key);
};
