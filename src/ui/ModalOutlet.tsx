/**
 * Modal Outlet
 *
 * 모달을 렌더링하는 포털 컴포넌트입니다.
 * 필요한 모달을 switch case에 추가하여 사용하세요.
 */
import { memo, Suspense, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { atom, useRecoilState } from 'recoil';

/** 활성화된 모달 타입 */
export type ModalType = null; // 필요한 모달 타입 추가

/** 모달 상태 atom */
export const activeModalState = atom<ModalType>({
  key: 'activeModalState',
  default: null,
});

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

  const ActiveModal = useMemo(() => {
    switch (activeModal) {
      // 필요한 모달 추가
      // case 'example':
      //   return <ExampleModal onClose={() => setActiveModal(null)} />;
      default:
        return null;
    }
  }, [activeModal, setActiveModal]);

  return createPortal(<Suspense fallback={null}>{ActiveModal}</Suspense>, root);
});

export default ModalOutlet;
