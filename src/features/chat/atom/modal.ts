import { atom } from 'recoil';

export type ModalType = 'bottom-sheet' | null;

export const activeModalState = atom<ModalType>({
  key: 'activeModalState',
  default: null,
});
