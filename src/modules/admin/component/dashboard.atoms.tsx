import { atom } from 'recoil';
import { recoilPersist } from 'recoil-persist';

const { persistAtom } = recoilPersist();

export const dashboarGridAtom = atom<any[]>({
  key: 'dashboardGrid',
  default: [
    {
      w: 6,
      h: 3,
      x: 0,
      y: 0,
      i: 'a',
      moved: false,
      static: false,
    },
    {
      w: 5,
      h: 2,
      x: 0,
      y: 3,
      i: 'b',
      moved: false,
      static: false,
    },
    {
      w: 5,
      h: 5,
      x: 6,
      y: 0,
      i: 'c',
      moved: false,
      static: false,
    },
    {
      w: 3,
      h: 7,
      x: 11,
      y: 0,
      i: 'd',
      moved: false,
      static: false,
    },
  ],
  effects_UNSTABLE: [persistAtom],
});
