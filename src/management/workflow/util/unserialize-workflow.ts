import { Elements } from 'react-flow-renderer';
import { IWorkflow } from '../interface';
import { unserializeEdge } from './unserialize-edge';
import { unserializeNode } from './unserialize-node';

export const unserializeWorkflow = (workflow: IWorkflow): Elements => {
  return [
    ...workflow.nodes.map(unserializeNode),
    ...workflow.edges.map(unserializeEdge),
  ];
};
