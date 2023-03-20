import { atom } from 'recoil';
import { ILambdaMeta } from '../../../api/types/meta.interface';

export const lambdaMetasAtom = atom<ILambdaMeta[]>({
  key: 'lambdaMetas',
  default: [],
});
