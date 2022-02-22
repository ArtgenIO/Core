import { atom } from 'recoil';
import { ILambdaMeta } from '../../lambda/interface/meta.interface';

export const lambdaMetasAtom = atom<ILambdaMeta[]>({
  key: 'lambdaMetas',
  default: [],
});
