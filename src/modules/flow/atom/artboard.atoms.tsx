import { Elements, OnLoadParams } from 'react-flow-renderer';
import { atom } from 'recoil';
import { ILambdaMeta } from '../../lambda/interface/meta.interface';
import { IFlow } from '../interface/flow.interface';

export const lambdaMetasAtom = atom<ILambdaMeta[]>({
  key: 'lambdaMetas',
  default: [],
});

export const flowAtom = atom<IFlow>({
  key: 'flow',
  default: null,
});

export const flowInstanceAtom = atom<OnLoadParams>({
  key: 'flowInstance',
  default: null,
});

export const elementsAtom = atom<Elements>({
  key: 'elements',
  default: [],
});

export const selectedNodeIdAtom = atom<string>({
  key: 'selectedNodeId',
  default: null,
});

export const selectedEdgeIdAtom = atom<string>({
  key: 'selectedEdgeId',
  default: null,
});

export const selectedElementIdAtom = atom<string>({
  key: 'selectedElementId',
  default: null,
});

export const catalogCollapsedAtom = atom<boolean>({
  key: 'catalogCollapsed',
  default: true,
});

export const flowChangedAtom = atom<boolean>({
  key: 'flowChanged',
  default: false,
});
