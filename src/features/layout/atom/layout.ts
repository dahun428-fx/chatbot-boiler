import { atom } from 'recoil';

export const headerHeightState = atom<number>({
  key: 'headerHeight',
  default: 0,
});

export const inputFormHeightState = atom<number>({
  key: 'inputFormHeight',
  default: 0,
});

export const loadingOverlayState = atom<boolean>({
  key: 'loadingOverlayState',
  default: false,
});
