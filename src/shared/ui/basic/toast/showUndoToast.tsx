import { Id, toast, ToastContentProps } from 'react-toastify';

import { UndoToastButton } from './UndoToastButton';

/** 옵션 타입 */
export type ShowUndoToastOptions = {
  /** 메시지(문자열 또는 리액트 노드) */
  message?: React.ReactNode;
  /** 자동 닫힘 시간(ms) – 기본 5000ms */
  durationMs?: number;
  /** Undo 버튼 텍스트 – 기본 '실행 취소' */
  undoLabel?: string;
  /** 성공/실패 아이콘 등 커스텀 아이콘 */
  icon?: React.ReactNode;
  /** 같은 항목에 대해 중복 토스트 방지용 id */
  toastId?: Id;
  /**
   * 사용자가 '되돌리기'를 눌렀을 때 실행할 콜백 (낙관적 삭제를 되돌리는 로직 등)
   * 비동기 가능
   */
  onUndo?: () => void | Promise<void>;
  /**
   * 토스트가 자동으로 사라졌을 때 실행할 콜백 (실제 삭제 확정 API 호출 등)
   * 비동기 가능
   */
  onExpire?: () => void | Promise<void>;
};

/**
 * 되돌리기(Undo) 토스트를 표시하고,
 * 사용자가 Undo를 눌렀는지 여부를 Promise<boolean>으로 반환합니다.
 *
 * 반환값: true = Undo됨, false = 만료(확정)
 */
export function showUndoToast(options: ShowUndoToastOptions = {}): Promise<boolean> {
  const containerId = 'sidebar-delete-toast'; // 고정 컨테이너 ID
  const position = 'bottom-center'; // 고정 위치
  const {
    message = '삭제됨',
    durationMs = 1000,
    undoLabel = '실행취소',
    icon,
    // toastId = 'undo-toast',
    onUndo,
    onExpire,
  } = options;

  let settled = false; // resolve 중복 방지
  let undone = false;

  return new Promise<boolean>((resolve) => {
    const handleUndo = async (close?: () => void) => {
      if (settled) return;
      settled = true;
      undone = true;
      try {
        await onUndo?.();

        close?.();
      } finally {
        resolve(true);
      }
    };

    const Content: React.FC<ToastContentProps> = ({ closeToast }) => (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {icon}
          <span style={{ lineHeight: 1.3 }}>{message}</span>
        </div>
        <UndoToastButton onClick={() => handleUndo(closeToast)} label={undoLabel} />
      </div>
    );

    const idRef: { current: Id | null } = { current: null };

    const id = toast((toastProps) => <Content {...toastProps} />, {
      // toastId,
      containerId,
      autoClose: durationMs,
      position,
      type: 'info',
      closeOnClick: false,
      onClose: async () => {
        if (settled) return;
        settled = true;
        if (!undone) {
          await onExpire?.();
          resolve(false);
        }
      },
      role: 'status',
    });

    idRef.current = id;
  });
}
