import { atom } from 'recoil';
import { ISchema } from '.';

export const schemasAtom = atom<ISchema[]>({
  key: 'schemas',
  default: [],
});

export const schemaAtom = atom<ISchema>({
  key: 'schema',
  default: null,
});
