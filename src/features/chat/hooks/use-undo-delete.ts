// src/features/chat/hooks/use-undo-delete.ts
import { useCallback, useState } from 'react';

import { useTrack } from '@/lib/analystics/useTrack';
import { apiCaller } from '@/shared/api';
import { ApiBody } from '@/shared/api/api.types';
import { showUndoToast } from '@/shared/ui/basic/toast/showUndoToast';

type UseUndoDeleteOptions = {
  toastContainerId?: string; // StyledToastContainer의 containerId
};

export function useUndoDelete(opts: UseUndoDeleteOptions = {}) {
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [restoreSignalMap, setRestoreSignalMap] = useState<Record<string, number>>({});
  const track = useTrack();
  const handleDelete = useCallback(
    (chatRoomId: string) => {
      // 1) 화면에서 즉시 숨김(낙관적)
      setRemovedIds((prev) => {
        const next = new Set(prev);
        next.add(chatRoomId);
        return next;
      });

      // 2) Undo 토스트
      showUndoToast({
        ...(opts.toastContainerId ? { containerId: opts.toastContainerId } : {}),
        onUndo: () => {
          // 화면 복구
          setRemovedIds((prev) => {
            const next = new Set(prev);
            next.delete(chatRoomId);
            return next;
          });
          // 스와이프 리셋 신호(+1)
          setRestoreSignalMap((m) => ({ ...m, [chatRoomId]: (m[chatRoomId] ?? 0) + 1 }));

          // posthog
          track('chat_room_delete_undo_clicked', {
            undo_delete_clicked: true,
          });
        },
        onExpire: async () => {
          try {
            // 실제 삭제 확정
            await apiCaller('deleteChatSession', undefined, {
              chatRoomId,
            } as ApiBody<'deleteChatSession'>);

            // posthog
            track('chat_room_delete', {
              action_type: 'delete_swipe',
              count_deleted: 1,
            });
          } catch (e) {
            // 실패 시 화면 복구
            setRemovedIds((prev) => {
              const next = new Set(prev);
              next.delete(chatRoomId);
              return next;
            });
          }
        },
      });
    },
    [opts.toastContainerId, track]
  );

  const isRemoved = useCallback((id: string) => removedIds.has(id), [removedIds]);
  const restoreSignalOf = useCallback(
    (id: string) => restoreSignalMap[id] ?? 0,
    [restoreSignalMap]
  );

  return { removedIds, isRemoved, restoreSignalOf, handleDelete };
}
