import { ReactChild } from 'react';
import { atom } from 'recoil';
import { recoilPersist } from 'recoil-persist';

const { persistAtom } = recoilPersist();

export const jwtAtom = atom<string>({
  key: 'jwt',
  default: '',
  effects_UNSTABLE: [persistAtom],
});

export const pageNavCollapseAtom = atom<boolean>({
  key: 'pageNavCollpase',
  default: true,
  effects_UNSTABLE: [persistAtom],
});

export const pageDrawerAtom = atom<ReactChild>({
  key: 'pageDrawer',
  default: undefined,
});
