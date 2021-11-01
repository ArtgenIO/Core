import { Elements, OnLoadParams } from 'react-flow-renderer';
import { atom } from 'recoil';
import { ILambdaMeta } from '../../lambda/interface/meta.interface';
import { IWorkflow } from '../interface/serialized-workflow.interface';

export const nodesAtom = atom<ILambdaMeta[]>({
  key: 'nodes',
  default: [],
});

export const workflowAtom = atom<IWorkflow>({
  key: 'workflow',
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

export const workflowChangedAtom = atom<boolean>({
  key: 'workflowChanged',
  default: false,
});
