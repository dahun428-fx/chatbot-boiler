// app/ui/ModalOutlet.tsx
import { memo, Suspense, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRecoilState } from 'recoil';

import { activeModalState } from '@/features/chat/atom/modal';

// 모달 포털 대상 보장
function useModalRoot() {
  return useMemo(() => {
    let el = document.getElementById('modal-root');
    if (!el) {
      el = document.createElement('div');
      el.id = 'modal-root';
      document.body.appendChild(el);
    }
    return el;
  }, []);
}

const ModalOutlet = memo(function ModalOutlet() {
  const root = useModalRoot();
  const [activeModal, setActiveModal] = useRecoilState(activeModalState);

  const handleClose = useCallback(() => {
    setActiveModal(null);
  }, [setActiveModal]);

  const ActiveModal = useMemo(() => {
    switch (activeModal) {
      // 필요한 모달 추가
      default:
        return null;
    }
  }, [activeModal, handleClose]);

  return createPortal(<Suspense fallback={null}>{ActiveModal}</Suspense>, root);
});

export default ModalOutlet;
