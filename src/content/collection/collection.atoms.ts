import { atom } from 'recoil';
import { ICollection } from './interface/collection.interface';

export const collectionsAtom = atom<ICollection[]>({
  key: 'collections',
  default: [],
});
